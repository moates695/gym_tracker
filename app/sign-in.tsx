import { View, Text, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, ScrollView, Platform, Keyboard, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import TextInputFeild from "../components/InputField";
import * as SecureStore from "expo-secure-store";

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
  const [message, setMessage] = useState<string>('');

  const formDataLabels: Record<string, string> = {
    email: "Email",
    password: "Password",
  }

  const handleTextChange = (field: string, value: string): void => {   
    setMessage('');

    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/sign-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      if (data.status === "none") {
        setMessage("email does not exist");
      } else if (data.status === "unverified") {
        Alert.alert("Your email hasn't been verified yet");
        router.replace("/validate");
      } else if (data.status === "incorrect-password") {
        setMessage("incorrect password");
      } else if (data.status === "signed-in") {
        await SecureStore.setItemAsync("auth_token", data.auth_token);
        router.replace('/(tabs)')
      } else {
        throw new Error("Return status not recognised")
      }

    } catch (error) {
      console.log(error)
      Alert.alert("error during sign in")
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "black"}}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.container}>
            <View style={styles.singleItemRow}>
              <TextInputFeild field={'email'} label={formDataLabels['email']} value={formData['email']} is_number={false} is_secure={false} onChangeText={handleTextChange}/>
            </View>
            <View style={styles.singleItemRow}>
              <TextInputFeild field={'password'} label={formDataLabels['password']} value={formData['password']} is_number={false} is_secure={true} onChangeText={handleTextChange}/>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => handleSubmit()}
          >
            <Text style={{ color: "white"}}>sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.replace("/sign-up")}
          >
            <Text style={{ color: "white"}}>don't have an account?</Text>
          </TouchableOpacity>
          <Text style={{ color: "white"}}>{message}</Text>
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
