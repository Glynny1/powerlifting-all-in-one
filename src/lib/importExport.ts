import { SCHEMA_VERSION, type ExportBundle, type PersistedData, type SessionState } from '../types';

/** Build an export bundle from current data, optionally including session progress. */
export function buildExportBundle(
  data: PersistedData,
  session: SessionState | null,
  includeSession: boolean
): ExportBundle {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    routines: data.routines,
    activeRoutineId: data.activeRoutineId,
    settings: data.settings,
    ...(includeSession && session ? { session } : {}),
  };
}

export function bundleToJson(bundle: ExportBundle): string {
  return JSON.stringify(bundle, null, 2);
}

/** Trigger a browser download of a JSON string. */
export function downloadJson(filename: string, json: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke on next tick so the download has time to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function defaultExportFilename(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `powerlifting-warmup-${stamp}.json`;
}
