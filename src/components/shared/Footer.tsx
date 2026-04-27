import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const installFallbackMessage =
  'To add QueueSkip to your home screen, open your browser menu and choose "Add to Home Screen" or "Install App".'

export function Footer() {
  const [installPromptEvent, setInstallPromptEvent] = useState<InstallPromptEvent | null>(null)
  const [installMessage, setInstallMessage] = useState('')

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPromptEvent(event as InstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  async function handleInstallClick() {
    if (!installPromptEvent) {
      setInstallMessage(installFallbackMessage)
      return
    }

    await installPromptEvent.prompt()
    const choice = await installPromptEvent.userChoice

    setInstallMessage(
      choice.outcome === 'accepted'
        ? 'QueueSkip install request sent to your browser.'
        : installFallbackMessage,
    )
    setInstallPromptEvent(null)
  }

  return (
    <footer className="border-t border-slate-200/80 bg-white/80 px-5 py-10 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="grid gap-8 text-sm sm:grid-cols-2 lg:grid-cols-5">
          <section className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-lg font-black text-[var(--color-primary)]">QueueSkip</h2>
            <p className="mt-3 font-semibold text-slate-700">
              Join the queue without being in the queue.
            </p>
            <p className="mt-2 leading-6 text-slate-500">
              Smart queue management for faster, stress-free service.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]">
              Quick Links
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              <a
                className="font-semibold text-slate-600 transition hover:text-[var(--color-primary)]"
                href="/customer"
              >
                Home
              </a>
              <a
                className="font-semibold text-slate-600 transition hover:text-[var(--color-primary)]"
                href="/for-businesses"
              >
                For Businesses
              </a>
              <a
                className="font-semibold text-slate-600 transition hover:text-[var(--color-primary)]"
                href="/how-it-works"
              >
                How It Works
              </a>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]">
              Contact / Support
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              <a
                className="font-semibold text-slate-600 transition hover:text-[var(--color-primary)]"
                href="mailto:support@queueskip.co.za"
              >
                support@queueskip.co.za
              </a>
              <a
                className="font-semibold text-slate-500 transition hover:text-[var(--color-primary)]"
                href="/contact-us"
              >
                Need help? Contact us
              </a>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]">
              Legal
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              <a
                className="font-semibold text-slate-600 transition hover:text-[var(--color-primary)]"
                href="/privacy-policy"
              >
                Privacy Policy
              </a>
              <a
                className="font-semibold text-slate-600 transition hover:text-[var(--color-primary)]"
                href="/terms-of-service"
              >
                Terms of Service
              </a>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]">
              App Access
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              <button
                className="w-fit rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"
                onClick={() => void handleInstallClick()}
                type="button"
              >
                Add To Home Screen
              </button>
              {installMessage && <p className="max-w-xs leading-6 text-slate-500">{installMessage}</p>}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold">&copy; 2026 QueueSkip. All rights reserved.</p>
          <p>
            Designed by{' '}
            <a
              className="font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-accent)]"
              href="https://hadiniholdings.co.za"
              rel="noreferrer"
              target="_blank"
            >
              Hadini Holdings
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
