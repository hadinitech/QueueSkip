import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { TextArea } from '../../components/ui/TextArea'
import { TextInput } from '../../components/ui/TextInput'

type ContactFormState = {
  email: string
  message: string
  name: string
  subject: string
}

const emptyForm: ContactFormState = {
  email: '',
  message: '',
  name: '',
  subject: '',
}

export function ContactUsPage() {
  const [form, setForm] = useState<ContactFormState>(emptyForm)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const subject = encodeURIComponent(form.subject.trim() || 'QueueSkip enquiry')
    const body = encodeURIComponent(
      `Name: ${form.name.trim()}\nEmail: ${form.email.trim()}\n\nMessage:\n${form.message.trim()}`,
    )

    window.location.href = `mailto:support@queueskip.co.za?subject=${subject}&body=${body}`
    setForm(emptyForm)
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-10 sm:py-14">
      <div className="rounded-[2.25rem] bg-white/85 p-8 shadow-2xl shadow-slate-300/40 ring-1 ring-white/70 backdrop-blur sm:p-12">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-secondary)]">
          Contact Us
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-[var(--color-primary)] sm:text-5xl">
          We would love to hear from you
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
          Send us your question, support request, or partnership enquiry and the
          QueueSkip team will get back to you.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <form
            className="rounded-[2rem] bg-slate-50/95 p-6 shadow-xl shadow-slate-200/30 ring-1 ring-slate-100 sm:p-8"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Full name"
                name="name"
                onChange={(value) => setForm((current) => ({ ...current, name: value }))}
                placeholder="Your name"
                required
                value={form.name}
              />
              <TextInput
                label="Email"
                name="email"
                onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                placeholder="you@example.com"
                required
                type="email"
                value={form.email}
              />
              <div className="md:col-span-2">
                <TextInput
                  label="Subject"
                  name="subject"
                  onChange={(value) => setForm((current) => ({ ...current, subject: value }))}
                  placeholder="How can we help?"
                  required
                  value={form.subject}
                />
              </div>
              <div className="md:col-span-2">
                <TextArea
                  label="Message"
                  name="message"
                  onChange={(value) => setForm((current) => ({ ...current, message: value }))}
                  placeholder="Tell us what you need help with."
                  required
                  value={form.message}
                />
              </div>
            </div>

            <div className="mt-6">
              <Button type="submit" variant="secondary">
                Send Message
              </Button>
            </div>
          </form>

          <aside className="rounded-[2rem] bg-[var(--color-primary)] px-6 py-7 text-white shadow-xl shadow-[#0d2f64]/20 sm:px-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
              Support
            </p>
            <p className="mt-3 text-2xl font-black tracking-tight">
              support@queueskip.co.za
            </p>
            <p className="mt-4 text-sm leading-7 text-white/85">
              Use the form to send your message quickly, or email us directly if you
              prefer.
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}
