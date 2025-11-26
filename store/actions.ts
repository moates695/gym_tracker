import { PrimitiveAtom, useSetAtom } from "jotai";
import { v4 as uuidv4 } from 'uuid';
import * as Crypto from 'expo-crypto';
import { atom } from 'jotai';
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { Dispatch, SetStateAction } from "react";
import _ from "lodash";
import { loadingExerciseHistoryAtom } from "./general";

export const updateLoadingExerciseHistoryAtom = atom(
  null,
 (get, set, workout_exercise_id: string, state: boolean) => {
    const loadingExerciseHistory = get(loadingExerciseHistoryAtom);
    set(loadingExerciseHistoryAtom, {
      ...loadingExerciseHistory,
      [workout_exercise_id]: state
    })
  }
)

