import * as React from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity } from "react-native"
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
// view last workouts for the exercise

// basic would be to compare to user stats, advanced would be to allow comparison stats \
// curves to others (gender, age, weight, height etc)

// n rep max: maxes (graph | table), history per rep (graph)
// reps x sets x weight: 3D graph
// volume per workout: 2D graph

// DATA
// n rep max
//    table: reps | max ever weight
//    graph: weights vs time
// exercise volume per workout
//    graph: volume vs time
// rep x sets
//    graph: weight vs time (choose rep & set then see the weight lifted over time)
// rep x sets x weight
//    graph: 3D reps, sets, weight (x, y, z)
// exercise history
//    table: reps | weight | sets | (date?) | class? (warmup, cooldown, working)
//      -> table grouped by workout (dividing line or something between rows)
// muscle group volume per workout (overview data?)
//    graph: volume vs time


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
import TwoAxisChart from './TwoAxisGraph';
import TimeSeriesChart from './TimeSeriesChart';

interface ExerciseDataProps {
  exercise: any
  exerciseIndex: number
}

// type TimeSpan = 'week' | 'month' | '3-months' | '6 months' | 'year' | 'all'

type DataVisual = 'graph' | 'table';

export default function ExerciseData(props: ExerciseDataProps) {
  const {exercise, exerciseIndex} = props;

  const [exercisesHistoricalData, setExercisesHistoricalDataAtom] = useAtom(exercisesHistoricalDataAtom);
  const exerciseData = (exercisesHistoricalData as any)[exercise.id];
  console.log(exerciseData)

  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const dataOptions = [
    { label: 'n rep max', value: 'n_rep_max' },
    { label: 'reps x sets x weight', value: 'reps_sets_weight' },
    { label: 'volume per workout', value: 'volume_per_workout' },
  ]

  const [timeSpanIdx, setTimeSpanIdx] = useState<number>(0);
  const timeSpanOptions = [
    { label: 'week', value: 'week' },
    { label: 'month', value: 'month' },
    { label: '3 months', value: '3_months' },
    { label: '6 months', value: '6_months' },
    { label: 'year', value: 'year' },
    { label: 'all', value: 'all' },

  ]

  const timeSpanToMs = {
    'week': 7 * 24 * 60 * 60 * 1000,
    'month': 30 * 24 * 60 * 60 * 1000,
    '3_months': 30 * 24 * 60 * 60 * 1000,
    '6_months': 30 * 24 * 60 * 60 * 1000,
    'year': 30 * 24 * 60 * 60 * 1000,
    'all': 0,
  }
  const cutoff = Date.now() - (timeSpanToMs as any)[timeSpanOptions[timeSpanIdx].value];

  const [dataVisual, setDataVisual] = useState<DataVisual>('graph');

  const handleSwitchDataVisual = () => {
    if (dataVisual === 'graph') {
      setDataVisual('table');
      return;
    }
    setDataVisual('graph');
  }

  const filterHistory = () => {

  }

  const dummyPoints = [];
  for (const point of exerciseData['n_rep_max']['history']["1"]) {
    dummyPoints.push({
      "timestamp": parseInt((point as any)["timestamp"]),
      "value": parseFloat((point as any)["weight"]),
    })
  }
  console.log(dummyPoints)

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
      {dataOptions[selectedIdx].value === 'n_rep_max' &&
        <>
          {dataVisual == 'graph' && 
            <TimeSeriesChart points={dummyPoints}/>
          }
          {dataVisual == 'table' && 
            <>
            </>
          }
          <TouchableOpacity
            onPress={handleSwitchDataVisual}
          >
            <Text style={styles.text}>switch visual</Text>
          </TouchableOpacity>
        </>
      }
      {/* <TimeSeriesChart points={[]}/> */}
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