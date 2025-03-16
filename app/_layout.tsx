import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { AppState } from "react-native";
import { isTokenExpired } from "@/middleware/token";

type AccountState = "not-registered" | "not-validated" | "expired" | "good" | null;

export default function RootLayout() {
  const router = useRouter();
  const [accountState, setAccountState] = useState<AccountState>(null);

  // const checkTokens = async () => {
  //   const short_token = await SecureStore.getItemAsync("short_token");
  //   const long_token = await SecureStore.getItemAsync("long_token");
  //   if (!short_token && !long_token) {
  //     router.replace("/sign-up");
  //     return;
  //   } else if (long_token !== null && isTokenExpired(long_token)) {
  //     router.replace("/sign-in");
  //     return;
  //   }

  //   // todo fetch is_validated endpoint
  //   // todo if past half expiry, refresh tokens, else set timeout
  //   // todo run this func onmount and appstate change to active

  // };

  // useEffect(() => {
  //   const handleAppStateChange = (nextState: string) => {
  //     if (nextState === "active") {
  //       // startTimeout();
  //       // start refresh cycle(s)
  //     }
  //   };

  //   const subscription = AppState.addEventListener("change", handleAppStateChange);
  //   return () => subscription.remove();
  // }, []);

  useEffect(() => {
    router.replace("/sign-up");
  }, [])

  useEffect(() => {

    const checkAuthToken = async () => {
      const auth_token = await SecureStore.getItemAsync("auth_token");
      if (!auth_token) {
        router.replace("/sign-up");
        return;
      }

      // todo decode token and get email, use email to check validation
      // todo change server validation to email not username

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/register/validate/check?` + 
        new URLSearchParams({  }).toString()
      );
      if (!response.ok) throw new Error('response not ok');

      const data = await response.json();

      // todo if not validated, go to validation and send email
      // todo if validated but near expiry, renew auth token and go to home screen

    };

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
