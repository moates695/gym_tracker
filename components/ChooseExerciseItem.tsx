import { fetchWrapper } from "@/middleware/helpers";
import { emptyExerciseHistoricalData, exercisesHistoricalDataAtom, WorkoutExercise, workoutExercisesAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom } from "jotai";
import React, { useState } from "react"
import { Text, StyleSheet, View, TouchableOpacity } from "react-native"

interface ChooseExerciseDataProps {
  exercise: WorkoutExercise
  onChoose: () => void
}

// todo: in data, return dates when exercise last done, show as prev 7 day or prev month/30 day infographic

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
        <Text style={styles.text}>
          {exercise.name}
          {exercise.is_custom && 
            <Text style={[styles.text, {fontSize: 10}]}> (custom)</Text>
          }
        </Text>
        <TouchableOpacity 
          onPress={handleAddExercise}
        >
          <Text style={[styles.text, commonStyles.textButton]}>add</Text> 
        </TouchableOpacity>
      </View>
      {isExpanded &&
        <>
          <Text style={styles.text}>Bodyweight: {exercise.is_body_weight ? "true": "false"}</Text>
          <Text style={styles.text}>Description: {exercise.description}</Text>
          <Text style={styles.text}>Weight Type: {exercise.weight_type}</Text>
          <Text style={styles.text}>Muscle distribution:</Text>
          {exercise.muscle_data.map((group_data, i) => {
            return (
              <View key={`group-${i}`}>
                <Text style={styles.text}>{'\t'}{group_data.group_name}:</Text>
                {group_data.targets.map((target_data, j) => {
                  return (
                    <View key={`target-${j}`}>
                      <Text style={styles.text}>{'\t\t'}{target_data.target_name}: {target_data.ratio}</Text>
                    </View>
                  )
                })}
              </View>
            )
          })}
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

