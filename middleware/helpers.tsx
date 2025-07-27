import { SetData, ValidSetData, WorkoutExercise } from "@/store/general";
import * as SecureStore from "expo-secure-store";

type FetchWrapperMethods = 'POST' | 'GET';
type TokenString = 'auth_token' | 'temp_token';

interface FetchWrapperArgs {
  route: string
  method: FetchWrapperMethods
  params?: Record<string, string>
  body?: Object
  token_str?: TokenString
}

export const fetchWrapper = async ({route, method, params, body, token_str = 'auth_token'}: FetchWrapperArgs) => {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_URL}/${route}`;
    if (method === 'GET' && params) {
      url = `${url}?${new URLSearchParams(params).toString()}`
    }
    const token = await SecureStore.getItemAsync(token_str);
    const response = await fetch(url, {
      method: method,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      ...(method === 'POST' && {body: JSON.stringify(body)})         
    });
    
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.log(error)
    return null;
  }
}

export const isValidSet = (set_data: SetData, is_body_weight: boolean): boolean => {
  for (const [key, value] of Object.entries(set_data)) {
    if (is_body_weight && key === 'weight') continue;
    if (value !== null && value !== 0) continue;
    return false;
  }
  return true;
};

export const getValidSets = (exercise: WorkoutExercise): ValidSetData[] => {
  return exercise.set_data.filter((data) => isValidSet(data, exercise.is_body_weight)) as ValidSetData[];
}

export const getExerciseValueMap = (exercise: WorkoutExercise): Record<string, number> => {
  const valueMap: Record<string, number> = {};
  for (const group_data of exercise.muscle_data) {
    for (const target_data of group_data.targets) {
      valueMap[`${group_data.group_name}/${target_data.target_name}`] = target_data.ratio;
    }
  }
  return valueMap;
}

export const getBodyWeight = (exercise: WorkoutExercise): number => {
  // send request or do locally?
  return 18.25;
};