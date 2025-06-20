import * as React from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, ScrollView, FlatList } from "react-native"
import { exercisesHistoricalDataAtom, WorkoutExercise, ExerciseHistoricalData, TimestampValue, ExerciseHistory } from "@/store/general"
import ThreeAxisGraph, { Point3D } from './ThreeAxisGraph'
import { useEffect, useRef, useState } from "react";
// import Dropdown from "./Dropdown";
import { useAtom } from "jotai";
// import TwoAxisChart from './TwoAxisGraph';
// import TimeSeriesChart from './TimeSeriesChart';
import LineGraph, {LineGraphPoint, LineGraphScale} from './LineGraph';
import { commonStyles } from '@/styles/commonStyles';
import { Col, Row, Grid } from "react-native-easy-grid";
import { Dropdown } from 'react-native-element-dropdown';
import DataTable from './DataTable';
import CarouselDataTable from './CarouselDataTable';

// on select exercise, load in user data (async)
// allow refresh in case of errors

// time periods: last week, month, 3 months, 6 months, year, all time

// EXERCISE DATA
// n rep max
//    graph: max weight vs num reps
//    graph: max weight vs time
//    table: reps | max ever weight
// exercise volume per workout
//    graph: volume per date
// exercise volume per timespan (timespan is bucket) //???
//    graph: volume vs timespan (week, month, 3 month, 6 month, year)
//    table: volume vs span ???
// rep x sets x weight
//    3D graph: reps, sets, weight (x, y, z)
// exercise history
//    table: reps | weight | sets | date ?
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

 

interface ExerciseDataProps {
  exercise: WorkoutExercise
  exerciseIndex: number
}

type DataVisual = 'graph' | 'table';

type TimeSpanOption = 'week' | 'month' | '3_months' | '6_months' | 'year' | 'all'
interface TimeSpanOptionObject {
  label: string
  value: TimeSpanOption
}

type DataOption = 'n_rep_max' | 'reps_sets_weight' | 'volume_per_workout' | 'history';
interface DataOptionObject {
  label: string
  value: DataOption
}

type NRepMaxDataOption = 'all_time' | 'history';
interface NRepMaxDataOptionObject {
  label: string
  value: NRepMaxDataOption
}

type RepsSetsWeightOption = '2d' | '3d'
interface RepsSetsWeightOptionObject {
  label: string
  value: RepsSetsWeightOption
}

