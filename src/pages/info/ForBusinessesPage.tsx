import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { TextArea } from '../../components/ui/TextArea'
import { TextInput } from '../../components/ui/TextInput'
import { submitBusinessOnboardingRequest } from '../../services/supabase/businessOnboardingService'

const onboardingSteps = [
  {
    description: 'Share your business details in a short onboarding form.',
    title: 'Submit',
  },
  {
    description: 'QueueSkip reviews your request and sends your setup link.',
    title: 'Get Approved',
  },
  {
    description: 'Launch your queue, share your link, and start serving faster.',
    title: 'Go Live',
  },
]

type RequestFormState = {
  businessName: string
  email: string
  location: string
  notes: string
  ownerName: string
  phone: string
}

const emptyForm: RequestFormState = {
  businessName: '',
  email: '',
  location: '',
  notes: '',
  ownerName: '',
  phone: '',
}

export function ForBusinessesPage() {
  const [form, setForm] = useState<RequestFormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      await submitBusinessOnboardingRequest(form)
      setSuccessMessage('Your details have been sent. QueueSkip will contact you soon.')
      setForm(emptyForm)
      setIsModalOpen(false)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to submit your details right now.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
      <div className="rounded-[2.25rem] bg-white/85 p-8 shadow-2xl shadow-slate-300/40 ring-1 ring-white/70 backdrop-blur sm:p-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-secondary)]">
              For Businesses
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-[var(--color-primary)] sm:text-5xl">
              Get Started as a Business
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
              Start with a short request, get approved, and launch your queue fast.
            </p>
          </div>

          <div className="lg:ml-auto">
            <Button onClick={() => setIsModalOpen(true)} type="button" variant="secondary">
              Submit Details
            </Button>
          </div>
        </div>

        {successMessage && (
          <p className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
            {successMessage}
          </p>
        )}

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {onboardingSteps.map((step, index) => (
            <article
              className="rounded-[1.75rem] bg-slate-50/95 p-5 shadow-lg shadow-slate-200/40 ring-1 ring-slate-100"
              key={step.title}
            >
              <div className="grid size-11 place-items-center rounded-full bg-[var(--color-accent)] text-sm font-black text-white">
                {index + 1}
              </div>
              <h2 className="mt-4 text-xl font-black tracking-tight text-[var(--color-primary)]">
                {step.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] bg-[var(--color-primary)] px-6 py-7 text-white shadow-xl shadow-[#0d2f64]/20 sm:px-8">
          <p className="text-base font-black tracking-tight sm:text-lg">
            Simple onboarding. Fast setup. Ready to use.
          </p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/45 p-4">
          <div className="scrollbar-hidden max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-100 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                  Business onboarding
                </p>
                <h2 className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                  Submit your details
                </h2>
              </div>
              <button
                aria-label="Close submit details dialog"
                className="grid size-10 place-items-center rounded-2xl bg-slate-100 text-xl font-black text-[var(--color-primary)]"
                onClick={() => {
                  setError(null)
                  setIsModalOpen(false)
                }}
                type="button"
              >
                X
              </button>
            </div>

            <form className="mt-5" onSubmit={(event) => void handleSubmit(event)}>
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                  label="Business name"
                  name="businessName"
                  onChange={(value) => setForm((current) => ({ ...current, businessName: value }))}
                  placeholder="QueueSkip Salon"
                  required
                  value={form.businessName}
                />
                <TextInput
                  label="Owner name"
                  name="ownerName"
                  onChange={(value) => setForm((current) => ({ ...current, ownerName: value }))}
                  placeholder="Nomsa Dlamini"
                  required
                  value={form.ownerName}
                />
                <TextInput
                  label="Email"
                  name="email"
                  onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                  placeholder="owner@business.com"
                  required
                  type="email"
                  value={form.email}
                />
                <TextInput
                  label="Phone"
                  name="phone"
                  onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
                  placeholder="+27123456789"
                  required
                  type="tel"
                  value={form.phone}
                />
                <div className="md:col-span-2">
                  <TextInput
                    label="Location"
                    name="location"
                    onChange={(value) => setForm((current) => ({ ...current, location: value }))}
                    placeholder="Johannesburg"
                    required
                    value={form.location}
                  />
                </div>
                <div className="md:col-span-2">
                  <TextArea
                    label="Notes"
                    name="notes"
                    onChange={(value) => setForm((current) => ({ ...current, notes: value }))}
                    placeholder="Tell us what kind of queue or service you run."
                    value={form.notes}
                  />
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
                  {error}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button disabled={isSubmitting} type="submit" variant="secondary">
                  {isSubmitting ? 'Submitting...' : 'Submit Details'}
                </Button>
                <Button
                  onClick={() => {
                    setError(null)
                    setIsModalOpen(false)
                  }}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
