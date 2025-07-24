import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React from "react";
import * as Font from 'expo-font';
import { MaterialIcons, AntDesign, Ionicons } from '@expo/vector-icons';
import { fetchWrapper } from "@/middleware/helpers";

export interface DecodedJWT {
  email: string
  user_id: string
  exp: number
  iat: number
}

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/loading");

    const checkUserState = async () => {
      // await SecureStore.deleteItemAsync("auth_token"); //!!!! for testing new user

      const auth_token = await SecureStore.getItemAsync("auth_token");
      if (!auth_token) {
        router.replace("/sign-up");
        return;
      }

      try {
        const decoded: DecodedJWT = jwtDecode(auth_token);
        
        if (decoded.exp < Date.now() / 1000) {
          await SecureStore.deleteItemAsync("auth_token");
          router.replace("/sign-in");
          return;
        }

        const data = await fetchWrapper('login', 'GET');
        if (data === null) throw new Error("response not ok");

        if (data.account_state == "none") {
          await SecureStore.deleteItemAsync("auth_token");
          router.replace("/sign-up");
        } else if (data.account_state == "unverified") {
          const temp_token = await SecureStore.getItemAsync("temp_token");
          if (!temp_token) {
            router.replace("/sign-in");
            return;
          }
          
          const decodedTempToken: DecodedJWT = jwtDecode(temp_token);
          if (decodedTempToken.exp < Date.now() / 1000 - 3 * 60) {
            router.replace("/sign-in");
            return;
          }

          router.replace("/validate");

        } else if (data.account_state == "good") {
          await SecureStore.deleteItemAsync("temp_token");
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

  }, []);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        ...MaterialIcons.font,
        ...AntDesign.font,
        ...Ionicons.font,
      });
      // setFontsLoaded(true);
    }

    loadFonts();
  }, []);

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
