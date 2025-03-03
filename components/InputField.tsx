import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard } from "react-native";

interface InputFieldProps {
  field: string,
  label: string,
  value: string,
  is_number: boolean,
  onChangeText: (field: string, value: string) => void
}

export default function InputField(props: InputFieldProps) {
  const { field, label, value, is_number, onChangeText } = props;
  
  const handleSubmit = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Text style={styles.formHeader}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={(text) => onChangeText(field, text)}
          style={styles.textInput}
          keyboardType={is_number ? "decimal-pad" : "default"}
        />
        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>✔</Text>
        </TouchableOpacity>
      </View>
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
  },
  button: {
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
    marginLeft: 10,
  },
  container: { padding: 20 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    paddingRight: 40, // Space for button inside the input
  },
  buttonText: { color: "white", fontWeight: "bold" },
})