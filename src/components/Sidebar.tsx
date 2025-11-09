import { NavLink, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export type SidebarItem = {
  label: string
  path: string
  icon: LucideIcon
  exact?: boolean
}

type SidebarProps = {
  items: SidebarItem[]
}

const Sidebar = ({ items }: SidebarProps) => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-wolves-border bg-[#0C111D]">
      <div className="flex items-center gap-3 border-b border-wolves-border px-6 py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl font-semibold text-blue-400">
          🐺
        </div>
        <div>
          <p className="text-sm text-wolves-muted">{user?.name ?? 'Organizador'}</p>
          <p className="text-lg font-semibold text-white truncate max-w-[140px]" title={user?.email ?? 'Wolves'}>
            {user?.email ?? 'Wolves'}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        <p className="px-2 text-xs uppercase tracking-wider text-wolves-muted">
          Menu Principal
        </p>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-500/20 text-white shadow-card'
                  : 'text-wolves-muted hover:bg-white/5 hover:text-white',
              ].join(' ')
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-wolves-border p-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-transparent px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
