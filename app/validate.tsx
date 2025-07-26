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
      console.log("in validate function")

      const data = await fetchWrapper({
        route: 'register/validate/check',
        method: 'GET',
        params: { email: tempToken.email },
        token_str: 'temp_token'
      })
      if (data === null) return;
      
      if (data.account_state !== "unverified") {
        clearIntervalRef();
      }

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
    // return () => {
    //   if (intervalRef.current !== null) {
    //     clearInterval(intervalRef.current);
    //   }
    // };
    return clearIntervalRef;

  }, [tempToken]);

  const clearIntervalRef = () => {
    if (intervalRef.current === null) return;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  // const pathname = usePathname();
  // const [stopFetch, setStopFetch] = useState<boolean>(true); 

  // useEffect(() => {
  //   setStopFetch(pathname !== '/validate');
  // }, [pathname]);

  // useEffect(() => {
  //   let timeoutId: NodeJS.Timeout;

  //   const fetchValidationStatus = async () => {
  //     if (stopFetch) return;

  //     let is_validated: boolean = false;
  //     try {
  //       if (tempToken === null) throw Error('');

  //       const data = await fetchWrapper({
  //         route: 'register/validate/check',
  //         method: 'GET',
  //         params: { email: tempToken },
  //         token_str: 'temp_token'
  //       })

  //       const response = await fetch(
  //         `${process.env.EXPO_PUBLIC_API_URL}/register/validate/check?` + 
  //         new URLSearchParams({ email: emailString }).toString()
  //       )
  //       if (!response.ok) throw new Error('request not okay');

  //       // const data = await response.json();

  //       if (data.account_state === "good") {
  //         is_validated = true;
  //         clearTimeout(timeoutId);
  //         await SecureStore.setItemAsync('auth_token', data.auth_token);
  //         router.replace("/(tabs)")
  //       } else if (data.account_state === "none") {
  //         throw new Error("email not recognised")
  //       }

  //     } catch (error) {
  //       console.log(error);
  //     } finally {
  //       if (!is_validated) {
  //         timeoutId = setTimeout(fetchValidationStatus, 1500);        
  //       }
  //     }
  //   };

  //   fetchValidationStatus();

  //   return () => clearTimeout(timeoutId);

  // }, [stopFetch]);

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
              onPress={() => {
                clearIntervalRef();
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