import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils';

export const workoutExercisesAtom = atomWithStorage<any[]>('exercises', []);
export const startTimestampAtom = atomWithStorage('start_timestamp', Date.now());

export const workoutAtom = atom((get) => ({
  start_timestamp: get(startTimestampAtom),
  exercises: get(workoutExercisesAtom),
}));

export const exercisesAtom = atomWithStorage('exercisesAtom', [])