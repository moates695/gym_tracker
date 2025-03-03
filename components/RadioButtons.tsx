import { TouchableOpacity, View, Text } from "react-native";

interface RadioButtonProps {
  field: string,
  label: string,
  options: string[],
  selection: string,
  handleSelect: (field: string, value: string) => void
}

export default function RadioButtons (props: RadioButtonProps) {
  const { field, label, options, selection, handleSelect } = props;
  
  return (
    <View>
      <Text>{label}</Text>
      {options.map((option) => (
        <TouchableOpacity 
          key={option} 
          onPress={() => handleSelect(field, option)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            marginVertical: 5,
            borderWidth: 2,
            borderColor: selection === option ? "blue" : "gray",
            borderRadius: 5,
            backgroundColor: selection === option ? "#E0F7FA" : "white",
          }}
        >
          <Text>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}