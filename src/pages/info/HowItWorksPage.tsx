import { withBasePath } from '../../utils/appPath'

const customerSteps: Step[] = [
  {
    description: 'Enter your name and phone number to join a queue from your phone.',
    icon: 'user',
    title: 'Join the Queue',
  },
  {
    description: 'See your place in line and estimated wait time in real time.',
    icon: 'clock',
    title: 'Track Your Position',
  },
  {
    description: 'Show up only when it is your turn. No waiting in line.',
    icon: 'check',
    title: 'Arrive When Called',
  },
]

const businessSteps: Step[] = [
  {
    description: 'Set up a digital queue in seconds from your dashboard.',
    icon: 'store',
    title: 'Create a Queue',
  },
  {
    description: 'View your queue, call the next customer, and keep things moving.',
    icon: 'group',
    title: 'Manage Customers',
  },
  {
    description: 'Reduce crowding, improve flow, and deliver faster service.',
    icon: 'trend',
    title: 'Serve Efficiently',
  },
]

type Step = {
  description: string
  icon: 'check' | 'clock' | 'group' | 'store' | 'trend' | 'user'
  title: string
}

type StepSectionProps = {
  heading: string
  icon: 'group' | 'store'
  steps: Step[]
}

function SectionIcon({ icon }: { icon: 'group' | 'store' }) {
  if (icon === 'store') {
    return (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
        <path
          d="M5 10.5h14v8a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5v-8zm1-4h12l1.2 3.2A2 2 0 0 1 17.33 12H6.67A2 2 0 0 1 4.8 9.7L6 6.5zM9 14.5h6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM4.5 18a3.5 3.5 0 0 1 3.5-3.5h.5A3.5 3.5 0 0 1 12 18m2.5 0a3 3 0 0 1 3-3h.5a3 3 0 0 1 3 3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function StepIcon({ icon }: { icon: Step['icon'] }) {
  if (icon === 'user') {
    return (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm-6 7a6 6 0 0 1 12 0"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </svg>
    )
  }

  if (icon === 'clock') {
    return (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 8.5V12l2.5 2.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </svg>
    )
  }

  if (icon === 'check') {
    return (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="m8.5 12 2.2 2.2 4.8-4.8"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    )
  }

  if (icon === 'store') {
    return (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
        <path
          d="M5 10.5h14v8a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5v-8zm1-4h12l1.2 3.2A2 2 0 0 1 17.33 12H6.67A2 2 0 0 1 4.8 9.7L6 6.5z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    )
  }

  if (icon === 'group') {
    return (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
        <path
          d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM4.5 18a3.5 3.5 0 0 1 3.5-3.5h.5A3.5 3.5 0 0 1 12 18m2.5 0a3 3 0 0 1 3-3h.5a3 3 0 0 1 3 3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M7 16.5 11 12l2.5 2.5L17 9m0 0h-3m3 0v3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function StepSection({ heading, icon, steps }: StepSectionProps) {
  return (
    <section className="rounded-[1.6rem] bg-white/92 p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.2)] ring-1 ring-white/80 sm:p-7">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-[var(--color-primary)]/8 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/8">
          <SectionIcon icon={icon} />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-[var(--color-primary)]">
          {heading}
        </h2>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {steps.map((step, index) => (
          <article className="grid grid-cols-[2.6rem_1fr] gap-4" key={step.title}>
            <div className="flex flex-col items-center">
              <div className="grid size-10 place-items-center rounded-full bg-[var(--color-primary)] text-sm font-black text-white shadow-lg shadow-[var(--color-primary)]/20">
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className="mt-2 h-full min-h-10 w-px bg-slate-200" />
              )}
            </div>

            <div className="flex gap-3 rounded-[1.2rem] bg-slate-50/95 p-3.5 ring-1 ring-slate-100">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-[var(--color-primary)] shadow-sm ring-1 ring-slate-100">
                <StepIcon icon={step.icon} />
              </div>
              <div>
                <h3 className="text-base font-black text-[var(--color-primary)]">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function HowItWorksPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
      <div
        className="relative overflow-hidden rounded-[2.4rem] px-6 py-8 sm:px-8 sm:py-10"
        style={{
          background:
            'radial-gradient(circle at 70% 0%, rgb(13 47 100 / 0.08) 0, transparent 20rem), linear-gradient(180deg, rgb(255 255 255 / 0.96) 0%, rgb(244 248 255 / 0.92) 100%)',
        }}
      >
        <div className="pointer-events-none absolute right-6 top-8 hidden grid-cols-4 gap-2 opacity-40 sm:grid">
          {Array.from({ length: 24 }).map((_, index) => (
            <span
              className="block size-1.5 rounded-full bg-[var(--color-secondary)]/35"
              key={index}
            />
          ))}
        </div>

        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--color-accent)]">
          How It Works
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight tracking-tight text-[var(--color-primary)] sm:text-5xl">
          Simple queueing for customers and businesses
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
          QueueSkip makes it easy to join, track, and manage queues without the
          stress of standing in line.
        </p>

        <div className="mt-9 grid gap-5 lg:grid-cols-2">
          <StepSection heading="For Customers" icon="group" steps={customerSteps} />
          <StepSection heading="For Businesses" icon="store" steps={businessSteps} />
        </div>

        <div className="mt-8 rounded-[1.8rem] bg-[var(--color-primary)] px-5 py-5 text-white shadow-[0_24px_60px_-32px_rgba(13,47,100,0.65)] sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M4 12h16M12 4a13 13 0 0 1 0 16M12 4a13 13 0 0 0 0 16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </div>
              <div>
                <p className="text-base font-black">Simple. Fast. No app needed.</p>
                <p className="mt-1 text-sm leading-6 text-white/78">
                  QueueSkip works directly in your browser with minimal data usage.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-[#ed7f2c]/20 transition hover:-translate-y-0.5 hover:opacity-95"
                href={withBasePath('/signup')}
              >
                Get Started
              </a>
              <a
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/18 bg-white/6 px-5 py-2.5 text-sm font-black text-white transition hover:bg-white/10"
                href={withBasePath('/customer')}
              >
                Add to Home Screen
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
