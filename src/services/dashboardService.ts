import { apiClient } from './apiClient'

type DashboardApiResponse = {
  players: {
    total: number
    active: number
    high_frequency: number
  }
  attendanceToday: {
    date: string
    present: number
    total: number
    percentage: number
  }
  recentSessions?: Array<{
    trainingDate: string
    present: number
    total: number
  }>
}

export type DashboardOverview = {
  players: {
    total: number
    active: number
    highFrequency: number
  }
  attendanceToday: {
    date: string
    present: number
    total: number
    percentage: number
  }
  recentSessions: Array<{
    trainingDate: string
    present: number
    total: number
  }>
}

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const data = await apiClient.get<DashboardApiResponse>('/api/dashboard')
    return {
      players: {
        total: data.players.total,
        active: data.players.active,
        highFrequency: data.players.high_frequency,
      },
      attendanceToday: data.attendanceToday,
      recentSessions: data.recentSessions ?? [],
    }
  },
}
