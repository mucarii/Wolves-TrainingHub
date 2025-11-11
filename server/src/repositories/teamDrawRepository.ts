import db from '../database'

export type TeamDrawEntrySnapshot = {
  playerId: number | null
  name: string
  position: string
  shortPosition: string
  teamIndex: number
}

export type TeamDrawRecord = {
  id: number
  seed: string
  drawType: 'balanced' | 'random'
  teamsCount: number
  createdAt: string
  teams: Array<{
    index: number
    players: TeamDrawEntrySnapshot[]
  }>
}

type TeamDrawRow = {
  id: number
  seed: string
  draw_type: 'balanced' | 'random'
  teams_count: number
  created_at: string
}

type TeamDrawEntryRow = {
  draw_id: number
  team_index: number
  player_id: number | null
  player_name: string
  player_position: string | null
  player_short_position: string | null
}

export const saveTeamDraw = (payload: {
  seed: string
  drawType: 'balanced' | 'random'
  teamsCount: number
  teams: Array<{
    index: number
    players: TeamDrawEntrySnapshot[]
  }>
}): TeamDrawRecord => {
  const insertDraw = db.prepare(
    `INSERT INTO team_draws (seed, draw_type, teams_count) VALUES (@seed, @draw_type, @teams_count)`,
  )
  const insertEntry = db.prepare(
    `INSERT INTO team_draw_entries
      (draw_id, team_index, player_id, player_name, player_position, player_short_position)
     VALUES (@draw_id, @team_index, @player_id, @player_name, @player_position, @player_short_position)`,
  )

  const transaction = db.transaction(() => {
    const result = insertDraw.run({
      seed: payload.seed,
      draw_type: payload.drawType,
      teams_count: payload.teamsCount,
    })
    const drawId = Number(result.lastInsertRowid)
    for (const team of payload.teams) {
      for (const player of team.players) {
        insertEntry.run({
          draw_id: drawId,
          team_index: team.index,
          player_id: player.playerId,
          player_name: player.name,
          player_position: player.position,
          player_short_position: player.shortPosition,
        })
      }
    }

    return drawId
  })

  const drawId = transaction()
  return getTeamDrawById(drawId)!
}

export const getTeamDrawById = (id: number): TeamDrawRecord | undefined => {
  const row = db
    .prepare(
      `SELECT id, seed, draw_type, teams_count, created_at
         FROM team_draws
        WHERE id = ?`,
    )
    .get(id) as TeamDrawRow | undefined

  if (!row) return undefined

  const entries = db
    .prepare(
      `SELECT draw_id, team_index, player_id, player_name, player_position, player_short_position
         FROM team_draw_entries
        WHERE draw_id = ?
        ORDER BY team_index, id`,
    )
    .all(id) as TeamDrawEntryRow[]

  return mapRowsToRecord(row, entries)
}

export const listTeamDraws = (limit = 10): TeamDrawRecord[] => {
  const draws = db
    .prepare(
      `SELECT id, seed, draw_type, teams_count, created_at
         FROM team_draws
        ORDER BY created_at DESC, id DESC
        LIMIT ?`,
    )
    .all(limit) as TeamDrawRow[]

  if (draws.length === 0) return []

  const ids = draws.map((draw) => draw.id)
  const placeholders = ids.map(() => '?').join(',')
  const entries = db
    .prepare(
      `SELECT draw_id, team_index, player_id, player_name, player_position, player_short_position
         FROM team_draw_entries
        WHERE draw_id IN (${placeholders})
        ORDER BY draw_id DESC, team_index, id`,
    )
    .all(...ids) as TeamDrawEntryRow[]

  const groupedEntries = new Map<number, TeamDrawEntryRow[]>()
  for (const entry of entries) {
    if (!groupedEntries.has(entry.draw_id)) {
      groupedEntries.set(entry.draw_id, [])
    }
    groupedEntries.get(entry.draw_id)!.push(entry)
  }

  return draws.map((draw) => mapRowsToRecord(draw, groupedEntries.get(draw.id) ?? []))
}

const mapRowsToRecord = (draw: TeamDrawRow, entries: TeamDrawEntryRow[]): TeamDrawRecord => {
  const teamMap = new Map<number, TeamDrawEntrySnapshot[]>()

  for (const entry of entries) {
    if (!teamMap.has(entry.team_index)) {
      teamMap.set(entry.team_index, [])
    }
    teamMap.get(entry.team_index)!.push({
      playerId: entry.player_id,
      name: entry.player_name,
      position: entry.player_position ?? '',
      shortPosition: entry.player_short_position ?? '',
      teamIndex: entry.team_index,
    })
  }

  const teams: TeamDrawRecord['teams'] = Array.from({ length: draw.teams_count }, (_, index) => ({
    index,
    players: teamMap.get(index) ?? [],
  }))

  return {
    id: draw.id,
    seed: draw.seed,
    drawType: draw.draw_type,
    teamsCount: draw.teams_count,
    createdAt: draw.created_at,
    teams,
  }
}
