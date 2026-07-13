import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import {
  type Exercise,
  type PersistedData,
  type Routine,
  type SessionState,
  type Settings,
  type WarmupStage,
} from '../types';
import { loadData, loadSession, saveData, saveSession, clearAllStorage } from '../lib/storage/storage';
import { createDefaultData, createEmptySession } from '../data/defaults';
import { newId } from '../lib/ids';
import { insertAt, moveItem, replaceAt } from '../lib/arr';
import { reconcileRoutines } from '../lib/validation/validation';

/** Where an exercise lives inside a routine. */
export type ExerciseLocation = { kind: 'stage'; stageId: string } | { kind: 'reset' };

type Dir = -1 | 1;

interface DataAction {
  type: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Routine mutation helpers (pure)
// ---------------------------------------------------------------------------

function mapRoutine(data: PersistedData, routineId: string, fn: (r: Routine) => Routine): PersistedData {
  return { ...data, routines: data.routines.map((r) => (r.id === routineId ? fn(r) : r)) };
}

function getLocationExercises(r: Routine, loc: ExerciseLocation): Exercise[] {
  if (loc.kind === 'reset') return r.postLiftReset?.exercises ?? [];
  const stage = r.stages.find((s) => s.id === loc.stageId);
  return stage?.exercises ?? [];
}

function setLocationExercises(r: Routine, loc: ExerciseLocation, exercises: Exercise[]): Routine {
  if (loc.kind === 'reset') {
    const reset = r.postLiftReset ?? { enabled: false, exercises: [] };
    return { ...r, postLiftReset: { ...reset, exercises } };
  }
  return {
    ...r,
    stages: r.stages.map((s) => (s.id === loc.stageId ? { ...s, exercises } : s)),
  };
}

function blankExercise(): Exercise {
  return { id: newId('ex'), name: 'New exercise', prescription: '', measureType: 'reps' };
}

function blankStage(): WarmupStage {
  return { id: newId('stage'), name: 'New stage', icon: 'dot', estimatedDuration: '', exercises: [] };
}

function duplicateExerciseWithNewIds(ex: Exercise): Exercise {
  return { ...JSON.parse(JSON.stringify(ex)), id: newId('ex') };
}

function duplicateRoutineWithNewIds(routine: Routine): Routine {
  const copy: Routine = JSON.parse(JSON.stringify(routine));
  copy.id = newId('routine');
  copy.name = `${routine.name} (copy)`;
  copy.isDefault = false;
  copy.stages = copy.stages.map((s) => ({
    ...s,
    id: newId('stage'),
    exercises: s.exercises.map((e) => ({ ...e, id: newId('ex') })),
  }));
  if (copy.postLiftReset) {
    copy.postLiftReset = {
      ...copy.postLiftReset,
      exercises: copy.postLiftReset.exercises.map((e) => ({ ...e, id: newId('ex') })),
    };
  }
  return copy;
}

function emptyRoutine(): Routine {
  return {
    id: newId('routine'),
    name: 'New routine',
    isDefault: false,
    stages: [
      { id: newId('stage'), name: 'Release', icon: 'waves', estimatedDuration: '2 minutes', exercises: [] },
      { id: newId('stage'), name: 'Mobilise', icon: 'move', estimatedDuration: '2 minutes', exercises: [] },
      { id: newId('stage'), name: 'Stabilise', icon: 'anchor', estimatedDuration: '2 minutes', exercises: [] },
      { id: newId('stage'), name: 'Activate', icon: 'zap', estimatedDuration: '2 minutes', exercises: [] },
      { id: newId('stage'), name: 'Pattern', icon: 'route', estimatedDuration: '2 minutes', exercises: [] },
      { id: newId('stage'), name: 'Potentiate', icon: 'rocket', estimatedDuration: '1–2 minutes', exercises: [] },
    ],
    postLiftReset: { enabled: false, exercises: [] },
  };
}

// ---------------------------------------------------------------------------
// Data reducer
// ---------------------------------------------------------------------------

function dataReducer(state: PersistedData, action: DataAction): PersistedData {
  switch (action.type) {
    case 'replaceAll':
      return action.data as PersistedData;

    case 'setActiveRoutine':
      return { ...state, activeRoutineId: action.routineId as string };

    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...(action.patch as Partial<Settings>) } };

