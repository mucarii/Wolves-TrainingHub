import { useEffect, useMemo, useState } from 'react'
import { Shuffle as ShuffleIcon, Users } from 'lucide-react'
import { playerService } from '../services/playerService'
import type { Player } from '../types/player'

const TeamDrawPage = () => {
  const [players, setPlayers] = useState<Player[]>([])
  const [teamsCount, setTeamsCount] = useState(2)
  const [drawType, setDrawType] = useState<'balanced' | 'random'>('balanced')
  const [result, setResult] = useState<Player[][]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setIsLoading(true)
        setErrorMessage(null)
        const data = await playerService.list()
        setPlayers(data)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Não foi possível carregar os jogadores.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadPlayers()
  }, [])

  const presentPlayers = useMemo(
    () => players.filter((player) => player.status === 'Ativo'),
    [players],
  )

  const handleDraw = () => {
    if (presentPlayers.length === 0) {
      setErrorMessage('Nenhum jogador ativo para o sorteio.')
      return
    }

    const shuffled = [...presentPlayers].sort(() => Math.random() - 0.5)
    const groups = Array.from({ length: teamsCount }, () => [] as Player[])

    if (drawType === 'balanced') {
      const offense = shuffled.filter((player) => player.shortPosition === 'atk')
      const defense = shuffled.filter((player) => player.shortPosition === 'def')
      const others = shuffled.filter(
        (player) => player.shortPosition !== 'atk' && player.shortPosition !== 'def',
      )

      const distribute = (list: Player[]) => {
        list.forEach((player, index) => {
          groups[index % teamsCount].push(player)
        })
      }

      distribute(offense)
      distribute(defense)
      distribute(others)
    } else {
      shuffled.forEach((player, index) => {
        groups[index % teamsCount].push(player)
      })
    }

    setResult(groups)
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-widest text-blue-400">
          Wolves Training Hub
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Sorteio de Times</h2>
        <p className="text-sm text-wolves-muted">Forme times balanceados para os treinos</p>
      </div>

      <div className="rounded-3xl border border-wolves-border bg-wolves-card/70 p-6 shadow-card">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/80">Número de Times</label>
            <select
              value={teamsCount}
              onChange={(event) => setTeamsCount(Number(event.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {[2, 3, 4].map((value) => (
                <option key={value} value={value} className="text-black">
                  {value} Times
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/80">Tipo de Sorteio</label>
            <select
              value={drawType}
              onChange={(event) => setDrawType(event.target.value as 'balanced' | 'random')}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="balanced" className="text-black">
                Balanceado por posição
              </option>
              <option value="random" className="text-black">
                Totalmente aleatório
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/80">Jogadores Disponíveis</label>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xl font-semibold text-white">
              {isLoading ? '...' : presentPlayers.length}
            </div>
          </div>
        </div>

        <button
          onClick={handleDraw}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading || presentPlayers.length === 0}
        >
          <ShuffleIcon size={18} />
          Sortear Times
        </button>

        {errorMessage && (
          <p className="mt-4 text-center text-sm text-red-300">{errorMessage}</p>
        )}
      </div>

      <div className="rounded-3xl border border-wolves-border bg-wolves-card/70 p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Jogadores Presentes</h3>
          <div className="flex items-center gap-2 text-sm text-wolves-muted">
            <Users size={16} />
            Lista dos jogadores disponíveis para o sorteio
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {isLoading && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-wolves-muted">
              Carregando jogadores...
            </div>
          )}

          {!isLoading &&
            presentPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-white">{player.name}</p>
                  <p className="text-xs text-wolves-muted">{player.position}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-wolves-muted">
                  {player.shortPosition}
                </span>
              </div>
            ))}

          {!isLoading && presentPlayers.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-wolves-muted">
              Nenhum jogador ativo disponível. Cadastre e ative jogadores para sortear.
            </div>
          )}
        </div>
      </div>

      {result.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Resultado do Sorteio</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {result.map((team, index) => (
              <div
                key={`team-${index + 1}`}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-5"
              >
                <p className="text-sm uppercase tracking-wider text-blue-400">Time {index + 1}</p>
                <ul className="mt-4 space-y-3">
                  {team.map((player) => (
                    <li key={player.id} className="flex items-center justify-between text-sm text-white">
                      {player.name}
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase text-wolves-muted">
                        {player.shortPosition}
                      </span>
                    </li>
                  ))}
                  {team.length === 0 && (
                    <li className="text-sm text-wolves-muted">Nenhum jogador sorteado.</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamDrawPage
