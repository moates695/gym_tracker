import { atom, useAtom } from 'jotai'
import { atomWithStorage, createJSONStorage, loadable } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineGraphPoint } from '@/components/LineGraph';
import { HistoryGraphOption, VolumeTimespan } from '@/components/ExerciseData';
import { Point3D } from '@/components/ThreeAxisGraph';
import { TableData } from '@/components/DataTable';
import { Gender, GoalStatus, PedStatus } from '@/app/sign-up';
import { get } from 'lodash';
import { fetchWrapper, formatLocal } from '@/middleware/helpers';

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
  weight: number | null
  num_sets: number
  class: SetClass
}

export const emptySetData: SetData = {
  "reps": null,
  "weight": null,
  "num_sets": null,
  "class": "working"
}

export type WeightType = 'free' | 'machine' | 'cable' | 'calisthenic';

export type BodyWeightRatios = Record<Gender, number>

export interface Exercise {
  id: string
  name: string
  muscle_data: MuscleData[]
  is_body_weight: boolean
  description: string
  weight_type: WeightType
  is_custom: boolean
  ratios?: BodyWeightRatios
}

//? base exercise: `variation_name` = undefined
//? variation: `variation_name` = non empty string
export interface WorkoutExercise extends Exercise {
  workout_exercise_id: string
  variation_name?: string
  set_data: SetData[]
  // loadingHistory: boolean
}

export const workoutExercisesAtom = atomWithStorage<WorkoutExercise[]>('workoutExercisesAtom', [], storage, { getOnInit: true });
export const loadableWorkoutExercisesAtom = loadable(workoutExercisesAtom);

export const loadingExerciseHistoryAtom = atom<Record<string, boolean>>({});

export const workoutStartTimeAtom = atomWithStorage<number | null>('workoutStartTimeAtom', Date.now(), storage);

export const muscleGroupToTargetsAtom = atomWithStorage<Record<string, string[]>>('muscleGroupToTargetsAtom', {});
export const muscleTargetoGroupAtom = atomWithStorage<Record<string, string>>('muscleTargetoGroupAtom', {});

export const fetchMappingsAtom = atom(
  null,
  async (get, set) => {
    const data = await fetchWrapper({
      route: 'muscles/get_maps',
      method: 'GET'
    })
    if (!data || !data.group_to_targets || !data.target_to_group) {
      throw new Error('muscle maps bad response');
    }
    set(muscleGroupToTargetsAtom, data.group_to_targets);
    set(muscleGroupToTargetsAtom, data.target_to_group);
  }
)

export type WorkoutScreen = 'start' | 'confirm' | 'workout';

export const showWorkoutStartOptionsAtom = atom<WorkoutScreen>('start');

//? base exercise: `variations` = list
//? variation: `variations` = undefined
export interface ExerciseListItem extends Exercise {
  frequency: Record<number, number>
  variations?: ExerciseListItem[]
}

export const exerciseListAtom = atomWithStorage<ExerciseListItem[]>('exerciseListAtom', []);

export const editWorkoutExercisesAtom = atom<boolean>(false);

export interface ExerciseHistoryBaseData {
  graph: LineGraphPoint[]
  table: TableData<string[], string | number>
}

export interface HistoryNRepMaxData {
  all_time: ExerciseHistoryBaseData
  history: Record<number, ExerciseHistoryBaseData>
}

export interface HistoryVolumeData {
  workout: ExerciseHistoryBaseData
  timespan: Record<VolumeTimespan, ExerciseHistoryBaseData>
}

export interface HistoryData {
  graph: Record<HistoryGraphOption, LineGraphPoint[]>
  table: TableData<string[], string | number>
  started_at: number
}

export interface ExerciseHistoryData {
  n_rep_max: HistoryNRepMaxData
  volume: HistoryVolumeData
  history: HistoryData[]
  reps_sets_weight: Point3D[]
}

export const emptyTableData: TableData<string[], string | number> = {
  "headers": [],
  "rows": []
}

export const emptyHistoryBaseData: ExerciseHistoryBaseData = {
  "graph": [],
  "table": {...emptyTableData}
}

export const emptyExerciseHistoricalData: ExerciseHistoryData = {
  "n_rep_max": {
    "all_time": {...emptyHistoryBaseData},
    "history": {}
  },
  "volume": {
    "workout": {...emptyHistoryBaseData}, 
    "timespan": {
      "week": {...emptyHistoryBaseData},
      "month": {...emptyHistoryBaseData},
      "3_months": {...emptyHistoryBaseData},
      "6_months": {...emptyHistoryBaseData},
      "year": {...emptyHistoryBaseData},
    }
  },
  "history": [],
  "reps_sets_weight": []
}

export const exercisesHistoricalDataAtom = atomWithStorage<Record<string, ExerciseHistoryData>>('exercisesHistoricalDataAtom', {}, storage);
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
export const loadingPreviousWorkoutStatsAtom = atom<boolean>(false);

