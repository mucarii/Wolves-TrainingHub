import { useCallback, useEffect, useMemo, useState } from 'react'
import { Shuffle as ShuffleIcon, Users, History as HistoryIcon } from 'lucide-react'
import { attendanceService, type AttendanceListItem } from '../services/attendanceService'
import { teamDrawService, type TeamDrawResult } from '../services/teamDrawService'

const today = new Date().toISOString().slice(0, 10)

const TeamDrawPage = () => {
  const [attendanceList, setAttendanceList] = useState<AttendanceListItem[]>([])
  const [teamsCount, setTeamsCount] = useState(2)
  const [drawType, setDrawType] = useState<'balanced' | 'random'>('balanced')
  const [seedInput, setSeedInput] = useState('')
  const [currentDraw, setCurrentDraw] = useState<TeamDrawResult | null>(null)
  const [history, setHistory] = useState<TeamDrawResult[]>([])
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadAttendance = useCallback(async () => {
    try {
      setIsLoadingAttendance(true)
      setErrorMessage(null)
      const data = await attendanceService.getByDate(today)
      setAttendanceList(data.attendance)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel carregar as presencas.',
      )
    } finally {
      setIsLoadingAttendance(false)
    }
  }, [])

  const loadHistory = useCallback(async () => {
    try {
      setIsHistoryLoading(true)
      const items = await teamDrawService.list()
      setHistory(items)
    } catch (error) {
      console.error(error)
    } finally {
      setIsHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAttendance()
    loadHistory()
  }, [loadAttendance, loadHistory])

  const availablePlayers = useMemo(
    () =>
      attendanceList.filter(
        (player) => player.status === 'Ativo' && player.present,
      ),
    [attendanceList],
  )

  const handleDraw = async () => {
    if (availablePlayers.length === 0) {
      setErrorMessage('Nenhum jogador presente para o sorteio.')
      return
    }

    try {
      setIsDrawing(true)
      setErrorMessage(null)
      const payload = {
        teamsCount,
        drawType,
        seed: seedInput.trim() || undefined,
      }
      const draw = await teamDrawService.create(payload)
      setCurrentDraw(draw)
      if (!seedInput) {
        setSeedInput(draw.seed)
      }
      await loadHistory()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel realizar o sorteio.',
      )
    } finally {
      setIsDrawing(false)
    }
  }

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-widest text-blue-400">Wolves Training Hub</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Sorteio de Times</h2>
        <p className="text-sm text-wolves-muted">Forme times balanceados e auditaveis</p>
      </div>

      <div className="rounded-3xl border border-wolves-border bg-wolves-card/70 p-6 shadow-card">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/80">Numero de Times</label>
            <select
              value={teamsCount}
              onChange={(event) => setTeamsCount(Number(event.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {[2, 3, 4, 5].map((value) => (
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
                Balanceado por posicao
              </option>
              <option value="random" className="text-black">
                Totalmente aleatorio
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/80">Seed (opcional)</label>
            <input
              value={seedInput}
              onChange={(event) => setSeedInput(event.target.value)}
              placeholder="Ex.: treino-2025-11-10"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <p className="text-xs text-wolves-muted">
              Use a mesma seed para reproduzir um sorteio anterior.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/80">Jogadores presentes</label>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xl font-semibold text-white">
              {isLoadingAttendance ? '...' : availablePlayers.length}
            </div>
          </div>
        </div>

        <button
          onClick={handleDraw}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoadingAttendance || availablePlayers.length === 0 || isDrawing}
        >
          <ShuffleIcon size={18} />
          {isDrawing ? 'Sorteando...' : 'Sortear times'}
        </button>

        {errorMessage && (
          <p className="mt-4 text-center text-sm text-red-300">{errorMessage}</p>
        )}

        {currentDraw && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            Seed utilizada: <code className="text-blue-300">{currentDraw.seed}</code> -{' '}
            Gerado em {formatDateTime(currentDraw.createdAt)}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-wolves-border bg-wolves-card/70 p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Jogadores presentes hoje</h3>
          <div className="flex items-center gap-2 text-sm text-wolves-muted">
            <Users size={16} />
            Somente quem marcou presenca entra no sorteio
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {isLoadingAttendance && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-wolves-muted">
              Carregando presencas...
            </div>
          )}

          {!isLoadingAttendance &&
            availablePlayers.map((player) => (
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

          {!isLoadingAttendance && availablePlayers.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-wolves-muted">
              Nenhum jogador presente hoje. Registre a presenca antes de sortear.
            </div>
          )}
        </div>
      </div>

      {currentDraw && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Resultado do sorteio</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {currentDraw.teams.map((team) => (
              <div
                key={`team-${team.index + 1}`}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-5"
              >
                <p className="text-sm uppercase tracking-wider text-blue-400">
                  Time {team.index + 1}
                </p>
                <ul className="mt-4 space-y-3">
                  {team.players.map((player) => (
                    <li
                      key={`${player.playerId ?? 'ghost'}-${player.name}`}
                      className="flex items-center justify-between text-sm text-white"
                    >
                      {player.name}
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase text-wolves-muted">
                        {player.shortPosition ? player.shortPosition.toUpperCase() : '--'}
                      </span>
                    </li>
                  ))}
                  {team.players.length === 0 && (
                    <li className="text-sm text-wolves-muted">Nenhum jogador sorteado.</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-wolves-border bg-wolves-card/70 p-6 shadow-card">
        <div className="flex items-center gap-2 text-white">
          <HistoryIcon size={18} />
          <div>
            <p className="text-lg font-semibold">Historico recente</p>
            <p className="text-sm text-wolves-muted">
              Ultimos sorteios com seed, configuracao e equipes.
            </p>
          </div>
        </div>

        {isHistoryLoading && (
          <p className="mt-4 text-sm text-wolves-muted">Carregando historico...</p>
        )}

        {!isHistoryLoading && history.length === 0 && (
          <p className="mt-4 text-sm text-wolves-muted">
            Nenhum sorteio registrado ainda. Gere o primeiro para iniciar o historico.
          </p>
        )}

        {!isHistoryLoading && history.length > 0 && (
          <div className="mt-6 space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/90"
              >
                <p className="font-semibold">
                  {formatDateTime(item.createdAt)} - Seed{' '}
                  <code className="text-blue-300">{item.seed}</code>
                </p>
                <p className="text-xs text-wolves-muted">
                  {item.drawType === 'balanced' ? 'Balanceado' : 'Aleatorio'} •{' '}
                  {item.teamsCount} {item.teamsCount > 1 ? 'times' : 'time'}
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {item.teams.map((team) => (
                    <div
                      key={`history-${item.id}-${team.index}`}
                      className="rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      <p className="text-xs uppercase tracking-wider text-blue-300">
                        Time {team.index + 1}
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-white/80">
                        {team.players.map((player) => (
                          <li key={`${item.id}-${team.index}-${player.name}`}>
                            {player.name} - {player.shortPosition ? player.shortPosition.toUpperCase() : '--'}
                          </li>
                        ))}
                        {team.players.length === 0 && (
                          <li className="text-wolves-muted">Sem jogadores</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamDrawPage
