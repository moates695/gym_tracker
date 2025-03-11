import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert, View, Text } from "react-native";

export default function Validate() {
  const { username } = useLocalSearchParams();
  const usernameString: string = Array.isArray(username) ? username[0] : username ?? "";

  const router = useRouter();
  
  const fetchValidationStatus = async () => {
    let is_validated: boolean = false;
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/register/validate/check?` + 
        new URLSearchParams({ username: usernameString }).toString()
      )
      const data = await response.json();
      console.log(data);
      if (data["is_verified"] === true) {
        is_validated = true;
        router.replace("/(tabs)")
        return;
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (is_validated) return;
      setTimeout(fetchValidationStatus, 1500);        
    }

  };

  useEffect(() => {
    const timeout = setTimeout(fetchValidationStatus, 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black"}}>
      <Text style={{ color: "white" }}>Validate your email</Text>
    </View>
  )

}