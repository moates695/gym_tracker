import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils';

export const workoutAtom = atomWithStorage('workoutAtom', {
  "start_timestamp": Date.now(),
  "exercises": []
});

export const exercisesAtom = atomWithStorage('exercisesAtom', [])