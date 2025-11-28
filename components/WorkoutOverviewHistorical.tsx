import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal, Switch } from "react-native";
import { commonStyles } from "@/styles/commonStyles";
import WorkoutFinishOptions from "./WorkoutFinishOptions";
import { useAtom, useAtomValue } from "jotai";
import { loadablePreviousWorkoutStatsAtom, loadingPreviousWorkoutStatsAtom, muscleGroupToTargetsAtom, muscleTargetoGroupAtom, previousWorkoutStatsAtom, userDataAtom, WorkoutExercise, workoutExercisesAtom, workoutStartTimeAtom } from "@/store/general";
import { calcBodyWeight, calcValidWeight, fetchWrapper, getValidSets } from "@/middleware/helpers";
import MuscleGroupSvg from "./MuscleGroupSvg";
import { filterTimeSeries, timeSpanToMs, useDropdown } from "./ExerciseData";
import { TimeSpanOption, TimeSpanOptionObject } from "./ExerciseData";
import { Dropdown } from "react-native-element-dropdown";
import DataTable from "./DataTable";
import LineGraph, { LineGraphPoint } from "./LineGraph";
import { OptionsObject } from "./ChooseExerciseModal";
import LoadingScreen from "@/app/loading";

interface WorkoutOverviewHistoricalProps {}

type HistoryComparisonType = 'workout' | 'muscles';
interface HistoryComparisonOption {
  label: string
  value: HistoryComparisonType
}

type TotalsContributionType = 'volume' | 'num_sets' | 'reps' | 'duration' | 'num_exercises';
interface TotalsContributionTypeOption {
  label: string
  value: TotalsContributionType
}

type ContributionType = 'volume' | 'num_sets' | 'reps';
interface ContributionTypeOption {
  label: string
  value: ContributionType
}

