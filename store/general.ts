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
        "weight": 55.3,
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

// export const workoutAtom = atom(
//   (get) => ({
//     start_timestamp: get(workoutStartTimeAtom),
//     exercises: get(workoutExercisesAtom),
//   }),
//   (get, set, newWorkout: { start_timestamp: number; exercises: any[] }) => {
//     set(workoutStartTimeAtom, newWorkout.start_timestamp);
//     set(workoutExercisesAtom, newWorkout.exercises);
//   }
// );

export const exerciseListAtom = atomWithStorage('exerciseListAtom', [])

const now = Date.now();

export const exercisesHistoricalDataAtom = atom({
  "000": {
    "n_rep_max": {
      "all_time": {
        "1": { weight: 155.8, timestamp: now - 1000 * 60 * 60 * 24 * 30 },       // ~1 month ago
        "3": { weight: 152.9, timestamp: now - 1000 * 60 * 60 * 24 * 180 },      // ~6 months ago
        "5": { weight: 143.2, timestamp: now - 1000 * 60 * 60 * 24 * 90 },       // ~3 months ago
        "10": { weight: 135.6, timestamp: now - 1000 * 60 * 60 * 24 * 14 },      // ~2 weeks ago
        "11": { weight: 133.5, timestamp: now - 1000 * 60 * 60 * 24 * 7 },       // ~1 week ago
        "20": { weight: 90.9, timestamp: now - 1000 * 60 * 60 * 24 * 400 }       // ~13 months ago
      },
      "history": {
        "1": [
          { weight: 148.6, timestamp: now - 1000 * 60 * 60 * 24 * 1 },
          { weight: 149.0, timestamp: now - 1000 * 60 * 60 * 24 * 3 },
          { weight: 148.6, timestamp: now - 1000 * 60 * 60 * 24 * 5 },
          { weight: 152.2, timestamp: now - 1000 * 60 * 60 * 24 * 10 },
          { weight: 151.0, timestamp: now - 1000 * 60 * 60 * 24 * 20 },
          { weight: 155.8, timestamp: now - 1000 * 60 * 60 * 24 * 30 },
          { weight: 150.8, timestamp: now - 1000 * 60 * 60 * 24 * 60 },
          { weight: 150.5, timestamp: now - 1000 * 60 * 60 * 24 * 80 },
          { weight: 153.7, timestamp: now - 1000 * 60 * 60 * 24 * 150 },
          { weight: 153.7, timestamp: now - 1000 * 60 * 60 * 24 * 300 },
          { weight: 148.1, timestamp: now - 1000 * 60 * 60 * 24 * 370 }
        ],
        "3": [
          { weight: 141.0, timestamp: now - 1000 * 60 * 60 * 24 * 2 },
          { weight: 148.5, timestamp: now - 1000 * 60 * 60 * 24 * 10 },
          { weight: 146.2, timestamp: now - 1000 * 60 * 60 * 24 * 20 },
          { weight: 142.9, timestamp: now - 1000 * 60 * 60 * 24 * 40 },
          { weight: 145.1, timestamp: now - 1000 * 60 * 60 * 24 * 60 },
          { weight: 143.9, timestamp: now - 1000 * 60 * 60 * 24 * 90 },
          { weight: 149.9, timestamp: now - 1000 * 60 * 60 * 24 * 180 },
          { weight: 149.4, timestamp: now - 1000 * 60 * 60 * 24 * 250 },
          { weight: 144.7, timestamp: now - 1000 * 60 * 60 * 24 * 300 }
        ],
        "5": [
          { weight: 138.2, timestamp: now - 1000 * 60 * 60 * 24 * 1 },
          { weight: 137.0, timestamp: now - 1000 * 60 * 60 * 24 * 3 },
          { weight: 140.2, timestamp: now - 1000 * 60 * 60 * 24 * 5 },
          { weight: 139.9, timestamp: now - 1000 * 60 * 60 * 24 * 10 },
          { weight: 141.5, timestamp: now - 1000 * 60 * 60 * 24 * 40 },
          { weight: 143.2, timestamp: now - 1000 * 60 * 60 * 24 * 75 },
          { weight: 139.7, timestamp: now - 1000 * 60 * 60 * 24 * 90 },
          { weight: 142.6, timestamp: now - 1000 * 60 * 60 * 24 * 180 },
          { weight: 140.8, timestamp: now - 1000 * 60 * 60 * 24 * 365 }
        ],
        "10": [
          { weight: 128.1, timestamp: now - 1000 * 60 * 60 * 24 * 1 },
          { weight: 121.5, timestamp: now - 1000 * 60 * 60 * 24 * 7 },
          { weight: 128.4, timestamp: now - 1000 * 60 * 60 * 24 * 14 },
          { weight: 130.0, timestamp: now - 1000 * 60 * 60 * 24 * 20 },
          { weight: 126.7, timestamp: now - 1000 * 60 * 60 * 24 * 30 },
          { weight: 129.6, timestamp: now - 1000 * 60 * 60 * 24 * 50 },
          { weight: 129.1, timestamp: now - 1000 * 60 * 60 * 24 * 90 },
          { weight: 122.6, timestamp: now - 1000 * 60 * 60 * 24 * 180 },
          { weight: 125.8, timestamp: now - 1000 * 60 * 60 * 24 * 365 }
        ],
        "11": [
          { weight: 118.9, timestamp: now - 1000 * 60 * 60 * 24 * 3 },
          { weight: 126.5, timestamp: now - 1000 * 60 * 60 * 24 * 7 },
          { weight: 120.4, timestamp: now - 1000 * 60 * 60 * 24 * 15 },
          { weight: 124.1, timestamp: now - 1000 * 60 * 60 * 24 * 30 },
          { weight: 118.6, timestamp: now - 1000 * 60 * 60 * 24 * 45 },
          { weight: 117.6, timestamp: now - 1000 * 60 * 60 * 24 * 90 },
          { weight: 123.7, timestamp: now - 1000 * 60 * 60 * 24 * 180 },
          { weight: 119.7, timestamp: now - 1000 * 60 * 60 * 24 * 270 },
          { weight: 122.9, timestamp: now - 1000 * 60 * 60 * 24 * 400 }
        ],
        "20": [
          { weight: 91.8, timestamp: now - 1000 * 60 * 60 * 24 * 14 },
          { weight: 94.4, timestamp: now - 1000 * 60 * 60 * 24 * 45 },
          { weight: 93.7, timestamp: now - 1000 * 60 * 60 * 24 * 60 },
          { weight: 92.3, timestamp: now - 1000 * 60 * 60 * 24 * 90 },
          { weight: 96.7, timestamp: now - 1000 * 60 * 60 * 24 * 120 },
          { weight: 97.9, timestamp: now - 1000 * 60 * 60 * 24 * 150 },
          { weight: 95.3, timestamp: now - 1000 * 60 * 60 * 24 * 250 },
          { weight: 99.9, timestamp: now - 1000 * 60 * 60 * 24 * 400 },
          { weight: 95.8, timestamp: now - 1000 * 60 * 60 * 24 * 420 }
        ]
      }
    }
  },
  "001": {
    "n_rep_max": {
      "all_time": {},
      "history": {},
    }
  }
});