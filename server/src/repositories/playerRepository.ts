import db from '../database'

export type PlayerRecord = {
  id: number
  name: string
  email: string
  phone: string | null
  position: string
  short_position: string
  frequency: number
  status: 'Ativo' | 'Inativo'
  emergency_contact: string | null
  medical_notes: string | null
  created_at: string
  updated_at: string
  is_true: number
}

export type PlayerInput = {
  name: string
  email: string
  phone?: string | null
  position: string
  short_position: string
  frequency?: number
  status?: 'Ativo' | 'Inativo'
  emergency_contact?: string | null
  medical_notes?: string | null
}

export type PlayerUpdate = Partial<PlayerInput>

const baseSelect = `
  SELECT id, name, email, phone, position, short_position, frequency, status,
         emergency_contact, medical_notes, created_at, updated_at, is_true
  FROM players
`

export const listPlayers = (): PlayerRecord[] => {
  return db
    .prepare(`${baseSelect} WHERE is_true = 1 ORDER BY name`)
    .all() as PlayerRecord[]
}

export const getPlayerById = (id: number): PlayerRecord | undefined => {
  return db
    .prepare(`${baseSelect} WHERE id = ? AND is_true = 1`)
    .get(id) as PlayerRecord | undefined
}

export const createPlayer = (payload: PlayerInput): PlayerRecord => {
  const now = new Date().toISOString()
  const statement = db.prepare(
    `INSERT INTO players
      (name, email, phone, position, short_position, frequency, status,
       emergency_contact, medical_notes, created_at, updated_at)
     VALUES
      (@name, @email, @phone, @position, @short_position, @frequency, @status,
       @emergency_contact, @medical_notes, @created_at, @updated_at)`,
  )

  const result = statement.run({
    ...payload,
    phone: payload.phone ?? null,
    frequency: payload.frequency ?? 0,
    status: payload.status ?? 'Ativo',
    emergency_contact: payload.emergency_contact ?? null,
    medical_notes: payload.medical_notes ?? null,
    created_at: now,
    updated_at: now,
  })

  return getPlayerById(Number(result.lastInsertRowid))!
}

export const updatePlayer = (id: number, payload: PlayerUpdate): PlayerRecord => {
  const existing = getPlayerById(id)
  if (!existing) {
    throw new Error('PLAYER_NOT_FOUND')
  }

  const statement = db.prepare(
    `UPDATE players SET
      name = @name,
      email = @email,
      phone = @phone,
      position = @position,
      short_position = @short_position,
      frequency = @frequency,
      status = @status,
      emergency_contact = @emergency_contact,
      medical_notes = @medical_notes,
      updated_at = @updated_at
     WHERE id = @id`,
  )

  const updated = {
    ...existing,
    ...payload,
    phone: payload.phone ?? existing.phone,
    position: payload.position ?? existing.position,
    short_position: payload.short_position ?? existing.short_position,
    frequency: payload.frequency ?? existing.frequency,
    status: payload.status ?? existing.status,
    emergency_contact: payload.emergency_contact ?? existing.emergency_contact,
    medical_notes: payload.medical_notes ?? existing.medical_notes,
    updated_at: new Date().toISOString(),
  }

  statement.run({
    ...updated,
    id,
  })

  return getPlayerById(id)!
}

export const deletePlayer = (id: number) => {
  const statement = db.prepare(
    `UPDATE players SET is_true = 0, status = 'Inativo', updated_at = @updated_at WHERE id = @id`,
  )
  statement.run({ id, updated_at: new Date().toISOString() })
}

export const getPlayerStats = () => {
  const { total } = db
    .prepare(`SELECT COUNT(*) as total FROM players WHERE is_true = 1`)
    .get() as { total: number }
  const { active } = db
    .prepare(`SELECT COUNT(*) as active FROM players WHERE status = 'Ativo' AND is_true = 1`)
    .get() as { active: number }
  const { high_frequency } = db
    .prepare(
      `SELECT COUNT(*) as high_frequency FROM players WHERE frequency >= 80 AND is_true = 1`,
    )
    .get() as { high_frequency: number }

  return { total, active, high_frequency }
}