    case 'addRoutine': {
      const routine = action.routine as Routine;
      return { ...state, routines: [...state.routines, routine], activeRoutineId: routine.id };
    }

    case 'duplicateRoutine': {
      const idx = state.routines.findIndex((r) => r.id === action.routineId);
      if (idx === -1) return state;
      const copy = duplicateRoutineWithNewIds(state.routines[idx]);
      return { ...state, routines: insertAt(state.routines, idx + 1, copy), activeRoutineId: copy.id };
    }

    case 'renameRoutine':
      return mapRoutine(state, action.routineId as string, (r) => ({ ...r, name: action.name as string }));

    case 'setRoutineEstimatedDuration':
      return mapRoutine(state, action.routineId as string, (r) => ({
        ...r,
        estimatedDuration: (action.value as string) || undefined,
      }));

    case 'deleteRoutine': {
      const remaining = state.routines.filter((r) => r.id !== action.routineId);
      if (remaining.length === 0) {
        // Never allow zero routines — recover with a fresh default set.
        const fresh = createDefaultData();
        return { ...state, routines: fresh.routines, activeRoutineId: fresh.activeRoutineId };
      }
      const { routines, activeRoutineId } = reconcileRoutines(
        remaining,
        state.activeRoutineId === action.routineId ? null : state.activeRoutineId
      );
      return { ...state, routines, activeRoutineId };
    }

    case 'reorderRoutine': {
      const idx = state.routines.findIndex((r) => r.id === action.routineId);
      return { ...state, routines: moveItem(state.routines, idx, action.direction as Dir) };
    }

    case 'setDefaultRoutine':
      return {
        ...state,
        routines: state.routines.map((r) => ({ ...r, isDefault: r.id === action.routineId })),
      };

    case 'setPostLiftResetEnabled':
      return mapRoutine(state, action.routineId as string, (r) => {
        const reset = r.postLiftReset ?? { enabled: false, exercises: [] };
        return { ...r, postLiftReset: { ...reset, enabled: action.enabled as boolean } };
      });

    // ----- Stage ops -----
    case 'addStage':
      return mapRoutine(state, action.routineId as string, (r) => ({ ...r, stages: [...r.stages, blankStage()] }));

    case 'deleteStage':
      return mapRoutine(state, action.routineId as string, (r) => ({
        ...r,
        stages: r.stages.filter((s) => s.id !== action.stageId),
      }));

    case 'reorderStage':
      return mapRoutine(state, action.routineId as string, (r) => {
        const idx = r.stages.findIndex((s) => s.id === action.stageId);
        return { ...r, stages: moveItem(r.stages, idx, action.direction as Dir) };
      });

    case 'updateStage':
      return mapRoutine(state, action.routineId as string, (r) => ({
        ...r,
        stages: r.stages.map((s) =>
          s.id === action.stageId ? { ...s, ...(action.patch as Partial<WarmupStage>) } : s
        ),
      }));

    // ----- Exercise ops -----
    case 'addExercise':
      return mapRoutine(state, action.routineId as string, (r) => {
        const loc = action.location as ExerciseLocation;
        return setLocationExercises(r, loc, [...getLocationExercises(r, loc), blankExercise()]);
      });

    case 'updateExercise':
      return mapRoutine(state, action.routineId as string, (r) => {
        const loc = action.location as ExerciseLocation;
        const list = getLocationExercises(r, loc);
        const idx = list.findIndex((e) => e.id === action.exerciseId);
        if (idx === -1) return r;
        return setLocationExercises(r, loc, replaceAt(list, idx, action.exercise as Exercise));
      });

    case 'deleteExercise':
      return mapRoutine(state, action.routineId as string, (r) => {
        const loc = action.location as ExerciseLocation;
        const list = getLocationExercises(r, loc);
        return setLocationExercises(r, loc, list.filter((e) => e.id !== action.exerciseId));
      });

    case 'duplicateExercise':
      return mapRoutine(state, action.routineId as string, (r) => {
        const loc = action.location as ExerciseLocation;
        const list = getLocationExercises(r, loc);
        const idx = list.findIndex((e) => e.id === action.exerciseId);
        if (idx === -1) return r;
        return setLocationExercises(r, loc, insertAt(list, idx + 1, duplicateExerciseWithNewIds(list[idx])));
      });

