import { fetchWrapper, getExerciseValueMap } from "@/middleware/helpers";
import { emptyExerciseHistoricalData, emptySetData, exercisesHistoricalDataAtom, WorkoutExercise, workoutExercisesAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom } from "jotai";
import React, { useState } from "react"
import { Text, StyleSheet, View, TouchableOpacity } from "react-native"
import FrequencyCalendar from "./FrequencyCalendar";
import MuscleGroupSvg from "./MuscleGroupSvg";
import { useDropdown } from "./ExerciseData";

interface ChooseExerciseDataProps {
  exercise: WorkoutExercise
  onChoose: () => void
}

type DisplayOption = 'frequency' | 'heatmap';
interface DisplayOptionObject {
  label: string
  value: DisplayOption
}

// todo: in data, return dates when exercise last done, show as prev 7 day or prev month/30 day infographic

export default function ChooseExerciseData(props: ChooseExerciseDataProps) {
  const { exercise, onChoose: onPress } = props;
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [workoutExercises, setWorkoutExercisesAtom] = useAtom(workoutExercisesAtom);
  const [exercisesHistoricalData, setExercisesHistoricalData] = useAtom(exercisesHistoricalDataAtom);

  const displayOptions: DisplayOptionObject[] = [
    { label: 'heatmap', value: 'heatmap' },
    { label: 'frequency calendar', value: 'frequency' },
  ]
  const [displayValue, setDisplayValue] = useState<DisplayOption>('heatmap');

  const handleAddExercise = () => {
    const exerciseCopy: WorkoutExercise = JSON.parse(JSON.stringify(exercise));
    exerciseCopy.set_data = [{ ...emptySetData }];
    setWorkoutExercisesAtom(prev => [...prev, exerciseCopy]);

    setExercisesHistoricalData(prev => ({
      ...prev,
      [exerciseCopy.id]: emptyExerciseHistoricalData
    }))
    fetchExerciseHistoricalData(exercise.id);

    onPress();

  };

  const fetchExerciseHistoricalData = async (id: string) => {
    const data = await fetchWrapper({
    route: 'exercise/history',
    method: 'GET',
    params: {id: id}
})
    setExercisesHistoricalData(prev => ({
      ...prev,
      [id]: data
    }))
  };

  const displayMap: Record<DisplayOption, JSX.Element> = {
    frequency: <FrequencyCalendar frequencyData={exercise.frequency} />,
    heatmap: <MuscleGroupSvg
                valueMap={getExerciseValueMap(exercise)} 
                showGroups={false}
              />
  }

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
          <Text style={styles.text}>Description: {exercise.description}</Text>
          <Text style={styles.text}>Bodyweight: {exercise.is_body_weight ? "true": "false"}</Text>
          <Text style={styles.text}>Weight Type: {exercise.weight_type}</Text>
          {useDropdown(displayOptions, displayValue, setDisplayValue)}
          {displayMap[displayValue]}
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

