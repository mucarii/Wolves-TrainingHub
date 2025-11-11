import { apiClient } from './apiClient'

type HistoryApiResponse = {
  trainings: number
  average_frequency: number
  above_90: number
  below_80: number
  per_player: Array<{
    player_id: number
    name: string
    status: 'Ativo' | 'Inativo'
    sessions: number
    present: number
    percentage: number
  }>
  days: number
  start_date: string
}

type HistoryExportApiResponse = {
  days: number
  start_date: string
  entries: Array<{
    player_id: number
    name: string
    training_date: string
  }>
}

export type HistorySummary = {
  trainings: number
  averageFrequency: number
  above90: number
  below80: number
  perPlayer: Array<{
    playerId: number
    name: string
    status: 'Ativo' | 'Inativo'
    sessions: number
    present: number
    percentage: number
  }>
  days: number
  startDate: string
}

export type HistoryExportData = {
  days: number
  startDate: string
  entries: Array<{
    playerId: number
    name: string
    trainingDate: string
  }>
}

export const historyService = {
  async getSummary(days = 30): Promise<HistorySummary> {
    const data = await apiClient.get<HistoryApiResponse>(`/api/history?days=${days}`)
    return {
      trainings: data.trainings,
      averageFrequency: data.average_frequency,
      above90: data.above_90,
      below80: data.below_80,
      perPlayer: data.per_player.map((player) => ({
        playerId: player.player_id,
        name: player.name,
        status: player.status,
        sessions: player.sessions,
        present: player.present,
        percentage: player.percentage,
      })),
      days: data.days,
      startDate: data.start_date,
    }
  },

  async getPresenceEntries(days = 30): Promise<HistoryExportData> {
    const data = await apiClient.get<HistoryExportApiResponse>(`/api/history/entries?days=${days}`)
    return {
      days: data.days,
      startDate: data.start_date,
      entries: data.entries.map((entry) => ({
        playerId: entry.player_id,
        name: entry.name,
        trainingDate: entry.training_date,
      })),
    }
  },
}
