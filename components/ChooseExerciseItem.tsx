import { fetchWrapper } from "@/middleware/helpers";
import { emptyExerciseHistoricalData, exercisesHistoricalDataAtom, WorkoutExercise, workoutExercisesAtom } from "@/store/general";
import { useAtom } from "jotai";
import React, { useState } from "react"
import { Text, StyleSheet, View, TouchableOpacity } from "react-native"

interface ChooseExerciseDataProps {
  exercise: WorkoutExercise
  onChoose: () => void
}

export default function ChooseExerciseData(props: ChooseExerciseDataProps) {
  const { exercise, onChoose: onPress } = props;
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [workoutExercises, setWorkoutExercisesAtom] = useAtom(workoutExercisesAtom);
  const [exercisesHistoricalData, setExercisesHistoricalData] = useAtom(exercisesHistoricalDataAtom);

  const handleAddExercise = () => {
    const exerciseCopy: WorkoutExercise = JSON.parse(JSON.stringify(exercise));
    exerciseCopy.set_data = [
      {
        "reps": null,
        "weight": null,
        "num_sets": null,
      }
    ];
    setWorkoutExercisesAtom(prev => [...prev, exerciseCopy]);

    setExercisesHistoricalData(prev => ({
      ...prev,
      [exerciseCopy.id]: emptyExerciseHistoricalData
    }))
    fetchExerciseHistoricalData(exercise.id);

    onPress();

  };

  const fetchExerciseHistoricalData = async (id: string) => {
    const data = await fetchWrapper('exercise/history', 'GET', {id: id}, undefined)
    setExercisesHistoricalData(prev => ({
      ...prev,
      [id]: data
    }))
  };

  return (
    <TouchableOpacity 
      style={styles.box}
      onPress={() => setIsExpanded(!isExpanded)}
    >
      <View style={styles.row}>
        <Text style={styles.text}>{exercise.name}</Text>
        <TouchableOpacity 
          onPress={handleAddExercise}
          style={styles.addButton}
        >
          <Text style={styles.text}>add</Text> 
        </TouchableOpacity>
      </View>
      {isExpanded &&
        <>
          {/* <Text style={styles.text}>Muscle target: {Object.entries(exercise.targets).map(([key, value]) => `${key} (${value})`).join(', ')}</Text> */}
          <Text style={styles.text}>Bodyweight: {exercise.is_body_weight ? "true": "false"}</Text>
        </>
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: 'black',
    padding: 10,
    marginVertical: 2,
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

