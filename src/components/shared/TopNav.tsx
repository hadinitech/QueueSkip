import type { User } from '@supabase/supabase-js'
import { useState } from 'react'
import logo from '../../assets/LOGO.png'

type TopNavProps = {
  dashboardPath?: string | null
  isAuthenticated: boolean
  isMenuOpen: boolean
  onLogout: () => void
  onMenuToggle: () => void
  onNavigate: (pathname: string) => void
  showMenuButton: boolean
  user: User | null
}

export function TopNav({
  dashboardPath = null,
  isAuthenticated,
  isMenuOpen,
  onLogout,
  onMenuToggle,
  onNavigate,
  showMenuButton,
  user,
}: TopNavProps) {
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false)
  const isMobileMenuOpen = showMenuButton ? isMenuOpen : isAuthMenuOpen
  const displayName =
    typeof user?.user_metadata.full_name === 'string'
      ? user.user_metadata.full_name
      : user?.email || 'QueueSkip user'
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const handleLogoClick = () => {
    setIsAuthMenuOpen(false)

    if (showMenuButton && isMenuOpen) {
      onMenuToggle()
    }

    onNavigate('/customer')
  }

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[100] border-b border-slate-200/70 shadow-sm shadow-slate-200/40 backdrop-blur-xl"
        style={{ backgroundColor: 'var(--header-background)' }}
      >
        <nav className="relative mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-5">
          <button
            className="flex items-center gap-3 text-left"
            onClick={handleLogoClick}
            type="button"
          >
            <img
              alt="QueueSkip logo"
              className="h-auto w-28 rounded-2xl object-contain px-3 py-2"
              src={logo}
              style={{ backgroundColor: 'var(--logo-background)' }}
            />
          </button>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
            <div className="hidden items-center gap-3 lg:flex">
              {dashboardPath && (
                <button
                  className="rounded-full px-4 py-2 text-sm font-bold text-[var(--color-primary)] transition hover:bg-white"
                  onClick={() => onNavigate(dashboardPath)}
                  type="button"
                >
                  Dashboard
                </button>
              )}
              <button
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--color-primary)] shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5"
                onClick={onLogout}
                type="button"
              >
                Logout
              </button>
              <div
                aria-label={`Signed in as ${displayName}`}
                className="grid size-9 place-items-center rounded-full bg-[var(--color-primary)] text-sm font-black text-white shadow-sm shadow-[#0d2f64]/20"
                title={displayName}
              >
                {initials}
              </div>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <button
                className="rounded-full px-4 py-2 text-sm font-bold text-[var(--color-primary)] transition hover:bg-white"
                onClick={() => onNavigate('/login')}
                type="button"
              >
                Login
              </button>
              <button
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--color-primary)] shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5"
                onClick={() => onNavigate('/signup')}
                type="button"
              >
                Sign up
              </button>
            </div>
          )}
            <button
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="grid size-11 place-items-center rounded-lg bg-white text-[var(--color-primary)] shadow-sm ring-1 ring-slate-200 lg:hidden"
              onClick={() => {
                if (showMenuButton) {
                  onMenuToggle()
                  return
                }

                setIsAuthMenuOpen((isOpen) => !isOpen)
              }}
              type="button"
            >
              {isMobileMenuOpen ? (
                <span className="text-xl font-black leading-none">X</span>
              ) : (
                <span className="flex flex-col gap-1.5">
                  <span className="block h-0.5 w-5 rounded-full bg-[var(--color-primary)]" />
                  <span className="block h-0.5 w-5 rounded-full bg-[var(--color-primary)]" />
                  <span className="block h-0.5 w-5 rounded-full bg-[var(--color-primary)]" />
                </span>
              )}
            </button>

            {!showMenuButton && isAuthMenuOpen && (
              <div className="absolute right-5 top-20 flex w-56 flex-col gap-2 rounded-2xl bg-white p-3 shadow-xl shadow-slate-300/40 ring-1 ring-slate-100 lg:hidden">
                {isAuthenticated ? (
                  <>
                    {dashboardPath && (
                      <button
                        className="rounded-lg px-4 py-3 text-left text-sm font-black text-[var(--color-primary)] transition hover:bg-slate-50"
                        onClick={() => {
                          setIsAuthMenuOpen(false)
                          onNavigate(dashboardPath)
                        }}
                        type="button"
                      >
                        Dashboard
                      </button>
                    )}
                    <button
                      className="rounded-lg px-4 py-3 text-left text-sm font-black text-[var(--color-primary)] transition hover:bg-slate-50"
                      onClick={() => {
                        setIsAuthMenuOpen(false)
                        onLogout()
                      }}
                      type="button"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="rounded-lg px-4 py-3 text-left text-sm font-black text-[var(--color-primary)] transition hover:bg-slate-50"
                      onClick={() => {
                        setIsAuthMenuOpen(false)
                        onNavigate('/login')
                      }}
                      type="button"
                    >
                      Login
                    </button>
                    <button
                      className="rounded-lg bg-[var(--color-accent)] px-4 py-3 text-left text-sm font-black text-white"
                      onClick={() => {
                        setIsAuthMenuOpen(false)
                        onNavigate('/signup')
                      }}
                      type="button"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>
      <div aria-hidden="true" className="h-20" />
    </>
  )
}
