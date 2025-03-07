import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard } from "react-native";

interface InputFieldProps {
  field: string,
  label: string,
  value: string,
  is_number?: boolean,
  onChangeText: (field: string, value: string) => void
}

export default function InputField(props: InputFieldProps) {
  const { field, label, value, is_number=false, onChangeText } = props;

  return (
    <>
      <Text style={styles.formHeader}>{label}</Text>
      <View style={styles.container}>
        <TextInput
          value={value}
          onChangeText={(text) => onChangeText(field, text)}
          style={styles.input}
          keyboardType={is_number ? "decimal-pad" : "default"}
          returnKeyType="done"
          className="text-input"
        />
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
    marginHorizontal: 16,
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