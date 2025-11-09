import type { LucideIcon } from 'lucide-react'

type StatCardProps = {
  title: string
  value: string
  description?: string
  accent?: string
  icon: LucideIcon
}

const StatCard = ({ title, value, description, icon: Icon, accent }: StatCardProps) => {
  return (
    <div className="rounded-2xl border border-wolves-border bg-wolves-card/60 p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-wolves-muted">{title}</p>
          <p className="text-3xl font-semibold text-white">{value}</p>
          {description && <p className="text-sm text-wolves-muted">{description}</p>}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent ?? 'bg-blue-500/15 text-blue-400'}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

export default StatCard
