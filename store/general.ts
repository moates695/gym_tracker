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

export const exercisesHistoricalDataAtom = atom({
  "000": {
    "n_rep_max": {
      "all_time": {
        "1": {
          "weight": "155",
          "timestamp": "1748252144422"
        },
        "3": {
          "weight": "130",
          "timestamp": "1748338544422"
        },
        "5": {
          "weight": "100",
          "timestamp": "1748424944422"
        },
        "10": {
          "weight": "95",
          "timestamp": "1748511344422"
        },
        "11": {
          "weight": "92",
          "timestamp": "1748597744422"
        },
        "20": {
          "weight": "87",
          "timestamp": "1748684144422"
        }
      },
      "history": {
        "1": [
          {
            "weight": "155",
            "timestamp": "1748252144422"
          },
          {
            "weight": "150",
            "timestamp": "1748165744422"
          },
          {
            "weight": "148",
            "timestamp": "1748079344422"
          },
          {
            "weight": "152",
            "timestamp": "1747992944422"
          },
          {
            "weight": "149",
            "timestamp": "1747906544422"
          }
        ],
        "3": [
          { "weight": "130", "timestamp": "1748338544422" },
          { "weight": "128", "timestamp": "1748252144422" },
          { "weight": "127", "timestamp": "1748165744422" },
          { "weight": "125", "timestamp": "1748079344422" },
          { "weight": "129", "timestamp": "1747992944422" }
        ],
        "5": [
          { "weight": "100", "timestamp": "1748424944422" },
          { "weight": "98",  "timestamp": "1748338544422" },
          { "weight": "97",  "timestamp": "1748252144422" },
          { "weight": "95",  "timestamp": "1748165744422" },
          { "weight": "96",  "timestamp": "1748079344422" }
        ],
        "10": [
          { "weight": "95",  "timestamp": "1748511344422" },
          { "weight": "93",  "timestamp": "1748424944422" },
          { "weight": "91",  "timestamp": "1748338544422" },
          { "weight": "90",  "timestamp": "1748252144422" },
          { "weight": "92",  "timestamp": "1748165744422" }
        ],
        "11": [
          { "weight": "92",  "timestamp": "1748597744422" },
          { "weight": "90",  "timestamp": "1748511344422" },
          { "weight": "89",  "timestamp": "1748424944422" },
          { "weight": "88",  "timestamp": "1748338544422" },
          { "weight": "91",  "timestamp": "1748252144422" }
        ],
        "20": [
          { "weight": "87",  "timestamp": "1748684144422" },
          { "weight": "85",  "timestamp": "1748597744422" },
          { "weight": "84",  "timestamp": "1748511344422" },
          { "weight": "83",  "timestamp": "1748424944422" },
          { "weight": "86",  "timestamp": "1748338544422" }
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