import { Check } from 'lucide-react';
import { cn } from '../lib/cn';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Visually hide the label but keep it for screen readers. */
  hideLabel?: boolean;
  id?: string;
}

/**
 * Large, accessible checkbox. Built on a native input for keyboard + screen
 * reader support, with a custom visual box. Tap target is at least 44px.
 */
export function Checkbox({ checked, onChange, label, hideLabel, id }: CheckboxProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer select-none min-h-touch',
        hideLabel && 'gap-0'
      )}
      htmlFor={id}
    >
      <span className="relative inline-flex items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            'h-7 w-7 rounded-md border-2 flex items-center justify-center transition-colors',
            'border-zinc-400 dark:border-zinc-600',
            'peer-checked:bg-accent-600 peer-checked:border-accent-600',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-accent-500 peer-focus-visible:ring-offset-2',
            'peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-zinc-900'
          )}
        >
          <Check
            className={cn('h-5 w-5 text-white transition-opacity', checked ? 'opacity-100' : 'opacity-0')}
            strokeWidth={3}
          />
        </span>
      </span>
      <span className={cn(hideLabel && 'sr-only')}>{label}</span>
    </label>
  );
}
