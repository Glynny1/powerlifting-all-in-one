import { useId } from 'react';
import { Timer as TimerIcon, Info } from 'lucide-react';
import type { Exercise } from '../../types';
import { Checkbox } from '../../components/Checkbox';
import { ExerciseTimer } from '../timer/ExerciseTimer';
import { cn } from '../../lib/cn';

interface ExerciseRowProps {
  exercise: Exercise;
  checked: boolean;
  onToggle: () => void;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  timerActive: boolean;
  onOpenTimer: () => void;
  onCloseTimer: () => void;
}

export function ExerciseRow({
  exercise,
  checked,
  onToggle,
  soundEnabled,
  vibrationEnabled,
  timerActive,
  onOpenTimer,
  onCloseTimer,
}: ExerciseRowProps) {
  const checkboxId = useId();
  const hasTimer = exercise.timer?.enabled && (exercise.timer.durationSeconds ?? 0) > 0;
  const hasCues = (exercise.cues?.length ?? 0) > 0;
  const hasAlternatives = (exercise.alternatives?.length ?? 0) > 0;

  return (
    <li className="density-py border-t border-zinc-100 dark:border-zinc-800 first:border-t-0">
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Checkbox id={checkboxId} checked={checked} onChange={onToggle} label={`Mark ${exercise.name} complete`} hideLabel />
        </div>

        <div className="min-w-0 flex-1">
          <label htmlFor={checkboxId} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 cursor-pointer">
            <span className={cn('font-medium leading-snug', checked && 'text-zinc-400 line-through dark:text-zinc-600')}>
              {exercise.name}
            </span>
            {exercise.prescription && (
              <span className="text-sm font-semibold text-accent-700 dark:text-accent-400 tabular-nums">
                {exercise.prescription}
              </span>
            )}
            {exercise.optional && (
              <span className="chip bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">optional</span>
            )}
          </label>

          {exercise.note && (
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{exercise.note}</p>
          )}

          {hasAlternatives && (
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="font-medium">or:</span> {exercise.alternatives!.join(' · ')}
            </p>
          )}

          {hasCues && (
            <details className="mt-1 group">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
                Cues ({exercise.cues!.length})
              </summary>
              <ul className="mt-1 space-y-0.5 pl-4">
                {exercise.cues!.map((cue, i) => (
                  <li key={i} className="list-disc text-sm text-zinc-600 dark:text-zinc-300 marker:text-accent-500">
                    {cue}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {timerActive && hasTimer && (
            <ExerciseTimer
              exerciseName={exercise.name}
              durationSeconds={exercise.timer!.durationSeconds!}
              soundEnabled={soundEnabled}
              vibrationEnabled={vibrationEnabled}
              onClose={onCloseTimer}
            />
          )}
        </div>

        {hasTimer && !timerActive && (
          <button
            type="button"
            onClick={onOpenTimer}
            className="icon-btn h-11 w-11 shrink-0 text-accent-600 dark:text-accent-400"
            aria-label={`Start timer for ${exercise.name}`}
          >
            <TimerIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </li>
  );
}
