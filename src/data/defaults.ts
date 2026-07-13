import { SCHEMA_VERSION, type PersistedData, type SessionState } from '../types';
import { DEFAULT_SETTINGS } from './defaultSettings';
import { createDefaultRoutines, DEFAULT_ACTIVE_ROUTINE_ID } from './defaultRoutines';

export function createDefaultData(): PersistedData {
  return {
    schemaVersion: SCHEMA_VERSION,
    routines: createDefaultRoutines(),
    activeRoutineId: DEFAULT_ACTIVE_ROUTINE_ID,
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function createEmptySession(routineId: string | null): SessionState {
  return {
    routineId,
    completed: {},
    startedAt: null,
  };
}
