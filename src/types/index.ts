// Core, versioned data model for the application.
// Stable string IDs are used everywhere instead of array indexes so that
// reordering and editing never corrupts session progress or references.

export const SCHEMA_VERSION = 1;

/** How an exercise's prescription is primarily measured. Drives editor inputs. */
export type MeasureType = 'reps' | 'setsReps' | 'duration' | 'distance' | 'weight' | 'text';

export interface ExerciseTimer {
  enabled: boolean;
  /** Default countdown length in seconds. */
  durationSeconds?: number;
}

export interface Exercise {
  id: string;
  name: string;
  /** Human-readable prescription, e.g. "×10", "20 sec", "2 × 5". */
  prescription: string;
  /** Determines which editor input is shown. Defaults to 'text' when absent. */
  measureType?: MeasureType;
  note?: string;
  cues?: string[];
  optional?: boolean;
  timer?: ExerciseTimer;
  /** Alternative movements, e.g. "Kettlebell swing — 3 × 5". */
  alternatives?: string[];
}

export interface PostLiftReset {
  enabled: boolean;
  exercises: Exercise[];
}

export interface WarmupStage {
  id: string;
  name: string;
  /** Icon registry key. See lib/icons.ts. */
  icon?: string;
  estimatedDuration?: string;
  note?: string;
  exercises: Exercise[];
}

export interface Routine {
  id: string;
  name: string;
  isDefault: boolean;
  estimatedDuration?: string;
  stages: WarmupStage[];
  postLiftReset?: PostLiftReset;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'comfortable';

export interface Settings {
  theme: ThemeMode;
  density: Density;
  sound: boolean;
  vibration: boolean;
  autoCollapseCompleted: boolean;
  autoOpenNext: boolean;
  confirmResetSession: boolean;
  confirmDeleteRoutine: boolean;
}

/**
 * Persisted configuration bundle. Session progress is intentionally stored
 * under a separate key so editing routines never disturbs an in-progress session.
 */
export interface PersistedData {
  schemaVersion: number;
  routines: Routine[];
  activeRoutineId: string | null;
  settings: Settings;
}

/** Active session progress. Keyed by exercise id → completed flag. */
export interface SessionState {
  routineId: string | null;
  completed: Record<string, boolean>;
  startedAt: number | null;
}

/** Shape produced by Export / accepted by Import. */
export interface ExportBundle {
  schemaVersion: number;
  exportedAt: string;
  routines: Routine[];
  activeRoutineId: string | null;
  settings: Settings;
  /** Only present when the user explicitly chose to include session progress. */
  session?: SessionState;
}

export type ViewId = 'warmup' | 'edit' | 'settings';
