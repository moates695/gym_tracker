import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, View, Text, TouchableOpacity } from "react-native";
import * as SecureStore from "expo-secure-store";

export default function Validate() {
  const { email } = useLocalSearchParams();
  const emailString: string = Array.isArray(email) ? email[0] : email ?? "";

  const router = useRouter();
  const [stopFetch, SetStopFetch] = useState<boolean>(false); 

  // TODO prevent timeout until on page

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchValidationStatus = async () => {
      if (stopFetch) return;
      console.log(Date.now())  
      
      let is_validated: boolean = false;
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/register/validate/check?` + 
          new URLSearchParams({ email: emailString }).toString()
        )
        if (!response.ok) throw new Error('request not okay');

        const data = await response.json();

        if (data["is_verified"] === true) {
          is_validated = true;
          await SecureStore.setItemAsync('auth_token', data.auth_token);
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