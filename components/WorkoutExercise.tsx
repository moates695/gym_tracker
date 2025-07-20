import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native"
import { Text, StyleSheet } from "react-native"
import ExerciseSets from "./ExerciseSets";
import React from 'react-native'
import ExerciseData from "./ExerciseData";
import { editWorkoutExercisesAtom, exercisesHistoricalDataAtom, SetData, WorkoutExercise } from "@/store/general"
import { useAtom } from "jotai";
import { commonStyles } from "@/styles/commonStyles";
import { fetchWrapper, getValidSets, isValidSet } from "@/middleware/helpers"
import MuscleGroupSvg from "./MuscleGroupSvg";

interface WorkoutExerciseProps {
  exercise: WorkoutExercise
  exerciseIndex: number
}

export default function workoutExercise(props: WorkoutExerciseProps) {
  const { exercise, exerciseIndex } = props; 

  const [exercisesHistoricalData, setExercisesHistoricalData] = useAtom(exercisesHistoricalDataAtom);
  const [editExercises, _] = useAtom(editWorkoutExercisesAtom);  

  const [numSets, setNumSets] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  type DataOption = 'none' | 'data' | 'heatmap';
  const [dataOption, setDataOption] = useState<DataOption>('none');

  useEffect(() => {
    if (!isExpanded) {
      setDataOption('none');
    }
  }, [isExpanded]);

  useEffect(() => {
    const reducer = (sum: number, obj: SetData): number => {
      return sum + (obj.num_sets ?? 0)
    };
    setNumSets(getValidSets(exercise).reduce(reducer, 0));
  }, [exercise.set_data]);

  const handleRefreshHistory = async () => {
    const data = await fetchWrapper('exercise/history', 'GET', {id: exercise.id}, undefined)
    setExercisesHistoricalData(prev => ({
      ...prev,
      [exercise.id]: data
    }))
  }

  const handleDataExpanded = (option: DataOption) => {
    if (editExercises) return;
    if (option === dataOption) {
      setDataOption('none');
    } else {
      setDataOption(option);
    }
  };

  useEffect(() => {
    if (!editExercises) return;
    setDataOption('none');
    setIsExpanded(false);
  }, [editExercises])

  const valueMap: Record<string, number> = {};
  for (const group_data of exercise.muscle_data) {
    for (const target_data of group_data.targets) {
      valueMap[`${group_data.group_name}/${target_data.target_name}`] = target_data.ratio;
    }
  }

  return (
    <View style={styles.box}>
      <TouchableOpacity style={styles.row}
        onPress={() => setIsExpanded(!isExpanded)}
        disabled={editExercises}
      >
        <Text style={[styles.text, {fontWeight: 500}]}>{exercise.name}</Text>
        <Text style={styles.text}>{numSets} sets</Text>
      </TouchableOpacity>
      {isExpanded &&
        <View>
          <ExerciseSets exercise={exercise} exerciseIndex={exerciseIndex}/>
          <View style={styles.rowThin}>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                style={styles.thinTextButton}
                onPress={() => handleDataExpanded('heatmap')}
              >
                <Text style={styles.text}>heatmap</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.thinTextButton, {marginLeft: 5}]}
                onPress={() => handleDataExpanded('data')}
              >
                <Text style={styles.text}>data</Text>
              </TouchableOpacity>
            </View>
            {dataOption === 'data' && 
              <TouchableOpacity
                onPress={handleRefreshHistory}
                style={commonStyles.thinTextButton}
              >
                <Text style={styles.text}>refresh data</Text>
              </TouchableOpacity>
            }
          </View>
          {dataOption === 'data' &&
            <>
              <View style={styles.divider}/>
              <ExerciseData exercise={exercise} exerciseIndex={exerciseIndex}/>
            </>
          }
          {dataOption === 'heatmap' &&
            <>
              <View style={styles.divider}/>
              <MuscleGroupSvg
                valueMap={valueMap} 
                showGroups={false}
              />
            </>
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
    width: 'auto',
    padding: 10,
    margin: 2,
    borderColor: 'red',
    borderWidth: 2,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    alignItems: 'center',
    width: '100%',
  },
  rowThin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingLeft: 5,
    paddingRight: 5,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 8
  },
  thinTextButton: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 2,
    padding: 1,
    paddingLeft: 8,
    paddingRight: 8,
    // backgroundColor: 'grey',
    minWidth: 80,
    alignItems: 'center'
  },
})