type TextAreaProps = {
  defaultValue?: string
  disabled?: boolean
  label: string
  name: string
  onChange?: (value: string) => void
  placeholder: string
  required?: boolean
  value?: string
}

export function TextArea({
  defaultValue,
  disabled = false,
  label,
  name,
  onChange,
  placeholder,
  required = false,
  value,
}: TextAreaProps) {
  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <textarea
        className="min-h-28 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-secondary)] focus:ring-4 focus:ring-[var(--color-secondary)]/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        defaultValue={defaultValue}
        disabled={disabled}
        name={name}
        onChange={(event) => onChange?.(event.currentTarget.value)}
        placeholder={placeholder}
        required={required}
        value={value}
      />
    </label>
  )
}
