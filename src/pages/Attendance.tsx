import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, CheckCircle, Clock } from 'lucide-react'
import {
  attendanceService,
  type AttendanceListItem,
  type AttendanceRecord,
} from '../services/attendanceService'

const formatFullDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(value))

const today = new Date().toISOString().slice(0, 10)

const AttendancePage = () => {
  const [selectedDate, setSelectedDate] = useState(today)
  const [attendanceList, setAttendanceList] = useState<AttendanceListItem[]>([])
  const [summary, setSummary] = useState({ present: 0, total: 0, percentage: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadAttendance = useCallback(
    async (date: string) => {
      try {
        setIsLoading(true)
        setErrorMessage(null)
        const data = await attendanceService.getByDate(date)
        setAttendanceList(data.attendance)
        setSummary(data.summary)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Não foi possível carregar a presença.',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [setAttendanceList],
  )

  useEffect(() => {
    loadAttendance(selectedDate)
  }, [selectedDate, loadAttendance])

  const presentCount = useMemo(
    () => attendanceList.filter((player) => player.present).length,
    [attendanceList],
  )

  const togglePresence = (playerId: number) => {
    setAttendanceList((prev) =>
      prev.map((player) =>
        player.id === playerId ? { ...player, present: !player.present } : player,
      ),
    )
    setSuccessMessage(null)
  }

  const handleSave = async () => {
    const payload: AttendanceRecord[] = attendanceList.map((player) => ({
      playerId: player.id,
      present: player.present,
    }))

    try {
      setIsSaving(true)
      await attendanceService.save(selectedDate, payload)
      setSuccessMessage('Presenças salvas com sucesso!')
      loadAttendance(selectedDate)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível salvar a presença agora.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-blue-400">
            Wolves Training Hub
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Registro de Presença</h2>
          <p className="text-sm text-wolves-muted">{formatFullDate(selectedDate)}</p>
        </div>
        <input
          type="date"
          max={today}
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-wolves-border bg-wolves-card/60 p-5">
          <p className="text-sm text-wolves-muted">Presentes</p>
          <p className="text-3xl font-semibold text-white">
            {isLoading ? '...' : presentCount}
          </p>
          <p className="text-xs uppercase tracking-wider text-green-300">Atualizado agora</p>
        </div>
        <div className="rounded-2xl border border-wolves-border bg-wolves-card/60 p-5">
          <p className="text-sm text-wolves-muted">Total de Jogadores</p>
          <p className="text-3xl font-semibold text-white">
            {isLoading ? '...' : attendanceList.length}
          </p>
        </div>
        <div className="rounded-2xl border border-wolves-border bg-wolves-card/60 p-5">
          <p className="text-sm text-wolves-muted">Frequência Hoje</p>
          <p className="text-3xl font-semibold text-white">
            {isLoading ? '...' : `${summary.percentage}%`}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-wolves-border bg-wolves-card/70 p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3 text-sm text-wolves-muted">
            <CalendarDays size={18} />
            {formatFullDate(selectedDate)}
          </div>
          <div className="flex items-center gap-3 text-sm text-green-300">
            <CheckCircle size={18} />
            Sincronizado com o app dos jogadores
          </div>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mt-6 rounded-2xl border border-green-500/40 bg-green-500/5 px-4 py-3 text-sm text-green-300">
            {successMessage}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {isLoading && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-sm text-wolves-muted">
              Carregando jogadores cadastrados...
            </div>
          )}

          {!isLoading &&
            attendanceList.map((player) => (
              <button
                key={player.id}
                onClick={() => togglePresence(player.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition ${
                  player.present
                    ? 'border-green-500/40 bg-green-500/5 shadow-inner shadow-green-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
              >
                <div>
                  <p className="text-lg font-semibold text-white">{player.name}</p>
                  <p className="text-sm text-wolves-muted">
                    Frequência atual: {player.frequency}% • {player.position}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase text-wolves-muted">
                    {player.shortPosition}
                  </span>
                  {player.present ? (
                    <span className="rounded-full bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-300">
                      Presente
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/70">
                      Ausente
                    </span>
                  )}
                </div>
              </button>
            ))}

          {!isLoading && attendanceList.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-wolves-muted">
              Nenhum jogador cadastrado para registrar presença.
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6">
          <div className="flex items-center gap-2 text-sm text-wolves-muted">
            <Clock size={16} />
            Última atualização há poucos instantes
          </div>
          <button
            disabled={isSaving || isLoading}
            onClick={handleSave}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Salvando...' : 'Salvar Presença'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AttendancePage
