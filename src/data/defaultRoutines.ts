import type { Routine, Exercise, PostLiftReset } from '../types';

// Seed routines. IDs are stable, human-readable strings so exports stay
// deterministic and session progress maps reliably across reloads.

function ex(
  id: string,
  name: string,
  prescription: string,
  extra: Partial<Omit<Exercise, 'id' | 'name' | 'prescription'>> = {}
): Exercise {
  return { id, name, prescription, ...extra };
}

/** Shared default post-lift reset block (independently toggled per routine). */
function defaultPostLiftReset(prefix: string): PostLiftReset {
  return {
    enabled: true,
    exercises: [
      ex(`${prefix}-reset-1`, "Child's pose with controlled breathing", '60 sec', {
        measureType: 'duration',
        timer: { enabled: true, durationSeconds: 60 },
      }),
      ex(`${prefix}-reset-2`, 'Easy walking', '5 min', { measureType: 'duration' }),
      ex(`${prefix}-reset-3`, 'Passive hang, if pain-free', '30 sec', {
        measureType: 'duration',
        optional: true,
        timer: { enabled: true, durationSeconds: 30 },
      }),
    ],
  };
}

const squatBench: Routine = {
  id: 'routine-squat-bench',
  name: 'Squat + Bench',
  isDefault: true,
  stages: [
    {
      id: 'sb-s1',
      name: 'Release',
      icon: 'waves',
      estimatedDuration: '2 minutes',
      note: 'Use light, targeted pressure. The goal is to reduce excessive tension, not aggressively roll every tissue.',
      exercises: [
        ex('sb-s1-e1', 'Left QL', '30 sec', {
          measureType: 'duration',
          timer: { enabled: true, durationSeconds: 30 },
        }),
        ex('sb-s1-e2', 'Adductors', '30 sec', {
          measureType: 'duration',
          timer: { enabled: true, durationSeconds: 30 },
        }),
        ex('sb-s1-e3', 'T-spine', '30 sec', {
          measureType: 'duration',
          timer: { enabled: true, durationSeconds: 30 },
        }),
        ex('sb-s1-e4', 'Left pec/front delt', '30 sec', {
          measureType: 'duration',
          timer: { enabled: true, durationSeconds: 30 },
        }),
      ],
    },
    {
      id: 'sb-s2',
      name: 'Mobilise',
      icon: 'move',
      estimatedDuration: '2–3 minutes',
      exercises: [
        ex('sb-s2-e1', 'Ankle rocks', '10 each side', { measureType: 'reps' }),
        ex('sb-s2-e2', '90/90 hip rotations', '10 total', { measureType: 'reps' }),
        ex('sb-s2-e3', 'Adductor rockbacks', '10', { measureType: 'reps' }),
        ex('sb-s2-e4', 'Thoracic extensions', '10', { measureType: 'reps' }),
      ],
    },
    {
      id: 'sb-s3',
      name: 'Stabilise',
      icon: 'anchor',
      estimatedDuration: '2 minutes',
      note: 'Brace firmly and keep the pelvis and ribcage controlled.',
      exercises: [
        ex('sb-s3-e1', 'Bird dogs', '6 each side', { measureType: 'reps' }),
        ex('sb-s3-e2', 'Side plank', '20 sec each side', {
          measureType: 'duration',
          timer: { enabled: true, durationSeconds: 20 },
        }),
        ex('sb-s3-e3', 'Dead bug', '6 each side', { measureType: 'reps' }),
      ],
    },
    {
      id: 'sb-s4',
      name: 'Activate',
      icon: 'zap',
      estimatedDuration: '2 minutes',
      exercises: [
        ex('sb-s4-e1', 'Mini-band lateral walks', '10 each direction', { measureType: 'reps' }),
        ex('sb-s4-e2', 'Glute bridges', '10', { measureType: 'reps' }),
        ex('sb-s4-e3', 'Band pull-aparts', '20', { measureType: 'reps' }),
        ex('sb-s4-e4', 'Face pulls', '15', { measureType: 'reps' }),
      ],
    },
    {
      id: 'sb-s5',
      name: 'Pattern',
      icon: 'route',
      estimatedDuration: '2 minutes',
      exercises: [
        ex('sb-s5-e1', 'Empty-bar low-bar squat', '2 × 5', {
          measureType: 'setsReps',
          cues: [
            'Brace before descending',
            'Maintain balanced pressure through the feet',
            'Open the hips and knees together',
            'Stay over the mid-foot',
          ],
        }),
        ex('sb-s5-e2', 'Empty-bar bench press', '2 × 8', {
          measureType: 'setsReps',
          cues: [
            'Set the shoulder blades down and back',
            'Bend the bar',
            'Use leg drive before pressing',
            'Keep the shoulder position stable',
          ],
        }),
      ],
    },
    {
      id: 'sb-s6',
      name: 'Potentiate',
      icon: 'rocket',
      estimatedDuration: '1–2 minutes',
      note: 'Use maximal intent but low volume. Stop before fatigue develops.',
      exercises: [
        ex('sb-s6-e1', 'Box jump or broad jump', '3 × 3', {
          measureType: 'setsReps',
          alternatives: ['Broad jump — 3 × 3'],
        }),
      ],
    },
  ],
  postLiftReset: defaultPostLiftReset('sb'),
};

