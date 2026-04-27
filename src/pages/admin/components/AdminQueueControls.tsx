import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { TextArea } from '../../../components/ui/TextArea'
import { TextInput } from '../../../components/ui/TextInput'
import type { CreateQueueInput } from '../../../services/supabase/adminQueueService'

type AdminQueueControlsProps = {
  defaultLocation?: string
  error: string | null
  isCreating: boolean
  onClose: () => void
  onCreateQueue: (input: CreateQueueInput) => Promise<boolean>
}

export function AdminQueueControls({
  defaultLocation = '',
  error,
  isCreating,
  onClose,
  onCreateQueue,
}: AdminQueueControlsProps) {
  const [locationValue, setLocationValue] = useState(defaultLocation)

  useEffect(() => {
    setLocationValue(defaultLocation)
  }, [defaultLocation])

  return (
    <form
      className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault()

        const form = event.currentTarget
        const formData = new FormData(form)
        const estimatedWaitMinutes = Number(
          formData.get('estimatedWaitMinutes') || 0,
        )

        void onCreateQueue({
          description: String(formData.get('description') || ''),
          estimatedWaitMinutes,
          lunchTime: String(formData.get('lunchTime') || ''),
          location: locationValue,
          name: String(formData.get('name') || ''),
          title: String(formData.get('title') || ''),
        }).then((wasCreated) => {
          if (wasCreated) {
            form.reset()
            setLocationValue(defaultLocation)
            onClose()
          }
        })
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
            Create queue
          </p>
          <h2 className="mt-2 text-2xl font-black text-[var(--color-primary)]">
            Queue details
          </h2>
          </div>
          <button
            className="rounded-full px-3 py-1 text-sm font-black text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        <TextInput
          label="Queue name"
          name="name"
          placeholder="Service queue"
          required
        />
        <TextInput
          label="Title"
          name="title"
          placeholder="Grant and social support services"
          required
        />
        <TextArea
          label="Description"
          name="description"
          placeholder="Join a queue for grant applications, status checks, and help."
          required
        />
        <TextInput
          label="Lunch time"
          name="lunchTime"
          placeholder="12:30 - 13:30"
          required
        />
        <TextInput
          label="Estimated wait minutes"
          name="estimatedWaitMinutes"
          placeholder="45"
          required
          type="number"
        />
        {error && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
            {error}
          </p>
        )}
        <Button disabled={isCreating} type="submit">
          {isCreating ? 'Creating...' : 'Create Queue'}
        </Button>
      </div>
    </form>
  )
}
