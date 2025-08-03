import * as React from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, ScrollView, FlatList, StyleProp, ViewStyle } from "react-native"
import { exercisesHistoricalDataAtom, WorkoutExercise, ExerciseHistoricalData, TimestampValue, ExerciseHistory, loadableExercisesHistoricalDataAtom } from "@/store/general"
import ThreeAxisGraph, { Point3D } from './ThreeAxisGraph'
import { useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import LineGraph, {LineGraphPoint, LineGraphScale} from './LineGraph';
import { commonStyles } from '@/styles/commonStyles';
import { Dropdown } from 'react-native-element-dropdown';
import CarouselDataTable from './CarouselDataTable';
import { fetchWrapper, getValidSets } from '@/middleware/helpers';
import LoadingScreen from '@/app/loading';

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

export type TimeSpanOption = 'week' | 'month' | '3_months' | '6_months' | 'year' | 'all'
export interface TimeSpanOptionObject {
  label: string
  value: TimeSpanOption
}

type DataOption = 'n_rep_max' | 'reps_sets_weight' | 'volume' | 'history';
interface DataOptionObject {
  label: string
  value: DataOption
}

type NRepMaxDataOption = 'all_time' | 'history';
interface NRepMaxDataOptionObject {
  label: string
  value: NRepMaxDataOption
}

type VolumeOption = 'workout' | 'timespan';
interface VolumeOptionObject {
  label: string
  value: VolumeOption
}

type VolumeTimespan = 'week' | 'month' | '3_months' | '6_months' | 'year';
interface VolumeTimespanObject {
  label: string
  value: VolumeTimespan
}

type HistoryGraphOption = 'weight_per_set' | 'volume_per_set' | 'weight_per_rep';
interface HistoryGraphObject {
  label: string
  value: HistoryGraphOption
}

export const useDropdown = (options: any, value: any, setter: any, disabled: boolean = false, style?: StyleProp<ViewStyle>): JSX.Element => {
  return (
    <Dropdown 
      data={options}
      value={value}
      labelField="label"
      valueField="value"
      onChange={item => {setter(item.value)}}
      style={[styles.dropdownButton, style]}
      selectedTextStyle={disabled ? {color: 'red', fontSize: 14} : styles.dropdownText}
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
      disable={disabled}
    />
  )
};

export const timeSpanToMs: Record<TimeSpanOption, number> = {
  'week': 7 * 24 * 60 * 60 * 1000,
  'month': 30 * 24 * 60 * 60 * 1000,
  '3_months': 3 * 30 * 24 * 60 * 60 * 1000,
  '6_months': 6 * 30 * 24 * 60 * 60 * 1000,
  'year': 365 * 24 * 60 * 60 * 1000,
  'all': 0,
}

export const filterTimeSeries = (points: LineGraphPoint[], timeSpanOptionValue: TimeSpanOption): LineGraphPoint[] => {
  if (timeSpanOptionValue === 'all') return points;
  return points.filter(point => {
    return point.x >= (Date.now() - timeSpanToMs[timeSpanOptionValue])
  });
}

export default function ExerciseData(props: ExerciseDataProps) {
  const {exercise, exerciseIndex} = props;

  const [exercisesHistoricalData, setExercisesHistoricalData] = useAtom(exercisesHistoricalDataAtom);
  const [exerciseData, setExerciseData] = useState<ExerciseHistoricalData>(exercisesHistoricalData[exercise.id]);
  const loadableExercisesHistoricalData = useAtomValue(loadableExercisesHistoricalDataAtom);

  const dataOptions: DataOptionObject[] = [
    { label: 'rep max', value: 'n_rep_max' },
    { label: 'volume', value: 'volume' },
    { label: 'history', value: 'history' },
    { label: '3D plot', value: 'reps_sets_weight' },
  ]
  const [dataOptionValue, setDataOptionValue] = useState<DataOption>('n_rep_max');

  const nRepMaxOptions: NRepMaxDataOptionObject[] = [
    { label: 'all time', value: 'all_time' },
    { label: 'history', value: 'history' },
  ]
  const [nRepMaxOptionValue, setNRepMaxOptionValue] = useState<NRepMaxDataOption>('all_time');

  const [nRepMaxHistoryOptions, setNRepMaxHistoryOptions] = useState<any[]>([]);
  const [nRepMaxHistoryOptionValue, setNRepMaxHistoryOptionValue] = useState<string | null>(nRepMaxHistoryOptions[0]?.value ?? null);

  useEffect(() => {
    try {
      const temp: any[] = [];
      for (const key in exerciseData['n_rep_max']['history']) {
        temp.push({
          label: key, value: key
        })
      }
      setNRepMaxHistoryOptions(temp);
      setNRepMaxHistoryOptionValue(temp[0]?.value ?? null);
    } catch (error) {
      console.log(error)
      setNRepMaxHistoryOptions([]);
    }
  }, [exerciseData]);

  const volumeOptions: VolumeOptionObject[] = [
    { label: 'workout', value: 'workout' },
    { label: 'timespan', value: 'timespan' },
  ]
  const [volumeOptionValue, setVolumeOptionValue]= useState<VolumeOption>('workout');

  const volumeTimespanOptions: VolumeTimespanObject[] = [
    { label: 'week', value: 'week' },
    { label: 'month', value: 'month' },
    { label: '3 months', value: '3_months' },
    { label: '6 months', value: '6_months' },
    { label: 'year', value: 'year' },
  ]
  const [volumeTimespanOptionValue, setVolumeTimespanOptionValue]= useState<VolumeTimespan>('week'); 

  const timeSpanOptions: TimeSpanOptionObject[] = [
    { label: 'week', value: 'week' },
    { label: 'month', value: 'month' },
    { label: '3 months', value: '3_months' },
    { label: '6 months', value: '6_months' },
    { label: 'year', value: 'year' },
    { label: 'all', value: 'all' },
  ]
  const [timeSpanOptionValue, setTimeSpanOptionValue] = useState<TimeSpanOption>('month');

  const [dataVisual, setDataVisual] = useState<DataVisual>('graph');

  const [historyListIndex, setHistoryListIndex] = useState<number>(0);

  const historyGraphOptions: HistoryGraphObject[] = [
    { label: 'volume per set', value: 'volume_per_set' },
    { label: 'weight per set', value: 'weight_per_set' },
    { label: 'weight per rep', value: 'weight_per_rep' },
  ]
  const [historyGraphOptionValue, setHistoryGraphOptionValue] = useState<HistoryGraphOption>('volume_per_set');

  const handleSwitchDataVisual = () => {
    setDataVisual(dataVisual === 'graph' ? 'table' : 'graph')
  }

  const getPoints = (): LineGraphPoint[] => {
    try {
      switch (dataOptionValue) {
        case 'n_rep_max':
          return getNRepMaxPoints();
        case 'volume':
          return getVolumePoints();
        case 'history':
          return getHistoryPoints();
        default:
          return [];
      }
    } catch (error) {
      console.log(error);
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
    return filterTimeSeries(points, timeSpanOptionValue);
  };

  const getVolumePoints = (): LineGraphPoint[] => {
    switch (volumeOptionValue) {
      case 'workout':
        return getVolumePerWorkoutPoints();
      case 'timespan':
        return getVolumePerBucketPoints();
    }
  };

  const getVolumePerWorkoutPoints = (): LineGraphPoint[] => {
    const points: LineGraphPoint[] = [];
    for (const point of exerciseData["volume"]) {
      points.push({
        "x": Math.floor((point as TimestampValue)["timestamp"]),
        "y": (point as TimestampValue)["value"]
      })
    }
    return filterTimeSeries(points, timeSpanOptionValue);
  };

  const getVolumePerBucketPoints = (): LineGraphPoint[] => {
    const {bucketData, now, bucketMs} = getBucketData();

    const points: LineGraphPoint[] = [];
    for (const [bucket, volume] of Object.entries(bucketData)) {
      points.push({
        x: now - (parseFloat(bucket) * bucketMs) - bucketMs / 2,
        y: volume
      })
    }
    return points;
  };

  const getBucketData = () => {
    const now = Date.now();
    const bucketMs = timeSpanToMs[volumeTimespanOptionValue];
    const bucketData: Record<number, number> = {};
    
    for (const data of exerciseData.volume) {
      const bucket = Math.floor((now - data.timestamp) / bucketMs);
      if (!bucketData.hasOwnProperty(bucket)) {
        bucketData[bucket] = 0;
      }
      bucketData[bucket] += data.value;
    }
    
    return {
      bucketData,
      now,
      bucketMs
    };
  };

  const getHistoryPoints = (): LineGraphPoint[] => {
    if (historyGraphOptionValue !== 'weight_per_rep') {
      return getHistoryPointsSets();
    } else {
      return getHistoryPointsReps();
    }
  };

  const getHistoryPointsSets = (): LineGraphPoint[] => {
    const data = exerciseData["history"][historyListIndex];
    if (data === undefined) return [];

    const points: LineGraphPoint[] = [];
    let set_num = 1;
    data.set_data.map(set_data => {
      for (let i = 0; i < set_data.num_sets; i++) {
        let yValue = set_data.weight;
        if (historyGraphOptionValue === 'volume_per_set') {
          yValue *= set_data.reps
        } 
        points.push({
          "x": set_num,
          "y": yValue
        })
        set_num++;
      }
    });

    return points;
  };

  const getHistoryPointsReps = (): LineGraphPoint[] => {
    const data = exerciseData["history"][historyListIndex];
    if (data === undefined) return [];

    const points: LineGraphPoint[] = [];
    let rep_num = 1;
    data.set_data.map(set_data => {
      for (let i = 0; i < set_data.num_sets; i++) {
        for (let j = 0; j < set_data.reps; j++) {
          points.push({
            "x": rep_num,
            "y": set_data.weight
          })
          rep_num++;
        }
      }
    });

    return points;
  };

  const getTable = (): JSX.Element => {
    let headers = [];
    let rows = [];

    try {
      switch (dataOptionValue) {
        case 'n_rep_max':
          [headers, rows] = getNRepMaxTable();
          break;
        case 'volume':
          [headers, rows] = getVolumeTable();
          break;
        case 'history':
          [headers, rows] = getHistoryTable();
          break;
        default:
          return (<></>); 
      }
    } catch (error) {
      console.log(error);
      return (<></>);
    }

    // rows = rows.slice().reverse();

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
    rows.reverse();
    
    return [headers, rows];
  };

  const getVolumeTable = (): [string[], (string | number)[][]] => {
    switch (volumeOptionValue) {
      case 'workout':
        return getVolumePerWorkoutTable();
      case 'timespan':
        return getVolumePerTimespanTable();
    }
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
    rows.reverse();

    return [headers, rows];
  };

  const getVolumePerTimespanTable = (): [string[], (string | number)[][]] => {
    const headers = ['Volume', 'Date Range'];
    let rows: (number | string)[][] = [];
    
    const {bucketData, now, bucketMs} = getBucketData();
    for (const [bucket, volume] of Object.entries(bucketData)) {
      const date1 = now - parseInt(bucket) * bucketMs;
      const date2 = now - parseInt(bucket) * bucketMs - bucketMs;
      rows.push([
        volume,
        `${timestampToDateStr(date2)}-${timestampToDateStr(date1)}`
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
    if (newIndex < 0 || newIndex >= (exerciseData?.history?.length ?? 0)) return;
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
      <View>
        <Text style={styles.text}>Choose a view:</Text>
        {useDropdown(volumeOptions, volumeOptionValue, setVolumeOptionValue)}
      </View>
      {(volumeOptionValue === 'workout' && dataVisual === 'graph') && 
        lookbackComponent
      }
      {volumeOptionValue === 'timespan' && 
        <View>
          <Text style={styles.text}>Choose a timespan bucket:</Text>
          {useDropdown(volumeTimespanOptions, volumeTimespanOptionValue, setVolumeTimespanOptionValue)}
        </View>
      }
    </>
  )

  const historyComponent = (
    <>
      {dataVisual === 'graph' &&
        <View>
          <Text style={styles.text}>Choose data accumulation:</Text>
          {useDropdown(historyGraphOptions, historyGraphOptionValue, setHistoryGraphOptionValue)}
        </View>
      }
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
      {exerciseData !== undefined &&
        <Text 
          style={[styles.text, {alignSelf: 'center', margin: 5}]}
        >
          Workout on {timestampToDateStr(exerciseData["history"][historyListIndex].timestamp)}
        </Text>
      }
    </>
  )

  const get3DGraphPoints = (): Point3D[] => {
    if (exerciseData === undefined) return [];
    
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
    'volume': volumePerWorkoutComponent,
    'history': historyComponent,
    'reps_sets_weight': repsSetsWeightComponent
  }

  const [graphScale, setGraphScale] = useState<LineGraphScale>('time');

  useEffect(() => {
    if (dataOptionValue === 'n_rep_max') {      
      setGraphScale(nRepMaxOptionValue === 'all_time' ? 'value' : 'time');
    } else if (dataOptionValue === 'history') {
      setGraphScale('value');
    } else if (dataOptionValue === 'volume') {
      setGraphScale('time')
    } else if (dataOptionValue === 'reps_sets_weight') {

    }
  }, [dataOptionValue, nRepMaxOptionValue]);

  const getBarValue = (): number | null => {
    if (dataOptionValue !== 'volume') return null;
    const validSets = getValidSets(exercise);
    if (validSets.length === 0) return null;
    let volume = 0;
    for (const set_data of validSets) {
      volume += set_data.reps! * set_data.weight! * set_data.num_sets!;
    }
    return volume;
  };

  const getCurrentPoints = (): LineGraphPoint[] => {
    if (dataOptionValue !== 'history') return [];
    if (historyGraphOptionValue !== 'weight_per_rep') {
      return getCurrentPointsSets();
    } else {
      return getCurrentPointsReps();
    }
  };

  const getCurrentPointsSets = (): LineGraphPoint[] => {
    const points: LineGraphPoint[] = [];
    let setNum = 1;
    for (const set_data of getValidSets(exercise)) {
      for (let i = 0; i < set_data.num_sets; i++) {
        let yValue = set_data.weight!;
        if (historyGraphOptionValue === 'volume_per_set') {
          yValue *= set_data.reps!
        }
        points.push({
          x: setNum,
          y: yValue,
        })
        setNum++;
      }
    }
    return points;
  };

  const getCurrentPointsReps = (): LineGraphPoint[] => {
    const points: LineGraphPoint[] = [];
    let repNum = 1; 
    for (const set_data of getValidSets(exercise)) {
      for (let i = 0; i < set_data.num_sets; i++) {
        for (let j = 0; j < set_data.reps!; j++) {
          points.push({
            x: repNum,
            y: set_data.weight,
          });
          repNum++;
        }
      }
    }
    return points;

  }; 

  const dataVisualMap: Record<DataVisual, JSX.Element> = {
    'graph': <LineGraph points={getPoints()} scale_type={graphScale} barValue={getBarValue()} currentPoints={getCurrentPoints()}/>,
    'table': getTable()
  }

  const loadExerciseData = () => { 
    if (loadableExercisesHistoricalData.state === 'hasData') {
      const temp = exercisesHistoricalData[exercise.id];
      if (temp !== undefined) {
        setExerciseData(temp);
        return;
      }
    }

    if (loadableExercisesHistoricalData.state === 'loading' || exerciseData !== undefined) return;

    const handleRefreshHistory = async () => {
      const data = await fetchWrapper({
        route: 'exercise/history',
        method: 'GET',
        params: {exercise_id: exercise.id}
      })
      setExercisesHistoricalData(prev => ({
        ...prev,
        [exercise.id]: data
      }))
    }

    handleRefreshHistory();
  };

  useEffect(() => {
    loadExerciseData();
  }, [loadableExercisesHistoricalData.state, exerciseData])

  if (exerciseData === undefined) {
    loadExerciseData();
    return <LoadingScreen />
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
});