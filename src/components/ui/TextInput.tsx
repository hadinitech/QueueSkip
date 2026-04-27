import { useState } from 'react'

type TextInputProps = {
  defaultValue?: string
  disabled?: boolean
  label: string
  name: string
  onChange?: (value: string) => void
  placeholder: string
  required?: boolean
  type?: 'date' | 'email' | 'number' | 'password' | 'tel' | 'text'
  value?: string
}

export function TextInput({
  defaultValue,
  disabled = false,
  label,
  name,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  value,
}: TextInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const isPasswordField = type === 'password'
  const resolvedType = isPasswordField && isPasswordVisible ? 'text' : type

  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <div className="relative">
        <input
          className={`min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-secondary)] focus:ring-4 focus:ring-[var(--color-secondary)]/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
            isPasswordField ? 'pr-14' : ''
          }`}
          defaultValue={defaultValue}
          disabled={disabled}
          name={name}
          onChange={(event) => onChange?.(event.currentTarget.value)}
          placeholder={placeholder}
          required={required}
          type={resolvedType}
          value={value}
        />
        {isPasswordField && (
          <button
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-[var(--color-primary)]"
            onClick={() => setIsPasswordVisible((current) => !current)}
            type="button"
          >
            {isPasswordVisible ? (
              <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
                <path
                  d="M3 3l18 18M10.6 10.6A2 2 0 0 0 13.4 13.4M9.9 5.6A10.7 10.7 0 0 1 12 5.4c4.9 0 8.2 3.3 9.4 5.6a1.8 1.8 0 0 1 0 2c-.5 1-1.6 2.7-3.5 4.1M6.4 6.4C4.5 7.8 3.3 9.6 2.7 11a1.8 1.8 0 0 0 0 2c1.2 2.3 4.5 5.6 9.3 5.6 1.1 0 2.1-.2 3.1-.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            ) : (
              <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
                <path
                  d="M2.7 12a1.8 1.8 0 0 1 0-2c1.2-2.3 4.5-5.6 9.3-5.6s8.2 3.3 9.3 5.6a1.8 1.8 0 0 1 0 2c-1.2 2.3-4.5 5.6-9.3 5.6S3.8 14.3 2.7 12z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            )}
          </button>
        )}
      </div>
    </label>
  )
}
