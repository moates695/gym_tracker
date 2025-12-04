import { fetchWrapper, getExerciseValueMap } from "@/middleware/helpers";
import { emptyExerciseHistoricalData, emptySetData, ExerciseListItem, exercisesHistoricalDataAtom, loadingExerciseHistoryAtom, WorkoutExercise, workoutExercisesAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react"
import { Text, StyleSheet, View, TouchableOpacity } from "react-native"
import FrequencyCalendar from "./FrequencyCalendar";
import MuscleGroupSvg from "./MuscleGroupSvg";
import { useDropdown } from "./ExerciseData";
import { OptionsObject } from "./ChooseExerciseModal";
import { MaterialIcons } from "@expo/vector-icons";
import { v4 as uuidv4 } from 'uuid';
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";

interface ChooseExerciseDataProps {
  exercise: ExerciseListItem
  onChoose: () => void
}

type DisplayOption = 'frequency' | 'heatmap';
interface DisplayOptionObject {
  label: string
  value: DisplayOption
}

// todo: in data, return dates when exercise last done, show as prev 7 day or prev month/30 day infographic

export default function ChooseExerciseItem(props: ChooseExerciseDataProps) {
  const { exercise, onChoose } = props;
  
  const variations = exercise.variations ?? [];

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [workoutExercises, setWorkoutExercisesAtom] = useAtom(workoutExercisesAtom);
  const [, setExercisesHistoricalData] = useAtom(exercisesHistoricalDataAtom);
  const [loadingExerciseHistory, setLoadingExerciseHistory] = useAtom(loadingExerciseHistoryAtom);

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const [chosenVariation, setChosenVariation] = useState<ExerciseListItem>(exercise);
  
  const displayOptions: DisplayOptionObject[] = [
    { label: 'heatmap', value: 'heatmap' },
    { label: 'frequency calendar', value: 'frequency' },
  ]
  const [displayValue, setDisplayValue] = useState<DisplayOption>('heatmap');

  const baseVariationValue = 'base';
  const variationOptions: OptionsObject[] = ((): OptionsObject[] => {
    const options: OptionsObject[] = [
      { label: 'base exercise', value: baseVariationValue }
    ];
    for (const variation of variations) {
      options.push({ label: variation.name, value: variation.name })
    }
    return options
  })();
  const [variationValue, setVariationValue] = useState<string>(baseVariationValue);

  const handleChooseExercise = () => {
    const newExercise = JSON.parse(JSON.stringify(chosenVariation));
    delete newExercise.frequency;
    newExercise.workout_exercise_id = uuidv4();
    newExercise.set_data = [{ ...emptySetData }];
    // newExercise.loadingHistory = false;
    if (variationValue !== baseVariationValue) {
      newExercise.name = exercise.name;
      newExercise.variation_name = chosenVariation.name;
    }
    const tempExercises = [...workoutExercises];
    tempExercises.push(newExercise);
    setWorkoutExercisesAtom(tempExercises);

    setExercisesHistoricalData(prev => ({
      ...prev,
      [newExercise.id]: emptyExerciseHistoricalData
    }))
    fetchExerciseHistoricalData(chosenVariation.id);

    const tempLoading = {...loadingExerciseHistory};
    tempLoading[newExercise.workout_exercise_id] = false;
    setLoadingExerciseHistory(tempLoading);

    onChoose();
  };

  const fetchExerciseHistoricalData = async (exercise_id: string) => {
    try {
      const data = await fetchWrapper({
        route: 'exercises/history',
        method: 'GET',
        params: {exercise_id}
      })
      setExercisesHistoricalData(prev => ({
        ...prev,
        [exercise_id]: data
      }))
    } catch (error) {
      addCaughtErrorLog(error, 'error exercises/history');
    }
  };

  const displayMap: Record<DisplayOption, JSX.Element> = {
    frequency: <FrequencyCalendar frequencyData={chosenVariation.frequency} />,
    heatmap: <MuscleGroupSvg
      valueMap={getExerciseValueMap(chosenVariation)} 
      showGroups={false}
    />
  }

  // if (exercise.id === 'ceaf5334-aff7-475e-b7d3-d52d74b0d091') {
  //   console.log(exercise.frequency)
  //   console.log(chosenVariation.frequency)
  // }

  useEffect(() => {
    if (variationValue === baseVariationValue) {
      setChosenVariation(exercise);
      return;
    }
    for (const variation of variations) {
      if (variation.name != variationValue) continue;
      setChosenVariation(variation);
      break;
    }
  }, [variationValue])

  return (
    <View style={styles.box}>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <View 
            style={{
              flexDirection: 'row', 
              alignItems: 'center', 
            }}
          >
            <Text style={[styles.text]}>{exercise.name}</Text>
            <MaterialIcons 
              name={isExpanded ? "expand-less" : "expand-more"} 
              size={16} 
              color="gray" 
              style={{paddingLeft: 4, paddingBottom: 4}}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleChooseExercise}
        >
          <Text style={[styles.text, commonStyles.textButton]}>add</Text> 
        </TouchableOpacity>
      </View>
      {isExpanded &&
        <>
          {variations.length > 0 &&
            <>
              <Text style={styles.text}>Choose variation:</Text>
              {useDropdown(variationOptions, variationValue, setVariationValue)}
            </>
          }
          <Text style={styles.text}>Description: {chosenVariation.description}</Text>
          <Text style={styles.text}>Bodyweight: {chosenVariation.is_body_weight ? "true": "false"}</Text>
          <Text style={styles.text}>Weight Type: {chosenVariation.weight_type}</Text>
          <Text style={styles.text}>Is custom: {chosenVariation.is_custom ? 'yes': 'no'}</Text>
          {useDropdown(displayOptions, displayValue, setDisplayValue)}
          {displayMap[displayValue]}
        </>
      }
    </View>
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

