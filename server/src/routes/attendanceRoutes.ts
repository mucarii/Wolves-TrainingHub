import { Router } from 'express'
import { z } from 'zod'
import {
  bulkSaveAttendance,
  getAttendanceSummary,
  listAttendanceForDate,
  recalculatePlayerFrequencies,
} from '../repositories/attendanceRepository'

const router = Router()

const attendanceSchema = z.object({
  records: z
    .array(
      z.object({
        playerId: z.number().int().positive(),
        present: z.boolean(),
        note: z.string().optional(),
      }),
    )
    .min(1),
})

router.get('/', (req, res) => {
  const dateParam = (req.query.date as string) ?? new Date().toISOString().slice(0, 10)
  recalculatePlayerFrequencies()
  const attendance = listAttendanceForDate(dateParam)
  const summary = getAttendanceSummary(dateParam)
  res.json({ date: dateParam, summary, attendance })
})

router.put('/:date', (req, res) => {
  const dateParam = req.params.date
  const parsed = attendanceSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Dados inválidos', issues: parsed.error.format() })
    return
  }

  bulkSaveAttendance(
    dateParam,
    parsed.data.records.map((record) => ({
      training_date: dateParam,
      player_id: record.playerId,
      present: record.present ? 1 : 0,
      note: record.note ?? null,
    })),
  )

  recalculatePlayerFrequencies()

  const summary = getAttendanceSummary(dateParam)
  res.json({ message: 'Presenças atualizadas com sucesso', summary })
})

export default router
