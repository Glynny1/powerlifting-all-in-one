import {
  type Exercise,
  type PersistedData,
  type PostLiftReset,
  type Routine,
  type Settings,
  type WarmupStage,
  type MeasureType,
  type ExportBundle,
  type SessionState,
} from '../../types';
import { DEFAULT_SETTINGS } from '../../data/defaultSettings';
import { newId } from '../ids';

/**
 * Defensive validation + normalisation. Rather than rejecting slightly-off data,
 * we coerce it into a valid shape wherever it is safe to do so (filling missing
 * ids, defaulting booleans), and reject only when the structure is unusable.
 * This keeps hand-edited exports importable while still guarding against garbage.
 */

const MEASURE_TYPES: MeasureType[] = ['reps', 'setsReps', 'duration', 'distance', 'weight', 'text'];

export class ValidationError extends Error {}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function asOptionalString(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function asBool(v: unknown, fallback = false): boolean {
  return typeof v === 'boolean' ? v : fallback;
}

function asStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const arr = v.filter((x): x is string => typeof x === 'string');
  return arr.length ? arr : undefined;
}

export function normalizeExercise(input: unknown, idPrefix = 'ex'): Exercise {
  if (!isObject(input)) {
    throw new ValidationError('Exercise must be an object.');
  }
  const name = asString(input.name).trim();
  if (!name) throw new ValidationError('Every exercise needs a name.');

  const measureRaw = input.measureType;
  const measureType =
    typeof measureRaw === 'string' && MEASURE_TYPES.includes(measureRaw as MeasureType)
      ? (measureRaw as MeasureType)
      : undefined;

  let timer: Exercise['timer'];
  if (isObject(input.timer)) {
    const enabled = asBool(input.timer.enabled, false);
    const durationSeconds =
      typeof input.timer.durationSeconds === 'number' && input.timer.durationSeconds > 0
        ? Math.round(input.timer.durationSeconds)
        : undefined;
    timer = { enabled, durationSeconds };
  }

  return {
    id: asString(input.id) || newId(idPrefix),
    name,
    prescription: asString(input.prescription),
    measureType,
    note: asOptionalString(input.note),
    cues: asStringArray(input.cues),
    optional: input.optional === true ? true : undefined,
    timer,
    alternatives: asStringArray(input.alternatives),
  };
}

export function normalizeStage(input: unknown): WarmupStage {
  if (!isObject(input)) throw new ValidationError('Stage must be an object.');
  const name = asString(input.name).trim();
  if (!name) throw new ValidationError('Every stage needs a name.');
  const exercisesRaw = Array.isArray(input.exercises) ? input.exercises : [];
  return {
    id: asString(input.id) || newId('stage'),
    name,
    icon: asOptionalString(input.icon),
    estimatedDuration: asOptionalString(input.estimatedDuration),
    note: asOptionalString(input.note),
    exercises: exercisesRaw.map((e) => normalizeExercise(e)),
  };
}

function normalizePostLiftReset(input: unknown): PostLiftReset | undefined {
  if (!isObject(input)) return undefined;
  const exercisesRaw = Array.isArray(input.exercises) ? input.exercises : [];
  return {
    enabled: asBool(input.enabled, false),
    exercises: exercisesRaw.map((e) => normalizeExercise(e, 'reset')),
  };
}

export function normalizeRoutine(input: unknown): Routine {
  if (!isObject(input)) throw new ValidationError('Routine must be an object.');
  const name = asString(input.name).trim();
  if (!name) throw new ValidationError('Every routine needs a name.');
  const stagesRaw = Array.isArray(input.stages) ? input.stages : [];
  return {
    id: asString(input.id) || newId('routine'),
    name,
    isDefault: asBool(input.isDefault, false),
    estimatedDuration: asOptionalString(input.estimatedDuration),
    stages: stagesRaw.map(normalizeStage),
    postLiftReset: normalizePostLiftReset(input.postLiftReset),
  };
}

