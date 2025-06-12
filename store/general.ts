import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils';

export interface MuscleTargetData {
  target_id: string,
  target_name: string,
  ratio: number
}

export interface MuscleData {
  group_id: string,
  group_name: string,
  targets: MuscleTargetData[]
}

export interface SetData {
  reps: number | null
  weight: number | null
  num_sets: number | null
}

export type WeightType = 'free' | 'machine' | 'cable';

export interface ExerciseFrequencyData {
  days_past: number,
  volume: number
}

export interface WorkoutExercise {
  id: string
  name: string
  muscle_data: MuscleData[]
  is_body_weight: boolean
  set_data: SetData[]
  description: string
  weight_type: WeightType
  is_custom: boolean
  // frequency: ExerciseFrequencyData[]
  frequency: Record<number, number>
}

export const workoutExercisesAtom = atomWithStorage<WorkoutExercise[]>('workoutExercisesAtom', []);

export const workoutStartTimeAtom = atomWithStorage<number | null>('workoutStartTimeAtom', Date.now());

export const showWorkoutStartOptionsAtom = atom<boolean>(true);

export const exerciseListAtom = atomWithStorage('exerciseListAtom', [])

export interface WeightTimestamp {
  weight: number
  timestamp: number
}

export interface NRepMaxData {
  all_time: Record<string, WeightTimestamp>
  history: Record<string, WeightTimestamp[]>
}

export interface ExerciseHistoricalData {
  n_rep_max: NRepMaxData
  // reps_sets: any
}

export const emptyExerciseHistoricalData: ExerciseHistoricalData = {
  "n_rep_max": {
    "all_time": {},
    "history": {}
  }
}

const now = Date.now();
export const exercisesHistoricalDataAtom = atom<Record<string, ExerciseHistoricalData>>({
  "000": {
    "n_rep_max": {
      "all_time": {
        "1": { weight: 155.8, timestamp: now - 1000 * 60 * 60 * 24 * 30 },
        "3": { weight: 152.9, timestamp: now - 1000 * 60 * 60 * 24 * 180 },
        "5": { weight: 143.2, timestamp: now - 1000 * 60 * 60 * 24 * 90 },
        "10": { weight: 135.6, timestamp: now - 1000 * 60 * 60 * 24 * 14 },
        "11": { weight: 133.5, timestamp: now - 1000 * 60 * 60 * 24 * 7 },
        "20": { weight: 90.9, timestamp: now - 1000 * 60 * 60 * 24 * 400 }
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
  "001": emptyExerciseHistoricalData
});