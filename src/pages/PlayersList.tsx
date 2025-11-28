import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Mail, PhoneCall, Pencil, Trash2, PlusCircle, AlertCircle } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { playerService } from '../services/playerService'
import type { Player } from '../types/player'

const PlayersListPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativo' | 'Inativo'>('Todos')
  const [playerList, setPlayerList] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadPlayers = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const data = await playerService.list()
      setPlayerList(data)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os jogadores cadastrados.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPlayers()
  }, [loadPlayers])

  const filteredPlayers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return playerList.filter((player) => {
      const matchesSearch =
        term.length === 0 ||
        player.name.toLowerCase().includes(term) ||
        player.position.toLowerCase().includes(term) ||
        player.email.toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === 'Todos' ? true : player.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [playerList, searchTerm, statusFilter])

  const handleDelete = async (playerId: number) => {
    const player = playerList.find((item) => item.id === playerId)
    if (!player) return

    const confirmed = window.confirm(
      `Tem certeza de que deseja remover ${player.name} do banco de dados?`,
    )
    if (!confirmed) return

    try {
      await playerService.remove(playerId)
      setPlayerList((prev) => prev.filter((item) => item.id !== playerId))
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : 'Não foi possível excluir o jogador agora.',
      )
    }
  }

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  const handlePhoneCall = (phone?: string | null) => {
    if (!phone) return
    const digits = phone.replace(/[^\d+]/g, '')
    window.location.href = `tel:${digits}`
  }

  const totalPlayers = playerList.length
  const activePlayers = playerList.filter((player) => player.status === 'Ativo').length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-blue-400">Wolves Training Hub</p>
          <h2 className="text-3xl font-semibold text-white">Lista de Jogadores</h2>
          <p className="text-sm text-wolves-muted">Membros do time Wolves</p>
        </div>
        <Link
          to="/players/new"
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:brightness-110"
        >
          <PlusCircle size={18} />
          Novo Jogador
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-wolves-border bg-wolves-card/60 p-4">
          <p className="text-sm text-wolves-muted">Total de jogadores</p>
          <p className="text-2xl font-semibold text-white">{totalPlayers}</p>
        </div>
        <div className="rounded-2xl border border-wolves-border bg-wolves-card/60 p-4">
          <p className="text-sm text-wolves-muted">Jogadores ativos</p>
          <p className="text-2xl font-semibold text-white">{activePlayers}</p>
        </div>
        <div className="rounded-2xl border border-wolves-border bg-wolves-card/60 p-4">
          <p className="text-sm text-wolves-muted">Frequência média</p>
          <p className="text-2xl font-semibold text-white">87%</p>
        </div>
        <div className="rounded-2xl border border-wolves-border bg-wolves-card/60 p-4">
          <p className="text-sm text-wolves-muted">Posições cobertas</p>
          <p className="text-2xl font-semibold text-white">2</p>
        </div>
      </div>

      <div className="rounded-3xl border border-wolves-border bg-wolves-card/70 p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-wolves-muted" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar jogador por nome ou posição..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="Todos" className="text-black">
              Todos os status
            </option>
            <option value="Ativo" className="text-black">
              Ativo
            </option>
            <option value="Inativo" className="text-black">
              Inativo
            </option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {isLoading && (
            <p className="px-2 py-6 text-center text-sm text-wolves-muted">
              Carregando jogadores cadastrados...
            </p>
          )}

          {!isLoading && errorMessage && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              <AlertCircle size={16} />
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && filteredPlayers.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-wolves-muted">
              Nenhum jogador cadastrado até o momento. Utilize o botão “Novo Jogador” para incluir
              o primeiro membro.
            </div>
          )}

          {!isLoading && !errorMessage && filteredPlayers.length > 0 && (
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-wolves-muted">
                <th className="pb-4">Nome</th>
                <th className="pb-4">Posição</th>
                <th className="pb-4">Frequência</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Contato</th>
                <th className="pb-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPlayers.map((player) => (
                <tr key={player.id} className="text-white">
                  <td className="py-4">
                    <div>
                      <p className="font-semibold">{player.name}</p>
                      <p className="text-xs text-wolves-muted">{player.email}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase text-wolves-muted">
                      {player.position}
                    </span>
                  </td>
                  <td className="py-4">
                    <span
                      className={`font-semibold ${
                        player.frequency >= 90
                          ? 'text-green-300'
                          : player.frequency >= 80
                            ? 'text-yellow-200'
                            : 'text-red-300'
                      }`}
                    >
                      {player.frequency}%
                    </span>
                  </td>
                  <td className="py-4">
                    <StatusBadge
                      label={player.status}
                      tone={player.status === 'Ativo' ? 'success' : 'danger'}
                    />
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2 text-wolves-muted">
                      <button
                        type="button"
                        onClick={() => handleEmail(player.email)}
                        className="rounded-full border border-white/10 p-2 transition hover:border-white/40 hover:text-white"
                      >
                        <Mail size={16} />
                      </button>
                      <button
                        type="button"
                        aria-disabled={!player.phone}
                        onClick={() => handlePhoneCall(player.phone)}
                        className={`rounded-full border border-white/10 p-2 transition hover:border-white/40 hover:text-white ${
                          player.phone ? '' : 'cursor-not-allowed opacity-50'
                        }`}
                      >
                        <PhoneCall size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/players/${player.id}/edit`}
                        className="rounded-full border border-white/10 p-2 hover:border-blue-500/50 hover:text-blue-400"
                        aria-label={`Editar ${player.name}`}
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(player.id)}
                        className="rounded-full border border-white/10 p-2 hover:border-red-500/50 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlayersListPage
