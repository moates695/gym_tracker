import { useEffect, useState } from "react";
import { Keyboard, TouchableOpacity, View } from "react-native"
import { Text, StyleSheet } from "react-native"
import ExerciseSets from "./ExerciseSets";
import React from 'react-native'
import ExerciseData from "./ExerciseData";
import { editWorkoutExercisesAtom, exercisesHistoricalDataAtom, loadingExerciseHistoryAtom, SetData, WorkoutExercise } from "@/store/general"
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { commonStyles } from "@/styles/commonStyles";
import { fetchWrapper, getExerciseValueMap, getValidSets, isValidSet } from "@/middleware/helpers"
import MuscleGroupSvg from "./MuscleGroupSvg";
import { addCaughtErrorLogAtom, addErrorLogAtom, updateLoadingExerciseHistoryAtom } from "@/store/actions";

interface WorkoutExerciseProps {
  exercise: WorkoutExercise
  exerciseIndex: number
}

// todo handle a variation name (might require changing the interface?)

export default function workoutExercise(props: WorkoutExerciseProps) {
  const { exercise, exerciseIndex } = props; 

  const [exercisesHistoricalData, setExercisesHistoricalData] = useAtom(exercisesHistoricalDataAtom);
  const [editExercises, _] = useAtom(editWorkoutExercisesAtom);  
  const loadingExerciseHistory = useAtomValue(loadingExerciseHistoryAtom);
  const updateLoadingExerciseHistory = useSetAtom(updateLoadingExerciseHistoryAtom)

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

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
      return sum + (obj.class === 'dropset' ? 1 : obj.num_sets ?? 0)
    };
    setNumSets(getValidSets(exercise).reduce(reducer, 0));
  }, [exercise.set_data]);

  const handlePressNameBar = () => {
    Keyboard.dismiss();
    setIsExpanded(!isExpanded);
  };

  const handleRefreshHistory = async () => {
    Keyboard.dismiss();
    try {
      updateLoadingExerciseHistory(exercise.workout_exercise_id, true);

      const data = await fetchWrapper({
        route: 'exercises/history',
        method: 'GET',
        params: {exercise_id: exercise.id}
      })
      setExercisesHistoricalData(prev => ({
        ...prev,
        [exercise.id]: data
      }))
    } catch (error) {
      addCaughtErrorLog(error, 'error handleRefreshHistory')
    } finally {
      updateLoadingExerciseHistory(exercise.workout_exercise_id, false);
    }
  }

  const handleDataExpanded = (option: DataOption) => {
    Keyboard.dismiss();
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

  const [parentWidth, setParentWidth] = useState(0);
  const [setTextWidth, setSetTextWidth] = useState(0);

  return (
    <View 
      style={styles.box} 
      onLayout={e => setParentWidth(e.nativeEvent.layout.width)}
    >
      <TouchableOpacity style={styles.row}
        onPress={handlePressNameBar}
        disabled={editExercises}
      >
        <View 
          style={{
            flexDirection: 'row', 
            alignItems: 'baseline',
            // backgroundColor: 'purple',
            flex: 1,
            maxWidth: parentWidth - setTextWidth - 40
          }}
        >
          <Text 
            style={[styles.text, {fontWeight: 500}]}
            numberOfLines={1}
          >
            {exercise.name}
          </Text>
          {exercise.variation_name !== undefined &&
            <Text 
              style={[styles.text, {paddingLeft: 4, flexShrink: 1, fontSize: 12}]}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              ({exercise.variation_name})
            </Text>
          }
        </View>
        <Text 
          style={styles.text}
          onLayout={e => setSetTextWidth(e.nativeEvent.layout.width)}
        >
          {numSets} sets
        </Text>
      </TouchableOpacity>
      {isExpanded &&
        <View>
          <ExerciseSets exercise={exercise} exerciseIndex={exerciseIndex}/>
          <View style={styles.rowThin}>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                style={[
                  styles.thinTextButton,
                  dataOption === 'heatmap' && styles.thinTextButtonHighlighted
                ]}
                onPress={() => handleDataExpanded('heatmap')}
              >
                <Text 
                  style={[
                    styles.text,
                    dataOption === 'heatmap' && {
                      color: 'black'
                    }
                  ]}
                >
                  heatmap
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.thinTextButton,
                  dataOption === 'data' && styles.thinTextButtonHighlighted,
                  {
                    marginLeft: 4
                  }
                ]}
                onPress={() => handleDataExpanded('data')}
              >
                <Text 
                  style={[
                    styles.text,
                    dataOption === 'data' && {
                      color: 'black'
                    }
                  ]}
                >
                  data
                </Text>
              </TouchableOpacity>
            </View>
            {dataOption === 'data' && 
              <TouchableOpacity
                onPress={handleRefreshHistory}
                style={commonStyles.thinTextButton}
                disabled={loadingExerciseHistory[exercise.workout_exercise_id] ?? false}
              >
                <Text style={styles.text}>refresh data</Text>
              </TouchableOpacity>
            }
          </View>
          {dataOption === 'data' &&
            <>
              <View style={styles.divider}/>
              <ExerciseData exercise={exercise} />
            </>
          }
          {dataOption === 'heatmap' &&
            <>
              <View style={styles.divider}/>
              <MuscleGroupSvg
                valueMap={getExerciseValueMap(exercise)} 
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
  thinTextButtonHighlighted: {
    backgroundColor: '#e0e0e0ff',
    borderColor: '#e0e0e0ff',
  }
})