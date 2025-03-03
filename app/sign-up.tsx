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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text>Registration Form</Text>

      <TextInputFeild field="email" label="Email" value={formData.email} is_number={false} onChangeText={handleTextChange}/>
      <TextInputFeild field="username" label="Username" value={formData.username} is_number={false} onChangeText={handleTextChange}/>
      <TextInputFeild field="password" label="Password" value={formData.password} is_number={false} onChangeText={handleTextChange}/>
      <TextInputFeild field="first_name" label="First name" value={formData.first_name} is_number={false} onChangeText={handleTextChange}/>
      <TextInputFeild field="last_name" label="Last name" value={formData.last_name} is_number={false} onChangeText={handleTextChange}/>
      <TextInputFeild field="height" label="Height" value={formData.height} is_number={true} onChangeText={handleTextChange}/>
      <TextInputFeild field="weight" label="Weight" value={formData.weight} is_number={true} onChangeText={handleTextChange}/>
      <RadioButtons field="gender" label="Gender" selection={formData.gender} options={["male", "female", "other"]} handleSelect={handleSelectChange}/>
      <RadioButtons field="goal_status" label="Current status" selection={formData.goal_status} options={["bulking", "cutting", "maintaining"]} handleSelect={handleSelectChange}/>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 }, // Ensures scroll works smoothly
  box: {
    padding: 20,
    marginVertical: 5,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
});



