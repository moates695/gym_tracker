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
      1: 155,
      3: 130,
      5: 100,
      10: 95,
      11: 92,
      20: 87
    },
    "over_time": {
      "week": {
        3:  [150, 148],
        10: [145],
        11: [144, 143],
        20: [140, 139]
      },
      "all": {
        1: [155, 154, 153, 150, 148, 150, 145, 140],
        3:  [150, 148, 147, 145, 143, 142, 140, 139, 137],
        5:  [148, 146, 144, 143, 141, 140, 138, 137, 135, 134, 132],
        10: [145, 144, 142, 140, 139, 138, 137, 135, 134, 133, 132, 130, 129, 128],
        11: [144, 143, 141, 140, 138, 137, 136, 135, 134, 133, 132, 130, 129, 128],
        20: [140, 139, 138, 137, 136, 135, 133, 132, 131, 130, 129, 128, 127, 126, 125]
      }
    }
  }
};