import { View, Text, StyleSheet, TextInput } from "react-native";

interface InputFieldProps {
  field: string,
  label: string,
  value: string,
  is_number: boolean,
  onChangeText: (field: string, value: string) => void;
}

export default function InputField(props: InputFieldProps) {
  const { field, label, value, is_number, onChangeText } = props;
  
  return (
    <View>
      <Text style={styles.formHeader}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={(text) => onChangeText(field, text)}
        style={styles.textInput}
        keyboardType={is_number ? "decimal-pad" : "default"}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  formHeader: {
    fontSize: 16,
    marginBottom: 5
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  }
})