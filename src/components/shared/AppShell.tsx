import { Footer } from './Footer'

type AppShellProps = {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[var(--page-background)] text-[var(--text-strong)]">
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </main>
  )
}
