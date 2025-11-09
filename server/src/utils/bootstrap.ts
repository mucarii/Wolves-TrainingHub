import db from '../database'
import bcrypt from 'bcryptjs'

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    position TEXT NOT NULL,
    short_position TEXT NOT NULL,
    frequency INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Ativo',
    emergency_contact TEXT,
    medical_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    training_date TEXT NOT NULL,
    player_id INTEGER NOT NULL,
    present INTEGER NOT NULL DEFAULT 0,
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (training_date, player_id),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
]

const seedPlayers = [
  {
    name: 'Joao Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    position: 'Ataque',
    shortPosition: 'atk',
    frequency: 92,
    status: 'Ativo',
    emergencyContact: 'Ana Silva - (11) 98888-7766',
    medicalNotes: 'Nenhuma',
  },
  {
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 98888-7777',
    position: 'Ataque',
    shortPosition: 'atk',
    frequency: 88,
    status: 'Ativo',
    emergencyContact: 'Carlos Santos - (11) 97777-5544',
    medicalNotes: 'Alergia leve a anti-inflamatorios',
  },
  {
    name: 'Pedro Costa',
    email: 'pedro@email.com',
    phone: '(11) 97777-6644',
    position: 'Defesa',
    shortPosition: 'def',
    frequency: 76,
    status: 'Ativo',
    emergencyContact: 'Fernanda Costa - (11) 96666-3322',
    medicalNotes: 'Historico de lesao no joelho esquerdo',
  },
  {
    name: 'Ana Oliveira',
    email: 'ana@email.com',
    phone: '(11) 96666-1122',
    position: 'Defesa',
    shortPosition: 'def',
    frequency: 95,
    status: 'Inativo',
    emergencyContact: 'Paulo Oliveira - (11) 95555-8822',
    medicalNotes: 'Recuperacao de torcao no tornozelo',
  },
]

export const runMigrations = () => {
  db.pragma('foreign_keys = ON')
  const migrate = db.transaction(() => {
    for (const statement of MIGRATIONS) {
      db.prepare(statement).run()
    }
  })
  migrate()
}

export const seedDatabase = () => {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM players').get() as {
    count: number
  }

  if (count > 0) return

  const insert = db.prepare(
    `INSERT INTO players
    (name, email, phone, position, short_position, frequency, status, emergency_contact, medical_notes)
    VALUES (@name, @email, @phone, @position, @shortPosition, @frequency, @status, @emergencyContact, @medicalNotes)`,
  )

  const seed = db.transaction(() => {
    for (const player of seedPlayers) {
      insert.run(player)
    }
  })

  seed()
}

export const ensureAdminUser = () => {
  const { totalUsers } = db
    .prepare('SELECT COUNT(*) as totalUsers FROM users')
    .get() as { totalUsers: number }

  if (totalUsers > 0) return

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@wolves.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'wolves123'
  const passwordHash = bcrypt.hashSync(adminPassword, 10)

  db.prepare(
    `INSERT INTO users (name, email, password_hash) VALUES ('Administrador', ?, ?)`,
  ).run(adminEmail, passwordHash)
}
