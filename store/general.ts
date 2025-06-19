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

export interface TimestampValue {
  value: number
  timestamp: number
}

export interface ExerciseHistoricalData {
  n_rep_max: NRepMaxData
  volume: TimestampValue[]
}

export const emptyExerciseHistoricalData: ExerciseHistoricalData = {
  "n_rep_max": {
    "all_time": {},
    "history": {}
  },
  "volume": []
}

export const exercisesHistoricalDataAtom = atom<Record<string, ExerciseHistoricalData>>({})