type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger'

type ButtonProps = {
  children: React.ReactNode
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: ButtonVariant
  className?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--color-primary)] text-white shadow-lg shadow-[#0d2f64]/20',
  secondary:
    'bg-[var(--color-accent)] text-white shadow-lg shadow-[#ed7f2c]/20',
  outline:
    'border border-slate-200 bg-white text-[var(--color-primary)] shadow-sm',
  danger: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-100',
}

export function Button({
  children,
  disabled = false,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
}: ButtonProps) {
  return (
    <button
      className={`min-h-12 rounded-2xl px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-[var(--color-secondary)]/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  )
}
