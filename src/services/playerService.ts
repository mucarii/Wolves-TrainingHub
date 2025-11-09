import type { CreatePlayerPayload, Player } from '../types/player'
import { apiClient } from './apiClient'

type PlayerApiResponse = {
  id: number
  name: string
  email: string
  phone: string | null
  position: Player['position']
  short_position: Player['shortPosition']
  frequency: number
  status: Player['status']
  emergency_contact: string | null
  medical_notes: string | null
  created_at?: string
  updated_at?: string
}

const toPlayer = (data: PlayerApiResponse): Player => ({
  id: data.id,
  name: data.name,
  email: data.email,
  phone: data.phone,
  position: data.position,
  shortPosition: data.short_position,
  frequency: data.frequency,
  status: data.status,
  emergencyContact: data.emergency_contact,
  medicalNotes: data.medical_notes,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
})

export const playerService = {
  async list(): Promise<Player[]> {
    const data = await apiClient.get<PlayerApiResponse[]>('/api/players')
    return data.map(toPlayer)
  },

  async getById(id: number): Promise<Player> {
    const data = await apiClient.get<PlayerApiResponse>(`/api/players/${id}`)
    return toPlayer(data)
  },

  async create(payload: CreatePlayerPayload): Promise<Player> {
    const data = await apiClient.post<PlayerApiResponse>('/api/players', {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      position: payload.position,
      shortPosition: payload.shortPosition,
      status: payload.status ?? 'Ativo',
      emergencyContact: payload.emergencyContact,
      medicalNotes: payload.medicalNotes,
    })
    return toPlayer(data)
  },

  async update(id: number, payload: CreatePlayerPayload): Promise<Player> {
    const data = await apiClient.put<PlayerApiResponse>(`/api/players/${id}`, {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      position: payload.position,
      shortPosition: payload.shortPosition,
      status: payload.status ?? 'Ativo',
      emergencyContact: payload.emergencyContact,
      medicalNotes: payload.medicalNotes,
    })
    return toPlayer(data)
  },

  async remove(playerId: number): Promise<void> {
    await apiClient.delete<void>(`/api/players/${playerId}`)
  },
}
