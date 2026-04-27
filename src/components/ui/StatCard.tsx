type StatCardProps = {
  label: string
  value: string
  tone?: 'light' | 'accent'
}

export function StatCard({ label, value, tone = 'light' }: StatCardProps) {
  const toneClasses =
    tone === 'accent'
      ? 'bg-[var(--color-accent)] text-white'
      : 'bg-white text-[var(--color-primary)] ring-1 ring-slate-200'

  return (
    <div className={`rounded-3xl p-5 shadow-sm ${toneClasses}`}>
      <p className="text-sm font-semibold opacity-75">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
    </div>
  )
}
