import { Router } from 'express'
import { z } from 'zod'
import { recalculatePlayerFrequencies } from '../repositories/attendanceRepository'
import {
  createPlayer,
  deletePlayer,
  getPlayerById,
  listPlayers,
  updatePlayer,
} from '../repositories/playerRepository'

const router = Router()

const basePlayerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().optional(),
  position: z.string().min(3),
  shortPosition: z.string().min(2).max(4),
  frequency: z.number().int().min(0).max(100).optional(),
  status: z.enum(['Ativo', 'Inativo']).optional(),
  emergencyContact: z.string().optional(),
  medicalNotes: z.string().optional(),
})

router.get('/', (_req, res) => {
  recalculatePlayerFrequencies()
  const players = listPlayers()
  res.json(players)
})

router.get('/:id', (req, res) => {
  const id = Number(req.params.id)
  const player = getPlayerById(id)
  if (!player) {
    res.status(404).json({ message: 'Jogador não encontrado' })
    return
  }
  res.json(player)
})

const mapToCreatePayload = (data: z.infer<typeof basePlayerSchema>) => ({
  name: data.name,
  email: data.email,
  phone: data.phone ?? null,
  position: data.position,
  short_position: data.shortPosition,
  frequency: data.frequency,
  status: data.status,
  emergency_contact: data.emergencyContact ?? null,
  medical_notes: data.medicalNotes ?? null,
})

router.post('/', (req, res) => {
  const parsed = basePlayerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Dados inválidos', issues: parsed.error.format() })
    return
  }

  const player = createPlayer(mapToCreatePayload(parsed.data))

  res.status(201).json(player)
})

router.put('/:id', (req, res) => {
  const id = Number(req.params.id)
  const parsed = basePlayerSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Dados inválidos', issues: parsed.error.format() })
    return
  }

  const payload = parsed.data

  try {
    const player = updatePlayer(id, {
      name: payload.name,
      email: payload.email,
      phone:
        payload.phone === undefined
          ? undefined
          : payload.phone === null || payload.phone === ''
            ? null
            : payload.phone,
      position: payload.position,
      short_position: payload.shortPosition,
      frequency: payload.frequency,
      status: payload.status,
      emergency_contact:
        payload.emergencyContact === undefined ? undefined : payload.emergencyContact ?? null,
      medical_notes:
        payload.medicalNotes === undefined ? undefined : payload.medicalNotes ?? null,
    })
    res.json(player)
  } catch (error) {
    if ((error as Error).message === 'PLAYER_NOT_FOUND') {
      res.status(404).json({ message: 'Jogador não encontrado' })
      return
    }
    res.status(500).json({ message: 'Erro ao atualizar jogador' })
  }
})

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  deletePlayer(id)
  res.status(204).send()
})

export default router
