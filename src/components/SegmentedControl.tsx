import { cn } from '../lib/cn';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
}

/** Accessible segmented control implemented as a radiogroup. */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex w-full rounded-lg border border-zinc-300 dark:border-zinc-700 p-0.5 bg-zinc-100 dark:bg-zinc-950"
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 min-h-touch rounded-md px-3 text-sm font-medium transition-colors',
              selected
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
