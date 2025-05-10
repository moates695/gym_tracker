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