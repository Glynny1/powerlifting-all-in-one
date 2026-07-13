import { cn } from '../lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  id: string;
}

/** Accessible on/off switch built on a native checkbox input. */
export function Toggle({ checked, onChange, label, description, id }: ToggleProps) {
  const descId = description ? `${id}-desc` : undefined;
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-4 cursor-pointer min-h-touch">
      <span className="min-w-0">
        <span className="block font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
        {description && (
          <span id={descId} className="block text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </span>
        )}
      </span>
      <span className="relative inline-flex shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          aria-describedby={descId}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            'h-7 w-12 rounded-full transition-colors',
            'bg-zinc-300 dark:bg-zinc-700 peer-checked:bg-accent-600',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-accent-500 peer-focus-visible:ring-offset-2',
            'peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-zinc-900'
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            'absolute left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5'
          )}
        />
      </span>
    </label>
  );
}
