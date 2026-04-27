import { useState } from 'react'
import { BrandHeader } from '../../components/shared/BrandHeader'
import { Button } from '../../components/ui/Button'
import { PlaceAutocompleteInput } from '../../components/ui/PlaceAutocompleteInput'
import { TextInput } from '../../components/ui/TextInput'
import { useAuthActions } from '../../hooks/useAuthActions'

type SignupPageProps = {
  onNavigate: (pathname: string) => void
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const [locationInput, setLocationInput] = useState('')
  const [locationError, setLocationError] = useState<string | null>(null)
  const [passwordValue, setPasswordValue] = useState('')
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string
    locationLabel: string
  } | null>(null)
  const { error, isLoading, message, signup } = useAuthActions()

  function validateSignupForm(
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) {
    if (fullName.trim().length < 2) {
      return 'Please enter your full name.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address.'
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long.'
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return 'Password must include at least one letter and one number.'
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match.'
    }

    return null
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-5.25rem)] w-full max-w-6xl place-items-center gap-8 px-5 py-8 sm:py-12 lg:grid-cols-[0.95fr_1.05fr]">
      <BrandHeader
        description="Create your account to manage queues, track your place, and keep every visit moving."
        eyebrow="Create account"
        title="Start using QueueSkip today."
      />

      <form
        className="w-full max-w-xl rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault()
          setFormError(null)
          setLocationError(null)

          const formData = new FormData(event.currentTarget)
          const fullName = String(formData.get('fullName') || '')
          const email = String(formData.get('email') || '')
          const password = String(formData.get('password') || '')
          const confirmPassword = String(formData.get('confirmPassword') || '')

          const validationError = validateSignupForm(
            fullName,
            email,
            password,
            confirmPassword,
          )

          if (validationError) {
            setFormError(validationError)
            return
          }

          if (!selectedLocation) {
            setLocationError('Please search and select your location from the suggestions.')
            return
          }

          void signup(
            fullName,
            email,
            selectedLocation.locationLabel,
            password,
            onNavigate,
          )
        }}
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Full name"
            name="fullName"
            placeholder="Thando Mokoena"
            required
          />
          <TextInput
            label="Email address"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
          <PlaceAutocompleteInput
            helperText="Search your suburb, city, or address and choose the correct suggestion."
            label="Location"
            onInputChange={(value) => {
              setLocationInput(value)
              setSelectedLocation(null)
              setLocationError(null)
            }}
            onPlaceSelected={(place) => {
              setLocationInput(place.address)
              setSelectedLocation({
                address: place.address,
                locationLabel:
                  place.city || place.province || place.country || place.address,
              })
              setLocationError(null)
            }}
            placeholder="Search your area"
            required
            value={locationInput}
          />
          <TextInput
            label="Password"
            name="password"
            onChange={setPasswordValue}
            placeholder="Create a secure password"
            required
            type="password"
            value={passwordValue}
          />
          <TextInput
            label="Confirm password"
            name="confirmPassword"
            onChange={setConfirmPasswordValue}
            placeholder="Repeat your password"
            required
            type="password"
            value={confirmPasswordValue}
          />
          {formError && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
              {formError}
            </p>
          )}
          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
              {error}
            </p>
          )}
          {locationError && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
              {locationError}
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
            {isLoading ? 'Creating account...' : 'Sign up'}
          </Button>
          <button
            className="text-sm font-bold text-[var(--color-secondary)]"
            onClick={() => onNavigate('/login')}
            type="button"
          >
            Already have an account? Login
          </button>
        </div>
      </form>
    </section>
  )
}
