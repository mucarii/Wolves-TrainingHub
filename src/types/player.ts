export type PlayerStatus = 'Ativo' | 'Inativo'
export type PlayerPosition = 'Ataque' | 'Defesa' | 'Especial'
export type PlayerShortPosition = 'atk' | 'def' | 'esp'

export type Player = {
  id: number
  name: string
  email: string
  phone: string | null
  position: PlayerPosition
  shortPosition: PlayerShortPosition
  frequency: number
  status: PlayerStatus
  emergencyContact: string | null
  medicalNotes: string | null
  createdAt?: string
  updatedAt?: string
}

export type CreatePlayerPayload = {
  name: string
  email: string
  phone?: string | null
  position: PlayerPosition
  shortPosition: PlayerShortPosition
  status?: PlayerStatus
  emergencyContact?: string | null
  medicalNotes?: string | null
}