const deadlift: Routine = {
  id: 'routine-deadlift',
  name: 'Deadlift',
  isDefault: false,
  stages: [
    {
      id: 'dl-s1',
      name: 'Release',
      icon: 'waves',
      estimatedDuration: '2 minutes',
      exercises: [
        ex('dl-s1-e1', 'Left QL', '30 sec', {
          measureType: 'duration',
          timer: { enabled: true, durationSeconds: 30 },
        }),
        ex('dl-s1-e2', 'Adductors', '30 sec', {
          measureType: 'duration',
          timer: { enabled: true, durationSeconds: 30 },
        }),
        ex('dl-s1-e3', 'Glutes', '30 sec', {
          measureType: 'duration',
          timer: { enabled: true, durationSeconds: 30 },
        }),
        ex('dl-s1-e4', 'T-spine', '30 sec', {
          measureType: 'duration',
          timer: { enabled: true, durationSeconds: 30 },
        }),
      ],
    },
    {
      id: 'dl-s2',
      name: 'Mobilise',
      icon: 'move',
      estimatedDuration: '2–3 minutes',
      exercises: [
        ex('dl-s2-e1', 'Hip airplanes', '5 each side', { measureType: 'reps' }),
        ex('dl-s2-e2', '90/90 hip rotations', '10 total', { measureType: 'reps' }),
        ex('dl-s2-e3', 'Adductor rockbacks', '10', { measureType: 'reps' }),
        ex('dl-s2-e4', 'Ankle rocks', '10 each side', { measureType: 'reps' }),
      ],
    },
    {
      id: 'dl-s3',
      name: 'Stabilise',
      icon: 'anchor',
      estimatedDuration: '2 minutes',
      exercises: [
        ex('dl-s3-e1', 'Bird dogs', '6 each side', { measureType: 'reps' }),
        ex('dl-s3-e2', 'McGill curl-up', '5 each side', { measureType: 'reps' }),
        ex('dl-s3-e3', 'Side plank', '20 sec each side', {
          measureType: 'duration',
          timer: { enabled: true, durationSeconds: 20 },
        }),
      ],
    },
    {
      id: 'dl-s4',
      name: 'Activate',
      icon: 'zap',
      estimatedDuration: '2 minutes',
      exercises: [
        ex('dl-s4-e1', 'Monster walks', '10 each direction', { measureType: 'reps' }),
        ex('dl-s4-e2', 'Single-leg glute bridges', '8 each side', { measureType: 'reps' }),
        ex('dl-s4-e3', 'Banded hip hinges', '10', { measureType: 'reps' }),
      ],
    },
    {
      id: 'dl-s5',
      name: 'Pattern',
      icon: 'route',
      estimatedDuration: '2 minutes',
      exercises: [
        ex('dl-s5-e1', 'Empty-bar Romanian deadlift', '10', { measureType: 'reps' }),
        ex('dl-s5-e2', 'Sumo deadlift at 60 kg', '5', {
          measureType: 'reps',
          cues: [
            'Wedge into the bar',
            'Lock the lats',
            'Push the floor apart',
            'Maintain pressure through the whole foot',
            'Keep the chest and hips rising together',
          ],
        }),
      ],
    },
    {
      id: 'dl-s6',
      name: 'Potentiate',
      icon: 'rocket',
      estimatedDuration: '1–2 minutes',
      note: 'Use explosive repetitions without creating fatigue.',
      exercises: [
        ex('dl-s6-e1', 'Broad jump', '3 × 2', {
          measureType: 'setsReps',
          alternatives: ['Kettlebell swing — 3 × 5'],
        }),
      ],
    },
  ],
  postLiftReset: defaultPostLiftReset('dl'),
};

/** Fresh deep copy of the seed routines. */
export function createDefaultRoutines(): Routine[] {
  return JSON.parse(JSON.stringify([squatBench, deadlift])) as Routine[];
}

export const DEFAULT_ACTIVE_ROUTINE_ID = squatBench.id;
