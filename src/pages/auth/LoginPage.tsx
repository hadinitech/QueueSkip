import { BrandHeader } from '../../components/shared/BrandHeader'
import { Button } from '../../components/ui/Button'
import { TextInput } from '../../components/ui/TextInput'
import { useAuthActions } from '../../hooks/useAuthActions'

type LoginPageProps = {
  onNavigate: (pathname: string) => void
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { error, isLoading, login } = useAuthActions()
  const accessReason = new URLSearchParams(window.location.search).get('reason')
  const accessMessage =
    accessReason === 'customer'
      ? 'Sign in with a customer account to view your joined queues.'
      : accessReason === 'business'
        ? 'Sign in with a business account to access your dashboard.'
        : accessReason === 'super-admin'
          ? 'Sign in with a super admin account to manage platform controls.'
          : null

  return (
    <section className="mx-auto grid min-h-[calc(100vh-5.25rem)] w-full max-w-6xl place-items-center gap-8 px-5 py-8 sm:py-12 lg:grid-cols-[0.95fr_1.05fr]">
      <BrandHeader
        description="Sign in to join a queue, manage your place, or run your business dashboard."
        eyebrow="Secure login"
        title="Welcome back to QueueSkip."
      />

      <form
        className="w-full max-w-xl rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault()

          const formData = new FormData(event.currentTarget)
          const email = String(formData.get('email') || '')
          const password = String(formData.get('password') || '')

          void login(email, password, onNavigate)
        }}
      >
        <div className="flex flex-col gap-4">
          {accessMessage && (
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">
              {accessMessage}
            </p>
          )}
          <TextInput
            label="Email address"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
          <TextInput
            label="Password"
            name="password"
            placeholder="Enter your password"
            required
            type="password"
          />
          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
              {error}
            </p>
          )}
          <Button className="mt-2 w-full" disabled={isLoading} type="submit">
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>

          <button
            className="text-sm font-bold text-[var(--color-secondary)]"
            onClick={() => onNavigate('/forgot-password')}
            type="button"
          >
            Forgot password?
          </button>

          <button
            className="text-sm font-bold text-[var(--color-secondary)]"
            onClick={() => onNavigate('/signup')}
            type="button"
          >
            Need an account? Sign up
          </button>
        </div>
      </form>
    </section>
  )
}
