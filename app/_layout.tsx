import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/loading");

    const checkUserState = async () => {
      const auth_token = await SecureStore.getItemAsync("auth_token");
      if (!auth_token) {
        router.replace("/sign-up");
        return;
      }

      try {
        const decoded: {email: string, exp: number, iat: number } = jwtDecode(auth_token);
        
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/register/validate/check?` + 
          new URLSearchParams({ "email": decoded.email }).toString()
        );
        if (!response.ok) throw new Error("response not ok");

        const data = await response.json();
        if (data.account_state == "none") {
          router.replace("/sign-in")
        } else if (data.account_state == "unverified") {
          router.replace("/validate")
        } else if (data.account_state == "good") {
          await SecureStore.setItemAsync("auth_token", data.auth_token);
          router.replace("/(tabs)");
        } else {
          throw new Error("response ot recognised");
        }

      } catch (error) {
        console.log(error);
        router.replace("/sign-up")
      }
      
    };

    checkUserState();

  }, [])

  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="loading"/>
      <Stack.Screen name="(tabs)"/>
      <Stack.Screen name="+not-found" />
      <Stack.Screen name="sign-up"/>
      <Stack.Screen name="sign-in"/>
      <Stack.Screen name="validate"/>
      <Stack.Screen name="error"/>
    </Stack>
  );
}
