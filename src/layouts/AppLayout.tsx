import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  UserPlus,
  Users,
  CheckCircle,
  History,
  Shuffle,
  Menu,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Cadastrar Jogador', path: '/players/new', icon: UserPlus, exact: true },
  { label: 'Lista de Jogadores', path: '/players', icon: Users, exact: true },
  { label: 'Presenca', path: '/attendance', icon: CheckCircle, exact: true },
  { label: 'Historico', path: '/history', icon: History, exact: true },
  { label: 'Sorteio de Times', path: '/team-draw', icon: Shuffle, exact: true },
]

const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#050912] via-[#05070E] to-[#03050A] text-wolves-text">
      <Sidebar
        items={navItems}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col">
        <header className="border-b border-wolves-border bg-[#090F1B]/80 px-4 py-3 backdrop-blur sm:px-6 sm:py-4 lg:px-10 lg:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white shadow-sm transition hover:bg-white/10 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menu"
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="text-sm uppercase tracking-wider text-blue-400">Wolves Training Hub</p>
                <h1 className="text-xl font-semibold text-white sm:text-2xl">
                  Sistema de gestao de treinos
                </h1>
                <p className="hidden text-sm text-wolves-muted sm:block">
                  Painel do organizador - controle completo do time
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
