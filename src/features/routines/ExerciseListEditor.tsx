import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Exercise } from '../../types';
import { useApp, type ExerciseLocation } from '../../context/AppContext';
import { ExerciseEditor } from './ExerciseEditor';

interface ExerciseListEditorProps {
  routineId: string;
  location: ExerciseLocation;
  exercises: Exercise[];
}

/** Editable list of exercises shared by stage editing and the post-lift reset. */
export function ExerciseListEditor({ routineId, location, exercises }: ExerciseListEditorProps) {
  const { addExercise, updateExercise, deleteExercise, duplicateExercise, reorderExercise } = useApp();
  const [editing, setEditing] = useState<Exercise | null>(null);

  return (
    <div className="space-y-2">
      <ul className="space-y-1.5">
        {exercises.map((ex, i) => (
          <li key={ex.id} className="surface-muted flex items-center gap-2 p-2">
            <div className="flex flex-col">
              <button
                type="button"
                className="icon-btn h-7 w-7"
                onClick={() => reorderExercise(routineId, location, ex.id, -1)}
                disabled={i === 0}
                aria-label={`Move ${ex.name} up`}
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="icon-btn h-7 w-7"
                onClick={() => reorderExercise(routineId, location, ex.id, 1)}
                disabled={i === exercises.length - 1}
                aria-label={`Move ${ex.name} down`}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setEditing(ex)}
              className="min-w-0 flex-1 text-left"
            >
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="truncate font-medium">{ex.name || 'Untitled'}</span>
                {ex.prescription && (
                  <span className="text-sm text-accent-700 dark:text-accent-400">{ex.prescription}</span>
                )}
              </span>
              <span className="mt-0.5 flex flex-wrap gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                {ex.optional && <span>optional</span>}
                {ex.timer?.enabled && <span>timer {ex.timer.durationSeconds ?? 0}s</span>}
                {ex.cues?.length ? <span>{ex.cues.length} cues</span> : null}
              </span>
            </button>

            <div className="flex shrink-0 items-center">
              <button
                type="button"
                className="icon-btn h-9 w-9"
                onClick={() => setEditing(ex)}
                aria-label={`Edit ${ex.name}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="icon-btn h-9 w-9"
                onClick={() => duplicateExercise(routineId, location, ex.id)}
                aria-label={`Duplicate ${ex.name}`}
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="icon-btn h-9 w-9 text-red-600 dark:text-red-400"
                onClick={() => deleteExercise(routineId, location, ex.id)}
                aria-label={`Delete ${ex.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {exercises.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No exercises yet.</p>
      )}

      <button type="button" className="btn-ghost h-9 w-full px-3 text-sm" onClick={() => addExercise(routineId, location)}>
        <Plus className="h-4 w-4" /> Add exercise
      </button>

      <ExerciseEditor
        open={editing !== null}
        exercise={editing}
        onClose={() => setEditing(null)}
        onSave={(updated) => {
          updateExercise(routineId, location, updated);
          setEditing(null);
        }}
      />
    </div>
  );
}
