import { apiClient } from './apiClient'

type AttendanceApiResponse = {
  date: string
  summary: {
    present: number
    total: number
    percentage: number
  }
  attendance: Array<{
    id: number
    name: string
    position: string
    short_position: 'atk' | 'def' | 'esp'
    frequency: number
    status: 'Ativo' | 'Inativo'
    present: boolean
  }>
}

export type AttendanceRecord = {
  playerId: number
  present: boolean
  note?: string
}

export type AttendanceListItem = {
  id: number
  name: string
  position: string
  shortPosition: 'atk' | 'def' | 'esp'
  frequency: number
  status: 'Ativo' | 'Inativo'
  present: boolean
}

export type AttendancePayload = {
  date: string
  summary: AttendanceApiResponse['summary']
  attendance: AttendanceListItem[]
}

export const attendanceService = {
  async getByDate(date: string): Promise<AttendancePayload> {
    const data = await apiClient.get<AttendanceApiResponse>(`/api/attendance?date=${date}`)
    return {
      date: data.date,
      summary: data.summary,
      attendance: data.attendance.map((item) => ({
        id: item.id,
        name: item.name,
        position: item.position,
        shortPosition: item.short_position,
        frequency: item.frequency,
        status: item.status,
        present: item.present,
      })),
    }
  },

  async save(date: string, records: AttendanceRecord[]) {
    await apiClient.put<{ message: string; summary: AttendanceApiResponse['summary'] }>(
      `/api/attendance/${date}`,
      {
        records: records.map((record) => ({
          playerId: record.playerId,
          present: record.present,
          note: record.note,
        })),
      },
    )
  },
}
