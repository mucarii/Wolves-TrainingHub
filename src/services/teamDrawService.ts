import { apiClient } from './apiClient'

export type TeamDrawPlayer = {
  playerId: number | null
  name: string
  position: string
  shortPosition: string
}

export type TeamDrawTeam = {
  index: number
  players: TeamDrawPlayer[]
}

export type TeamDrawResult = {
  id: number
  seed: string
  drawType: 'balanced' | 'random'
  teamsCount: number
  createdAt: string
  teams: TeamDrawTeam[]
}

export type CreateTeamDrawPayload = {
  teamsCount: number
  drawType: 'balanced' | 'random'
  seed?: string
}

export const teamDrawService = {
  async create(payload: CreateTeamDrawPayload): Promise<TeamDrawResult> {
    return apiClient.post<TeamDrawResult>('/api/team-draws', payload)
  },

  async list(limit = 5): Promise<TeamDrawResult[]> {
    const data = await apiClient.get<{ items: TeamDrawResult[] }>(`/api/team-draws?limit=${limit}`)
    return data.items
  },
}
