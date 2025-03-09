import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

interface RadioButtonProps {
  field: string,
  label: string,
  options: string[],
  selection: string,
  handleSelect: (field: string, value: string) => void
}

export default function RadioButtons (props: RadioButtonProps) {
  const { field, label, options, selection, handleSelect } = props;
  
  const optionsItemWidth = 100 / options.length;

  return (
    <View>
      <Text style={styles.text}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity 
            key={option} 
            onPress={() => handleSelect(field, option)}
            style={{
              padding: 10,
              justifyContent: "space-around",
              width: `${optionsItemWidth}%`,
              marginVertical: 5,
              marginHorizontal: 4,
              borderWidth: 2,
              borderColor: selection === option ? "red" : "gray",
              borderRadius: 5,
              backgroundColor: "black"
            }}
          >
            <Text style={{alignSelf: "center", color: "white"}}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  text: { color: "white" },
  optionsContainer: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 5
  }
})