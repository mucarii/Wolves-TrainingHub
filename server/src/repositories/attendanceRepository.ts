import db from '../database'

export type AttendanceRecord = {
  player_id: number
  training_date: string
  present: boolean | number
  note: string | null
}

export type AttendanceResponse = {
  id: number
  name: string
  position: string
  short_position: string
  frequency: number
  status: string
  present: boolean
}

type AttendanceRow = {
  id: number
  name: string
  position: string
  short_position: string
  frequency: number
  status: string
  present: number
}

export const listAttendanceForDate = (trainingDate: string): AttendanceResponse[] => {
  const statement = db.prepare(
    `SELECT p.id,
            p.name,
            p.position,
            p.short_position,
            p.frequency,
            p.status,
            COALESCE(a.present, 0) as present
       FROM players p
       LEFT JOIN attendance a
              ON a.player_id = p.id
             AND a.training_date = @trainingDate
      WHERE p.is_true = 1
      ORDER BY p.name`,
  )

  const rows = statement.all({ trainingDate }) as AttendanceRow[]

  return rows.map(({ present, ...rest }) => ({
    ...rest,
    present: Boolean(present),
  }))
}

export const upsertAttendance = (record: AttendanceRecord) => {
  const statement = db.prepare(
    `INSERT INTO attendance (training_date, player_id, present, note)
     VALUES (@training_date, @player_id, @present, @note)
     ON CONFLICT(training_date, player_id)
     DO UPDATE SET present = excluded.present, note = excluded.note`,
  )

  statement.run({
    ...record,
    present: record.present ? 1 : 0,
    note: record.note ?? null,
  })
}

export const bulkSaveAttendance = (trainingDate: string, entries: AttendanceRecord[]) => {
  const insertMany = db.transaction((payloads: AttendanceRecord[]) => {
    for (const entry of payloads) {
      upsertAttendance({
        ...entry,
        training_date: trainingDate,
      })
    }
  })

  insertMany(entries)
}

export const getAttendanceSummary = (trainingDate: string) => {
  const present = db
    .prepare(
      `SELECT COUNT(*) as count
         FROM attendance a
         JOIN players p
           ON p.id = a.player_id
        WHERE a.training_date = ?
          AND a.present = 1
          AND p.is_true = 1`,
    )
    .get(trainingDate) as { count: number } | undefined

  const total = db.prepare(`SELECT COUNT(*) as total FROM players WHERE is_true = 1`).get() as
    | { total: number }
    | undefined

  return {
    present: present?.count ?? 0,
    total: total?.total ?? 0,
    percentage: total && total.total > 0 ? Math.round(((present?.count ?? 0) / total.total) * 100) : 0,
  }
}

export const getRecentSessions = (limit = 5) => {
  const rows = db
    .prepare(
      `SELECT training_date as trainingDate,
              SUM(present) as present,
              COUNT(*) as total
         FROM attendance
        GROUP BY training_date
        ORDER BY training_date DESC
        LIMIT ?`,
    )
    .all(limit) as { trainingDate: string; present: number; total: number }[]

  return rows
}

type PlayerHistoryRow = {
  id: number
  name: string
  status: string
  total_sessions: number
  present_sessions: number | null
}

export const getPlayerHistory = (startDate?: string) => {
  const rows = db
    .prepare(
      `SELECT p.id,
              p.name,
              p.status,
              COUNT(a.training_date) as total_sessions,
              SUM(CASE WHEN a.present = 1 THEN 1 ELSE 0 END) as present_sessions
         FROM players p
         LEFT JOIN attendance a
                ON a.player_id = p.id
               AND (@startDate IS NULL OR a.training_date >= @startDate)
        WHERE p.is_true = 1
        GROUP BY p.id
        ORDER BY p.name`,
    )
    .all({ startDate: startDate ?? null }) as PlayerHistoryRow[]

  return rows
}

export const getDistinctTrainingSessions = (startDate?: string) => {
  const row = db
    .prepare(
      `SELECT COUNT(DISTINCT training_date) as sessions
         FROM attendance
        WHERE (@startDate IS NULL OR training_date >= @startDate)`,
    )
    .get({ startDate: startDate ?? null }) as { sessions: number } | undefined

  return row?.sessions ?? 0
}

type PlayerPresenceEntryRow = {
  player_id: number
  name: string
  training_date: string
}

export const getPlayerPresenceEntries = (startDate?: string) => {
  const rows = db
    .prepare(
      `SELECT p.id as player_id,
              p.name,
              a.training_date
         FROM attendance a
         JOIN players p
           ON p.id = a.player_id
        WHERE a.present = 1
          AND p.is_true = 1
          AND (@startDate IS NULL OR a.training_date >= @startDate)
        ORDER BY p.name, a.training_date`,
    )
    .all({ startDate: startDate ?? null }) as PlayerPresenceEntryRow[]

  return rows
}
