import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Checkbox } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import TextInputFeild from "../components/InputField";

type Gender = "male" | "female" | "other"
type GoalStatus = "bulking" | "cutting" | "maintaining"

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
    password: "",
    username: "",
    first_name: "",
    last_name: "",
    gender: "male",
    height: "",
    weight: "",
    goal_status: "bulking"
  })

  const handleTextChange = (field: string, value: string): void => {
    if (field in ["height", "weight"]) {
      value.replace("^\d*\.?\d+$", "")
      value = String(Number(value) || 0);
    }
    
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
    console.log('Form data:', formData);
    if (validateForm()) {
      Alert.alert('Success', 'Form submitted successfully!');
    } else {
      Alert.alert('Error', 'Please fix the errors in the form');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Registration Form</Text>

      <TextInputFeild field="email" label="Email" value={formData.email} is_number={false} onChangeText={handleTextChange}/>
      <TextInputFeild field="username" label="Username" value={formData.username} is_number={false} onChangeText={handleTextChange}/>
      <TextInputFeild field="password" label="Password" value={formData.password} is_number={false} onChangeText={handleTextChange}/>
      <TextInputFeild field="first_name" label="First name" value={formData.first_name} is_number={false} onChangeText={handleTextChange}/>
      <TextInputFeild field="last_name" label="Last name" value={formData.last_name} is_number={false} onChangeText={handleTextChange}/>
      <TextInputFeild field="height" label="Height" value={formData.height} is_number={true} onChangeText={handleTextChange}/>
      <TextInputFeild field="weight" label="Weight" value={formData.weight} is_number={true} onChangeText={handleTextChange}/>

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


