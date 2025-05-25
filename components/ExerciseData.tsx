import React, { View, StyleSheet, Text, Platform } from "react-native"
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';

// on select exercise, load in user data (async)
// allow refresh in case of errors

// time periods: last week, month, 3 months, 6 months, year, all time

// n rep maxes (chart or table)
// 3D graph of reps (x), sets (y), weight (z) + can collapse into 2D views
// 2D graphs: 
//    volume per session vs time
//    n rep maxes vs time

// seperate overall stats page:
// muscle polygon of volume
// muscle diagram heatmap
// favourite exercises
//    overall by sets, volume, reps
//    per muscle by sets, volume, reps

import ThreeDPlot from './ThreeAxisChart'
import { useState } from "react";
import Dropdown from "./Dropdown";

export default function ExerciseData() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const dataOptions = [
    { label: 'n rep max', value: 'n-rep-max' },
    { label: 'reps x sets x weight', value: 'reps-sets-weight' },
    { label: 'volume per workout', value: 'n-rep-max' },
  ]

  return (
    <View>
      {/* <ThreeDPlot /> */}
      <Text style={styles.text}>Choose an option:</Text>
      <Dropdown selectedIdx={selectedIdx} setSelectedIdx={setSelectedIdx} options={dataOptions}/>
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
});