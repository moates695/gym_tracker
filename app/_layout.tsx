import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

type AccountState = "not-registered" | "not-validated" | "expired" | "good" | null;

export default function RootLayout() {
  const router = useRouter();
  const [accountState, setAccountState] = useState<AccountState>(null);

  useEffect(() => {
    const checkStorage = async () => {
      try {
        const token = await SecureStore.getItemAsync("auth_token_long");
        if (!token) {
          setAccountState("not-registered");
          return;
        }

        const url = process.env.API_URL as string;
        const response = await fetch(`${url}/authenticate`, {
          method: 'POST',
          body: JSON.stringify({
            "token": token
          })
        });
        if (!response.ok) throw new Error("HTTP error");
        
        const data = await response.json();

      } catch (error) {
        console.error("Error checking credentials:", error);
        // show error message
      }
    };

    checkStorage();
  }, []);

  useEffect(() => {
    if (accountState === null) {
      return;
    } else if (accountState === "not-registered") {
      // router.replace("/sign-up");
      router.replace({
        pathname: "/sign-up",
        params: { await_validation: "false" }
      })
    } else if (accountState === "not-validated") {
      router.replace({
        pathname: "/sign-up",
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
      <Stack.Screen name="error"/>
    </Stack>
  );
}
