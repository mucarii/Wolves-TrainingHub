import { useEffect, useState } from 'react'
import { Filter, Download } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { historyService, type HistorySummary } from '../services/historyService'

const ranges = [
  { label: '30 dias', value: 30 },
  { label: '60 dias', value: 60 },
  { label: '90 dias', value: 90 },
]

const HistoryPage = () => {
  const [summary, setSummary] = useState<HistorySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setIsLoading(true)
        setErrorMessage(null)
        const data = await historyService.getSummary(days)
        setSummary(data)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Não foi possível carregar o histórico.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadSummary()
  }, [days])

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const exportData = await historyService.getPresenceEntries(days)

      if (exportData.entries.length === 0) {
        window.alert('Não há presenças registradas no período selecionado para exportar.')
        return
      }

      const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })
      const escapeCell = (value: string) =>
        value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')

      const rows = exportData.entries
        .map((entry) => {
          const formattedDate = dateFormatter.format(new Date(entry.trainingDate))
          return `<tr><td>${escapeCell(entry.name)}</td><td>${escapeCell(formattedDate)}</td></tr>`
        })
        .join('')

      const table = `<table border="1"><thead><tr><th>Jogador</th><th>Data da Presença</th></tr></thead><tbody>${rows}</tbody></table>`
      const blob = new Blob(['\ufeff', table], {
        type: 'application/vnd.ms-excel;charset=utf-8;',
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `relatorio-presencas-${new Date().toISOString().slice(0, 10)}.xls`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível exportar o relatório agora.'
      window.alert(message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-blue-400">
            Wolves Training Hub
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Histórico de Presença</h2>
          <p className="text-sm text-wolves-muted">
            Acompanhe a frequência dos jogadores (últimos {days} dias)
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={isLoading || isExporting}
          className={`flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white transition ${
            isLoading || isExporting ? 'cursor-not-allowed opacity-60' : 'hover:border-blue-400/60'
          }`}
        >
          <Download size={18} />
          {isExporting ? 'Gerando XLS...' : 'Exportar Relatorio'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-wolves-border bg-wolves-card/60 p-4">
          <p className="text-sm text-wolves-muted">Treinos realizados</p>
          <p className="text-2xl font-semibold text-white">
            {isLoading ? '...' : summary?.trainings ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-wolves-border bg-wolves-card/60 p-4">
          <p className="text-sm text-wolves-muted">Frequência média geral</p>
          <p className="text-2xl font-semibold text-white">
            {isLoading ? '...' : `${summary?.averageFrequency ?? 0}%`}
          </p>
        </div>
        <div className="rounded-2xl border border-wolves-border bg-wolves-card/60 p-4">
          <p className="text-sm text-wolves-muted">Jogadores com 90%+</p>
          <p className="text-2xl font-semibold text-white">
            {isLoading ? '...' : summary?.above90 ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-wolves-border bg-wolves-card/60 p-4">
          <p className="text-sm text-wolves-muted">Abaixo de 80%</p>
          <p className="text-2xl font-semibold text-white">
            {isLoading ? '...' : summary?.below80 ?? 0}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-wolves-border bg-wolves-card/70 p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[220px]">
            <input
              placeholder="Buscar por jogador..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <Filter className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
          </div>
          <select className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none">
            <option className="text-black">Todos os jogadores</option>
          </select>
          <select
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
          >
            {ranges.map((range) => (
              <option key={range.value} value={range.value} className="text-black">
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-wolves-muted"
              >
                Carregando...
              </div>
            ))}

          {!isLoading &&
            !errorMessage &&
            summary &&
            summary.perPlayer.map((item) => (
              <div key={item.playerId} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-wolves-muted">Resumo por Jogador</p>
                    <p className="text-lg font-semibold text-white">{item.name}</p>
                  </div>
                  <StatusBadge
                    label={item.percentage >= 90 ? 'Excelente' : item.percentage >= 80 ? 'Bom' : 'Atenção'}
                    tone={
                      item.percentage >= 90
                        ? 'success'
                        : item.percentage >= 80
                          ? 'neutral'
                          : 'danger'
                    }
                  />
                </div>
                <p className="mt-6 text-4xl font-semibold text-white">{item.percentage}%</p>
                <p className="text-sm text-wolves-muted">
                  {item.present} de {item.sessions} treinos
                </p>
              </div>
            ))}

          {!isLoading && summary && summary.perPlayer.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-wolves-muted">
              Sem registros de presença no período selecionado.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HistoryPage
