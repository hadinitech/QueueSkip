import { Button } from '../../../components/ui/Button'
import { TextInput } from '../../../components/ui/TextInput'

type CustomerJoinCardProps = {
  error: string | null
  isJoining: boolean
  queueName: string
  onJoinQueue: (details: { name: string; phone: string }) => void
}

export function CustomerJoinCard({
  error,
  isJoining,
  queueName,
  onJoinQueue,
}: CustomerJoinCardProps) {
  return (
    <form
      className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const name = String(formData.get('name') || 'QueueSkip customer')
        const phone = String(formData.get('phone') || '+27 72 123 4567')

        onJoinQueue({ name, phone })
      }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
            Join queue
          </p>
          <h2 className="mt-2 text-2xl font-black text-[var(--color-primary)]">
            {queueName}
          </h2>
        </div>
        <TextInput
          label="Full name"
          name="name"
          placeholder="Thando Mokoena"
          required
        />
        <TextInput
          label="Phone number"
          name="phone"
          placeholder="+27 72 123 4567"
          required
          type="tel"
        />
        {error && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
            {error}
          </p>
        )}
        <Button
          className="mt-2 w-full"
          disabled={isJoining}
          type="submit"
          variant="secondary"
        >
          {isJoining ? 'Joining...' : 'Join Queue'}
        </Button>
      </div>
    </form>
  )
}
