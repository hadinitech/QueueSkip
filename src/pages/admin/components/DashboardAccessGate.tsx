import { AppLoader } from '../../../components/ui/AppLoader'
import { Button } from '../../../components/ui/Button'
import logo from '../../../assets/LOGO.png'

type DashboardAccessGateProps = {
  isCheckingAccess: boolean
  message?: string
  onNavigate: (pathname: string) => void
  title?: string
}

export function DashboardAccessGate({
  isCheckingAccess,
  message,
  onNavigate,
  title,
}: DashboardAccessGateProps) {
  return (
    <section className="mx-auto grid min-h-[70vh] w-full max-w-3xl place-items-center px-5 py-12">
      <div className="rounded-[2rem] bg-white p-6 text-center shadow-xl shadow-slate-200/70 ring-1 ring-slate-100 sm:p-8">
        <img
          alt="QueueSkip logo"
          className="mx-auto h-auto w-36 object-contain"
          src={logo}
        />
        <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
          Secure dashboard
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--color-primary)]">
          {isCheckingAccess ? 'Checking access' : (title || 'Business login required')}
        </h1>
        {isCheckingAccess ? (
          <div className="mt-6">
            <AppLoader label="Please wait while we confirm your secure session." />
          </div>
        ) : (
          <>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600">
              {message ||
                'Sign in with your business account to access your queues, customer list, and serving controls.'}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => onNavigate('/login')} type="button">
                Go to Login
              </Button>
              <Button
                onClick={() => onNavigate('/signup')}
                type="button"
                variant="outline"
              >
                Create Account
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
