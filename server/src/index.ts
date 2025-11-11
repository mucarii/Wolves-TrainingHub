import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import playerRoutes from './routes/playerRoutes'
import attendanceRoutes from './routes/attendanceRoutes'
import dashboardRoutes from './routes/dashboardRoutes'
import historyRoutes from './routes/historyRoutes'
import teamDrawRoutes from './routes/teamDrawRoutes'
import authRoutes from './routes/authRoutes'
import healthRoutes from './routes/healthRoutes'
import { runMigrations, seedDatabase, ensureAdminUser } from './utils/bootstrap'
import { authenticate } from './middlewares/authMiddleware'

runMigrations()
if (process.env.SEED_ON_START === 'true') {
  seedDatabase()
}
ensureAdminUser()

const app = express()

app.use(
  cors({
    origin: process.env.APP_ORIGIN ?? '*',
  }),
)
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({
    name: 'Wolves Training Hub API',
    version: '1.0.0',
  })
})

app.use('/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/players', authenticate, playerRoutes)
app.use('/api/attendance', authenticate, attendanceRoutes)
app.use('/api/dashboard', authenticate, dashboardRoutes)
app.use('/api/history', authenticate, historyRoutes)
app.use('/api/team-draws', authenticate, teamDrawRoutes)

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ message: 'Erro interno do servidor' })
})

const PORT = Number(process.env.PORT ?? 3333)

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Wolves Training Hub API em execução na porta ${PORT}`)
  })
}

export default app
