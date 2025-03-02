import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Checkbox } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

interface FormData {
  email: string,
  password: string,
  username: string,
  first_name: string,
  last_name: string,
  gender: "male" | "female" | "other",
  height: 183,
  weight: 90,
  goal_status: "bulking" | "cutting" | "maintaining"
}

interface FormErrors {
  email?: string;
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
  const [errors, setErrors] = useState<FormErrors>({});

  const handleTextChange = (field: keyof Pick<FormData, 'email'>, value: string): void => {
    setFormData({
      ...formData,
      [field]: value,
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined,
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailPattern.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    <View>
      <Text>Registration Form</Text>
      <View>
        <Text>Email</Text>
        <TextInput
          value={formData.email}
          onChangeText={(text) => handleTextChange('email', text)}
          placeholder="Enter your full name"
        />
        {errors.email && <Text>{errors.email}</Text>}
      </View>

      <TouchableOpacity onPress={handleSubmit}>
        <Text>Submit</Text>
      </TouchableOpacity>

    </View>
  );
}
