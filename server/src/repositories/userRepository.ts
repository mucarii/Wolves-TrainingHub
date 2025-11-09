import db from '../database'

export type UserRecord = {
  id: number
  name: string
  email: string
  password_hash: string
  created_at: string
}

export const findUserByEmail = (email: string): UserRecord | undefined => {
  return db
    .prepare(`SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?`)
    .get(email) as UserRecord | undefined
}
