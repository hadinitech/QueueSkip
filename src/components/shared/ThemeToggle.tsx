import { useEffect, useState } from 'react'

type ThemeName = 'default' | 'orange' | 'navy' | 'dark'

const themes: Array<{
  color: string
  label: string
  name: ThemeName
}> = [
  { color: '#ffffff', label: 'Default theme', name: 'default' },
  { color: '#ed7f2c', label: 'Orange theme', name: 'orange' },
  { color: '#0d2f64', label: 'Navy theme', name: 'navy' },
  { color: '#111827', label: 'Dark theme', name: 'dark' },
]

function readSavedTheme(): ThemeName {
  const savedTheme = window.localStorage.getItem('queueskip-theme')

  return themes.some((theme) => theme.name === savedTheme)
    ? (savedTheme as ThemeName)
    : 'default'
}

export function ThemeToggle() {
  const [activeTheme, setActiveTheme] = useState<ThemeName>(readSavedTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = activeTheme
    window.localStorage.setItem('queueskip-theme', activeTheme)
  }, [activeTheme])

  return (
    <div
      aria-label="Choose site theme"
      className="fixed bottom-5 right-5 z-[200] flex items-center gap-2 rounded-full bg-white/80 p-1.5 shadow-xl shadow-slate-300/40 ring-1 ring-slate-200/80 backdrop-blur-md"
      role="group"
    >
      {themes.map((theme) => (
        <button
          aria-label={theme.label}
          aria-pressed={activeTheme === theme.name}
          className={`size-7 rounded-full border transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[var(--color-secondary)]/25 ${
            activeTheme === theme.name
              ? 'border-slate-950 ring-2 ring-white'
              : 'border-white/70'
          }`}
          key={theme.name}
          onClick={() => setActiveTheme(theme.name)}
          style={{ backgroundColor: theme.color }}
          title={theme.label}
          type="button"
        />
      ))}
    </div>
  )
}
