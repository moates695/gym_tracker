import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

interface WorkoutFinishOptionsProps {
  onPress: () => void
}

export default function WorkoutFinishOptions(props: WorkoutFinishOptionsProps) {
  const { onPress } = props;
  
  return (
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          onPress={() => {}}
        >
          <Text style={styles.text}>save</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {}}
        >
          <Text style={styles.text}>discard</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onPress}
        >
          <Text style={styles.text}>cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    backgroundColor: 'black',
    padding: 15,
    // alignItems: 'center',
    elevation: 5,
    borderColor: 'red',
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 150,
    maxHeight: '95%',
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center'
    
  },
})