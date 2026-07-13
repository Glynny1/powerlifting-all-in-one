import { Check, ChevronDown, CircleCheck } from 'lucide-react';
import type { Exercise, WarmupStage } from '../../types';
import type { StageProgress } from '../../lib/progress';
import { getStageIcon } from '../../lib/icons';
import { ExerciseRow } from './ExerciseRow';
import { cn } from '../../lib/cn';

interface StageCardProps {
  stage: WarmupStage;
  stageNumber: number;
  progress: StageProgress;
  expanded: boolean;
  onToggleExpand: () => void;
  completed: Record<string, boolean>;
  onToggleExercise: (exerciseId: string) => void;
  onCompleteStage: () => void;
  onNextStage: () => void;
  hasNextStage: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  activeTimerId: string | null;
  setActiveTimerId: (id: string | null) => void;
}

export function StageCard({
  stage,
  stageNumber,
  progress,
  expanded,
  onToggleExpand,
  completed,
  onToggleExercise,
  onCompleteStage,
  onNextStage,
  hasNextStage,
  soundEnabled,
  vibrationEnabled,
  activeTimerId,
  setActiveTimerId,
}: StageCardProps) {
  const Icon = getStageIcon(stage.icon);
  const bodyId = `stage-body-${stage.id}`;
  const isComplete = progress.isComplete;

  const openTimer = (ex: Exercise) => setActiveTimerId(ex.id);

  return (
    <section
      className={cn(
        'surface overflow-hidden transition-colors',
        isComplete && 'border-accent-200 dark:border-accent-900/60'
      )}
    >
      <h3>
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={expanded}
          aria-controls={bodyId}
          className="flex w-full items-center gap-3 px-3 py-3 text-left"
        >
          <span
            className={cn(
              'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
              isComplete
                ? 'bg-accent-600 text-white'
                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
            )}
          >
            {isComplete ? <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" /> : stageNumber}
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <Icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
              <span className="truncate font-semibold">{stage.name}</span>
            </span>
            <span className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              {stage.estimatedDuration && <span>{stage.estimatedDuration}</span>}
              {stage.exercises.length > 0 && (
                <span className="tabular-nums">
                  {progress.completed}/{stage.exercises.length} done
                </span>
              )}
            </span>
          </span>

          <span className="sr-only">{isComplete ? 'Stage complete.' : 'Stage in progress.'}</span>
          <ChevronDown
            className={cn(
              'h-5 w-5 shrink-0 text-zinc-400 transition-transform',
              expanded && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </button>
      </h3>

      {expanded && (
        <div id={bodyId} className="border-t border-zinc-100 px-3 pb-3 dark:border-zinc-800">
          {stage.note && (
            <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-950 dark:text-zinc-300">
              {stage.note}
            </p>
          )}

          {stage.exercises.length === 0 ? (
            <p className="py-4 text-sm text-zinc-500 dark:text-zinc-400">No exercises in this stage yet.</p>
          ) : (
            <ul className="mt-1">
              {stage.exercises.map((ex) => (
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

          <div className="mt-3 flex gap-2">
            <button type="button" className="btn-secondary flex-1" onClick={onCompleteStage} disabled={isComplete}>
              <CircleCheck className="h-4 w-4" aria-hidden="true" />
              {isComplete ? 'Stage complete' : 'Complete stage'}
            </button>
            {hasNextStage && (
              <button type="button" className="btn-primary flex-1" onClick={onNextStage}>
                Next stage
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
