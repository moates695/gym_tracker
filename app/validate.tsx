import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, View, Text, TouchableOpacity } from "react-native";

export default function Validate() {
  const { username } = useLocalSearchParams();
  const usernameString: string = Array.isArray(username) ? username[0] : username ?? "";

  const router = useRouter();
  const [stopFetch, SetStopFetch] = useState<boolean>(false); 

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchValidationStatus = async () => {
      if (stopFetch) return;
      
      let is_validated: boolean = false;
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/register/validate/check?` + 
          new URLSearchParams({ username: usernameString }).toString()
        )
        const data = await response.json();

        if (data["is_verified"] === true) {
          is_validated = true;
          router.replace("/(tabs)")
          return;
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (!is_validated) {
          timeoutId = setTimeout(fetchValidationStatus, 1500);        

        }
      }
    };

    fetchValidationStatus();

    return () => clearTimeout(timeoutId);

  }, [stopFetch]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black"}}>
      <Text style={{ color: "white" }}>Validate your email</Text>
      <TouchableOpacity 
        onPress={() => {
          SetStopFetch(true);
          router.replace("/sign-up");
        }}
      >
        <Text 
          style={{ color: "white"}}
        >back to sign up</Text>
      </TouchableOpacity>
    </View>
  )

}