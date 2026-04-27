type InfoPageProps = {
  ctaHref: string
  ctaLabel: string
  description: string
  eyebrow: string
  title: string
}

export function InfoPage({
  ctaHref,
  ctaLabel,
  description,
  eyebrow,
  title,
}: InfoPageProps) {
  const isExternal = ctaHref.startsWith('mailto:')

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 items-center px-5 py-10 sm:py-14">
      <div className="w-full rounded-[2rem] bg-white/85 p-8 shadow-2xl shadow-slate-300/40 ring-1 ring-white/70 backdrop-blur sm:p-12">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-secondary)]">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-[var(--color-primary)] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
          {description}
        </p>
        <a
          className="mt-8 inline-flex rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#ed7f2c]/20 transition hover:-translate-y-0.5"
          href={ctaHref}
          rel={isExternal ? 'noreferrer' : undefined}
          target={isExternal ? '_blank' : undefined}
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  )
}
