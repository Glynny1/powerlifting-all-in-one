import { type PersistedData, type SessionState } from '../../types';
import { createDefaultData, createEmptySession } from '../../data/defaults';
import { migrateToLatest } from '../migrations/migrations';
import { normalizePersistedData, normalizeSession } from '../validation/validation';
import { SCHEMA_VERSION } from '../../types';

const DATA_KEY = 'plwu:data';
const SESSION_KEY = 'plwu:session';

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage may be unavailable (private mode / quota). App keeps working in-memory.
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

/**
 * Load configuration data. On any corruption, migration failure, or validation
 * error we recover to defaults rather than crashing the app.
 */
export function loadData(): { data: PersistedData; recovered: boolean } {
  const raw = safeGet(DATA_KEY);
  if (!raw) {
    return { data: createDefaultData(), recovered: false };
  }
  try {
    const parsed = JSON.parse(raw);
    const migrated = migrateToLatest(parsed);
    const data = normalizePersistedData(migrated, SCHEMA_VERSION);
    if (data.routines.length === 0) {
      // Never leave the user with zero routines.
      return { data: createDefaultData(), recovered: true };
    }
    return { data, recovered: false };
  } catch {
    return { data: createDefaultData(), recovered: true };
  }
}

export function saveData(data: PersistedData): void {
  safeSet(DATA_KEY, JSON.stringify(data));
}

export function loadSession(fallbackRoutineId: string | null): SessionState {
  const raw = safeGet(SESSION_KEY);
  if (!raw) return createEmptySession(fallbackRoutineId);
  try {
    const parsed = JSON.parse(raw);
    const session = normalizeSession(parsed);
    return session ?? createEmptySession(fallbackRoutineId);
  } catch {
    return createEmptySession(fallbackRoutineId);
  }
}

export function saveSession(session: SessionState): void {
  safeSet(SESSION_KEY, JSON.stringify(session));
}

export function clearAllStorage(): void {
  safeRemove(DATA_KEY);
  safeRemove(SESSION_KEY);
}
