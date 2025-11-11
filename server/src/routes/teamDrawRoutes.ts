import { Router } from 'express'
import { z } from 'zod'
import { listActivePlayers } from '../repositories/playerRepository'
import { saveTeamDraw, listTeamDraws } from '../repositories/teamDrawRepository'

const router = Router()

const drawSchema = z.object({
  teamsCount: z.number().int().min(2).max(8),
  drawType: z.enum(['balanced', 'random']),
  seed: z.string().trim().min(1).max(64).optional(),
})

const listSchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((value) => Number(value))
    .refine((value) => value > 0 && value <= 25, { message: 'limit must be between 1 and 25' })
    .optional(),
})

type DrawType = 'balanced' | 'random'
type DrawPlayer = ReturnType<typeof listActivePlayers>[number]

const hashSeed = (value: string) => {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash || 1
}

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const createSeededShuffle = (seedValue: string) => {
  const random = mulberry32(hashSeed(seedValue))
  const shuffle = <T>(list: T[]) => {
    const copy = [...list]
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  const distributePlayers = (orderedPlayers: DrawPlayer[], teams: Array<{ players: DrawPlayer[] }>) => {
    orderedPlayers.forEach((player, index) => {
      teams[index % teams.length].players.push(player)
    })
  }

  return {
    shuffle,
    distributePlayers,
  }
}

const buildTeams = (players: DrawPlayer[], teamsCount: number, drawType: DrawType, seed: string) => {
  const teams = Array.from({ length: teamsCount }, () => ({ players: [] as DrawPlayer[] }))
  const { shuffle, distributePlayers } = createSeededShuffle(seed)

  if (drawType === 'balanced') {
    const offense = shuffle(players.filter((player) => player.short_position === 'atk'))
    const defense = shuffle(players.filter((player) => player.short_position === 'def'))
    const others = shuffle(
      players.filter(
        (player) => player.short_position !== 'atk' && player.short_position !== 'def',
      ),
    )

    distributePlayers(offense, teams)
    distributePlayers(defense, teams)
    distributePlayers(others, teams)
  } else {
    const shuffled = shuffle(players)
    distributePlayers(shuffled, teams)
  }

  return teams.map((team, index) => ({
    index,
    players: team.players.map((player) => ({
      playerId: player.id,
      name: player.name,
      position: player.position,
      shortPosition: player.short_position,
      teamIndex: index,
    })),
  }))
}

router.post('/', (req, res) => {
  const parsed = drawSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Dados inválidos', issues: parsed.error.format() })
    return
  }

  const players = listActivePlayers()
  if (players.length === 0) {
    res.status(400).json({ message: 'Nenhum jogador ativo disponível para o sorteio.' })
    return
  }

  const seed = parsed.data.seed ?? Date.now().toString(36)
  const teams = buildTeams(players, parsed.data.teamsCount, parsed.data.drawType, seed)
  const record = saveTeamDraw({
    seed,
    drawType: parsed.data.drawType,
    teamsCount: parsed.data.teamsCount,
    teams,
  })

  res.status(201).json(record)
})

router.get('/', (req, res) => {
  const parsed = listSchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ message: 'Parâmetros inválidos', issues: parsed.error.format() })
    return
  }

  const limit = parsed.data?.limit ?? 5
  const items = listTeamDraws(limit)
  res.json({ items })
})

export default router
