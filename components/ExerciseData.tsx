import * as React from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, ScrollView, FlatList, StyleProp, ViewStyle } from "react-native"
import { exercisesHistoricalDataAtom, WorkoutExercise, ExerciseHistoryData, loadableExercisesHistoricalDataAtom, emptyExerciseHistoricalData, HistoryData, ExerciseListItem } from "@/store/general"
import ThreeAxisGraph, { Point3D } from './ThreeAxisGraph'
import { useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import LineGraph, {LineGraphPoint, LineGraphScale} from './LineGraph';
import { commonStyles } from '@/styles/commonStyles';
import { Dropdown } from 'react-native-element-dropdown';
import CarouselDataTable from './CarouselDataTable';
import { fetchWrapper, getValidSets } from '@/middleware/helpers';
import LoadingScreen from '@/app/loading';
import { OptionsObject } from './ChooseExerciseModal';
import { timestampToDateStr } from '../middleware/helpers'
import DataTable, { TableData } from './DataTable';
import Feather from '@expo/vector-icons/Feather';

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

export type VolumeTimespan = 'week' | 'month' | '3_months' | '6_months' | 'year';
interface VolumeTimespanObject {
  label: string
  value: VolumeTimespan
}

export type HistoryGraphOption = 'weight_per_set' | 'volume_per_set' | 'weight_per_rep';
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
      autoScroll={false}
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

interface ExerciseDataProps {
  exercise: WorkoutExercise
}

// todo include bar graph and current points for exercise data to compare to previous
export default function ExerciseData(props: ExerciseDataProps) {
  const {exercise} = props;

  const [exercisesHistoricalData, setExercisesHistoricalData] = useAtom(exercisesHistoricalDataAtom);
  const loadableExercisesHistoricalData = useAtomValue(loadableExercisesHistoricalDataAtom);

  const exerciseHistory: ExerciseHistoryData = exercisesHistoricalData[exercise.id] ?? emptyExerciseHistoricalData;

  const dataOptions: DataOptionObject[] = [
    { label: 'n rep max', value: 'n_rep_max' },
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

  const nRepMaxHistoryOptions: OptionsObject[] = ((): OptionsObject[] => {
    const options: OptionsObject[] = [];
    for (const rep of Object.keys(exerciseHistory.n_rep_max.history)) {
      options.push({ label: rep, value: rep });
    }
    return options;
  })();
  const [nRepMaxHistoryOptionValue, setNRepMaxHistoryOptionValue] = useState<string | null>(nRepMaxHistoryOptions[0]?.value ?? null);

  useEffect(() => {
    setNRepMaxHistoryOptionValue(nRepMaxHistoryOptions[0]?.value ?? null);
  }, [exerciseHistory]);

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
    setDataVisual(dataVisual === 'graph' ? 'table' : 'graph');
  }

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
    if (newIndex < 0 || newIndex >= (exerciseHistory?.history?.length ?? 0)) return;
    setHistoryListIndex(newIndex);
  };

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
            lookbackComponent
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
      <View style={{flexDirection: 'row', marginTop: 10, justifyContent: 'space-around'}}>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableOpacity
            onPress={() => setHistoryListIndex(0)}
            style={[commonStyles.thinTextButton, {width: 30}]}
          >
            <Feather name="chevrons-left" size={14} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => updateHistoryListIndex(historyListIndex - 1)}
            style={[commonStyles.thinTextButton, {width: 30, marginLeft: 4}]}
          >
            <Feather name="chevron-left" size={14} color="white" />
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableOpacity
            onPress={() => updateHistoryListIndex(historyListIndex + 1)}
            style={[commonStyles.thinTextButton, {width: 30}]}
          >
            <Feather name="chevron-right" size={14} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setHistoryListIndex(exerciseHistory.history.length - 1)}
            style={[commonStyles.thinTextButton, {width: 30, marginLeft: 4}]}
          >
            <Feather name="chevrons-right" size={14} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      {exerciseHistory["history"][historyListIndex]?.started_at &&
        <Text 
          style={[styles.text, {alignSelf: 'center', margin: 5}]}
        >
          Workout on {timestampToDateStr(exerciseHistory["history"][historyListIndex]?.started_at)}
        </Text>
      }
    </>
  )

  // const get3DGraphPoints = (): Point3D[] => {
  //   if (exerciseHistory === undefined) return [];
  //   return [];

  //   // const points: Point3D[] = [];
  //   // for (const data of exerciseHistory["reps_sets_weight"]) {
  //   //   points.push({
  //   //     x: data.num_sets,
  //   //     y: data.weight,
  //   //     z: data.reps
  //   //   })
  //   // }
  //   // return points;
  // };

  // const points3D = get3DGraphPoints();
  
  const repsSetsWeightComponent = (
    <>
      <View style={styles.row}>
        <Text style={{color: 'blue'}}>reps</Text>
        <Text style={{color: 'orange'}}>sets</Text>
        <Text style={{color: 'green'}}>weight</Text>
      </View>
      <Text style={styles.text}>data is normalised</Text>
      {exerciseHistory.reps_sets_weight.length < 0 ? 
        <Text style={styles.text}>not enough data</Text>
      :
        <View style={{height: 350}}>
          <ThreeAxisGraph points={exerciseHistory.reps_sets_weight}/>
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
            y: set_data.weight ?? 0,
          });
          repNum++;
        }
      }
    }
    return points;

  }; 

  // todo: filter time series points
  const getPoints = (): LineGraphPoint[] => {
    let points: LineGraphPoint[] = [];
    let filterSeries = false;
    try {
      if (dataOptionValue === 'n_rep_max') {
        if (nRepMaxOptionValue === 'all_time') {
          points = exerciseHistory[dataOptionValue][nRepMaxOptionValue].graph;
        } else if (nRepMaxHistoryOptionValue !== null) {
          points = exerciseHistory[dataOptionValue][nRepMaxOptionValue][Number(nRepMaxHistoryOptionValue)].graph;
          filterSeries = true;
        }
      } else if (dataOptionValue === 'volume') {
        if (volumeOptionValue === 'workout') {
          points = exerciseHistory[dataOptionValue][volumeOptionValue].graph;
          filterSeries = true;
        } else {
          points = exerciseHistory[dataOptionValue][volumeOptionValue][volumeTimespanOptionValue].graph;
        }
      } else if (dataOptionValue === 'history') {
        points = exerciseHistory[dataOptionValue][historyListIndex].graph[historyGraphOptionValue];
      }
    } catch (error) {
      console.log(error);
    }

    if (filterSeries) {
      points = filterTimeSeries(points, timeSpanOptionValue);
    }

    return points;
  };

  const getTableData = (): TableData<string[], string | number> => {
    let tableData: TableData<string[], string | number> = {
      headers: [],
      rows: []
    };
    try {
      if (dataOptionValue === 'n_rep_max') {
        if (nRepMaxOptionValue === 'all_time') {
          tableData = exerciseHistory[dataOptionValue][nRepMaxOptionValue].table;
        } else if (nRepMaxHistoryOptionValue !== null) {
          tableData = exerciseHistory[dataOptionValue][nRepMaxOptionValue][Number(nRepMaxHistoryOptionValue)].table;
        }
      } else if (dataOptionValue === 'volume') {
        if (volumeOptionValue === 'workout') {
          tableData = exerciseHistory[dataOptionValue][volumeOptionValue].table;
        } else {
          tableData = exerciseHistory[dataOptionValue][volumeOptionValue][volumeTimespanOptionValue].table;
        }
      } else if (dataOptionValue === 'history') {
        tableData = exerciseHistory[dataOptionValue][historyListIndex].table;
      }
    } catch (error) {
      console.log(error);
    }

    return {
      'headers': tableData.headers,
      'rows': tableData.rows
    };
  };

  const dataVisualMap: Record<DataVisual, JSX.Element> = {
    'graph': <LineGraph points={getPoints()} scale_type={graphScale} barValue={getBarValue()} currentPoints={getCurrentPoints()}/>,
    'table': <DataTable tableData={getTableData()} />
  }

  if (loadableExercisesHistoricalData.state === 'loading') {
    return <LoadingScreen />
  } else if (loadableExercisesHistoricalData.state === 'hasError') {
    console.log('error loading historical data from storage');
    setExercisesHistoricalData({});
  }

  if (exerciseHistory.history.length === 0) {
    return (
      <View
        style={{
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={styles.text}>
          this exercise has no historical data
        </Text>
      </View>
    )
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