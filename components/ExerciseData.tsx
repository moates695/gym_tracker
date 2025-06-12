import * as React from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity } from "react-native"
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { exercisesHistoricalDataAtom, WorkoutExercise, ExerciseHistoricalData } from "@/store/general"

// on select exercise, load in user data (async)
// allow refresh in case of errors

// time periods: last week, month, 3 months, 6 months, year, all time

// EXERCISE DATA
// n rep max
//    graph: max weight vs num reps
//    graph: max weight vs time
//    table: reps | max ever weight
// exercise volume per workout
//    graph: volume vs time
// rep x sets x weight
//    2D graph: weight vs time (choose rep & set then see the weight lifted over time)
//    3D graph: reps, sets, weight (x, y, z)
// exercise history
//    table: reps | weight | sets | (date?) | class? (warmup, cooldown, working)
//      -> table grouped by workout (dividing line or something between rows)

// WORKOUT OVERVIEW DATA
// list of exercises in the workout
//    volume, sets, reps
// total workout volume
//    graph volume vs time, with bar for current workout
// muscle group, target volume
//    graph: volume vs time, with bar for current workout
// distrubution data
//    muscle polygon of volume, sets, reps (with percentages)
//    muscle diagram heatmap

// USER DATA (total overview)
// distrubution data
//    muscle polygon of volume, sets, reps (with percentages)
//    muscle diagram heatmap
// total volume, sets, reps
// favourite exercises
//    overall by sets, volume, reps
//    per muscle group or target by sets, volume, reps


import ThreeDPlot from './ThreeAxisChart'
import { useState } from "react";
import Dropdown from "./Dropdown";
import { useAtom } from "jotai";
// import TwoAxisChart from './TwoAxisGraph';
// import TimeSeriesChart from './TimeSeriesChart';
import LineGraph, {LineGraphPoint} from './LineGraph';
import { commonStyles } from '@/styles/commonStyles';

interface ExerciseDataProps {
  exercise: WorkoutExercise
  exerciseIndex: number
}

// type TimeSpan = 'week' | 'month' | '3-months' | '6 months' | 'year' | 'all'

type DataVisual = 'graph' | 'table';

export default function ExerciseData(props: ExerciseDataProps) {
  const {exercise, exerciseIndex} = props;

  const [exercisesHistoricalData, setExercisesHistoricalDataAtom] = useAtom(exercisesHistoricalDataAtom);
  const exerciseData = exercisesHistoricalData[exercise.id];

  const [dataOptionIdx, setSelectedIdx] = useState<number>(0);
  const dataOptions = [
    { label: 'n rep max', value: 'n_rep_max' },
    { label: 'reps x sets x weight', value: 'reps_sets_weight' },
    { label: 'volume per workout', value: 'volume_per_workout' },
  ]
  const dataOption = dataOptions[dataOptionIdx].value;

  const [nRepMaxIdx, setNRepMaxIdx] = useState<number>(0);
  const nRepMaxOptions = [
    { label: 'all time maxes', value: 'all_time' },
    { label: 'rep max history', value: 'history' },
  ]
  const nRepMaxOption = nRepMaxOptions[nRepMaxIdx].value;

  const [nRepMaxHistoryIdx, setNRepMaxHistoryIdx] = useState<number>(0);
  const nRepMaxHistoryOptions = [];
  for (const key in exerciseData['n_rep_max']['history']) {
    nRepMaxHistoryOptions.push({
      label: key, value: key
    })
  } 
  const nRepMaxHistoryOption: string | null = nRepMaxHistoryOptions[nRepMaxHistoryIdx]?.value ?? null;

  const [timeSpanIdx, setTimeSpanIdx] = useState<number>(0);
  const timeSpanOptions = [
    { label: 'week', value: 'week' },
    { label: 'month', value: 'month' },
    { label: '3 months', value: '3_months' },
    { label: '6 months', value: '6_months' },
    { label: 'year', value: 'year' },
    { label: 'all', value: 'all' },
  ]
  const timeSpanOption = timeSpanOptions[timeSpanIdx].value;

  const timeSpanToMs: Record<string, number> = {
    'week': 7 * 24 * 60 * 60 * 1000,
    'month': 30 * 24 * 60 * 60 * 1000,
    '3_months': 3 * 30 * 24 * 60 * 60 * 1000,
    '6_months': 6 * 30 * 24 * 60 * 60 * 1000,
    'year': 365 * 24 * 60 * 60 * 1000,
    'all': 0,
  }
  // const cutoff = Date.now() - (timeSpanToMs as any)[timeSpanOptions[timeSpanIdx].value];

  const [dataVisual, setDataVisual] = useState<DataVisual>('graph');

  const handleSwitchDataVisual = () => {
    if (dataVisual === 'graph') {
      setDataVisual('table');
      return;
    }
    setDataVisual('graph');
  }

  const filterTimeSeries = (points: LineGraphPoint[]) => {
    if (timeSpanOption === 'all') return points;
    return points.filter(point => {
      return point.x >= (Date.now() - timeSpanToMs[timeSpanOption])
    });
  }

  const getPoints = (): LineGraphPoint[] => {
    if (dataOption === 'n_rep_max') {
      return getNRepMaxPoints();
    }
    return [];
  };

  const getNRepMaxPoints = (): LineGraphPoint[] => {
    if (nRepMaxOption === 'all_time') {
      const points: any[] = [];
      for (const [key, obj] of Object.entries(exerciseData['n_rep_max']['all_time'])) {
        points.push({
          'x': parseInt(key),
          'y': parseFloat((obj as any).weight)
        })
      }
      return points;
    } else if (nRepMaxOption === 'history') {
      if (nRepMaxHistoryOption === null) return [];
      const points: any[] = [];
      for (const point of exerciseData['n_rep_max']['history'][nRepMaxHistoryOption]) {
        points.push({
          "x": parseInt((point as any)["timestamp"]),
          "y": parseFloat((point as any)["weight"]),
        })
      }
      return filterTimeSeries(points);
    }
    return [];
  };

  const points = getPoints();

  return (
    <View>
      <View>
        <Text style={styles.text}>Choose a data type:</Text>
        <Dropdown selectedIdx={dataOptionIdx} setSelectedIdx={setSelectedIdx} options={dataOptions}/>
      </View>
      {dataOptions[dataOptionIdx].value === 'n_rep_max' &&
        <>
          <View>
            <Text style={styles.text}>Choose a view:</Text>
            <Dropdown selectedIdx={nRepMaxIdx} setSelectedIdx={setNRepMaxIdx} options={nRepMaxOptions}/>
          </View>
          {(nRepMaxOption === 'history' && nRepMaxHistoryOption !== null) &&
            <>
              <View>
                <Text style={styles.text}>Choose a rep number:</Text>
                <Dropdown selectedIdx={nRepMaxHistoryIdx} setSelectedIdx={setNRepMaxHistoryIdx} options={nRepMaxHistoryOptions}/>
              </View>
              <View>
                <Text style={styles.text}>Choose a lookback:</Text>
                <Dropdown selectedIdx={timeSpanIdx} setSelectedIdx={setTimeSpanIdx} options={timeSpanOptions}/>
              </View>
            </>
          }

          {dataVisual === 'graph' && 
            <LineGraph points={points} scale_type={nRepMaxOption === 'all_time' ? 'value' : 'time'}/>
          }
          {dataVisual === 'table' && 
            <>
            </>
          }
          <TouchableOpacity
            onPress={handleSwitchDataVisual}
            style={[commonStyles.thinTextButton, {width: 100}]}
          >
            <Text style={styles.text}>switch visual</Text>
          </TouchableOpacity>
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