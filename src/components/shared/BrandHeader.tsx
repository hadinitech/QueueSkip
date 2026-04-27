type BrandHeaderProps = {
  eyebrow: string
  title: string
  description: string
}

export function BrandHeader({ eyebrow, title, description }: BrandHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--color-secondary)]">
        {eyebrow}
      </p>
      <div className="max-w-2xl">
        <h1 className="text-4xl font-black tracking-tight text-[var(--color-primary)] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          {description}
        </p>
      </div>
    </header>
  )
}
