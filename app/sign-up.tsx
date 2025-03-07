import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import TextInputFeild from "../components/InputField";
import RadioButtons from "../components/RadioButtons";

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
  const { await_validation } = useLocalSearchParams();
  const [awaitValidation, setAwaitValidation] = useState<boolean>(await_validation === "true");
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    height: "",
    weight: "",
    gender: "male",
    goal_status: "bulking"
  })

  const handleTextChange = (field: string, value: string): void => {
    if (field in ["height", "weight"]) {
      value = String(Number(value.replace("^\d*\.?\d+$", "")) || 0);
    }
    
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSelectChange = (field: string, value: string): void => {
    setFormData({
      ...formData,
      [field]: value
    })
  };

  const validateForm = (): boolean => {

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailPattern.test(formData.email)) {
      return false;
    }

    return true;
  };

  const handleSubmit = (): void => {
    console.log('Form data:', formData);
    if (validateForm()) {
      Alert.alert('Success', 'Form submitted successfully!');
    } else {
      Alert.alert('Error', 'Please fix the errors in the form');
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
    goal_status: "Current goal"
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
                <TextInputFeild field={key} label={formDataLabels[key]} value={formData[key as keyof FormData]} is_number={false} onChangeText={handleTextChange}/>
              </View>
            ))}
            {[['first_name', 'last_name'], ['height', 'weight']].map((tuple, index) => (
              <View key={index} style={styles.doubleItemRow}>
                <View style={styles.doubleItem}>
                  <TextInputFeild field={tuple[0]} label={formDataLabels[tuple[0]]} value={formData[tuple[0] as keyof FormData]} is_number={index === 1} onChangeText={handleTextChange}/>
                </View>
                <View style={styles.doubleItem}>
                  <TextInputFeild field={tuple[1]} label={formDataLabels[tuple[1]]} value={formData[tuple[1] as keyof FormData]} is_number={index === 1} onChangeText={handleTextChange}/>
                </View>
              </View>
            ))}

            {['gender', 'goal_status'].map((key, index) => (
              <RadioButtons key={index} field={key} label={formDataLabels[key]} options={formDataOptions[key]} selection={formData[key as keyof FormData]} handleSelect={handleSelectChange}/>
            ))}

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                onPress={handleSubmit}
                style={{
                  backgroundColor: "green",
                  padding: 12,
                  borderRadius: 5,
                  width: "80%",
                  alignItems: "center"
                }} 
              >
                <Text style={{ color: "white"}}>Submit</Text>
              </TouchableOpacity>
            </View>
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