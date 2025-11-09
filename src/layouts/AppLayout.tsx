import { Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  UserPlus,
  Users,
  CheckCircle,
  History,
  Shuffle,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Cadastrar Jogador', path: '/players/new', icon: UserPlus, exact: true },
  { label: 'Lista de Jogadores', path: '/players', icon: Users, exact: true },
  { label: 'Presença', path: '/attendance', icon: CheckCircle, exact: true },
  { label: 'Histórico', path: '/history', icon: History, exact: true },
  { label: 'Sorteio de Times', path: '/team-draw', icon: Shuffle, exact: true },
]

const AppLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#050912] via-[#05070E] to-[#03050A] text-wolves-text">
      <Sidebar items={navItems} />

      <div className="flex flex-1 flex-col">
        <header className="border-b border-wolves-border bg-[#090F1B]/80 px-10 py-6 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-blue-400">Wolves Training Hub</p>
              <h1 className="text-2xl font-semibold text-white">
                Sistema de gestão de treinos
              </h1>
              <p className="text-sm text-wolves-muted">
                Painel do organizador • controle completo do time
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-right text-sm text-white/80">
              Domingo, 9 de novembro de 2025
              <p className="text-wolves-muted">Última sincronização há 5 minutos</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto w-full max-w-6xl space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
