import { workoutExercisesAtom } from "@/store/general";
import { useAtom } from "jotai";
import React, { useState } from "react"
import { Text, StyleSheet, View, TouchableOpacity } from "react-native"

interface ChooseExerciseDataProps {
  exercise: any
  onPress: () => void
}

export default function ChooseExerciseData(props: ChooseExerciseDataProps) {
  const { exercise, onPress } = props;
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [workoutExercises, setWorkoutExercisesAtom] = useAtom(workoutExercisesAtom);

  const handleAddExercise = () => {
    const exercise_copy = JSON.parse(JSON.stringify(exercise));
    exercise_copy.sets = [
      {
        "reps": null,
        "weight": null,
        "sets": null,
      }
    ];
    setWorkoutExercisesAtom(prev => [...prev, exercise_copy]);
    onPress();
  };

  return (
    <TouchableOpacity 
      style={styles.box}
      onPress={() => setIsExpanded(!isExpanded)}
    >
      {isExpanded ? 
        <View>
          <View style={styles.row}>
            <Text style={styles.text}>{exercise.name}</Text>
            <TouchableOpacity 
              onPress={handleAddExercise}
              style={styles.addButton}
            >
              <Text style={styles.text}>add</Text> 
            </TouchableOpacity>
          </View>
          <Text style={styles.text}>Muscle target: {Object.entries(exercise.targets).map(([key, value]) => `${key} (${value})`).join(', ')}</Text>

          <Text style={styles.text}>Bodyweight?: {exercise.is_body_weight ? "true": "false"}</Text>
        </View>
        :
        <View style={styles.row}>
          <Text style={styles.text}>{exercise.name}</Text>
          <TouchableOpacity 
            onPress={handleAddExercise}
            style={styles.addButton}
          >
            <Text style={styles.text}>add</Text> 
          </TouchableOpacity>
        </View>
      }
      
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: 'black',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    width: '100%',
    borderColor: 'red',
    borderWidth: 2
  },
  text: {
    color: 'white',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  addButton: {
    backgroundColor: 'green',
    padding: 5,
    margin: 0
  }
});

