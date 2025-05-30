import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native"
import { Text, StyleSheet } from "react-native"
import ExerciseSets from "./ExerciseSets";
import React from 'react-native'
import ExerciseData from "./ExerciseData";
import { exercisesHistoricalDataAtom, SetData, WorkoutExercise } from "@/store/general"
import { useAtom } from "jotai";

interface WorkoutExerciseProps {
  exercise: WorkoutExercise
  exerciseIndex: number
}

export default function workoutExercise(props: WorkoutExerciseProps) {
  const { exercise, exerciseIndex } = props; 

  const [exercisesHistoricalData, setExercisesHistoricalDataAtom] = useAtom(exercisesHistoricalDataAtom);

  const [numSets, setNumSets] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isDataExpanded, setIsDataExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (!isExpanded) {
      setIsDataExpanded(false);
    }
  }, [isExpanded]);

  useEffect(() => {
    const isValidSet = (set: SetData): boolean => {
      for (const value of Object.values(set)) {
        if (value !== null && value !== 0) continue;
        return false;
      }
      return true;
      // return set.reps !== null && set.weight !== null && set.num_sets !== null;
    };
    const reducer = (sum: number, obj: SetData): number => {
      return sum + (obj.num_sets ?? 0)
    };
    setNumSets(exercise.set_data.filter(isValidSet).reduce(reducer, 0));
  }, [exercise.set_data]);

  const handleRefreshHistory = async () => {
    // send request to refresh all historical data from exercise.id
    setExercisesHistoricalDataAtom(exercisesHistoricalData);
    // const data = {};
    // const temp = {...exercisesHistoricalData} as any;
    // temp[exercise.id] = data;
    // setExercisesHistoricalDataAtom(temp);
  }

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
          <View style={styles.rowThin}>
            <TouchableOpacity
              onPress={() => setIsDataExpanded(!isDataExpanded)}
            >
              <Text style={styles.text}>{isDataExpanded ? 'close data': 'open data'}</Text>
            </TouchableOpacity>
            {isDataExpanded && 
              <TouchableOpacity
                onPress={handleRefreshHistory}
              >
                <Text style={styles.text}>refresh data</Text>
              </TouchableOpacity>
            }
          </View>
          {isDataExpanded &&
            <>
              <View style={styles.divider}/>
              <ExerciseData exercise={exercise} exerciseIndex={exerciseIndex}/>
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
    width: '100%',
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
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 8
  }
})