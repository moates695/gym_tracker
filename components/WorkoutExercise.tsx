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

  const [numSets, setNumSets] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isDataExpanded, setIsDataExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (!isExpanded) {
      setIsDataExpanded(false);
    }
  }, [isExpanded]);

  useEffect(() => {
    const isValidSet = (set: any) => {
      return set.reps !== null && set.weight !== null && set.sets !== null;
    };
    setNumSets(exercise.sets.filter(isValidSet).reduce((sum: any, obj: { sets: any; }) => sum + obj.sets, 0));
  }, [exercise.sets]);

  return (
    <View style={styles.box}>
      <TouchableOpacity style={styles.row}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.text}>{exercise.name}</Text>
        <Text style={styles.text}>{numSets} sets</Text>
      </TouchableOpacity>
      {isExpanded &&
        <View>
          <ExerciseSets exercise={exercise} exerciseIndex={exerciseIndex}/>
          <TouchableOpacity
            onPress={() => setIsDataExpanded(!isDataExpanded)}
          >
            <Text style={styles.text}>{isDataExpanded ? 'close data': 'open data'}</Text>
          </TouchableOpacity>
          {isDataExpanded &&
            <View style={styles.divider}/>
          }
        </View>
      }
    </View>
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
    padding: 5,
    alignItems: 'center',
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 8
  }
})