export default function WorkoutOverviewHistorical(props: WorkoutOverviewHistoricalProps) {
  const exercises = useAtomValue(workoutExercisesAtom); 
  const muscleGroupToTargets = useAtomValue(muscleGroupToTargetsAtom);
  const [overviewHistoricalStats, setOverviewHistoricalStats] = useAtom(previousWorkoutStatsAtom);
  const loadableOverviewHistoricalStats = useAtomValue(loadablePreviousWorkoutStatsAtom);
  const workoutStartTime = useAtomValue(workoutStartTimeAtom);
  const loadingPreviousWorkoutStats = useAtomValue(loadingPreviousWorkoutStatsAtom);
  const userData = useAtomValue(userDataAtom);

  const historyComparisonOptions: HistoryComparisonOption[] = [
    { label: 'workout totals', value: 'workout' },
    { label: 'muscles', value: 'muscles' },
  ]
  const [historyComparisonValue, setHistoryComparisonValue] = useState<HistoryComparisonType>('workout')

  const muscleGroupOptions: OptionsObject[] = Object.keys(muscleGroupToTargets).map(group => (
    { label: group, value: group }
  ));
  const [muscleGroupValue, setMuscleGroupValue] = useState<string>(muscleGroupOptions[0].value);

  const muscleTargetOptions: OptionsObject[] = ((): OptionsObject[] => {
    const options: OptionsObject[] = [{ label: 'all targets', value: 'all' }];
    for (const target of muscleGroupToTargets[muscleGroupValue] ?? []) {
      options.push({
        label: target,
        value: target
      })
    }
    return options;
  })();
  const [muscleTargetValue, setMuscleTargetValue] = useState<string>('all');

  const totalsContributionOptions: TotalsContributionTypeOption[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'num_sets' },
    { label: 'reps', value: 'reps' },
    { label: 'duration', value: 'duration' },
    { label: '# exercises', value: 'num_exercises' },
  ]
  const [totalsContributionValue, setTotalsContributionValue] = useState<TotalsContributionType>('volume');

  const contributionTypeOptions: ContributionTypeOption[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'num_sets' },
    { label: 'reps', value: 'reps' },
  ]
  const [contributionTypeValue, setContributionTypeValue] = useState<ContributionType>('volume');

  const timeSpanOptions: TimeSpanOptionObject[] = [
    { label: 'week', value: 'week' },
    { label: 'month', value: 'month' },
    { label: '3 months', value: '3_months' },
    { label: '6 months', value: '6_months' },
    { label: 'year', value: 'year' },
    { label: 'all', value: 'all' },
  ]
  const [timeSpanOptionValue, setTimeSpanOptionValue] = useState<TimeSpanOption>('month');

  const [workoutDuration, setWorkoutDuration] = useState<number>(0);

  useEffect(() => {
    if (workoutStartTime === null) return;

    const updateDuration = () => {
      setWorkoutDuration(Math.floor((Date.now() - workoutStartTime) / 1000));
    };

    updateDuration();
    const interval = setInterval(updateDuration, 5000);
    return () => clearInterval(interval);

  }, [workoutStartTime])

  const handleChooseMuscleGroup = (value: string) => {
    setMuscleGroupValue(value);
    setMuscleTargetValue('all');
  };

  const historyDataContributionsMap: Record<HistoryComparisonType, JSX.Element> = {
    workout: useDropdown(totalsContributionOptions, totalsContributionValue, setTotalsContributionValue),
    muscles: useDropdown(contributionTypeOptions, contributionTypeValue, setContributionTypeValue),
  };

  const getHistoryPoints = (): LineGraphPoint[] => {
    try {
      let points: LineGraphPoint[] = [];
      if (historyComparisonValue === 'workout') {
        points = getHistoryWorkoutPoints();
      } else if (muscleTargetValue === 'all') {
        points = getHistoryMuscleGroupPoints();
      } else {
        points = getHistoryMuscleTargetPoints();
      }
      return filterTimeSeries(points, timeSpanOptionValue);
    } catch (error) {
      console.log(`getHistoryPoints error: ${error}`)
      return [];
    }
  };

  const getHistoryWorkoutPoints = (): LineGraphPoint[] => {
    const points: LineGraphPoint[] = [];
    for (const workout of overviewHistoricalStats) {
      let yValue = null;
      switch (totalsContributionValue) {
        case 'volume':
          yValue = workout.totals.volume;
          break;
        case 'reps':
          yValue = workout.totals.reps;
          break;
        case 'num_sets':
          yValue = workout.totals.num_sets;
          break;
        case 'duration':
          yValue = workout.duration;
          break;
        case 'num_exercises':
          yValue = workout.num_exercises;
          break;
      }
      points.push({
        x: Math.floor(workout.started_at),
        y: yValue
      })
    }
    return points;
  };

  const getHistoryMuscleGroupPoints = (): LineGraphPoint[] => {
    const points: LineGraphPoint[] = [];
    for (const stats of overviewHistoricalStats) {
      if (!(muscleGroupValue in stats.muscles)) continue; 
      points.push({
        x: Math.floor(stats.started_at),
        y: Object.values(stats.muscles[muscleGroupValue]).reduce((acc, val) => acc + val[contributionTypeValue], 0)
      })
    }
    return points;
  };

  const getHistoryMuscleTargetPoints = (): LineGraphPoint[] => {
    const points: LineGraphPoint[] = [];
    for (const stats of overviewHistoricalStats) {
      if (!(muscleGroupValue in stats.muscles)) continue; 
      for (const [targetName, targetStats] of Object.entries(stats.muscles[muscleGroupValue])) {
        if (targetName != muscleTargetValue) continue;
        points.push({
          x: Math.floor(stats.started_at),
          y: targetStats[contributionTypeValue]
        })
      }
    }
    return points;
  };

  const getBarValue = (): number => {
    try {
        if (historyComparisonValue === 'workout') {
        return getBarValueWorkout();
      }
      return getBarValueMuscle();
    } catch (error) {
      console.log(error);
      return 0;
    }
  };

  const getBarValueWorkout = (): number => {
    if (totalsContributionValue === 'duration') {
      return workoutDuration;
    }

    let numValidExercises = 0
    let value = 0
    for (const exercise of exercises) {
      const validSets = getValidSets(exercise);
      if (validSets.length > 0) numValidExercises++; 

      for (const set_data of validSets) {
        if (totalsContributionValue === 'volume') {
          const weight = calcValidWeight(exercise, userData, set_data);
          value += set_data.reps * weight * set_data.num_sets;
        } else if (totalsContributionValue === 'reps') {
          value += set_data.reps * set_data.num_sets;
        } else {
          value += set_data.num_sets;
        }
      }
    }

    if (totalsContributionValue === 'num_exercises') {
      return numValidExercises;
    }
    return value;
  };

  const getBarValueMuscle = (): number => {
    let value = 0;
    for (const exercise of exercises) {
      const valid_sets = getValidSets(exercise);
      if (valid_sets.length === 0) continue;

      let maxRatio = -1;
      for (const muscle_data of exercise.muscle_data) {
        if (muscle_data.group_name !== muscleGroupValue) continue;
        for (const target_data of muscle_data.targets) {
          // if (historyComparisonValue === 'muscle_target' && target_data.target_name != muscleTargetValue) continue;
          if (muscleTargetValue !== 'all' && target_data.target_name != muscleTargetValue) continue;
          if (target_data.ratio <= maxRatio) continue;
          maxRatio = target_data.ratio;
        }
      }

      if (maxRatio === -1) continue;

      for (const set_data of getValidSets(exercise)) {
        if (contributionTypeValue === 'volume') {
          const weight = calcValidWeight(exercise, userData, set_data);
          value += set_data.reps * weight * set_data.num_sets * (maxRatio / 10);
        } else if (contributionTypeValue === 'reps') {
          value += set_data.reps * set_data.num_sets;
        } else {
          value += set_data.num_sets;
        }
      }
    }

    return value;
  };

  if (loadableOverviewHistoricalStats.state === 'loading' || loadingPreviousWorkoutStats) {
    return <LoadingScreen />
  } else if (loadableOverviewHistoricalStats.state === 'hasError') {
    console.log('error getting overview historical stats from storage');
    setOverviewHistoricalStats([]);
  }

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

  return (
    <>
      <Text style={styles.text}>Choose a comparison:</Text>
      {useDropdown(historyComparisonOptions, historyComparisonValue, setHistoryComparisonValue)}
      {historyComparisonValue !== 'workout' &&
        <>
          <Text style={styles.text}>Choose a muscle group:</Text>
          {useDropdown(muscleGroupOptions, muscleGroupValue, handleChooseMuscleGroup)}
          <Text style={styles.text}>Choose a muscle target:</Text>
          {useDropdown(muscleTargetOptions, muscleTargetValue, setMuscleTargetValue)}
        </>
      }
      <Text style={styles.text}>Choose a contribution type:</Text>
      {historyDataContributionsMap[historyComparisonValue]}
      {lookbackComponent}
      <LineGraph points={getHistoryPoints()} scale_type="time" barValue={getBarValue()}/>
    </>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
    width: '100%',
  },
  modalContainer: {
    backgroundColor: 'black',
    padding: 15,
    // alignItems: 'center',
    elevation: 5,
    borderColor: 'red',
    borderTopWidth: 2,
    maxHeight: '95%',
    width: '100%',
  },
  dataContainer: {
    minHeight: 300,
    padding: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    justifyContent: 'center',
    width: 50,
    alignSelf: 'center',
    textAlign: 'center',
    alignItems: 'center'
  },
  switchContainer: {
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center',
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
  dataTableContainer: {
    height: 50,
    padding: 5,
  }
})