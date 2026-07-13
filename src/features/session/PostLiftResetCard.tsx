import { useState } from 'react';
import { ChevronDown, Leaf } from 'lucide-react';
import type { Exercise, PostLiftReset } from '../../types';
import { ExerciseRow } from './ExerciseRow';
import { cn } from '../../lib/cn';

interface PostLiftResetCardProps {
  reset: PostLiftReset;
  completed: Record<string, boolean>;
  onToggleExercise: (exerciseId: string) => void;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  activeTimerId: string | null;
  setActiveTimerId: (id: string | null) => void;
}

export function PostLiftResetCard({
  reset,
  completed,
  onToggleExercise,
  soundEnabled,
  vibrationEnabled,
  activeTimerId,
  setActiveTimerId,
}: PostLiftResetCardProps) {
  const [expanded, setExpanded] = useState(false);
  if (!reset.enabled) return null;

  const doneCount = reset.exercises.filter((e) => completed[e.id]).length;
  const openTimer = (ex: Exercise) => setActiveTimerId(ex.id);

  return (
    <section className="surface overflow-hidden">
      <h3>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="postlift-body"
          className="flex w-full items-center gap-3 px-3 py-3 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            <Leaf className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="truncate font-semibold">Post-Lift Reset</span>
            <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
              Optional · {doneCount}/{reset.exercises.length} done
            </span>
          </span>
          <ChevronDown
            className={cn('h-5 w-5 shrink-0 text-zinc-400 transition-transform', expanded && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
      </h3>

      {expanded && (
        <div id="postlift-body" className="border-t border-zinc-100 px-3 pb-3 dark:border-zinc-800">
          {reset.exercises.length === 0 ? (
            <p className="py-4 text-sm text-zinc-500 dark:text-zinc-400">No reset exercises configured.</p>
          ) : (
            <ul className="mt-1">
              {reset.exercises.map((ex) => (
                <ExerciseRow
                  key={ex.id}
                  exercise={ex}
                  checked={completed[ex.id] === true}
                  onToggle={() => onToggleExercise(ex.id)}
                  soundEnabled={soundEnabled}
                  vibrationEnabled={vibrationEnabled}
                  timerActive={activeTimerId === ex.id}
                  onOpenTimer={() => openTimer(ex)}
                  onCloseTimer={() => setActiveTimerId(null)}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
