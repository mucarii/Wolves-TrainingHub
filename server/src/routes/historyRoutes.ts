import { Router } from 'express'
import {
  getDistinctTrainingSessions,
  getPlayerHistory,
  getPlayerPresenceEntries,
} from '../repositories/attendanceRepository'

const router = Router()

const clampDays = (value: number) => {
  if (Number.isNaN(value) || value <= 0) return 30
  return Math.min(Math.max(value, 7), 365)
}

const resolveStartDateISO = (days: number) => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - (days - 1))
  return startDate.toISOString().slice(0, 10)
}

router.get('/', (req, res) => {
  const daysParam = typeof req.query.days === 'string' ? Number(req.query.days) : 30
  const days = clampDays(daysParam)

  const startDateISO = resolveStartDateISO(days)

  const playerHistory = getPlayerHistory(startDateISO)
  const totalSessions = getDistinctTrainingSessions(startDateISO)

  const perPlayer = playerHistory.map((player) => {
    const sessions = player.total_sessions
    const present = player.present_sessions ?? 0
    const percentage = sessions > 0 ? Math.round((present / sessions) * 100) : 0

    return {
      player_id: player.id,
      name: player.name,
      status: player.status,
      sessions,
      present,
      percentage,
    }
  })

  const playersWithSessions = perPlayer.filter((player) => player.sessions > 0)
  const averageFrequency =
    playersWithSessions.length > 0
      ? Math.round(
          playersWithSessions.reduce((sum, player) => sum + player.percentage, 0) /
            playersWithSessions.length,
        )
      : 0

  const above90 = perPlayer.filter((player) => player.percentage >= 90 && player.sessions > 0).length
  const below80 = perPlayer.filter((player) => player.sessions > 0 && player.percentage < 80).length

  res.json({
    trainings: totalSessions,
    average_frequency: averageFrequency,
    above_90: above90,
    below_80: below80,
    per_player: perPlayer,
    days,
    start_date: startDateISO,
  })
})

router.get('/entries', (req, res) => {
  const daysParam = typeof req.query.days === 'string' ? Number(req.query.days) : 30
  const days = clampDays(daysParam)
  const startDateISO = resolveStartDateISO(days)

  const entries = getPlayerPresenceEntries(startDateISO)

  res.json({
    days,
    start_date: startDateISO,
    entries,
  })
})

export default router
