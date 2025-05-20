import { useEffect, useState } from "react";
import React, { TouchableOpacity, View } from "react-native"
import { Text, StyleSheet } from "react-native"
import ExerciseSets from "./ExerciseSets";

interface WorkoutExerciseProps {
  exercise: any
  exerciseIndex: number
}

export default function workoutExercise(props: WorkoutExerciseProps) {
  const { exercise, exerciseIndex } = props; 

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [numSets, setNumSets] = useState<number>(0);

  useEffect(() => {
    const isValidSet = (set: any) => {
      return set.reps !== null && set.weight !== null && set.sets !== null;
    };
    setNumSets(exercise.sets.filter(isValidSet).length);
  }, [exercise.sets]);

  return (
    <TouchableOpacity style={styles.box}
      onPress={() => setIsExpanded(!isExpanded)}
    >
      <View style={styles.row}>
        <Text style={styles.text}>{exercise.name}</Text>
        <Text style={styles.text}>{numSets} sets</Text>
      </View>
      {isExpanded &&
        <View>
          <Text style={styles.text}>{exercise.is_body_weight ? 'bodyweight' : 'weighted'}</Text>
          <Text style={styles.text}>{JSON.stringify(exercise.targets).toString()}</Text>
          <Text style={styles.text}>{JSON.stringify(exercise.sets).toString()}</Text>
          <ExerciseSets exercise={exercise} exerciseIndex={exerciseIndex}/>
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
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
})