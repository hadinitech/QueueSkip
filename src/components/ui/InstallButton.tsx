import { useState } from 'react'
import { usePWAInstall } from '../../hooks/usePWAInstall'

type InstallButtonProps = {
  buttonClassName?: string
  messageClassName?: string
}

export function InstallButton({
  buttonClassName = '',
  messageClassName = 'text-slate-500',
}: InstallButtonProps) {
  const { installApp, isInstallable, isInstalled, isIosInstallHintAvailable } =
    usePWAInstall()
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isInstalling, setIsInstalling] = useState(false)

  if (isInstalled) {
    return null
  }

  if (!isInstallable && !isIosInstallHintAvailable) {
    return null
  }

  async function handleInstallClick() {
    if (isIosInstallHintAvailable) {
      setFeedbackMessage('Tap Share, then choose Add to Home Screen.')
      return
    }

    setIsInstalling(true)
    setFeedbackMessage(null)

    try {
      const outcome = await installApp()

      if (outcome === 'accepted') {
        setFeedbackMessage('App installation started.')
        return
      }

      if (outcome === 'dismissed') {
        setFeedbackMessage('Installation was dismissed.')
      }
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        className={`inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#0d2f64]/20 transition hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-[var(--color-secondary)]/20 ${buttonClassName}`}
        onClick={() => void handleInstallClick()}
        type="button"
      >
        {isInstalling ? 'Installing...' : 'Install App'}
      </button>

      {isIosInstallHintAvailable && (
        <p className={`text-sm leading-6 ${messageClassName}`}>
          Tap Share, then choose Add to Home Screen.
        </p>
      )}

      {feedbackMessage && !isIosInstallHintAvailable && (
        <p className={`text-sm leading-6 ${messageClassName}`}>{feedbackMessage}</p>
      )}
    </div>
  )
}