export interface WorkoutTotalStats {
  volume: number
  num_sets: number
  reps: number
  duration: number
  num_workouts: number
  num_exercises: number
}

export const workoutTotalStatsAtom = atom<WorkoutTotalStats | null>(null)

export interface WorkoutHistoryStatsMuscleValue extends PreviousWorkoutStatsData {
  targets: Record<string, PreviousWorkoutStatsData>
}

export interface WorkoutHistoryStatsReplay {
  exercise_id: string
  exercise_name: string
  variation_name: string | null
  set_data: ValidSetData[]
}

export interface HistoryWorkoutStats extends PreviousWorkoutStatsData {
  num_exercises: number
}

export interface WorkoutHistoryStats {
  metadata: {
    started_at: number
    duration: number
    top_groups: string[]
  }
  workout_stats: HistoryWorkoutStats
  workout_muscle_stats: Record<string, WorkoutHistoryStatsMuscleValue>
  replay: WorkoutHistoryStatsReplay[]
}

export const workoutHistoryStatsAtom = atom<WorkoutHistoryStats[] | null>(null)

export interface UserData {
  user_id: string
  email: string
  username: string
  first_name: string
  last_name: string
  gender: Gender
  goal_status: GoalStatus
  height: number
  ped_status: PedStatus
  weight: number
}

export const userDataAtom = atomWithStorage<UserData | null>('userData', null, storage, { getOnInit: true })
export const loadableUserDataAtom = loadable(userDataAtom);

export type DistributionStatsMetric = 'volume' | 'num_sets' | 'reps' | 'num_exercises';

export type DistributionStatsBase = Record<DistributionStatsMetric, number>

export interface DistributionGroupStats extends DistributionStatsBase {
  targets: Record<string, DistributionStatsBase>
}

export type DistributionStats = Record<string, DistributionGroupStats>

export const distributionStatsAtom = atom<DistributionStats | null>(null);

export type FavouriteStatsMetric = 'volume' | 'num_sets' | 'reps' | 'counter';
export interface FavouriteExercisesFields {
  exercise_id: string
  exercise_name: string
  variation_name?: string
  groups: string[]
}

export type FavouriteExercisesStats = FavouriteExercisesFields & {
  [K in FavouriteStatsMetric]: number
}

export const favouriteExerciseStatsAtom = atom<FavouriteExercisesStats[] | null>(null);

export interface LeaderboardListItem {
  user_id: string
  username: string
  rank: number
  value: number
}

export interface LeaderboardData {
  fracture: number | null
  leaderboard: LeaderboardListItem[]
  user_rank: number
  max_rank: number
  friend_ids: string[]
  rank_data: any[]
}

export const volumeLeaderboardAtom = atom<LeaderboardData | null>(null);
export const setLeaderboardAtom = atom<LeaderboardData | null>(null);
export const repsLeaderboardAtom = atom<LeaderboardData | null>(null);

export type HeatMapOption = 'bluered' | 'ironbow' | 'inferno' | 'viridis' | 'jet' | 'hot' | 'cool' | 'plasma';
export const chosenHeatMap = atomWithStorage<HeatMapOption>('chosenHeatMap', 'bluered', storage, { getOnInit: true });
export const loadableChosenHeatMap = loadable(chosenHeatMap);

export type ErrorLevel = 'warn' | 'error';
export interface ErrorLog {
  date_str: string
  message: string
  level: ErrorLevel
}

export const errorLogsAtom = atomWithStorage<ErrorLog[]>('errorLogs', [], storage, { getOnInit: true });
export const loadableErrorLogsAtom = loadable(errorLogsAtom);

export interface FriendsListItem {
  user_id: string
  username: string
}

export const friendsListAtom = atomWithStorage<FriendsListItem[]>('friendsList', [], storage, { getOnInit: true });
// export const loadableFriendsListAtom = loadable(friendsListAtom);
export const blockedListAtom = atomWithStorage<FriendsListItem[]>('friendsList', [], storage, { getOnInit: true });

export type FriendRequestState = 'requested' | 'accepted' | 'denied';

export interface FriendRequest {
  id: string, // todo change here and backend to user_id
  username: string
  request_state: FriendRequestState
}

export const inboundFriendRequestsAtom = atomWithStorage<FriendRequest[]>('inboundFriendRequests', [], storage, { getOnInit: true });
export const outboundFriendRequestsAtom = atomWithStorage<FriendRequest[]>('outboundFriendRequests', [], storage, { getOnInit: true });

export type PermissionsKey = 
  | 'searchable'
  | 'workouts'
  | 'name'
  | 'gender'
  | 'age'
  | 'goal'
  | 'height'
  | 'weight'
  | 'ped_status';

export type Permissions = Record<PermissionsKey, string>

export const permissionsAtom = atomWithStorage<Permissions | null>('permissions', null, storage, { getOnInit: true });