export default function ExerciseData(props: ExerciseDataProps) {
  const {exercise, exerciseIndex} = props;

  const [exercisesHistoricalData, setExercisesHistoricalDataAtom] = useAtom(exercisesHistoricalDataAtom);
  const exerciseData = exercisesHistoricalData[exercise.id];

  const dataOptions: DataOptionObject[] = [
    { label: 'n rep max', value: 'n_rep_max' },
    { label: 'volume per workout', value: 'volume_per_workout' },
    { label: 'history', value: 'history' },
    { label: 'reps x sets x weight', value: 'reps_sets_weight' },
  ]
  const [dataOptionValue, setDataOptionValue] = useState<DataOption>('n_rep_max');

  const nRepMaxOptions: NRepMaxDataOptionObject[] = [
    { label: 'all time maxes', value: 'all_time' },
    { label: 'rep max history', value: 'history' },
  ]
  const [nRepMaxOptionValue, setNRepMaxOptionValue] = useState<NRepMaxDataOption>('all_time');

  const nRepMaxHistoryOptions = [];
  for (const key in exerciseData['n_rep_max']['history']) {
    nRepMaxHistoryOptions.push({
      label: key, value: key
    })
  } 
  const [nRepMaxHistoryOptionValue, setNRepMaxHistoryOptionValue] = useState<string | null>(nRepMaxHistoryOptions[0]?.value ?? null);

  const timeSpanOptions: TimeSpanOptionObject[] = [
    { label: 'week', value: 'week' },
    { label: 'month', value: 'month' },
    { label: '3 months', value: '3_months' },
    { label: '6 months', value: '6_months' },
    { label: 'year', value: 'year' },
    { label: 'all', value: 'all' },
  ]
  const [timeSpanOptionValue, setTimeSpanOptionValue] = useState<TimeSpanOption>('month');

  const timeSpanToMs: Record<TimeSpanOption, number> = {
    'week': 7 * 24 * 60 * 60 * 1000,
    'month': 30 * 24 * 60 * 60 * 1000,
    '3_months': 3 * 30 * 24 * 60 * 60 * 1000,
    '6_months': 6 * 30 * 24 * 60 * 60 * 1000,
    'year': 365 * 24 * 60 * 60 * 1000,
    'all': 0,
  }

  const [dataVisual, setDataVisual] = useState<DataVisual>('graph');

  const [historyListIndex, setHistoryListIndex] = useState<number>(0);

  const handleSwitchDataVisual = () => {
    setDataVisual(dataVisual === 'graph' ? 'table' : 'graph')
  }

  const filterTimeSeries = (points: LineGraphPoint[]) => {
    if (timeSpanOptionValue === 'all') return points;
    return points.filter(point => {
      return point.x >= (Date.now() - timeSpanToMs[timeSpanOptionValue])
    });
  }

  const getPoints = (): LineGraphPoint[] => {
    switch (dataOptionValue) {
      case 'n_rep_max':
        return getNRepMaxPoints();
      case 'volume_per_workout':
        return getVolumePerWorkoutPoints();
      case 'history':
        return getHistoryPoints();
      default:
        return [];
    }
  };

  const getNRepMaxPoints = (): LineGraphPoint[] => {
    switch (nRepMaxOptionValue) {
      case 'all_time':
        return getNRepMaxAllTimePoints();
      case 'history':
        return getNRepMaxHistoryPoints();
    }
  };

  const getNRepMaxAllTimePoints = (): LineGraphPoint[] => {
    const points: LineGraphPoint[] = [];
    for (const [key, obj] of Object.entries(exerciseData['n_rep_max']['all_time'])) {
      points.push({
        'x': parseInt(key),
        'y': parseFloat((obj as any).weight)
      })
    }
    return points;
  };

  const getNRepMaxHistoryPoints = (): LineGraphPoint[] => {
    if (nRepMaxHistoryOptionValue === null) return [];
    const points: any[] = [];
    for (const point of exerciseData['n_rep_max']['history'][nRepMaxHistoryOptionValue]) {
      points.push({
        "x": parseInt((point as any)["timestamp"]),
        "y": parseFloat((point as any)["weight"]),
      })
    }
    return filterTimeSeries(points);
  };

  const getVolumePerWorkoutPoints = (): LineGraphPoint[] => {
    const points: LineGraphPoint[] = [];
    for (const point of exerciseData["volume"]) {
      points.push({
        "x": Math.floor((point as TimestampValue)["timestamp"]),
        "y": (point as TimestampValue)["value"]
      })
    }
    return filterTimeSeries(points);
  };

  const getHistoryPoints = (): LineGraphPoint[] => {
    const data = exerciseData["history"][historyListIndex];
    if (data === undefined) return [];
    
    const points: LineGraphPoint[] = [];
    let set_num = 1;
    data.set_data.map(set_data => {
      for (let i = 0; i < set_data.num_sets; i++) {
        points.push({
          "x": set_num,
          "y": set_data.weight
        })
        set_num++;
      }
    });

    return points;
  };

  const getTable = (): JSX.Element => {
    let headers = [];
    let rows = [];

    switch (dataOptionValue) {
      case 'n_rep_max':
        [headers, rows] = getNRepMaxTable();
        break;
      case 'volume_per_workout':
        [headers, rows] = getVolumePerWorkoutTable();
        break;
      case 'history':
        [headers, rows] = getHistoryTable();
        break;
      default:
        return (<></>); 
    }

    rows = rows.slice().reverse();

    return (
      <CarouselDataTable 
        headers={headers}
        rows={rows}
      />
    ) 
  };

  const getNRepMaxTable = (): [string[], (string | number)[][]] => {
    switch (nRepMaxOptionValue) {
      case 'all_time':
        return getNRepMaxAllTimeTable();
      case 'history':
        return getNRepMaxHistoryTable(); 
    }
  };

  const getNRepMaxAllTimeTable = (): [string[], (string | number)[][]] => {
    const headers = ['Reps', 'Weight', 'Date'];
    const rows: (number | string)[][] = [];
    
    for (const [reps, value] of Object.entries(exerciseData['n_rep_max']['all_time'])) {
      rows.push([
        reps,
        value.weight,
        timestampToDateStr(value.timestamp)
      ])
    }

    return [headers, rows];
  };

  const getNRepMaxHistoryTable = (): [string[], (string | number)[][]] => {
    if (nRepMaxHistoryOptionValue === null) return [[], []];

    const headers = ['Weight', 'Date'];
    const rows: (number | string)[][] = [];

    for (const value of Object.values(exerciseData['n_rep_max']['history'][nRepMaxHistoryOptionValue])) {
      rows.push([
        value.weight,
        timestampToDateStr(value.timestamp)
      ])
    }

    return [headers, rows];
  };

  const getVolumePerWorkoutTable = (): [string[], (string | number)[][]] => {
    const headers = ['Volume', 'Date'];
    const rows: (number | string)[][] = [];
    
    for (const data of exerciseData["volume"]) {
      rows.push([
        data.value,
        timestampToDateStr(data.timestamp)
      ])
    }

    return [headers, rows];
  };

  const getHistoryTable = (): [string[], (string | number)[][]] => {
    const data = exerciseData["history"][historyListIndex];
    if (data === undefined) return [[], []];

    const headers = ['Reps', 'Weight', 'Sets'];
    const rows: (number | string)[][] = [];

    for (const set_data of data.set_data) {
      rows.push([
        set_data.reps,
        set_data.weight,
        set_data.num_sets
      ])
    }

    return [headers, rows];
  };

  const timestampToDateStr = (timestamp: number): string => {
    const localDate = new Date(timestamp);

    const day = localDate.getDate().toString().padStart(2, '0');
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
    const year = localDate.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const useDropdown = (options: any, value: any, setter: any): JSX.Element => {
    return (
      <Dropdown 
        data={options}
        value={value}
        labelField="label"
        valueField="value"
        onChange={item => {setter(item.value)}}
        style={styles.dropdownButton}
        selectedTextStyle={styles.dropdownText}
        containerStyle={styles.dropdownContainerStyle}
        renderItem={(item, selected) => (
          <View
            style={{
              padding: 10,
              borderWidth: selected ? 1 : 0,
              borderColor: selected ? 'red' : 'transparent',
              backgroundColor: 'black',
            }}
          >
            <Text style={{ color: selected ? 'red' : 'white' }}>{item.label}</Text>
          </View>
        )}
      />
    )
  };

  const renderItem = (item: any, selected: any): JSX.Element => {
    return (
      <View
        style={{
          padding: 10,
          borderWidth: selected ? 1 : 0,
          borderColor: selected ? 'red' : 'transparent',
          backgroundColor: 'black',
        }}
      >
        <Text style={{ color: selected ? 'red' : 'white' }}>{item.label}</Text>
      </View>
    )
  };

  const lookbackComponent = (
    <>
      <Text style={styles.text}>Choose a lookback:</Text>
      <Dropdown
        data={timeSpanOptions}
        value={timeSpanOptionValue}
        labelField="label"
        valueField="value"
        onChange={item => {setTimeSpanOptionValue(item.value)}}
        style={styles.dropdownButton}
        selectedTextStyle={styles.dropdownText}
        containerStyle={styles.dropdownContainerStyle}
        renderItem={(item, selected) => renderItem(item, selected)}
      />
    </>
  );

  const updateHistoryListIndex = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= exerciseData["history"].length) return;
    setHistoryListIndex(newIndex);
  };

  // todo graph for workout history, switch between graphs for each workout/day

  const nRepMaxComponent = (
    <>
      <View>
        <Text style={styles.text}>Choose a view:</Text>
        {useDropdown(nRepMaxOptions, nRepMaxOptionValue, setNRepMaxOptionValue)}
      </View>
      {(nRepMaxOptionValue === 'history' && nRepMaxHistoryOptionValue !== null) &&
        <>
          <View>
            <Text style={styles.text}>Choose a rep number:</Text>
            {useDropdown(nRepMaxHistoryOptions, nRepMaxHistoryOptionValue, setNRepMaxHistoryOptionValue)}
          </View>
          {dataVisual === 'graph' &&
            <>
              {lookbackComponent}
            </>
          } 
        </>
      }
    </>
  )

  const volumePerWorkoutComponent = (
    <>
      {dataVisual === 'graph' &&
        <>
          {lookbackComponent}
        </>
      }
    </>
  )

  const historyComponent = (
    <>
      <View style={[styles.row, {marginTop: 10}]}>
        <TouchableOpacity
          onPress={() => updateHistoryListIndex(historyListIndex - 1)}
          style={[commonStyles.thinTextButton, {width: 50}]}
        >
          <Text style={styles.text}>newer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => updateHistoryListIndex(historyListIndex + 1)}
          style={[commonStyles.thinTextButton, {width: 50}]}
        >
          <Text style={styles.text}>older</Text>
        </TouchableOpacity>
      </View>
      <Text 
        style={[styles.text, {alignSelf: 'center', margin: 5}]}
      >
        Workout on {timestampToDateStr(exerciseData["history"][historyListIndex].timestamp)}
      </Text>
    </>
  )

  const get3DGraphPoints = (): Point3D[] => {
    const points: Point3D[] = [];
    for (const data of exerciseData["reps_sets_weight"]) {
      points.push({
        x: data.num_sets,
        y: data.weight,
        z: data.reps
      })
    }
    return points;
  };

  const points3D = get3DGraphPoints();
  const repsSetsWeightComponent = (
    <>
      <View style={styles.row}>
        <Text style={{color: 'blue'}}>reps</Text>
        <Text style={{color: 'orange'}}>sets</Text>
        <Text style={{color: 'green'}}>weight</Text>
      </View>
      <Text style={styles.text}>data is normalised</Text>
      {points3D.length < 0 ? 
        <Text style={styles.text}>not enough data</Text>
      :
        <View style={{height: 350}}>
          <ThreeAxisGraph points={get3DGraphPoints()}/>
        </View>
      }
    </>
  )

  const componentMap: Record<DataOption, JSX.Element> = {
    'n_rep_max': nRepMaxComponent,
    'volume_per_workout': volumePerWorkoutComponent,
    'history': historyComponent,
    'reps_sets_weight': repsSetsWeightComponent
  }

  // todo, implement this (useEffect?)
  const [graphScale, setGraphScale] = useState<LineGraphScale>('time');

  useEffect(() => {
    if (dataOptionValue === 'n_rep_max') {      
      setGraphScale(nRepMaxOptionValue === 'all_time' ? 'value' : 'time');
    } else if (dataOptionValue === 'history') {
      setGraphScale('value');
    } else if (dataOptionValue === 'volume_per_workout') {
      setGraphScale('time')
    } else if (dataOptionValue === 'reps_sets_weight') {

    }
  }, [dataOptionValue, nRepMaxOptionValue]);

  const dataVisualMap: Record<DataVisual, JSX.Element> = {
    'graph': <LineGraph points={getPoints()} scale_type={graphScale}/>,
    'table': getTable()
  }

  return (
    <View>
      <View>
        <Text style={styles.text}>Choose a data type:</Text>
        {useDropdown(dataOptions, dataOptionValue, setDataOptionValue)}
      </View>
      {componentMap[dataOptionValue]}
      {dataOptionValue !== 'reps_sets_weight' &&
        <>
          {dataVisualMap[dataVisual]}
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
  },
  tableContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  gridText: {
    color: 'white',
    textAlign: 'center',
  },
  dropdownButton: {
    backgroundColor: 'black',
    width: 200,
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 5,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  dropdownContainerStyle: {
    backgroundColor: 'black',
    maxHeight: 250,
  },
  dropdownText: {
    color: 'white',
    fontSize: 14
  },
  historyContainer: {
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
  historyTableContainer: {
    width: 200,
    minHeight: 100,
    justifyContent: 'center',
  }
});