import { Router } from 'express'
import { getAttendanceSummary, getRecentSessions } from '../repositories/attendanceRepository'
import { getPlayerStats } from '../repositories/playerRepository'

const router = Router()

router.get('/', (_req, res) => {
  const playerStats = getPlayerStats()
  const today = new Date().toISOString().slice(0, 10)
  const attendance = getAttendanceSummary(today)
  const recentSessions = getRecentSessions(5)

  res.json({
    players: playerStats,
    attendanceToday: {
      date: today,
      ...attendance,
    },
    recentSessions,
  })
})

export default router
