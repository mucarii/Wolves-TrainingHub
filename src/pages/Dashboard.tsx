import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  CheckCircle,
  TrendingUp,
  UserPlus,
  ClipboardCheck,
  List,
  History as HistoryIcon,
  Shuffle,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import { dashboardService, type DashboardOverview } from '../services/dashboardService'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })

const DashboardPage = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setIsLoading(true)
        setErrorMessage(null)
        const data = await dashboardService.getOverview()
        setOverview(data)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Não foi possível carregar o dashboard.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadOverview()
  }, [])

  const stats = useMemo(() => {
    return [
      {
        title: 'Jogadores Cadastrados',
        value: overview ? String(overview.players.total) : isLoading ? '...' : '0',
        description: overview
          ? `${overview.players.active} jogadores ativos`
          : 'Carregando estatísticas',
        icon: Users,
      },
      {
        title: 'Presença Hoje',
        value: overview ? String(overview.attendanceToday.present) : isLoading ? '...' : '0',
        description: 'Jogadores presentes no treino',
        icon: CheckCircle,
        accent: 'bg-green-500/15 text-green-400',
      },
      {
        title: 'Frequência Hoje',
        value: overview ? `${overview.attendanceToday.percentage}%` : isLoading ? '...' : '0%',
        description: overview
          ? `${overview.attendanceToday.present}/${overview.attendanceToday.total} confirmados`
          : 'Aguardando registros',
        icon: TrendingUp,
        accent: 'bg-purple-500/20 text-purple-300',
      },
    ]
  }, [overview, isLoading])

  const quickActions = [
    {
      title: 'Cadastrar Jogador',
      description: 'Adicionar novo membro ao time',
      icon: UserPlus,
      link: '/players/new',
    },
    {
      title: 'Registrar Presença',
      description: 'Marcar presença no treino',
      icon: ClipboardCheck,
      link: '/attendance',
    },
    {
      title: 'Ver Jogadores',
      description: 'Lista completa do time',
      icon: List,
      link: '/players',
    },
    {
      title: 'Histórico',
      description: 'Consultar presenças anteriores',
      icon: HistoryIcon,
      link: '/history',
    },
    {
      title: 'Sorteio de Times',
      description: 'Formar times automaticamente',
      icon: Shuffle,
      link: '/team-draw',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-widest text-blue-400">Wolves Training Hub</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Dashboard</h2>
        <p className="text-sm text-wolves-muted">Bem-vindo ao sistema de gestão dos Wolves!</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <section>
        <h3 className="text-xl font-semibold text-white">Ações Rápidas</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className="group rounded-2xl border border-wolves-border bg-wolves-card/60 p-5 transition hover:border-blue-500/50 hover:bg-blue-500/5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{action.title}</p>
                  <p className="text-sm text-wolves-muted">{action.description}</p>
                </div>
                <div className="rounded-2xl bg-blue-500/15 p-3 text-blue-400 transition group-hover:bg-blue-500/25">
                  <action.icon size={22} />
                </div>
              </div>
              <button className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
                Acessar
              </button>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Atividade Recente</h3>
          <button className="text-sm font-semibold text-blue-400 hover:text-blue-300">
            Atualizado automaticamente
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {errorMessage && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/5 px-5 py-4 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          {!errorMessage && isLoading && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-wolves-muted">
              Carregando atividade dos últimos treinos...
            </div>
          )}

          {!errorMessage &&
            !isLoading &&
            overview &&
            overview.recentSessions.length > 0 &&
            overview.recentSessions.map((item) => (
              <div
                key={item.trainingDate}
                className="flex items-center justify-between rounded-2xl border border-wolves-border bg-wolves-card/60 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-white">
                    {item.present} jogadores presentes (
                    {Math.round((item.present / item.total) * 100)}%)
                  </p>
                  <p className="text-sm text-wolves-muted">
                    {dateFormatter.format(new Date(item.trainingDate))}
                  </p>
                </div>
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300">
                  {item.present}/{item.total}
                </span>
              </div>
            ))}

          {!errorMessage && !isLoading && overview && overview.recentSessions.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-wolves-muted">
              Nenhuma presença registrada ainda. Inicie um treino para ver o histórico aqui.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
