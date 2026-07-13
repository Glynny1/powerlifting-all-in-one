import { cn } from '../lib/cn';

interface ProgressBarProps {
  value: number;
  max: number;
  /** Accessible label describing the progress. */
  label: string;
  className?: string;
}

export function ProgressBar({ value, max, label, className }: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800', className)}
    >
      <div
        className="h-full rounded-full bg-accent-600 transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
