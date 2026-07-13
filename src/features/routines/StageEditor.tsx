import { useState } from 'react';
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from 'lucide-react';
import type { WarmupStage } from '../../types';
import { useApp } from '../../context/AppContext';
import { getStageIcon } from '../../lib/icons';
import { TextField } from '../../components/Inputs';
import { IconPicker } from './IconPicker';
import { ExerciseListEditor } from './ExerciseListEditor';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { cn } from '../../lib/cn';

interface StageEditorProps {
  routineId: string;
  stage: WarmupStage;
  index: number;
  total: number;
}

export function StageEditor({ routineId, stage, index, total }: StageEditorProps) {
  const { updateStage, deleteStage, reorderStage } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const Icon = getStageIcon(stage.icon);

  return (
    <section className="surface overflow-hidden">
      <div className="flex items-center gap-1 px-2 py-2">
        <div className="flex flex-col">
          <button
            type="button"
            className="icon-btn h-7 w-8"
            onClick={() => reorderStage(routineId, stage.id, -1)}
            disabled={index === 0}
            aria-label={`Move ${stage.name} up`}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="icon-btn h-7 w-8"
            onClick={() => reorderStage(routineId, stage.id, 1)}
            disabled={index === total - 1}
            aria-label={`Move ${stage.name} down`}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={`stage-edit-${stage.id}`}
          className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-xs font-bold dark:bg-zinc-800">
            {index + 1}
          </span>
          <Icon className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{stage.name}</span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">
              {stage.exercises.length} exercise{stage.exercises.length === 1 ? '' : 's'}
              {stage.estimatedDuration ? ` · ${stage.estimatedDuration}` : ''}
            </span>
          </span>
          <ChevronDown className={cn('h-5 w-5 shrink-0 text-zinc-400 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
        </button>
      </div>

      {expanded && (
        <div id={`stage-edit-${stage.id}`} className="space-y-4 border-t border-zinc-100 px-3 py-3 dark:border-zinc-800">
          <TextField label="Stage name" value={stage.name} onChange={(v) => updateStage(routineId, stage.id, { name: v })} />
          <TextField
            label="Estimated duration"
            value={stage.estimatedDuration ?? ''}
            onChange={(v) => updateStage(routineId, stage.id, { estimatedDuration: v || undefined })}
            placeholder='e.g. "2 minutes"'
          />
          <TextField
            label="Stage note (optional)"
            value={stage.note ?? ''}
            onChange={(v) => updateStage(routineId, stage.id, { note: v || undefined })}
            placeholder="Guidance shown at the top of the stage"
          />
          <IconPicker label="Icon" value={stage.icon} onChange={(key) => updateStage(routineId, stage.id, { icon: key })} />

          <div>
            <h4 className="field-label flex items-center gap-1">
              <GripVertical className="h-4 w-4 text-zinc-400" aria-hidden="true" /> Exercises
            </h4>
            <ExerciseListEditor routineId={routineId} location={{ kind: 'stage', stageId: stage.id }} exercises={stage.exercises} />
          </div>

          <button
            type="button"
            className="btn-ghost h-9 px-3 text-sm text-red-600 dark:text-red-400"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-4 w-4" /> Delete stage
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete stage?"
        message={`"${stage.name}" and its exercises will be removed from this routine.`}
        confirmLabel="Delete stage"
        destructive
        onConfirm={() => {
          deleteStage(routineId, stage.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </section>
  );
}
