import { SetData, ValidSetData, WorkoutExercise } from "@/store/general";
import * as SecureStore from "expo-secure-store";

export const fetchExercises = async (setExercises: any) => {
  try {
    const auth_token = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/exercises/list/all`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${auth_token}`
      }         
    });
    
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
    const data = await response.json();
    setExercises(data.exercises);
    
  } catch (error) {
    console.log(error)
  }
};

export const fetchWrapper = async (route: string, method: string, params?: any, body?: any) => {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_URL}/${route}`;
    if (method === 'GET' && params) {
      url = `${url}?${new URLSearchParams(params).toString()}`
    }
    const auth_token = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(url, {
      method: method,
      headers: {
        "Authorization": `Bearer ${auth_token}`,
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