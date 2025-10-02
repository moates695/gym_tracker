import { ExerciseListItem, exercisesHistoricalDataAtom, WorkoutExercise } from "@/store/general";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { OptionsObject } from "./ChooseExerciseModal";
import { MaterialIcons } from "@expo/vector-icons";
import ExerciseData, { useDropdown } from "./ExerciseData";
import { useAtom } from "jotai";
import { fetchWrapper } from "@/middleware/helpers";
import LoadingScreen from "@/app/loading";
import { commonStyles } from "@/styles/commonStyles";

export interface ExerciseStatsItemProps {
  exercise: ExerciseListItem
}

export default function ExerciseStatsItem(props: ExerciseStatsItemProps) {
  const {exercise} = props;
  
  const variations = exercise.variations ?? [];
  
  const [exercisesHistoricalData, setExercisesHistoricalData] = useAtom(exercisesHistoricalDataAtom);
  
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [chosenVariation, setChosenVariation] = useState<ExerciseListItem>(exercise);
  const [loadingData, setLoadingData] = useState<boolean>(false);

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
  }, [variationValue]);
  
  const fetchExerciseHistoricalDataAll = async () => {
    setLoadingData(true);
    try {
      const exercise_ids = [exercise.id, ...variations.map(v => v.id)];

      const results = await Promise.all(
        exercise_ids.map(async (exercise_id) => {
          try {
            const data = await fetchWrapper({
              route: 'exercise/history',
              method: 'GET',
              params: { exercise_id }
            });
            return { exercise_id, data };
          } catch (err) {
            console.log(`Failed to fetch history for ${exercise_id}`, err);
            return null;
          }
        })
      );

      const combinedData = results.reduce((acc, result) => {
        if (result) acc[result.exercise_id] = result.data;
        return acc;
      }, {} as Record<string, any>);

      setExercisesHistoricalData(prev => ({
        ...prev,
        ...combinedData
      }));

    } catch (error) {
      console.log(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    if (chosenVariation.id in exercisesHistoricalData) return;
    fetchExerciseHistoricalDataAll();
  };

  const workoutExercise: WorkoutExercise = {
    id: chosenVariation.id,
    name: chosenVariation.name,
    muscle_data: chosenVariation.muscle_data,
    is_body_weight: chosenVariation.is_body_weight,
    description: chosenVariation.description,
    weight_type: chosenVariation.weight_type,
    is_custom: chosenVariation.is_custom,
    ratios: chosenVariation.ratios,
    set_data: [],
  };

  return (
    <View style={styles.box}>
      <TouchableOpacity
        onPress={handleExpand}
      >
        <View 
          style={{
            flexDirection: 'row', 
            justifyContent: 'space-between',
            alignItems: 'center', 
          }}
        >
          <Text style={[commonStyles.text]}>{exercise.name}</Text>
          <MaterialIcons 
            name={isExpanded ? "expand-less" : "expand-more"} 
            size={16} 
            color="gray" 
            style={{paddingLeft: 4, paddingBottom: 4}}
          />
        </View>
      </TouchableOpacity>
      {isExpanded &&
        <>
          {loadingData ?
            <LoadingScreen />
          :
            <>
              {variations.length > 0 &&
                <>
                  <Text style={commonStyles.text}>Choose variation:</Text>
                  {useDropdown(variationOptions, variationValue, setVariationValue)}
                </>
              }
              <ExerciseData exercise={workoutExercise} />
              <View
                style={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => fetchExerciseHistoricalDataAll()}
                  style={commonStyles.thinTextButton}
                >
                  <Text style={[commonStyles.text]}>refresh</Text>
                </TouchableOpacity>
              </View>
            </>
          }
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
  }
});