/** A pill-shaped single choice picker, sized for the 720-wide game stage. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  size,
}: {
  label: string
  options: [T, string][]
  value: T
  onChange(value: T): void
  size: 'sm' | 'lg'
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-2 rounded-full bg-black/30 p-2">
      {options.map(([id, text]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => value !== id && onChange(id)}
          className={`flex-1 rounded-full font-semibold transition ${size === 'lg' ? 'h-[84px] text-[32px]' : 'h-[64px] text-[26px]'} ${
            value === id ? 'bg-white text-bg' : 'text-white/65 active:bg-white/10'
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  )
}
