import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard } from "react-native";

interface InputFieldProps {
  field: string,
  label: string,
  value: string,
  is_number?: boolean,
  is_secure?: boolean,
  error_message?: string,
  onChangeText: (field: string, value: string) => void
}

export default function InputField(props: InputFieldProps) {
  const { field, label, value, is_number=false, is_secure=false, error_message='', onChangeText } = props;

  return (
    <>
      <Text style={styles.formHeader}>{label}</Text>
      <View style={styles.container}>
        <TextInput
          value={value}
          onChangeText={(text) => onChangeText(field, text)}
          style={[styles.input, {borderColor: error_message === '' ? "#ccc": "red"}]}
          keyboardType={is_number ? "decimal-pad" : "default"}
          returnKeyType="done"
          className="text-input"
          secureTextEntry={is_secure}
        />
      </View>
      <View style={styles.container}>
        <Text style={{color: "red", opacity: error_message === '' ? 0 : 1}}>{error_message}</Text>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  formHeader: {
    fontSize: 16,
    marginBottom: 5,
    color: "white"
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: 'black',
    color: "white"
  },
  button: {
    marginLeft: 8,
    height: 50,
    width: 50,
    borderRadius: 8,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  }
})