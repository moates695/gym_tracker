import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage, loadable } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = createJSONStorage(() => AsyncStorage) as any;

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

export type SetClass = 'working' | 'dropset' | 'warmup' | 'cooldown';

export interface SetData {
  reps: number | null
  weight: number | null
  num_sets: number | null
  class: SetClass
}

export interface ValidSetData {
  reps: number
  weight: number
  num_sets: number
  class: SetClass
}

export const emptySetData: SetData = {
  "reps": null,
  "weight": null,
  "num_sets": null,
  "class": "working"
}

export type WeightType = 'free' | 'machine' | 'cable';

export interface Exercise {
  id: string
  name: string
  muscle_data: MuscleData[]
  is_body_weight: boolean
  description: string
  weight_type: WeightType
  is_custom: boolean
}

export interface WorkoutExercise extends Exercise {
  set_data: SetData[]
}

export const workoutExercisesAtom = atomWithStorage<WorkoutExercise[]>('workoutExercisesAtom', [], storage, { getOnInit: true });
export const loadableWorkoutExercisesAtom = loadable(workoutExercisesAtom);

export const workoutStartTimeAtom = atomWithStorage<number | null>('workoutStartTimeAtom', Date.now(), storage);

export const muscleGroupToTargetsAtom = atomWithStorage<Record<string, string[]>>('muscleGroupToTargetsAtom', {});
export const muscleTargetoGroupAtom = atomWithStorage<Record<string, string>>('muscleTargetoGroupAtom', {});

export const showWorkoutStartOptionsAtom = atom<boolean>(true);

export interface ExerciseListItem extends Exercise {
  frequency: Record<number, number>
  variations?: ExerciseListItem[]
}

export const exerciseListAtom = atomWithStorage<ExerciseListItem[]>('exerciseListAtom', []);

export const editWorkoutExercisesAtom = atom<boolean>(false);

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

export interface HistorySetData {
  reps: number
  weight: number
  num_sets: number
}

export interface ExerciseHistory {
  set_data: HistorySetData[],
  timestamp: number
}

export interface ExerciseHistoricalData {
  n_rep_max: NRepMaxData
  volume: TimestampValue[]
  history: ExerciseHistory[]
  reps_sets_weight: HistorySetData[]
}

export const emptyExerciseHistoricalData: ExerciseHistoricalData = {
  "n_rep_max": {
    "all_time": {},
    "history": {}
  },
  "volume": [],
  "history": [],
  "reps_sets_weight": []
}

export const exercisesHistoricalDataAtom = atomWithStorage<Record<string, ExerciseHistoricalData>>('exercisesHistoricalDataAtom', {}, storage);
export const loadableExercisesHistoricalDataAtom = loadable(exercisesHistoricalDataAtom);

export interface PreviousWorkoutStatsData {
  volume: number
  num_sets: number
  reps: number
}

export interface PreviousWorkoutStats {
  started_at: number
  duration: number
  num_exercises: number
  totals: PreviousWorkoutStatsData
  muscles: Record<string, Record<string, PreviousWorkoutStatsData>>
}

export const previousWorkoutStatsAtom = atomWithStorage<PreviousWorkoutStats[]>('previousWorkoutStatsAtom', [], storage);
export const loadablePreviousWorkoutStatsAtom = loadable(previousWorkoutStatsAtom);
