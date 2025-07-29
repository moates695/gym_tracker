import { View, Text, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, ScrollView, Platform, Keyboard, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import TextInputFeild from "../components/InputField";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { DecodedJWT } from "./_layout";
import { jwtDecode } from "jwt-decode";
import { StatusBar } from "expo-status-bar";
import { commonStyles } from "@/styles/commonStyles";
import { fetchWrapper } from "@/middleware/helpers";
import Constants from 'expo-constants';

interface FormData {
  email: string,
  password: string
}

// todo allow fingerprint or face ?

export default function SignInScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    email: "moates695@gmail.com",
    password: "Password1!",
  })

  const [inError, setInError] = useState<FormData>( {
    email: '',
    password: ''
  });

  const [submitting, setSubmitting] = useState<boolean>(false);

  const formDataLabels: Record<string, string> = {
    email: "Email",
    password: "Password",
  }

  const handleTextChange = (field: string, value: string): void => {   
    setInError({
      ...inError,
      [field]: value !== '' ? '' : 'cannot be empty'
    });

    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (): Promise<void> => {
    setSubmitting(true);
    try {
      const response = await fetch(`${Constants.expoConfig?.extra?.apiUrl}/sign-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });

      const data = await fetchWrapper({
        route: 'sign-in',
        method: 'POST',
        body: formData,
        token_str: 'temp_token'
      })
      if (data === null) throw new Error(`HTTP error! Status: ${response.status}`);

      if (data.status === "none") {
        setInError({
          ...inError,
          ['email']: 'email does not exist'
        })
      } else if (data.status === "unverified") {
        await SecureStore.setItemAsync("temp_token", data.token)
        const resendData = await fetchWrapper({
          route: 'register/validate/resend',
          method: 'POST',
          token_str: 'temp_token'
        })
        if (resendData === null) {
          await SecureStore.deleteItemAsync("temp_token");
          Alert.alert("account exists, error sending validation email")
        } else {
          router.replace("/validate");
        }
      } else if (data.status === "incorrect-password") {
        setInError({
          ...inError,
          ['password']: 'password is incorrect'
        })
      } else if (data.status === "signed-in") {
        await SecureStore.deleteItemAsync("temp_token");
        await SecureStore.setItemAsync("auth_token", data.token);
        router.replace('/(tabs)');
      } else {
        throw new Error("Return status not recognised")
      }

    } catch (error) {
      console.log(error)
      Alert.alert("error during sign in")
    }
    setSubmitting(false);
  }

  const isButtonDisabled = () => {
    return formData.email === '' || formData.password === '' || submitting;
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
          <Text style={commonStyles.boldText}>Sign In</Text>
          <View style={styles.container}>
            {(['email','password'] as (keyof FormData)[]).map((key, index) => (
              <View key={index} style={styles.singleItemRow}>
                <TextInputFeild field={key} label={formDataLabels[key]} value={formData[key]} is_number={false} is_secure={key === 'password'} onChangeText={handleTextChange} error_message={inError[key]}/>
              </View>
            ))}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              onPress={handleSubmit}
              style={{
                backgroundColor: isButtonDisabled() ? "#ccc" : "#0db80d",
                padding: 12,
                borderRadius: 5,
                width: "30%",
                alignItems: "center"
              }}
              disabled={isButtonDisabled()}
            >
              <Text style={{ color: "white"}}>{submitting ? 'submitting' : 'sign in'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              onPress={() => router.replace("/sign-up")}
            >
              <Text style={{ color: "white"}}>don't have an account?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  text: { color: "white" },
  content: { padding: 30 },
  container: {
    flex: 1,
    padding: 10,
    color: "white",
  },
  singleItemRow: {
    flex: 1,
    marginBottom: 10,
  },
  singleItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    padding: 15,
  },
  doubleItemRow: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 10,
  },
  doubleItem: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 5,
  },
  buttonContainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  }
});
