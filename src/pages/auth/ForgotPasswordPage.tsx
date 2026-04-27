import { BrandHeader } from '../../components/shared/BrandHeader'
import { Button } from '../../components/ui/Button'
import { TextInput } from '../../components/ui/TextInput'
import { useAuthActions } from '../../hooks/useAuthActions'

type ForgotPasswordPageProps = {
  onNavigate: (pathname: string) => void
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const { error, isLoading, message, sendResetEmail } = useAuthActions()

  return (
    <section className="mx-auto grid min-h-[calc(100vh-5.25rem)] w-full max-w-6xl place-items-center gap-8 px-5 py-8 sm:py-12 lg:grid-cols-[0.95fr_1.05fr]">
      <BrandHeader
        description="Enter your email address and we will send you a secure link to reset your password."
        eyebrow="Password reset"
        title="Get back into your account."
      />

      <form
        className="w-full max-w-xl rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault()

          const formData = new FormData(event.currentTarget)
          const email = String(formData.get('email') || '')

          void sendResetEmail(email)
        }}
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Email address"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
              {message}
            </p>
          )}

          <Button
            className="mt-2 w-full"
            disabled={isLoading}
            type="submit"
            variant="secondary"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <button
            className="text-sm font-bold text-[var(--color-secondary)]"
            onClick={() => onNavigate('/login')}
            type="button"
          >
            Back to Login
          </button>
        </div>
      </form>
    </section>
  )
}
