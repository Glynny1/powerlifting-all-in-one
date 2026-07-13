import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Exercise, MeasureType } from '../../types';
import { Modal } from '../../components/Modal';
import { Toggle } from '../../components/Toggle';
import { TextField, TextArea, SelectField, FieldRow } from '../../components/Inputs';
import { sanitizeImageUrl } from '../../lib/validation/validation';

interface ExerciseEditorProps {
  open: boolean;
  /** The exercise being edited (a working copy is made internally). */
  exercise: Exercise | null;
  onSave: (exercise: Exercise) => void;
  onClose: () => void;
}

const MEASURE_OPTIONS: { value: MeasureType; label: string }[] = [
  { value: 'reps', label: 'Repetitions' },
  { value: 'setsReps', label: 'Sets & reps' },
  { value: 'duration', label: 'Duration' },
  { value: 'distance', label: 'Distance' },
  { value: 'weight', label: 'Weight' },
  { value: 'text', label: 'Free text' },
];

const PRESCRIPTION_HINTS: Record<MeasureType, string> = {
  reps: 'e.g. "10" or "10 each side"',
  setsReps: 'e.g. "2 × 5"',
  duration: 'e.g. "30 sec"',
  distance: 'e.g. "20 m"',
  weight: 'e.g. "60 kg × 5"',
  text: 'Any free-text prescription',
};

