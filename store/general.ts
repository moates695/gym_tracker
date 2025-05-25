import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils';

export const workoutExercisesAtom = atomWithStorage<any[]>('workoutExercisesAtom', [
  {
    "id": "000",
    "name": "Dumbbell Bicep Curl",
    "targets": {
        "bicep": "100",
        "forearm": "20"
    },
    "is_body_weight": false,
    "sets": [
      {
        "reps": 10,
        "weight": 55,
        "sets": 2,
      }
    ]
  },
  {
    "id": "001",
    "name": "Push-Up",
    "targets": {
        "chest": "80",
        "tricep": "60",
        "shoulder": "40"
    },
    "is_body_weight": true,
    "sets": [
      {
        "reps": null,
        "weight": null,
        "sets": null,
      }
    ]
  },
]);
export const workoutStartTimeAtom = atomWithStorage('workoutStartTimeAtom', Date.now());

export const workoutAtom = atom(
  (get) => ({
    start_timestamp: get(workoutStartTimeAtom),
    exercises: get(workoutExercisesAtom),
  }),
  (get, set, newWorkout: { start_timestamp: number; exercises: any[] }) => {
    set(workoutStartTimeAtom, newWorkout.start_timestamp);
    set(workoutExercisesAtom, newWorkout.exercises);
  }
);

export const exerciseListAtom = atomWithStorage('exerciseListAtom', [])

export const exerciseHistoricalData = atom({});