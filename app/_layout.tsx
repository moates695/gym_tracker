import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React from "react";
import * as Font from 'expo-font';
import { MaterialIcons, AntDesign, Ionicons } from '@expo/vector-icons';
import { fetchWrapper } from "@/middleware/helpers";
import { Alert, useColorScheme } from 'react-native';
import * as SystemUI from "expo-system-ui"

export interface DecodedJWT {
  email: string
  user_id: string
  exp: number
  iat: number
}

export default function RootLayout() {
  const router = useRouter();

  const colorScheme = useColorScheme();

  SystemUI.setBackgroundColorAsync("black")

  useEffect(() => {
    router.replace("/loading");

    const checkUserState = async () => {
      await SecureStore.deleteItemAsync("auth_token"); //!!!! for testing new user

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

        const data = await fetchWrapper({
          route: 'login',
          method: 'GET',
        });
        if (data === null) throw new Error("response not ok");

        if (data.account_state !== "good") {
          await SecureStore.deleteItemAsync("auth_token");
        }
        if (data.account_state !== "unverified") {
          await SecureStore.deleteItemAsync("temp_token");
        }

        if (data.account_state == "none") {
          router.replace("/sign-up");
        } else if (data.account_state == "unverified") {
          const temp_token = await SecureStore.getItemAsync("temp_token");
          if (!temp_token || (jwtDecode(temp_token) as DecodedJWT).exp < Date.now() / 1000 - 120) {
            await SecureStore.deleteItemAsync("temp_token");
            router.replace("/sign-in");
            return;
          }
          const data = await fetchWrapper({
            route: 'register/validate/resend',
            method: 'POST',
            token_str: 'temp_token'
          })
          if (data === null) {
            await SecureStore.deleteItemAsync("temp_token");
            router.replace("/sign-in");
          } else {
            router.replace("/validate");
          }
        } else if (data.account_state == "good") {
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
    }

    loadFonts();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
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
