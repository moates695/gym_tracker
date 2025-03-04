import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from "react-native";
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text>Registration Form</Text>

      {Object.entries(formData).map(([key, value]: [string, string]) => (
        <>
          {key === 'gender' || key === 'goal_status' ? (
            <RadioButtons field={key} label={formDataLabels[key]} selection={formData[key as keyof FormData]} options={key === 'gender' ? ["male", "female", "other"] : ["bulking", "cutting", "maintaining"]} handleSelect={handleSelectChange}/>
          ) : (
            <TextInputFeild field={key} label={formDataLabels[key]} value={formData[key as keyof FormData]} onChangeText={handleTextChange}/>
          )}
        </>
      ))}

      <TouchableOpacity 
        onPress={handleSubmit}
        style={{
          backgroundColor: "blue",
          padding: 12,
          borderRadius: 5,
          alignItems: "center",
        }} 
      >
        <Text style={{ color: "white"}}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  content: { padding: 20 }, // Ensures scroll works smoothly
  box: {
    padding: 20,
    marginVertical: 5,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
});



