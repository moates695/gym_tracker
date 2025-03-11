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
        new URLSearchParams({ usernameString }).toString()
      )
      const data = await response.json();
      console.log(data);
      is_validated = data["is_verified"];
    } catch (error) {
      console.log(error);
    } finally {
      if (!is_validated) {
        setTimeout(fetchValidationStatus, 1000);        
      }
    }

    if (!is_validated) return;

    Alert.alert("email has been validated")
    // todo save username + data in storage and navigate to home screen (?)

  };

  useEffect(() => {
    const timeout = setTimeout(fetchValidationStatus, 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "black"}}>
      <Text>Validate your email</Text>
    </View>
  )

}