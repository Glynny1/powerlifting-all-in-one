import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Plus, Star, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TextField } from '../../components/Inputs';
import { Toggle } from '../../components/Toggle';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StageEditor } from './StageEditor';
import { ExerciseListEditor } from './ExerciseListEditor';
import { cn } from '../../lib/cn';

export function EditRoutineView() {
  const {
    data,
    settings,
    createRoutine,
    duplicateRoutine,
    renameRoutine,
    setRoutineEstimatedDuration,
    deleteRoutine,
    reorderRoutine,
    setDefaultRoutine,
    setPostLiftResetEnabled,
    addStage,
  } = useApp();

  const [selectedId, setSelectedId] = useState<string>(data.activeRoutineId ?? data.routines[0]?.id ?? '');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  // Keep the selected routine valid as routines are added/removed.
  useEffect(() => {
    if (!data.routines.some((r) => r.id === selectedId)) {
      setSelectedId(data.activeRoutineId ?? data.routines[0]?.id ?? '');
    }
  }, [data.routines, data.activeRoutineId, selectedId]);

  const selected = useMemo(
    () => data.routines.find((r) => r.id === selectedId) ?? null,
    [data.routines, selectedId]
  );

  const requestDelete = (routineId: string) => {
    if (settings.confirmDeleteRoutine) setPendingDelete(routineId);
    else deleteRoutine(routineId);
  };

  const routineToDelete = data.routines.find((r) => r.id === pendingDelete) ?? null;
  const isLastRoutine = data.routines.length === 1;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Edit Routine</h1>

      {/* Routine management */}
      <section className="surface p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Routines</h2>
          <button type="button" className="btn-primary h-9 px-3 text-sm" onClick={createRoutine}>
            <Plus className="h-4 w-4" /> New
          </button>
        </div>

        <ul className="space-y-1.5">
          {data.routines.map((r, i) => {
            const isSelected = r.id === selectedId;
            return (
              <li
                key={r.id}
                className={cn(
                  'flex items-center gap-1 rounded-lg border p-1.5',
                  isSelected
                    ? 'border-accent-400 bg-accent-50/60 dark:border-accent-800 dark:bg-accent-950/30'
                    : 'border-zinc-200 dark:border-zinc-800'
                )}
              >
                <div className="flex flex-col">
                  <button
                    type="button"
                    className="icon-btn h-6 w-7"
                    onClick={() => reorderRoutine(r.id, -1)}
                    disabled={i === 0}
                    aria-label={`Move ${r.name} up`}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="icon-btn h-6 w-7"
                    onClick={() => reorderRoutine(r.id, 1)}
                    disabled={i === data.routines.length - 1}
                    aria-label={`Move ${r.name} down`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  className="min-w-0 flex-1 text-left"
                  aria-pressed={isSelected}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="truncate font-medium">{r.name}</span>
                    {r.isDefault && (
                      <span className="chip bg-accent-100 text-accent-700 dark:bg-accent-950/60 dark:text-accent-300">
                        default
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                    {r.stages.length} stages
                  </span>
                </button>

                <button
                  type="button"
                  className={cn(
                    'icon-btn h-9 w-9',
                    r.isDefault ? 'text-accent-600 dark:text-accent-400' : ''
                  )}
                  onClick={() => setDefaultRoutine(r.id)}
                  aria-label={r.isDefault ? `${r.name} is the default routine` : `Set ${r.name} as default`}
                  aria-pressed={r.isDefault}
                >
                  <Star className={cn('h-4 w-4', r.isDefault && 'fill-current')} />
                </button>
                <button
                  type="button"
                  className="icon-btn h-9 w-9"
                  onClick={() => duplicateRoutine(r.id)}
                  aria-label={`Duplicate ${r.name}`}
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="icon-btn h-9 w-9 text-red-600 disabled:text-zinc-400 dark:text-red-400"
                  onClick={() => requestDelete(r.id)}
                  disabled={isLastRoutine}
                  aria-label={`Delete ${r.name}`}
                  title={isLastRoutine ? 'At least one routine is required' : undefined}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
        {isLastRoutine && (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            At least one routine must exist. Duplicate this one before deleting if you want a fresh start.
          </p>
        )}
      </section>

      {/* Selected routine editor */}
      {selected && (
        <section className="space-y-4">
          <div className="surface space-y-4 p-3">
            <h2 className="font-semibold">Editing: {selected.name}</h2>
            <TextField label="Routine name" value={selected.name} onChange={(v) => renameRoutine(selected.id, v)} />
            <TextField
              label="Estimated duration (optional)"
              value={selected.estimatedDuration ?? ''}
              onChange={(v) => setRoutineEstimatedDuration(selected.id, v)}
              placeholder="Leave blank to auto-estimate from stages"
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Stages</h3>
              <button type="button" className="btn-secondary h-9 px-3 text-sm" onClick={() => addStage(selected.id)}>
                <Plus className="h-4 w-4" /> Add stage
              </button>
            </div>
            {selected.stages.length === 0 ? (
              <p className="surface px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                This routine has no stages yet. Add one to get started.
              </p>
            ) : (
              selected.stages.map((stage, i) => (
                <StageEditor key={stage.id} routineId={selected.id} stage={stage} index={i} total={selected.stages.length} />
              ))
            )}
          </div>

          {/* Post-lift reset */}
          <div className="surface space-y-3 p-3">
            <Toggle
              id="postlift-enabled"
              checked={selected.postLiftReset?.enabled ?? false}
              onChange={(v) => setPostLiftResetEnabled(selected.id, v)}
              label="Post-Lift Reset"
              description="Optional cooldown shown after the warm-up"
            />
            {selected.postLiftReset?.enabled && (
              <ExerciseListEditor
                routineId={selected.id}
                location={{ kind: 'reset' }}
                exercises={selected.postLiftReset.exercises}
              />
            )}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete routine?"
        message={
          routineToDelete
            ? `"${routineToDelete.name}" will be permanently removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete routine"
        destructive
        onConfirm={() => {
          if (pendingDelete) deleteRoutine(pendingDelete);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
