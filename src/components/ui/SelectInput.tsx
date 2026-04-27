type SelectInputOption = {
  label: string
  value: string
}

type SelectInputProps = {
  disabled?: boolean
  label: string
  name: string
  onChange?: (value: string) => void
  options: SelectInputOption[]
  placeholder: string
  required?: boolean
  value?: string
}

export function SelectInput({
  disabled = false,
  label,
  name,
  onChange,
  options,
  placeholder,
  required = false,
  value,
}: SelectInputProps) {
  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <select
        className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-[var(--color-secondary)] focus:ring-4 focus:ring-[var(--color-secondary)]/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        disabled={disabled}
        name={name}
        onChange={(event) => onChange?.(event.currentTarget.value)}
        required={required}
        value={value}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
