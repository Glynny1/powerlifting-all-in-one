import type { Routine, SessionState, WarmupStage } from '../types';

export interface StageProgress {
  stageId: string;
  total: number;
  requiredTotal: number;
  completed: number;
  requiredCompleted: number;
  /** A stage is "done" once all its non-optional exercises are checked. */
  isComplete: boolean;
}

export interface RoutineProgress {
  stages: StageProgress[];
  totalStages: number;
  completedStages: number;
  /** 1-based index of the first incomplete stage, or null when all complete. */
  currentStageNumber: number | null;
  currentStageId: string | null;
  allComplete: boolean;
  overallCompleted: number;
  overallRequired: number;
}

export function computeStageProgress(
  stage: WarmupStage,
  completed: Record<string, boolean>
): StageProgress {
  let done = 0;
  let requiredTotal = 0;
  let requiredCompleted = 0;
  for (const ex of stage.exercises) {
    const isDone = completed[ex.id] === true;
    if (isDone) done += 1;
    if (!ex.optional) {
      requiredTotal += 1;
      if (isDone) requiredCompleted += 1;
    }
  }
  return {
    stageId: stage.id,
    total: stage.exercises.length,
    requiredTotal,
    completed: done,
    requiredCompleted,
    // Empty stages count as complete so they never block progression.
    isComplete: requiredTotal === 0 ? true : requiredCompleted === requiredTotal,
  };
}

export function computeRoutineProgress(
  routine: Routine,
  session: SessionState
): RoutineProgress {
  const completed = session.completed;
  const stages = routine.stages.map((s) => computeStageProgress(s, completed));
  const completedStages = stages.filter((s) => s.isComplete).length;

  const firstIncompleteIndex = stages.findIndex((s) => !s.isComplete);
  const allComplete = routine.stages.length > 0 && firstIncompleteIndex === -1;

  const overallCompleted = stages.reduce((n, s) => n + s.requiredCompleted, 0);
  const overallRequired = stages.reduce((n, s) => n + s.requiredTotal, 0);

  return {
    stages,
    totalStages: routine.stages.length,
    completedStages,
    currentStageNumber: firstIncompleteIndex === -1 ? null : firstIncompleteIndex + 1,
    currentStageId: firstIncompleteIndex === -1 ? null : routine.stages[firstIncompleteIndex].id,
    allComplete,
    overallCompleted,
    overallRequired,
  };
}

export function isPostLiftResetComplete(
  routine: Routine,
  completed: Record<string, boolean>
): boolean {
  const reset = routine.postLiftReset;
  if (!reset || !reset.enabled) return true;
  const required = reset.exercises.filter((e) => !e.optional);
  if (required.length === 0) return true;
  return required.every((e) => completed[e.id] === true);
}
