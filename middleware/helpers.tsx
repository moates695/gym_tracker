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
        "Authorization": `Bearer ${auth_token}`
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