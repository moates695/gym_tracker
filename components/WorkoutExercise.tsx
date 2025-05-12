import { useState } from "react";
import React, { TouchableOpacity, View } from "react-native"
import { Text, StyleSheet } from "react-native"

interface WorkoutExerciseProps {
  exercise: any
}

export default function workoutExercise(props: WorkoutExerciseProps) {
  const { exercise } = props; 

  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <TouchableOpacity style={styles.box}
      onPress={() => setIsExpanded(!isExpanded)}
    >
      <Text style={styles.text}>{exercise.name}</Text>
      {isExpanded &&
        <View>
          <Text style={styles.text}>here</Text>
        </View>
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  box: {
    width: '90%',
    padding: 15,
    margin: 2,
    borderColor: 'red',
    borderWidth: 2,
    borderRadius: 8
  }
})