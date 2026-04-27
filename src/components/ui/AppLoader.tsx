type AppLoaderProps = {
  className?: string
  label?: string
  size?: 'md' | 'sm'
}

export function AppLoader({
  className = '',
  label,
  size = 'md',
}: AppLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
    >
      <div
        aria-hidden="true"
        className={`app-loader ${size === 'sm' ? 'app-loader-sm' : ''}`}
      />
      {label && (
        <p className="text-center text-sm font-semibold text-slate-500">
          {label}
        </p>
      )}
      <span className="sr-only">{label || 'Loading'}</span>
    </div>
  )
}
