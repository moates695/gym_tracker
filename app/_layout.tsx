import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React from "react";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/loading");

    // router.replace("/(tabs)");
    // return;

    const checkUserState = async () => {
      // await SecureStore.deleteItemAsync("auth_token"); //!!!!

      const auth_token = await SecureStore.getItemAsync("auth_token");
      if (!auth_token) {
        router.replace("/sign-up");
        return;
      }

      try {
        const decoded: {email: string, user_id: string, exp: number, iat: number } = jwtDecode(auth_token);
        
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/register/validate/check?` + 
          new URLSearchParams({ "email": decoded.email, "user_id": decoded.user_id }).toString()
        );
        if (!response.ok) throw new Error("response not ok");

        const data = await response.json();
        if (data.account_state == "none") {
          router.replace("/sign-up")
        } else if (data.account_state == "unverified") {
          router.replace({
            pathname: "/validate",
            params: { email: decoded.email }
          })
        } else if (data.account_state == "good") {
          await SecureStore.setItemAsync("auth_token", data.auth_token);
          router.replace("/(tabs)");
        } else {
          throw new Error("response not recognised");
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
