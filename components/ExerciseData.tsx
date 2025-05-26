import React, { View, StyleSheet, Text, Platform } from "react-native"
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { exercisesHistoricalDataAtom } from "@/store/general"

// on select exercise, load in user data (async)
// allow refresh in case of errors

// time periods: last week, month, 3 months, 6 months, year, all time

// n rep maxes (chart or table)
// 3D graph of reps (x), sets (y), weight (z) + can collapse into 2D views
// 2D graphs: 
//    volume per session vs time
//    n rep maxes vs time

// basic would be to compare to user stats, advanced would be to allow comparison stats \
// curves to others (gender, age, weight, height etc)

// seperate overall stats page:
// muscle polygon of volume
// muscle diagram heatmap
// favourite exercises
//    overall by sets, volume, reps
//    per muscle by sets, volume, reps

import ThreeDPlot from './ThreeAxisChart'
import { useState } from "react";
import Dropdown from "./Dropdown";
import { useAtom } from "jotai";

interface ExerciseDataProps {
  exercise: any
  exerciseIndex: number
}

type TimeSpan = 'week' | 'month' | '3-months' | '6 months' | 'year' | 'all'

export default function ExerciseData(props: ExerciseDataProps) {
  const {exercise, exerciseIndex} = props;

  const [exercisesHistoricalData, setExercisesHistoricalDataAtom] = useAtom(exercisesHistoricalDataAtom);

  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const dataOptions = [
    { label: 'n rep max', value: 'n-rep-max' },
    { label: 'reps x sets x weight', value: 'reps-sets-weight' },
    { label: 'volume per workout', value: 'n-rep-max' },
  ]

  const [timeSpanIdx, setTimeSpanIdx] = useState<number>(0);
  const timeSpanOptions = [
    { label: 'week', value: 'week' },
    { label: 'month', value: 'month' },
    { label: '3 months', value: '3-months' },
    { label: '6 months', value: '6-months' },
    { label: 'year', value: 'year' },
    { label: 'all', value: 'all' },

  ]

  const refreshData = async () => {
    // send request to refresh all historical data from exercise.id
  };

  return (
    <View>
      {/* <ThreeDPlot /> */}
      <View style={styles.row}>
        <View>
          <Text style={styles.text}>Choose an option:</Text>
          <Dropdown selectedIdx={selectedIdx} setSelectedIdx={setSelectedIdx} options={dataOptions}/>
        </View>
        <View>
          <Text style={styles.text}>Choose a time span:</Text>
          <Dropdown selectedIdx={timeSpanIdx} setSelectedIdx={setTimeSpanIdx} options={timeSpanOptions}/>
        </View>
      </View>
      {dataOptions[selectedIdx].value === 'n-rep-max' &&
        <>
        </>
      }
    </View>
  )
}

//! GL graph may need fixed height to render

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  }
});

const exampleData = {
  "n_rep_max": {
    "maxes": {
      "1": {
        "weight": "155",
        "timestamp": "1748252144422"
      },
      "3": {
        "weight": "130",
        "timestamp": "1748338544422"
      },
      "5": {
        "weight": "100",
        "timestamp": "1748424944422"
      },
      "10": {
        "weight": "95",
        "timestamp": "1748511344422"
      },
      "11": {
        "weight": "92",
        "timestamp": "1748597744422"
      },
      "20": {
        "weight": "87",
        "timestamp": "1748684144422"
      }
    },
    "history": {
      "1": [
        {
          "weight": "155",
          "timestamp": "1748252144422"
        },
        {
          "weight": "150",
          "timestamp": "1748165744422"
        },
        {
          "weight": "148",
          "timestamp": "1748079344422"
        },
        {
          "weight": "152",
          "timestamp": "1747992944422"
        },
        {
          "weight": "149",
          "timestamp": "1747906544422"
        }
      ],
      "3": [
        { "weight": "130", "timestamp": "1748338544422" },
        { "weight": "128", "timestamp": "1748252144422" },
        { "weight": "127", "timestamp": "1748165744422" },
        { "weight": "125", "timestamp": "1748079344422" },
        { "weight": "129", "timestamp": "1747992944422" }
      ],
      "5": [
        { "weight": "100", "timestamp": "1748424944422" },
        { "weight": "98",  "timestamp": "1748338544422" },
        { "weight": "97",  "timestamp": "1748252144422" },
        { "weight": "95",  "timestamp": "1748165744422" },
        { "weight": "96",  "timestamp": "1748079344422" }
      ],
      "10": [
        { "weight": "95",  "timestamp": "1748511344422" },
        { "weight": "93",  "timestamp": "1748424944422" },
        { "weight": "91",  "timestamp": "1748338544422" },
        { "weight": "90",  "timestamp": "1748252144422" },
        { "weight": "92",  "timestamp": "1748165744422" }
      ],
      "11": [
        { "weight": "92",  "timestamp": "1748597744422" },
        { "weight": "90",  "timestamp": "1748511344422" },
        { "weight": "89",  "timestamp": "1748424944422" },
        { "weight": "88",  "timestamp": "1748338544422" },
        { "weight": "91",  "timestamp": "1748252144422" }
      ],
      "20": [
        { "weight": "87",  "timestamp": "1748684144422" },
        { "weight": "85",  "timestamp": "1748597744422" },
        { "weight": "84",  "timestamp": "1748511344422" },
        { "weight": "83",  "timestamp": "1748424944422" },
        { "weight": "86",  "timestamp": "1748338544422" }
      ]
    }
  },
};