import { BodyWeightRatios, ExerciseListItem, SetData, UserData, ValidSetData, WorkoutExercise } from "@/store/general";
import * as SecureStore from "expo-secure-store";
import Constants from 'expo-constants';
import * as Font from 'expo-font';
import { MaterialIcons, AntDesign, Ionicons, Feather } from '@expo/vector-icons';

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
      ...(method === 'POST' && {body: JSON.stringify(body)})         
    });
    
    if (!response.ok) {
      if (response.status === 422) {
        const errorData = await response.json();
        console.log('Validation errors:', errorData.detail);
      } else {
        console.log('HTTP error. Status: ', response.status);
      }
      throw new Error('HTTP Error');
    }
  
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

export const getExerciseValueMap = (exercise: WorkoutExercise | ExerciseListItem): Record<string, number> => {
  const valueMap: Record<string, number> = {};
  for (const group_data of exercise.muscle_data) {
    for (const target_data of group_data.targets) {
      valueMap[`${group_data.group_name}/${target_data.target_name}`] = target_data.ratio;
    }
  }
  return valueMap;
}

export const calcBodyWeight = (userData: UserData | null, ratios: BodyWeightRatios, additional: number | null): number => {
    if (!userData) {
      console.log('user data is null');
      return 0;
    };
  return userData.weight * ratios[userData.gender] + (additional || 0);
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