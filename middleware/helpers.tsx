import { BodyWeightRatios, ExerciseListItem, SetData, UserData, ValidSetData, WorkoutExercise } from "@/store/general";
import * as SecureStore from "expo-secure-store";
import Constants from 'expo-constants';
import * as Font from 'expo-font';
import { MaterialIcons, AntDesign, Ionicons, Feather } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { Atom, useAtomValue } from "jotai";
import { Loadable } from "jotai/vanilla/utils/loadable";

type FetchWrapperMethods = 'POST' | 'GET';
type TokenString = 'auth_token' | 'temp_token';

interface FetchWrapperArgs {
  route: string
  method: FetchWrapperMethods
  params?: Record<string, string>
  body?: Object
  token_str?: TokenString
}

export const fetchWrapper = async ({route, method, params = {}, body, token_str = 'auth_token'}: FetchWrapperArgs) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), parseInt(Constants.expoConfig?.extra?.apiTimeoutMs));

  try {
    let url = `${Constants.expoConfig?.extra?.apiUrl}/${route}`;
    url = `${url}?${new URLSearchParams(params).toString()}`;
    
    const token = await SecureStore.getItemAsync(token_str);
    const response = await fetch(url, {
      method: method,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      ...(method === 'POST' && {body: JSON.stringify(body)}),
      signal: controller.signal  
    });
    
    if (!response.ok) {
      if (response.status == 404) {
        throw new SafeError('404 url not found');
      } else if (response.status === 422) {
        const errorData = await response.json();
        console.log('Validation errors:', errorData.detail);
        throw new SafeError('fastapi validation error');
      } else {
        console.log('HTTP error. Status: ', response.status);
        const data = await response.json();
        throw new SafeError(`bad response ${response.status}: ${data.message}`);
      }
    }
  
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.log(error);
    if (error instanceof SafeError) throw new SafeError(`error saving workout: ${error.message}`);
    throw new SafeError(`uncaught fetchWrapper error: ${safeErrorMessage(error, '')}`);
  } finally {
    clearTimeout(id);
  }
}

