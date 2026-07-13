import { useRef, useState } from 'react';
import { AlertTriangle, FileUp } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Toggle } from '../../components/Toggle';
import { parseImportBundle, ValidationError } from '../../lib/validation/validation';
import { SCHEMA_VERSION, type ExportBundle, type PersistedData, type SessionState } from '../../types';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: PersistedData, session?: SessionState) => void;
}

export function ImportDialog({ open, onClose, onImport }: ImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [bundle, setBundle] = useState<ExportBundle | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [includeSession, setIncludeSession] = useState(false);

  const reset = () => {
    setBundle(null);
    setFileName('');
    setError(null);
    setIncludeSession(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File) => {
    setError(null);
    setBundle(null);
    setFileName(file.name);
    try {
      const text = await file.text();
      const parsed = parseImportBundle(text);
      setBundle(parsed);
      setIncludeSession(false);
    } catch (e) {
      if (e instanceof ValidationError) setError(e.message);
      else setError('Could not read the file. Please choose a valid export.');
    }
  };

  const confirmImport = () => {
    if (!bundle) return;
    const data: PersistedData = {
      schemaVersion: SCHEMA_VERSION,
      routines: bundle.routines,
      activeRoutineId: bundle.activeRoutineId,
      settings: bundle.settings,
    };
    onImport(data, includeSession && bundle.session ? bundle.session : undefined);
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import data"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={confirmImport} disabled={!bundle}>
            Overwrite &amp; import
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Import a previously exported JSON file. This will <strong>replace</strong> your current routines and settings.
        </p>

        <div>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            id="import-file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <label htmlFor="import-file" className="btn-secondary w-full cursor-pointer">
            <FileUp className="h-4 w-4" /> Choose file
          </label>
          {fileName && <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Selected: {fileName}</p>}
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {bundle && (
          <div className="surface-muted space-y-3 p-3">
            <p className="text-sm">
              <span className="font-medium">Ready to import:</span> {bundle.routines.length} routine
              {bundle.routines.length === 1 ? '' : 's'} (schema v{bundle.schemaVersion}).
            </p>
            {bundle.schemaVersion !== SCHEMA_VERSION && (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                This file uses a different schema version (v{bundle.schemaVersion}). It will be migrated on import.
              </p>
            )}
            {bundle.session && (
              <Toggle
                id="import-session"
                checked={includeSession}
                onChange={setIncludeSession}
                label="Also import session progress"
                description="Off by default — completion state is separate from routines"
              />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
