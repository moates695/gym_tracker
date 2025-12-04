import { PrimitiveAtom, useSetAtom } from "jotai";
import { v4 as uuidv4 } from 'uuid';
import * as Crypto from 'expo-crypto';
import { atom } from 'jotai';
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { Dispatch, SetStateAction } from "react";
import _ from "lodash";
import { ErrorLevel, errorLogsAtom, loadingExerciseHistoryAtom } from "./general";
import { formatLocal, safeErrorMessage } from "@/middleware/helpers";

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

export const addErrorLogAtom = atom(
  null,
  async (get, set, message: string, level: ErrorLevel = 'error') => {
    console.log(message);
    try {
      const tempLogs = await get(errorLogsAtom);
      const newLength = tempLogs.unshift({
        date_str: formatLocal(new Date()),
        message, 
        level
      })
      if (newLength > 100) tempLogs.pop();
      set(errorLogsAtom, tempLogs);
    } catch (error) {
      console.log(error);
    }
  }
)

export const addCaughtErrorLogAtom = atom(
  null,
  async (get, set, err: unknown, default_msg: string, level: ErrorLevel = 'error') => {
    try {
      const message = safeErrorMessage(err, default_msg);
      console.log(message);
      const tempLogs = await get(errorLogsAtom);
      const newLength = tempLogs.unshift({
        date_str: formatLocal(new Date()),
        message, 
        level
      })
      if (newLength > 100) tempLogs.pop();
      set(errorLogsAtom, tempLogs);
    } catch (error) {
      console.log(error);
    }
  }
)
