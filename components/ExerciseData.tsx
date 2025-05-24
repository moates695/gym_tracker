import React, { View } from "react-native"

// on select exercise, load in user data (async)
// allow refresh in case of errors

// time periods: last week, month, 3 months, 6 months, year, all time

// n rep maxes (chart or table)
// 3D graph of reps (x), sets (y), weight (z) + can collapse into 2D views
// 2D graphs: 
//    volume per session vs time
//    n rep maxes vs time

import ThreeDPlot from './ThreeAxisChart'

export default function ExerciseData() {
  return (
    <View style={{ height: 300 }}>
      <ThreeDPlot />
    </View>
  )
}