import React, { View } from "react-native"

// on select exercise, load in user data (async)
// allow refresh in case of errors

// time periods: last week, month, 3 months, 6 months, year, all time

// n rep max (chart or table)
// total volume per session (vs current session)
// graph of reps (x), sets (y), weight (z)

import ThreeDPlot from './ThreeAxisChart'

export default function ExerciseData() {
  return (
    <View style={{ height: 300 }}>
      <ThreeDPlot />
    </View>
  )
}