export const isValidSet = (set_data: SetData, is_body_weight: boolean): boolean => {
  try {
    for (const [key, value] of Object.entries(set_data)) {
      if (is_body_weight && key === 'weight') continue;
      if (value !== null && value !== 0) continue;
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    throw new SafeError('isValidSet uncaught error');
  }
};

export const getValidSets = (exercise: WorkoutExercise): ValidSetData[] => {
  try {
    return exercise.set_data.filter((data) => isValidSet(data, exercise.is_body_weight)) as ValidSetData[];
  } catch (error) {
    console.log(error);
    if (error instanceof SafeError) throw error;
    throw new SafeError('getValidSets uncaught error');
  }
}

export const getExerciseValueMap = (exercise: WorkoutExercise | ExerciseListItem): Record<string, number> => {
  try {
    const valueMap: Record<string, number> = {};
    for (const group_data of exercise.muscle_data) {
      for (const target_data of group_data.targets) {
        valueMap[`${group_data.group_name}/${target_data.target_name}`] = target_data.ratio;
      }
    }
    return valueMap;
  } catch (error) {
    console.log(error);
    throw new SafeError('getExerciseValueMap uncaught error');
  }
}

// todo: what to do if userData is null, and below function too (it shouldn't be)
export const calcBodyWeight = (userData: UserData | null, ratios: BodyWeightRatios, additional: number | null): number => {
  console.log(userData);
  console.log(ratios);
  console.log(additional);
  try {
    if (!userData) {
      console.log('user data is null');
      return 0;
    };
    return userData.weight * ratios[userData.gender] + (additional || 0);
  } catch (error) {
    console.log(error);
    throw new SafeError('calcBodyWeight uncaught error');
  }
};

export const calcValidWeight = (exercise: WorkoutExercise, userData: UserData | null, set_data: ValidSetData): number => {
  try {
    if (!userData) throw new Error('userData is null');
    return exercise.is_body_weight ? calcBodyWeight(userData, exercise.ratios!, set_data.weight) : set_data.weight!;
  } catch (error) {
    console.log(error);
    return set_data.weight || 0;
  }
};

export const timestampToDateStr = (timestamp: number): string => {
  try {
    const localDate = new Date(timestamp);

    const day = localDate.getDate().toString().padStart(2, '0');
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
    const year = localDate.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.log(error);
    return `date error`
  }
};

export const loadFonts = async () => {
  await Font.loadAsync({
    ...MaterialIcons.font,
    ...AntDesign.font,
    ...Ionicons.font,
    ...Feather.font,
  });
};

export const loadInitialNecessary = async (runFetchMappings: () => Promise<void>) => {
  await Promise.all([
    loadFonts(),
    runFetchMappings(),
  ])
};

export function useAwaitLoadable<T>(
  loadableAtom: Atom<Loadable<Awaited<T>>>,
  defaultValue: Awaited<T>
) {
  const loadableValue = useAtomValue(loadableAtom);
  const [isReady, setIsReady] = useState(false);
  const [value, setValue] = useState<Awaited<T>>(defaultValue);

  useEffect(() => {
    if (loadableValue.state === 'loading') return;

    if (loadableValue.state === 'hasData') {
      setValue(loadableValue.data);
      setIsReady(true);
    } else if (loadableValue.state === 'hasError') {
      setValue(defaultValue);
      setIsReady(true);
    }
  }, [loadableValue, defaultValue]);

  return { value, isReady };
}

export const formatLocal = (dt: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");

  let hours = dt.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${pad(dt.getDate())}/` +
         `${pad(dt.getMonth() + 1)}/` +
         `${dt.getFullYear()} ` +
         `${pad(hours)}:` +
         `${pad(dt.getMinutes())}:` +
         `${pad(dt.getSeconds())} ${ampm}`;
}

export const safeErrorMessage = (err: unknown, defaultMsg = "an unknown error occurred"): string => {
  if (err instanceof SafeError && err.message != '') return `${defaultMsg}: ${err.message}`;
  if (err instanceof Error && err.message != '') return `${defaultMsg}: ${err.message}`;
  if (typeof err === "string" && err != '') return `${defaultMsg}: ${err}`;
  if (err && typeof err === "object" && "message" in err && err.message != '') {
    return `${defaultMsg}: ${String(err.message)}`;
  }
  return defaultMsg;
}

export class SafeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SafeError";
  }
}

export const timeSplit = (minutes: number)  => {
  try {
    const min = 1;
    const hour = 60 * min;
    const day = 24 * hour;

    const days = Math.floor(minutes / day);
    const hours = Math.floor((minutes % day) / hour);
    const mins = minutes % hour;

    return {
      days,
      hours,
      mins,
    }

  } catch (error) {
    throw new SafeError('converting minutes into string')
  }
};

export const pad = (n: number) => String(n).padStart(2, "0");

export const formatMinutes = (minutes: number): string => {
  try {
    const {
      days,
      hours,
      mins
    } = timeSplit(minutes);

    return `${pad(days)}:${pad(hours)}:${pad(mins)}`;

  } catch (error) {
    throw new SafeError('converting minutes into string')
  }
}

export const formatMagnitude = (n: number, fix: number = 3): string => {
  try {
    const abs = Math.abs(n);

    const units = [
      { v: 1e12, s: "T" },
      { v: 1e9,  s: "B" },
      { v: 1e6,  s: "M" },
      { v: 1e3,  s: "K" },
    ];

    for (const u of units) {
      if (abs >= u.v) {
        return (n / u.v).toFixed(fix).replace(/\.0$/, "") + u.s;
      }
    }

    return String(n);
  
  } catch (error) {
    throw new SafeError('converting number into magnitude string');
  }
}