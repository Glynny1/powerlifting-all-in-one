import { useCallback, useEffect } from 'react';
import { Pause, Play, RotateCcw, X } from 'lucide-react';
import { useTimer } from './useTimer';
import { formatClock } from '../../lib/duration';
import { playChime, vibrate } from '../../lib/feedback';

interface ExerciseTimerProps {
  exerciseName: string;
  durationSeconds: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  onClose: () => void;
  /** Called when the countdown reaches zero (does not auto-check the exercise). */
  onFinish?: () => void;
}

/**
 * Inline countdown for a timed exercise. Only one is rendered at a time
 * (managed by the parent). Finishing never blocks manual completion.
 */
export function ExerciseTimer({
  exerciseName,
  durationSeconds,
  soundEnabled,
  vibrationEnabled,
  onClose,
  onFinish,
}: ExerciseTimerProps) {
  const handleFinish = useCallback(() => {
    playChime(soundEnabled);
    vibrate(vibrationEnabled);
    onFinish?.();
  }, [soundEnabled, vibrationEnabled, onFinish]);

  const { status, remaining, start, pause, resume, reset } = useTimer({
    durationSeconds,
    onFinish: handleFinish,
  });

  // Auto-start when opened.
  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = durationSeconds > 0 ? Math.max(0, Math.min(1, remaining / durationSeconds)) : 0;
  const isRunning = status === 'running';
  const isFinished = status === 'finished';

  return (
    <div
      className="surface-muted mt-2 p-3"
      role="group"
      aria-label={`Timer for ${exerciseName}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0">
          <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90" aria-hidden="true">
            <circle cx="18" cy="18" r="16" fill="none" strokeWidth="3" className="stroke-zinc-300 dark:stroke-zinc-700" />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              className="stroke-accent-600 transition-[stroke-dashoffset] duration-300"
              strokeDasharray={2 * Math.PI * 16}
              strokeDashoffset={2 * Math.PI * 16 * (1 - pct)}
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums"
            aria-hidden="true"
          >
            {formatClock(remaining)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{isFinished ? 'Time complete' : formatClock(remaining) + ' remaining'}</p>
          {/* Announce only the finish, not every tick. */}
          <span className="sr-only" role="status" aria-live="polite">
            {isFinished ? `${exerciseName} timer complete` : ''}
          </span>
          <div className="mt-2 flex items-center gap-1.5">
            {isRunning ? (
              <button type="button" className="btn-secondary h-9 px-3" onClick={pause}>
                <Pause className="h-4 w-4" aria-hidden="true" /> Pause
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary h-9 px-3"
                onClick={isFinished ? start : status === 'paused' ? resume : start}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                {isFinished ? 'Restart' : status === 'paused' ? 'Resume' : 'Start'}
              </button>
            )}
            <button type="button" className="icon-btn h-9 w-9" onClick={reset} aria-label="Reset timer">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button type="button" className="icon-btn h-9 w-9 self-start" onClick={onClose} aria-label="Close timer">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
