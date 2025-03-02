import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

type AccountState = "new" | "valid" | "expired" | "error" | null;

export default function RootLayout() {
  const router = useRouter();
  // const [loading, setLoading] = useState<boolean>(true);
  // const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [accountState, setAccountState] = useState<AccountState>(null);

  useEffect(() => {
    const checkStorage = async () => {
      try {
        const token = await SecureStore.getItemAsync("auth_token_long");
        if (!token) {
          setAccountState("new");
          return
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
        setAccountState("error")
      }
    };

    checkStorage();
  }, []);

  useEffect(() => {
    if (!accountState) return;
    else if (accountState === "new") {
      router.replace("/sign-up");
    } else if (accountState === "expired") {
      router.replace("/sign-in");
    } else if (accountState === "error") {
      router.replace("/error")
    } else {
      router.replace('/(tabs)')
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
