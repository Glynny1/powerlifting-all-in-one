import { STAGE_ICON_KEYS, getStageIcon } from '../../lib/icons';
import { cn } from '../../lib/cn';

interface IconPickerProps {
  value?: string;
  onChange: (key: string) => void;
  label: string;
}

/** Compact grid of selectable stage icons implemented as an accessible radiogroup. */
export function IconPicker({ value, onChange, label }: IconPickerProps) {
  return (
    <div>
      <span className="field-label">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {STAGE_ICON_KEYS.map((key) => {
          const Icon = getStageIcon(key);
          const selected = key === value;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={key}
              onClick={() => onChange(key)}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-lg border transition-colors',
                selected
                  ? 'border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-950/40 dark:text-accent-300'
                  : 'border-zinc-200 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800'
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
