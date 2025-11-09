type StatusBadgeProps = {
  label: string
  tone?: 'success' | 'warning' | 'danger' | 'neutral'
}

const toneMap = {
  success: 'bg-green-500/20 text-green-300 border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  danger: 'bg-red-500/15 text-red-300 border-red-500/30',
  neutral: 'bg-white/5 text-white border-white/10',
}

const StatusBadge = ({ label, tone = 'neutral' }: StatusBadgeProps) => {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[tone]}`}>
      {label}
    </span>
  )
}

export default StatusBadge
