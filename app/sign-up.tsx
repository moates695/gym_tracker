import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Checkbox } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import TextInputFeild from "../components/TextInputField";

type Gender = "male" | "female" | "other"
type GoalStatus = "bulking" | "cutting" | "maintaining"

interface FormData {
  email: string,
  password: string,
  username: string,
  first_name: string,
  last_name: string,
  gender: Gender,
  height: 183,
  weight: 90,
  goal_status: GoalStatus
}

export default function SignUpScreen() {
  const { await_validation } = useLocalSearchParams();
  const [awaitValidation, setAwaitValidation] = useState<boolean>(await_validation === "true");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    username: "",
    first_name: "",
    last_name: "",
    gender: "male",
    height: 183,
    weight: 90,
    goal_status: "bulking"
  })

  const handleTextChange = (field: string, value: string): void => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const validateForm = (): boolean => {

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailPattern.test(formData.email)) {
      return false;
    }

    return true;
  };

  const handleSubmit = (): void => {
    if (validateForm()) {
      // Form is valid, proceed with submission
      console.log('Form submitted:', formData);
      Alert.alert('Success', 'Form submitted successfully!');
      // Here you would typically send the data to your API
    } else {
      // Form has errors
      Alert.alert('Error', 'Please fix the errors in the form');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Registration Form</Text>

      <TextInputFeild field="email" label="Email" value={formData.email} onChangeText={handleTextChange}/>

      <TouchableOpacity 
        onPress={handleSubmit}
        style={{
          backgroundColor: "blue",
          padding: 12,
          borderRadius: 5,
          alignItems: "center",
        }} 
      >
        <Text>Submit</Text>
      </TouchableOpacity>

    </View>
  );
}


