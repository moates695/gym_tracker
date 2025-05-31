import React from "react";
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from "react-native";

interface ShiftTextInputProps {
  onChangeText: (text: string) => void
  value: string
  shiftPress: (increase: boolean) => void
}

export default function ShiftTextInput(props: ShiftTextInputProps) {
  const {onChangeText, value, shiftPress} = props;
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => shiftPress(false)}
        style={[styles.button, styles.borderRight]}
      >
        <Text style={styles.centerText}>-</Text>
      </TouchableOpacity>
      <TextInput 
        style={styles.textInput}
        keyboardType="number-pad"
        onChangeText={onChangeText}
        value={value}
      />
      <TouchableOpacity 
        onPress={() => shiftPress(true)}
        style={[styles.button, styles.borderLeft]}
      >
        <Text style={styles.centerText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  centerText: {
    color: 'white',
  },
  container: {
    height: '100%',
    width: '25%',
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'column',
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  borderRight: {
    borderRightColor: '#ccc',
    borderRightWidth: 2,
    height: 'auto', 
    marginVertical: -1
  },
  borderLeft: {
    borderLeftColor: '#ccc',
    borderLeftWidth: 2,
    height: 'auto', 
    marginVertical: -1
  },
  textInput: {
    color: 'white',
    borderWidth: 0,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '25%',
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
  }
})