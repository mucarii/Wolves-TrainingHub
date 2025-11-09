import path from 'node:path'
import fs from 'node:fs'
import DatabaseConstructor from 'better-sqlite3'

const dataDir = path.resolve(process.cwd(), 'server', 'data')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const databaseFile =
  process.env.DB_FILE ??
  path.resolve(
    dataDir,
    process.env.NODE_ENV === 'test' ? 'wolves-test.db' : 'wolves.db',
  )

const db = new DatabaseConstructor(databaseFile)

db.pragma('foreign_keys = ON')
db.pragma('journal_mode = WAL')

export default db
