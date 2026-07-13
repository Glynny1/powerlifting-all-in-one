import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PencilLine, RotateCcw } from 'lucide-react';
import type { ViewId } from '../../types';
import { useApp } from '../../context/AppContext';
import { computeRoutineProgress } from '../../lib/progress';
import { estimateRoutineMinutes } from '../../lib/duration';
import { ProgressBar } from '../../components/ProgressBar';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StageCard } from './StageCard';
import { PostLiftResetCard } from './PostLiftResetCard';

interface WarmupViewProps {
  onNavigate: (view: ViewId) => void;
}

export function WarmupView({ onNavigate }: WarmupViewProps) {
  const {
    data,
    activeRoutine,
    session,
    settings,
    setActiveRoutine,
    toggleExercise,
    completeStageExercises,
    resetSession,
  } = useApp();

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const progress = useMemo(
    () => (activeRoutine ? computeRoutineProgress(activeRoutine, session) : null),
    [activeRoutine, session]
  );

  // All exercise ids in the active routine (stages + reset) for session reset.
  const allExerciseIds = useMemo(() => {
    if (!activeRoutine) return [];
    const ids = activeRoutine.stages.flatMap((s) => s.exercises.map((e) => e.id));
    if (activeRoutine.postLiftReset) ids.push(...activeRoutine.postLiftReset.exercises.map((e) => e.id));
    return ids;
  }, [activeRoutine]);

  // Initialise open stage when the routine changes.
  const routineId = activeRoutine?.id ?? null;
  const prevRoutineIdRef = useRef<string | null>(null);
  const prevCurrentStageRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeRoutine || !progress) return;
    if (prevRoutineIdRef.current !== routineId) {
      prevRoutineIdRef.current = routineId;
      prevCurrentStageRef.current = progress.currentStageId;
      setOpenIds(new Set(progress.currentStageId ? [progress.currentStageId] : []));
      setActiveTimerId(null);
    }
  }, [routineId, activeRoutine, progress]);

  // React to stage advancement (auto-collapse completed / auto-open next).
  useEffect(() => {
    if (!progress) return;
    const prev = prevCurrentStageRef.current;
    const current = progress.currentStageId;
    if (prev === current) return;
    prevCurrentStageRef.current = current;

    setOpenIds((old) => {
      const next = new Set(old);
      if (settings.autoCollapseCompleted && prev) next.delete(prev);
      if (settings.autoOpenNext && current) next.add(current);
      return next;
    });
  }, [progress, settings.autoCollapseCompleted, settings.autoOpenNext]);

  const toggleStageOpen = useCallback((stageId: string) => {
    setOpenIds((old) => {
      const next = new Set(old);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  }, []);

  const handleCompleteStage = useCallback(
    (stageIndex: number) => {
      if (!activeRoutine) return;
      const stage = activeRoutine.stages[stageIndex];
      completeStageExercises(stage.exercises.map((e) => e.id));
    },
    [activeRoutine, completeStageExercises]
  );

  const handleNextStage = useCallback(
    (stageIndex: number) => {
      if (!activeRoutine) return;
      const current = activeRoutine.stages[stageIndex];
      const next = activeRoutine.stages[stageIndex + 1];
      setOpenIds((old) => {
        const set = new Set(old);
        if (settings.autoCollapseCompleted) set.delete(current.id);
        if (next) set.add(next.id);
        return set;
      });
      if (next) {
        // Bring the next stage into view on the next paint.
        requestAnimationFrame(() => {
          document.getElementById(`stage-anchor-${next.id}`)?.scrollIntoView({ block: 'start' });
        });
      }
    },
    [activeRoutine, settings.autoCollapseCompleted]
  );

  const doReset = useCallback(() => {
    resetSession(allExerciseIds);
    setActiveTimerId(null);
    if (activeRoutine && progress) {
      const firstStage = activeRoutine.stages[0];
      setOpenIds(new Set(firstStage ? [firstStage.id] : []));
      prevCurrentStageRef.current = firstStage?.id ?? null;
    }
    setConfirmReset(false);
  }, [resetSession, allExerciseIds, activeRoutine, progress]);

  const onResetClick = useCallback(() => {
    if (settings.confirmResetSession) setConfirmReset(true);
    else doReset();
  }, [settings.confirmResetSession, doReset]);

  if (!activeRoutine || !progress) {
    return (
      <div className="px-4 py-10 text-center text-zinc-500 dark:text-zinc-400">
        <p>No routine selected.</p>
        <button type="button" className="btn-primary mt-4" onClick={() => onNavigate('edit')}>
          Create a routine
        </button>
      </div>
    );
  }

  const estMinutes = activeRoutine.estimatedDuration
    ? activeRoutine.estimatedDuration
    : `≈ ${estimateRoutineMinutes(activeRoutine.stages.map((s) => s.estimatedDuration))} min`;

  const hasProgress = progress.overallCompleted > 0 || session.startedAt !== null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight">Powerlifting Warm-Up</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              className="icon-btn h-11 w-11"
              onClick={onResetClick}
              disabled={!hasProgress}
              aria-label="Reset session"
              title="Reset session"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="icon-btn h-11 w-11"
              onClick={() => onNavigate('edit')}
              aria-label="Edit routine"
              title="Edit routine"
            >
              <PencilLine className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="routine-select" className="field-label">
            Routine
          </label>
          <div className="flex items-center gap-3">
            <select
              id="routine-select"
              value={activeRoutine.id}
              onChange={(e) => setActiveRoutine(e.target.value)}
              className="field-input flex-1"
            >
              {data.routines.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                  {r.isDefault ? ' (default)' : ''}
                </option>
              ))}
            </select>
            <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400 tabular-nums">{estMinutes}</span>
          </div>
        </div>

        <div className="surface px-3 py-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {progress.totalStages === 0
                ? 'No stages yet'
                : progress.allComplete
                  ? 'All stages complete'
                  : `Stage ${progress.currentStageNumber} of ${progress.totalStages}`}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400 tabular-nums">
              {progress.completedStages}/{progress.totalStages} stages
            </span>
          </div>
          <ProgressBar
            className="mt-2"
            value={progress.completedStages}
            max={progress.totalStages}
            label={`${progress.completedStages} of ${progress.totalStages} stages complete`}
          />
        </div>
      </header>

      {/* Completion message */}
      {progress.allComplete && (
        <div
          className="surface border-accent-300 dark:border-accent-800/70 px-4 py-4 text-center"
          role="status"
        >
          <p className="font-semibold">Warm-up complete.</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            You're ready to train. Reset the session when you're done.
          </p>
        </div>
      )}

      {/* Stages */}
      <div className="space-y-2.5">
        {activeRoutine.stages.map((stage, index) => (
          <div key={stage.id} id={`stage-anchor-${stage.id}`} className="scroll-mt-4">
            <StageCard
              stage={stage}
              stageNumber={index + 1}
              progress={progress.stages[index]}
              expanded={openIds.has(stage.id)}
              onToggleExpand={() => toggleStageOpen(stage.id)}
              completed={session.completed}
              onToggleExercise={toggleExercise}
              onCompleteStage={() => handleCompleteStage(index)}
              onNextStage={() => handleNextStage(index)}
              hasNextStage={index < activeRoutine.stages.length - 1}
              soundEnabled={settings.sound}
              vibrationEnabled={settings.vibration}
              activeTimerId={activeTimerId}
              setActiveTimerId={setActiveTimerId}
            />
          </div>
        ))}
      </div>

      {activeRoutine.postLiftReset?.enabled && (
        <PostLiftResetCard
          reset={activeRoutine.postLiftReset}
          completed={session.completed}
          onToggleExercise={toggleExercise}
          soundEnabled={settings.sound}
          vibrationEnabled={settings.vibration}
          activeTimerId={activeTimerId}
          setActiveTimerId={setActiveTimerId}
        />
      )}

      <ConfirmDialog
        open={confirmReset}
        title="Reset session?"
        message="This clears all completion progress for this routine. Your saved routine is not affected."
        confirmLabel="Reset session"
        destructive
        onConfirm={doReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
