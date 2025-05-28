import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native"
import { Text, StyleSheet } from "react-native"
import ExerciseSets from "./ExerciseSets";
import React from 'react-native'
import ExerciseData from "./ExerciseData";
import { exercisesHistoricalDataAtom } from "@/store/general"
import { useAtom } from "jotai";

interface WorkoutExerciseProps {
  exercise: any
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
    const isValidSet = (set: any) => {
      return set.reps !== null && set.weight !== null && set.sets !== null;
    };
    setNumSets(exercise.sets.filter(isValidSet).reduce((sum: any, obj: { sets: any; }) => sum + obj.sets, 0));
  }, [exercise.sets]);

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
  rowThin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 8
  }
})

// const exampleData = {
//   "n_rep_max": {
//     "maxes": {
//       "1": {
//         "weight": "155",
//         "timestamp": "1748252144422"
//       },
//       "3": {
//         "weight": "130",
//         "timestamp": "1748338544422"
//       },
//       "5": {
//         "weight": "100",
//         "timestamp": "1748424944422"
//       },
//       "10": {
//         "weight": "95",
//         "timestamp": "1748511344422"
//       },
//       "11": {
//         "weight": "92",
//         "timestamp": "1748597744422"
//       },
//       "20": {
//         "weight": "87",
//         "timestamp": "1748684144422"
//       }
//     },
//     "history": {
//       "1": [
//         {
//           "weight": "155",
//           "timestamp": "1748252144422"
//         },
//         {
//           "weight": "150",
//           "timestamp": "1748165744422"
//         },
//         {
//           "weight": "148",
//           "timestamp": "1748079344422"
//         },
//         {
//           "weight": "152",
//           "timestamp": "1747992944422"
//         },
//         {
//           "weight": "149",
//           "timestamp": "1747906544422"
//         }
//       ],
//       "3": [
//         { "weight": "130", "timestamp": "1748338544422" },
//         { "weight": "128", "timestamp": "1748252144422" },
//         { "weight": "127", "timestamp": "1748165744422" },
//         { "weight": "125", "timestamp": "1748079344422" },
//         { "weight": "129", "timestamp": "1747992944422" }
//       ],
//       "5": [
//         { "weight": "100", "timestamp": "1748424944422" },
//         { "weight": "98",  "timestamp": "1748338544422" },
//         { "weight": "97",  "timestamp": "1748252144422" },
//         { "weight": "95",  "timestamp": "1748165744422" },
//         { "weight": "96",  "timestamp": "1748079344422" }
//       ],
//       "10": [
//         { "weight": "95",  "timestamp": "1748511344422" },
//         { "weight": "93",  "timestamp": "1748424944422" },
//         { "weight": "91",  "timestamp": "1748338544422" },
//         { "weight": "90",  "timestamp": "1748252144422" },
//         { "weight": "92",  "timestamp": "1748165744422" }
//       ],
//       "11": [
//         { "weight": "92",  "timestamp": "1748597744422" },
//         { "weight": "90",  "timestamp": "1748511344422" },
//         { "weight": "89",  "timestamp": "1748424944422" },
//         { "weight": "88",  "timestamp": "1748338544422" },
//         { "weight": "91",  "timestamp": "1748252144422" }
//       ],
//       "20": [
//         { "weight": "87",  "timestamp": "1748684144422" },
//         { "weight": "85",  "timestamp": "1748597744422" },
//         { "weight": "84",  "timestamp": "1748511344422" },
//         { "weight": "83",  "timestamp": "1748424944422" },
//         { "weight": "86",  "timestamp": "1748338544422" }
//       ]
//     }
//   },
// };