export function normalizeSettings(input: unknown): Settings {
  if (!isObject(input)) return { ...DEFAULT_SETTINGS };
  const theme = input.theme;
  const density = input.density;
  return {
    theme: theme === 'light' || theme === 'dark' || theme === 'system' ? theme : DEFAULT_SETTINGS.theme,
    density: density === 'compact' || density === 'comfortable' ? density : DEFAULT_SETTINGS.density,
    sound: asBool(input.sound, DEFAULT_SETTINGS.sound),
    vibration: asBool(input.vibration, DEFAULT_SETTINGS.vibration),
    autoCollapseCompleted: asBool(input.autoCollapseCompleted, DEFAULT_SETTINGS.autoCollapseCompleted),
    autoOpenNext: asBool(input.autoOpenNext, DEFAULT_SETTINGS.autoOpenNext),
    confirmResetSession: asBool(input.confirmResetSession, DEFAULT_SETTINGS.confirmResetSession),
    confirmDeleteRoutine: asBool(input.confirmDeleteRoutine, DEFAULT_SETTINGS.confirmDeleteRoutine),
  };
}

/**
 * Ensure exactly one routine is marked default and that activeRoutineId points
 * at a real routine. Returns a corrected copy.
 */
export function reconcileRoutines(
  routines: Routine[],
  activeRoutineId: string | null
): { routines: Routine[]; activeRoutineId: string | null } {
  if (routines.length === 0) {
    return { routines, activeRoutineId: null };
  }
  let seenDefault = false;
  const next = routines.map((r) => {
    if (r.isDefault && !seenDefault) {
      seenDefault = true;
      return r;
    }
    return r.isDefault ? { ...r, isDefault: false } : r;
  });
  if (!seenDefault) {
    next[0] = { ...next[0], isDefault: true };
  }
  const active =
    activeRoutineId && next.some((r) => r.id === activeRoutineId)
      ? activeRoutineId
      : next.find((r) => r.isDefault)?.id ?? next[0].id;
  return { routines: next, activeRoutineId: active };
}

/** Validate and normalise a full persisted-data object. Throws on unusable input. */
export function normalizePersistedData(input: unknown, schemaVersion: number): PersistedData {
  if (!isObject(input)) throw new ValidationError('Data must be an object.');
  const routinesRaw = Array.isArray(input.routines) ? input.routines : [];
  const routines = routinesRaw.map(normalizeRoutine);
  const settings = normalizeSettings(input.settings);
  const { routines: fixedRoutines, activeRoutineId } = reconcileRoutines(
    routines,
    typeof input.activeRoutineId === 'string' ? input.activeRoutineId : null
  );
  return {
    schemaVersion,
    routines: fixedRoutines,
    activeRoutineId,
    settings,
  };
}

export function normalizeSession(input: unknown): SessionState | null {
  if (!isObject(input)) return null;
  const completedRaw = isObject(input.completed) ? input.completed : {};
  const completed: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(completedRaw)) {
    if (v === true) completed[k] = true;
  }
  return {
    routineId: typeof input.routineId === 'string' ? input.routineId : null,
    completed,
    startedAt: typeof input.startedAt === 'number' ? input.startedAt : null,
  };
}

/** Validate an imported export bundle. Throws ValidationError with a clear message. */
export function parseImportBundle(raw: string): ExportBundle {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ValidationError('The file is not valid JSON.');
  }
  if (!isObject(parsed)) {
    throw new ValidationError('The file does not contain a data object.');
  }
  if (!Array.isArray(parsed.routines)) {
    throw new ValidationError('The file is missing a "routines" list.');
  }
  const schemaVersion =
    typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : undefined;
  if (schemaVersion === undefined) {
    throw new ValidationError('The file is missing a schema version.');
  }

  // Normalise routines/settings (throws if any routine is structurally invalid).
  const routines = parsed.routines.map(normalizeRoutine);
  if (routines.length === 0) {
    throw new ValidationError('The file contains no routines.');
  }
  const settings = normalizeSettings(parsed.settings);
  const { routines: fixedRoutines, activeRoutineId } = reconcileRoutines(
    routines,
    typeof parsed.activeRoutineId === 'string' ? parsed.activeRoutineId : null
  );
  const session = parsed.session ? normalizeSession(parsed.session) ?? undefined : undefined;

  return {
    schemaVersion,
    exportedAt: asString(parsed.exportedAt),
    routines: fixedRoutines,
    activeRoutineId,
    settings,
    session,
  };
}
