import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { DecodedJWT } from "./_layout";
import { jwtDecode } from "jwt-decode";
import { fetchWrapper } from "@/middleware/helpers";
import { commonStyles } from "@/styles/commonStyles";
import { StatusBar } from "expo-status-bar";

// todo resend validate email button if temp token valid
// TODO: fix rest of this file and refactor others

export default function Validate() {
  const router = useRouter();
  
  const [tempToken, setTempToken] = useState<DecodedJWT | null>(null);
  const intervalRef = useRef<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const getTempToken = async () => {
      const tempToken = await SecureStore.getItemAsync("temp_token");
      if (!tempToken) {
        // router.replace('/sign-up');
        return;
      }
      const decodedTempToken: DecodedJWT = jwtDecode(tempToken);
      setTempToken(decodedTempToken);
    };

    getTempToken();
  }, []);

  useEffect(() => {
    if (tempToken === null) return;

    const fetchValidationStatus = async () => {
      if (pathname !== '/validate') {
        clearIntervalRef();
        return;
      }

      const data = await fetchWrapper({
        route: 'register/validate/check',
        method: 'GET',
        params: { email: tempToken.email },
        token_str: 'temp_token'
      })
      if (data === null) return;
      
      if (data.account_state === 'unverified') return;

      clearIntervalRef();

      if (data.account_state === "none") {
        Alert.alert("account was not recognized");
        router.replace("/sign-up");
      } else if (data.account_state === "good") {
        await SecureStore.deleteItemAsync("temp_token");
        await SecureStore.setItemAsync("auth_token", data.auth_token);
        router.replace("/(tabs)");
      }
    };

    intervalRef.current = window.setInterval(fetchValidationStatus, 1500);
    return clearIntervalRef;

  }, [tempToken]);

  useEffect(() => {
    if (pathname === '/validate') return;
    clearIntervalRef();
  }, [pathname]);

  const clearIntervalRef = () => {
    if (intervalRef.current === null) return;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "black"}}
    >
      {Platform.OS == 'android' &&
        <StatusBar style="light" backgroundColor="black" translucent={false} />
      }
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={commonStyles.boldText}>Validate</Text>
          <View style={{height: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <Text style={[styles.text, {marginBottom: 20}]}>
              Check your emails for a validation link.
            </Text>
            <TouchableOpacity 
              onPress={async () => {
                clearIntervalRef();
                await SecureStore.deleteItemAsync("temp_token");
                router.replace("/sign-up");
              }}
            >
              <Text style={styles.text}>back to sign up?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  text: { 
    color: "white" 
  },
  content: { 
    flex: 1,
    padding: 30
  },
})