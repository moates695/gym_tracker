import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import TextInputFeild from "../components/InputField";
import RadioButtons from "../components/RadioButtons";
import * as SecureStore from "expo-secure-store";
import React from "react";

type Gender = "male" | "female" | "other"
type GoalStatus = "bulking" | "cutting" | "maintaining";

interface FormData {
  email: string,
  password: string,
  username: string,
  first_name: string,
  last_name: string,
  gender: Gender,
  height: string,
  weight: string,
  goal_status: GoalStatus
}

export default function SignUpScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    email: "moates695@gmail.com",
    username: "username2",
    password: "Password1!",
    first_name: "first",
    last_name: "last",
    height: "55",
    weight: "60",
    gender: "female",
    goal_status: "bulking"
  })

  const usernameTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isTimeoutActive, setIsTimeoutActive] = useState<boolean>(false);
  const [inError, setInError] = useState<Record<string, string>>({});
  const [submitting, SetSubmitting] = useState<boolean>(false);

  const handleTextChange = (field: string, value: string): void => {
    if (field in ["height", "weight"]) { // todo maybe remove this?
      value = String(Number(value.replace("^\d*\.?\d+$", "")) || 0);
    }

    setInError(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    })
    
    setFormData({
      ...formData,
      [field]: value,
    });

    switch (field) {
      case 'email':
        validateEmail(value);
        break;
      case 'password':
        validatePassword(value);
        break;
      case 'username':
        validateUsername(value);
        break;
      case 'first_name':
        validateName(value, 'first_name');
        break;
      case 'last_name':
        validateName(value, 'last_name');
        break;
      case 'height':
        validateHeight(value);
        break;
      case 'weight':
        validateWeight(value);
        break;
    }

  };

  const handleSelectChange = (field: string, value: string): void => {
    setFormData({
      ...formData,
      [field]: value
    })
  };

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailPattern.test(formData.email)) {
      setInError({
        ...inError,
        'email': 'invalid email'
      })
    }
  };

  const validatePassword = (password: string) => {
    let error_message = ''
    
    if (password.length < 8 || password.length > 36) {
      error_message = 'password must be between 8 and 36 characters'
    } else if (!/[A-Z]/.test(password)) {
      error_message = "password must have at least 1 uppercase letter"
    } else if (!/[1-9]/.test(password)) {
      error_message = "password must have at least 1 number"
    } else if (!/[^A-Za-z0-9]/ .test(password)) {
      error_message = "password must have at least 1 special character"
    }

    setInError({
      ...inError,
      'password': error_message
    })
  } 

  const validateUsername = (username: string) => {
    if (usernameTimeoutRef.current) {
      clearTimeout(usernameTimeoutRef.current);
    }

    setIsTimeoutActive(true);
    usernameTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/register/username?` + 
          new URLSearchParams({ username }).toString()
        );
        if (!response.ok) throw new Error('response not ok');

        const data = await response.json();
  
        if (data.taken === false) return;
  
        setInError({
          ...inError,
          'username': "username is taken"
        })
      
      } catch (error) {
        setInError({
          ...inError,
          'username': "error checking username"
        })
      } finally {
        setIsTimeoutActive(false);
      }
    }, 750);
  };

  const validateName = (name: string, field: string) => {
    if (name.length > 0 && name.trim().length > 0) return;
    setInError({
      ...inError,
      [field]: "name is empty"
    })
  };

  const validateHeight = (height_str: string) => {
    const height = Number(height_str);
    if (height >= 20 && height <= 300) return;
    setInError({
      ...inError,
      height: "invalid height"
    })
  };

  const validateWeight = (weight_str: string) => {
    const weight = Number(weight_str);
    if (weight >= 20 && weight <= 300) return;
    setInError({
      ...inError,
      weight: "invalid weight"
    })
  };

  const areFormDataFieldsEmpty = (): boolean => {
    for (const key in formData) {
      if (formData[key as keyof FormData].trim().length !== 0) continue;
      return true;
    }
    return false;
  };

  const isFormInError = (): boolean => {
    for (const key in inError) {
      if (inError[key].length === 0) continue;
      return true;
    }
    return false;
  };

  const isButtonDisabled = (): boolean => {
    return areFormDataFieldsEmpty() || isFormInError() || isTimeoutActive || submitting;
  };

  const handleSubmit = async (): Promise<void> => {
    SetSubmitting(true);
    
    try {
      let form_copy: Record<any, any> = { ...formData};
      form_copy.height = parseInt(formData.height);
      form_copy.weight = parseInt(formData.weight);

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form_copy)
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      router.replace({
        pathname: "/validate",
        params: { email: formData.email }
      })

    } catch (error) {
      console.log(error)
      Alert.alert("error during registration")
    } finally {
      SetSubmitting(false);
    }
  };

  const formDataLabels: Record<string, string> = {
    email: "Email",
    password: "Password",
    username: "Username",
    first_name: "First name",
    last_name: "Last name",
    gender: "Gender",
    height: "Height",
    weight: "Weight",
    goal_status: "Current phase"
  }

  const formDataOptions: Record<string, string[]> = {
    gender: ["male", "female", "other"],
    goal_status: ["bulking", "cutting", "maintaining"]
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "black"}}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.content}>
        
          <Text style={styles.text}>Sign Up</Text>

          <View style={styles.container}>
            {['email', 'password', 'username'].map((key, index) => (
              <View key={index} style={styles.singleItemRow}>
                <TextInputFeild field={key} label={formDataLabels[key]} value={formData[key as keyof FormData]} is_number={false} is_secure={key==='password'} error_message={inError[key]} onChangeText={handleTextChange}/>
              </View>
            ))}
            {[['first_name', 'last_name'], ['height', 'weight']].map((tuple, index) => (
              <View key={index} style={styles.doubleItemRow}>
                <View style={styles.doubleItem}>
                  <TextInputFeild field={tuple[0]} label={formDataLabels[tuple[0]]} value={formData[tuple[0] as keyof FormData]} is_number={index === 1} error_message={inError[tuple[0]]} onChangeText={handleTextChange}/>
                </View>
                <View style={styles.doubleItem}>
                  <TextInputFeild field={tuple[1]} label={formDataLabels[tuple[1]]} value={formData[tuple[1] as keyof FormData]} is_number={index === 1} error_message={inError[tuple[1]]} onChangeText={handleTextChange}/>
                </View>
              </View>
            ))}

            {['gender', 'goal_status'].map((key, index) => (
              <RadioButtons key={index} field={key} label={formDataLabels[key]} options={formDataOptions[key]} selection={formData[key as keyof FormData]} handleSelect={handleSelectChange}/>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              onPress={handleSubmit}
              style={{
                backgroundColor: isButtonDisabled() ? "#ccc" : "#0db80d",
                padding: 12,
                borderRadius: 5,
                width: "50%",
                alignItems: "center"
              }}
              disabled={isButtonDisabled()}
            >
              <Text style={{ color: "white"}}>Submit</Text>
            </TouchableOpacity>
            {submitting && <Text style={{ color: "white"}}>submitting...</Text>}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              onPress={() => router.replace("/sign-in")}
              disabled={submitting}
            >
              <Text style={{ color: "white"}}>already have an account?</Text>
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