export function ExerciseEditor({ open, exercise, onSave, onClose }: ExerciseEditorProps) {
  const [draft, setDraft] = useState<Exercise | null>(exercise);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setDraft(exercise ? JSON.parse(JSON.stringify(exercise)) : null);
    setError(null);
    setImgError(false);
  }, [exercise, open]);

  if (!draft) return null;

  const measureType: MeasureType = draft.measureType ?? 'text';
  const update = (patch: Partial<Exercise>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const cues = draft.cues ?? [];
  const alternatives = draft.alternatives ?? [];
  const timerEnabled = draft.timer?.enabled ?? false;

  const setCue = (i: number, value: string) => {
    const next = cues.slice();
    next[i] = value;
    update({ cues: next });
  };
  const addCue = () => update({ cues: [...cues, ''] });
  const removeCue = (i: number) => update({ cues: cues.filter((_, idx) => idx !== i) });

  const setAlt = (i: number, value: string) => {
    const next = alternatives.slice();
    next[i] = value;
    update({ alternatives: next });
  };
  const addAlt = () => update({ alternatives: [...alternatives, ''] });
  const removeAlt = (i: number) => update({ alternatives: alternatives.filter((_, idx) => idx !== i) });

  const handleSave = () => {
    if (!draft.name.trim()) {
      setError('Exercise name is required.');
      return;
    }
    const cleaned: Exercise = {
      ...draft,
      name: draft.name.trim(),
      prescription: draft.prescription.trim(),
      measureType,
      note: draft.note?.trim() ? draft.note.trim() : undefined,
      cues: cues.map((c) => c.trim()).filter(Boolean).length
        ? cues.map((c) => c.trim()).filter(Boolean)
        : undefined,
      alternatives: alternatives.map((a) => a.trim()).filter(Boolean).length
        ? alternatives.map((a) => a.trim()).filter(Boolean)
        : undefined,
      optional: draft.optional ? true : undefined,
      timer: timerEnabled
        ? { enabled: true, durationSeconds: Math.max(1, draft.timer?.durationSeconds ?? 30) }
        : undefined,
      imageUrl: sanitizeImageUrl(draft.imageUrl),
    };
    onSave(cleaned);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit exercise"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Save exercise
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        )}

        <TextField label="Name" value={draft.name} onChange={(v) => update({ name: v })} placeholder="Exercise name" />

        <FieldRow>
          <SelectField
            label="Measured as"
            value={measureType}
            onChange={(v) => update({ measureType: v })}
            options={MEASURE_OPTIONS}
          />
          <TextField
            label="Prescription"
            value={draft.prescription}
            onChange={(v) => update({ prescription: v })}
            hint={PRESCRIPTION_HINTS[measureType]}
          />
        </FieldRow>

        <TextArea
          label="Coaching note (optional)"
          value={draft.note ?? ''}
          onChange={(v) => update({ note: v })}
          placeholder="Short note shown under the exercise"
          rows={2}
        />

        {/* Reference image */}
        <div>
          <TextField
            label="Image URL (optional)"
            value={draft.imageUrl ?? ''}
            onChange={(v) => {
              setImgError(false);
              update({ imageUrl: v });
            }}
            type="url"
            placeholder="https://…"
            hint="Paste a link to a reference photo or GIF. Shown as a thumbnail in the warm-up."
          />
          {sanitizeImageUrl(draft.imageUrl) && !imgError && (
            <div className="mt-2">
              <img
                src={sanitizeImageUrl(draft.imageUrl)}
                alt={`Preview of ${draft.name || 'exercise'}`}
                onError={() => setImgError(true)}
                className="max-h-40 w-auto rounded-lg border border-zinc-200 object-contain dark:border-zinc-800"
              />
            </div>
          )}
          {draft.imageUrl && sanitizeImageUrl(draft.imageUrl) && imgError && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              That image couldn't be loaded. Check the link is a direct image URL (ends in .jpg, .png, .gif, …).
            </p>
          )}
          {draft.imageUrl?.trim() && !sanitizeImageUrl(draft.imageUrl) && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              Only http(s) links or data URIs are allowed.
            </p>
          )}
        </div>

        {/* Cues */}
        <fieldset className="space-y-2">
          <legend className="field-label">Coaching cues (optional)</legend>
          {cues.map((cue, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                aria-label={`Cue ${i + 1}`}
                value={cue}
                onChange={(e) => setCue(i, e.target.value)}
                className="field-input"
                placeholder="e.g. Brace before descending"
              />
              <button type="button" className="icon-btn h-11 w-11 shrink-0" onClick={() => removeCue(i)} aria-label={`Remove cue ${i + 1}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" className="btn-ghost h-9 px-3 text-sm" onClick={addCue}>
            <Plus className="h-4 w-4" /> Add cue
          </button>
        </fieldset>

        {/* Alternatives */}
        <fieldset className="space-y-2">
          <legend className="field-label">Alternatives (optional)</legend>
          {alternatives.map((alt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                aria-label={`Alternative ${i + 1}`}
                value={alt}
                onChange={(e) => setAlt(i, e.target.value)}
                className="field-input"
                placeholder="e.g. Kettlebell swing — 3 × 5"
              />
              <button type="button" className="icon-btn h-11 w-11 shrink-0" onClick={() => removeAlt(i)} aria-label={`Remove alternative ${i + 1}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" className="btn-ghost h-9 px-3 text-sm" onClick={addAlt}>
            <Plus className="h-4 w-4" /> Add alternative
          </button>
        </fieldset>

        {/* Options */}
        <div className="surface-muted space-y-3 p-3">
          <Toggle
            id="ex-optional"
            checked={draft.optional ?? false}
            onChange={(v) => update({ optional: v })}
            label="Optional exercise"
            description="Does not block stage completion"
          />
          <Toggle
            id="ex-timer"
            checked={timerEnabled}
            onChange={(v) =>
              update({ timer: v ? { enabled: true, durationSeconds: draft.timer?.durationSeconds ?? 30 } : { enabled: false } })
            }
            label="Enable timer"
            description="Show a countdown for this exercise"
          />
          {timerEnabled && (
            <TextField
              label="Default timer (seconds)"
              type="number"
              inputMode="numeric"
              value={String(draft.timer?.durationSeconds ?? 30)}
              onChange={(v) => {
                const n = parseInt(v, 10);
                update({ timer: { enabled: true, durationSeconds: Number.isNaN(n) ? undefined : Math.max(1, n) } });
              }}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