    case 'reorderExercise':
      return mapRoutine(state, action.routineId as string, (r) => {
        const loc = action.location as ExerciseLocation;
        const list = getLocationExercises(r, loc);
        const idx = list.findIndex((e) => e.id === action.exerciseId);
        return setLocationExercises(r, loc, moveItem(list, idx, action.direction as Dir));
      });

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Session reducer
// ---------------------------------------------------------------------------

type SessionAction =
  | { type: 'toggle'; exerciseId: string; hasStarted: boolean }
  | { type: 'setDone'; exerciseIds: string[]; done: boolean }
  | { type: 'resetKeys'; exerciseIds: string[] }
  | { type: 'setRoutine'; routineId: string | null }
  | { type: 'replace'; session: SessionState };

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'toggle': {
      const completed = { ...state.completed };
      if (completed[action.exerciseId]) {
        delete completed[action.exerciseId];
      } else {
        completed[action.exerciseId] = true;
      }
      const hasProgress = Object.keys(completed).length > 0;
      return {
        ...state,
        completed,
        startedAt: hasProgress ? state.startedAt ?? Date.now() : null,
      };
    }
    case 'setDone': {
      const completed = { ...state.completed };
      for (const id of action.exerciseIds) {
        if (action.done) completed[id] = true;
        else delete completed[id];
      }
      return { ...state, completed, startedAt: state.startedAt ?? Date.now() };
    }
    case 'resetKeys': {
      const completed = { ...state.completed };
      for (const id of action.exerciseIds) delete completed[id];
      const stillHasProgress = Object.keys(completed).length > 0;
      return { ...state, completed, startedAt: stillHasProgress ? state.startedAt : null };
    }
    case 'setRoutine':
      return { ...state, routineId: action.routineId };
    case 'replace':
      return action.session;
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AppContextValue {
  data: PersistedData;
  session: SessionState;
  settings: Settings;
  activeRoutine: Routine | null;
  recovered: boolean;
  dismissRecovered: () => void;

  // Routine-level
  setActiveRoutine: (routineId: string) => void;
  createRoutine: () => void;
  duplicateRoutine: (routineId: string) => void;
  renameRoutine: (routineId: string, name: string) => void;
  setRoutineEstimatedDuration: (routineId: string, value: string) => void;
  deleteRoutine: (routineId: string) => void;
  reorderRoutine: (routineId: string, direction: Dir) => void;
  setDefaultRoutine: (routineId: string) => void;
  setPostLiftResetEnabled: (routineId: string, enabled: boolean) => void;

  // Stage-level
  addStage: (routineId: string) => void;
  deleteStage: (routineId: string, stageId: string) => void;
  reorderStage: (routineId: string, stageId: string, direction: Dir) => void;
  updateStage: (routineId: string, stageId: string, patch: Partial<WarmupStage>) => void;

  // Exercise-level
  addExercise: (routineId: string, location: ExerciseLocation) => void;
  updateExercise: (routineId: string, location: ExerciseLocation, exercise: Exercise) => void;
  deleteExercise: (routineId: string, location: ExerciseLocation, exerciseId: string) => void;
  duplicateExercise: (routineId: string, location: ExerciseLocation, exerciseId: string) => void;
  reorderExercise: (
    routineId: string,
    location: ExerciseLocation,
    exerciseId: string,
    direction: Dir
  ) => void;

  // Settings
  updateSettings: (patch: Partial<Settings>) => void;

  // Import / reset
  replaceAllData: (data: PersistedData, session?: SessionState) => void;
  resetAppToDefaults: () => void;

  // Session
  toggleExercise: (exerciseId: string) => void;
  completeStageExercises: (exerciseIds: string[]) => void;
  resetSession: (exerciseIds: string[]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialLoad = () => loadData();

export function AppProvider({ children }: { children: ReactNode }) {
  const [{ data: initialData, recovered: initialRecovered }] = useState(initialLoad);
  const [data, dispatch] = useReducer(dataReducer, initialData);
  const [session, sessionDispatch] = useReducer(
    sessionReducer,
    initialData,
    (d) => loadSession(d.activeRoutineId)
  );
  const [recovered, setRecovered] = useState(initialRecovered);

  // Persist data + session whenever they change.
  useEffect(() => saveData(data), [data]);
  useEffect(() => saveSession(session), [session]);

  // Keep session.routineId in sync with the active routine (for reference only;
  // completion is keyed by unique exercise id so switching never loses progress).
  useEffect(() => {
    if (session.routineId !== data.activeRoutineId) {
      sessionDispatch({ type: 'setRoutine', routineId: data.activeRoutineId });
    }
  }, [data.activeRoutineId, session.routineId]);

  const activeRoutine = useMemo(
    () => data.routines.find((r) => r.id === data.activeRoutineId) ?? data.routines[0] ?? null,
    [data.routines, data.activeRoutineId]
  );

  const value = useMemo<AppContextValue>(() => {
    return {
      data,
      session,
      settings: data.settings,
      activeRoutine,
      recovered,
      dismissRecovered: () => setRecovered(false),

      setActiveRoutine: (routineId) => dispatch({ type: 'setActiveRoutine', routineId }),
      createRoutine: () => dispatch({ type: 'addRoutine', routine: emptyRoutine() }),
      duplicateRoutine: (routineId) => dispatch({ type: 'duplicateRoutine', routineId }),
      renameRoutine: (routineId, name) => dispatch({ type: 'renameRoutine', routineId, name }),
      setRoutineEstimatedDuration: (routineId, value) =>
        dispatch({ type: 'setRoutineEstimatedDuration', routineId, value }),
      deleteRoutine: (routineId) => dispatch({ type: 'deleteRoutine', routineId }),
      reorderRoutine: (routineId, direction) => dispatch({ type: 'reorderRoutine', routineId, direction }),
      setDefaultRoutine: (routineId) => dispatch({ type: 'setDefaultRoutine', routineId }),
      setPostLiftResetEnabled: (routineId, enabled) =>
        dispatch({ type: 'setPostLiftResetEnabled', routineId, enabled }),

      addStage: (routineId) => dispatch({ type: 'addStage', routineId }),
      deleteStage: (routineId, stageId) => dispatch({ type: 'deleteStage', routineId, stageId }),
      reorderStage: (routineId, stageId, direction) =>
        dispatch({ type: 'reorderStage', routineId, stageId, direction }),
      updateStage: (routineId, stageId, patch) => dispatch({ type: 'updateStage', routineId, stageId, patch }),

      addExercise: (routineId, location) => dispatch({ type: 'addExercise', routineId, location }),
      updateExercise: (routineId, location, exercise) =>
        dispatch({ type: 'updateExercise', routineId, location, exerciseId: exercise.id, exercise }),
      deleteExercise: (routineId, location, exerciseId) =>
        dispatch({ type: 'deleteExercise', routineId, location, exerciseId }),
      duplicateExercise: (routineId, location, exerciseId) =>
        dispatch({ type: 'duplicateExercise', routineId, location, exerciseId }),
      reorderExercise: (routineId, location, exerciseId, direction) =>
        dispatch({ type: 'reorderExercise', routineId, location, exerciseId, direction }),

      updateSettings: (patch) => dispatch({ type: 'updateSettings', patch }),

      replaceAllData: (nextData, nextSession) => {
        dispatch({ type: 'replaceAll', data: nextData });
        if (nextSession) {
          sessionDispatch({ type: 'replace', session: nextSession });
        }
      },
      resetAppToDefaults: () => {
        clearAllStorage();
        const fresh = createDefaultData();
        dispatch({ type: 'replaceAll', data: fresh });
        sessionDispatch({ type: 'replace', session: createEmptySession(fresh.activeRoutineId) });
      },

      toggleExercise: (exerciseId) =>
        sessionDispatch({ type: 'toggle', exerciseId, hasStarted: session.startedAt !== null }),
      completeStageExercises: (exerciseIds) => sessionDispatch({ type: 'setDone', exerciseIds, done: true }),
      resetSession: (exerciseIds) => sessionDispatch({ type: 'resetKeys', exerciseIds }),
    };
  }, [data, session, activeRoutine, recovered]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
