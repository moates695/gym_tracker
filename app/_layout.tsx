import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { AppState } from "react-native";
import { isTokenExpired } from "@/middleware/token";

type AccountState = "not-registered" | "not-validated" | "expired" | "good" | null;

export default function RootLayout() {
  const router = useRouter();
  const [accountState, setAccountState] = useState<AccountState>(null);
  const shortTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // useEffect(() => {
  //   // todo implement proper token checking once signed up / in
  //   const checkStorage = async () => {
  //     try {
  //       const token = await SecureStore.getItemAsync("long_token");
  //       if (!token) {
  //         setAccountState("not-registered");
  //         return;
  //       }

  //       const url = process.env.EXPO_PUBLIC_API_URL as string;
  //       const response = await fetch(`${url}/authenticate`, {
  //         method: 'POST', 
  //         body: JSON.stringify({
  //           "token": token
  //         })
  //       });
  //       if (!response.ok) throw new Error("HTTP error");
        
  //       const data = await response.json();

  //     } catch (error) {
  //       console.error("Error checking credentials:", error);
  //       // show error message
  //     }
  //   };

  //   checkStorage();
  // }, []);

  // if exists, load short token, if past half expiry refresh with long, else set timer for half expiry to refresh

  const checkTokens = async () => {
    const short_token = await SecureStore.getItemAsync("short_token");
    const long_token = await SecureStore.getItemAsync("long_token");
    if (!short_token && !long_token) {
      router.replace("/sign-up");
      return;
    } else if (long_token !== null && isTokenExpired(long_token)) {
      router.replace("/sign-in");
      return;
    }

    // todo fetch is_validated endpoint
    // todo if past half expiry, refresh tokens, else set timeout
    // todo run this func onmount and appstate change to active

  };

  useEffect(() => {
    const handleAppStateChange = (nextState: string) => {
      if (nextState === "active") {
        // startTimeout();
        // start refresh cycle(s)
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (accountState === null) {
      router.replace("/loading");
    } else if (accountState === "not-registered") {
      router.replace("/sign-up")
    } else if (accountState === "not-validated") {
      router.replace({
        pathname: "/validate",
        params: { await_validation: "true" }
      })
    } else if (accountState === "expired") {
      router.replace("/sign-in");
    } else if (accountState === "good") {
      router.replace("/(tabs)")
    } else {
      // todo show error
    }
  }, [accountState, router]);

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
