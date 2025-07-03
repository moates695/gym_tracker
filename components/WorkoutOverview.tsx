import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal, Switch } from "react-native";
import { commonStyles } from "@/styles/commonStyles";
import WorkoutFinishOptions from "./WorkoutFinishOptions";
import { useAtom, useAtomValue } from "jotai";
import { muscleGroupToTargetsAtom, muscleTargetoGroupAtom, WorkoutExercise, workoutExercisesAtom } from "@/store/general";
import { fetchWrapper, getValidSets } from "@/middleware/helpers";
import MuscleGroupSvg from "./MuscleGroupSvg";
import { useDropdown } from "./ExerciseData";
import { TimeSpanOption, TimeSpanOptionObject } from "./ExerciseData";
import { Dropdown } from "react-native-element-dropdown";
import DataTable from "./DataTable";

// get historical data when workout is started
// for all previous workouts get
//    graphing data
//      volume, sets, reps per group/target
//      total volume (implicit), number of exercises
//    comparison data
//      paginated previous workouts?
// i want to be able to
//    compare the volume (+ other data) of muscle groups/targets of current to previous
//    compare total workout volume
//    see what i did in that previous workout (similar to the stats page overview)

// for a certain lookback compare
// total workout volume, sets, reps, duration to current
// for a certain lookback + muscle group do the same (without the time)

// 

// todo implement histories

interface WorkoutOverviewProps {
  onPress: () => void
}

type DisplayedDataType = 'current' | 'history';
interface DisplayedDataOption {
  label: string
  value: DisplayedDataType
}

type MuscleType = 'group' | 'target';
interface MuscleTypeOption {
  label: string,
  value: MuscleType
}

type ContributionType = 'volume' | 'sets' | 'reps';
interface ContributionTypeOption {
  label: string
  value: ContributionType
}

type TotalsContributionType = 'volume' | 'sets' | 'reps' | 'duration' | 'num_exercises';
interface TotalsContributionTypeOption {
  label: string
  value: TotalsContributionType
}

type HistoryComparisonType = 'workout' | 'muscle_group' | 'muscle_target';
interface HistoryComparisonOption {
  label: string
  value: HistoryComparisonType
}

export default function WorkoutOverview(props: WorkoutOverviewProps) {
  const { onPress } = props;

  const exercises = useAtomValue(workoutExercisesAtom);
  const muscleGroupToTargets = useAtomValue(muscleGroupToTargetsAtom);

  const displayedDataOptions: DisplayedDataOption[] = [
    { label: 'current workout', value: 'current' },
    { label: 'workout history', value: 'history' },
  ]
  const [displayedDataValue, setDisplayedDataValue] = useState<DisplayedDataType>('current');

  const muscleTypeOptions: MuscleTypeOption[] = [
    { label: 'muscle heads', value: 'target' },
    { label: 'muscle groups', value: 'group' },
  ]
  const [muscleTypeValue, setMuscleTypeValue] = useState<MuscleType>('target');

  const contributionTypeOptions: ContributionTypeOption[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'sets' },
    { label: 'reps', value: 'reps' },
  ]
  const [contributionTypeValue, setContributionTypeValue] = useState<ContributionType>('volume');

  const historyComparisonOptions: HistoryComparisonOption[] = [
    { label: 'workout totals', value: 'workout' },
    { label: 'muscle group', value: 'muscle_group' },
    { label: 'muscle target', value: 'muscle_target' },
  ]
  const [historyComparisonValue, setHistoryComparisonValue] = useState<HistoryComparisonType>('workout')

  const totalsContributionTypeOptions: TotalsContributionTypeOption[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'sets' },
    { label: 'reps', value: 'reps' },
    { label: 'duration', value: 'duration' },
    { label: '# exercises', value: 'num_exercises' },
  ]
  const [totalsContributionTypeValue, setTotalsContributionTypeValue] = useState<ContributionType>('volume');

  const timeSpanOptions: TimeSpanOptionObject[] = [
    { label: 'week', value: 'week' },
    { label: 'month', value: 'month' },
    { label: '3 months', value: '3_months' },
    { label: '6 months', value: '6_months' },
    { label: 'year', value: 'year' },
    { label: 'all', value: 'all' },
  ]
  const [timeSpanOptionValue, setTimeSpanOptionValue] = useState<TimeSpanOption>('month');

  const getBodyWeight = (exercise: WorkoutExercise): number => {
    // send request or do locally?
    return 18.25;
  };

  const getTotalStats = () => {
    let volume = 0;
    let reps = 0;
    let sets = 0;
    let validExercises = 0;

    for (const exercise of exercises) {
      const validSets = getValidSets(exercise);
      if (validSets.length > 0) validExercises++;

      for (const set_data of validSets) {
        const weight = exercise.is_body_weight ? getBodyWeight(exercise) : (set_data.weight ?? 0);
        const tempReps = (set_data.reps ?? 0);
        const tempSets = (set_data.num_sets ?? 0);

        volume += tempReps * weight * tempSets;
        reps += tempReps;
        sets += tempSets;
      }
    }

    return {
      totalVolume: volume, 
      totalReps: reps, 
      totalSets: sets,
      numExercises: validExercises,
    };
  };

  const {
    totalVolume, 
    totalReps, 
    totalSets, 
    numExercises
  } = getTotalStats();

  const getMuscleStats = () => {
    const ratios: Record<string, any> = {
      "volume": {},
      "sets": {},
      "reps": {},
    };

    for (const exercise of exercises) {
      const validSets = getValidSets(exercise);
      if (validSets.length === 0) continue;

      let contributions: Record<string, number> = {
        "volume": 0,
        "sets": 0,
        "reps": 0,
      };
      for (const set_data of validSets) {
        const weight = exercise.is_body_weight ? getBodyWeight(exercise) : (set_data.weight ?? 0);
        const sets = (set_data.num_sets ?? 0);
        const reps = (set_data.reps ?? 0);
        
        contributions["volume"] += reps * weight * sets;
        contributions["sets"] = sets;
        contributions["reps"] = reps;
      }

      for (const [ratioKey, ratioData] of Object.entries(ratios) as [string, any][]) {
        for (const muscleData of exercise.muscle_data) {
          const groupName = muscleData.group_name;

          if (!ratioData.hasOwnProperty(groupName)) {
            ratioData[groupName] = {
              "targets": {}
            }
          }

          for (const targetData of muscleData.targets) {
            const targetName = targetData.target_name;
            const targets = ratioData[groupName]["targets"];

            if (!targets.hasOwnProperty(targetName)) {
              targets[targetName] = 0;
            }
            const weightFactor = ratioKey !== 'volume' ? 1 : (targetData.ratio / 10)
            targets[targetName] += contributions[ratioKey] * weightFactor;
          }
        }
      }
    }

    for (const [ratioKey, ratioData] of Object.entries(ratios) as [string, any][]) {
      for (const groupData of Object.values(ratioData) as Record<string, any>[]) {
        const targetValues: number[] = Object.values(groupData["targets"]);
        const sum: number = targetValues.reduce((a, b) => (a as number) + (b as number), 0);
        groupData["value"] = sum / targetValues.length;
      }
    }

    return ratios;
  };

  const getValueMap = (): Record<string, number> => {
    const ratios = getMuscleStats()[contributionTypeValue] ?? {};

    const valueMap: Record<string, number> = {};
    if (muscleTypeValue === 'group') {
      for (const [group, groupData] of Object.entries(ratios) as [string, { value: number }][]) {
        valueMap[group] = groupData["value"];
      }
    } else {
      for (const [group, groupData] of Object.entries(ratios) as [string, {targets: any}][]) {
        for (const [target, value] of Object.entries(groupData["targets"]) as [string, number][]) {
          valueMap[`${group}/${target}`] = value;
        }
      }
    }

    return valueMap;
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

  const currentDataTableHeaders: string[] = ['Volume', 'Reps', 'Sets', 'Exercises'];
  const currentDataTableRows: (number | string)[][] = [
    [totalVolume, totalReps, totalSets, numExercises]
  ];

  const currentData = (
    <>
      <View style={styles.dataTableContainer}>
        <DataTable 
          headers={currentDataTableHeaders}
          rows={currentDataTableRows}
        />
      </View>
      <Text style={styles.text}>Choose a muscle level:</Text>
      {useDropdown(muscleTypeOptions, muscleTypeValue, setMuscleTypeValue)}
      <Text style={styles.text}>Choose a contribution type:</Text>
      {useDropdown(contributionTypeOptions, contributionTypeValue, setContributionTypeValue)}
    
      <MuscleGroupSvg
        valueMap={getValueMap()} 
        showGroups={muscleTypeValue === 'group'}
      />
    </>
  )

  const historyData = (
    <>
      <Text style={styles.text}>Choose a comparison:</Text>
      {useDropdown(historyComparisonOptions, historyComparisonValue, setHistoryComparisonValue)}
      {historyComparisonValue === 'muscle_group' &&
        <>
        </>
      }
      {historyComparisonValue === 'muscle_target' &&
        <>
        </>
      }
      <Text style={styles.text}>Choose a contribution type:</Text>
      {useDropdown(contributionTypeOptions, contributionTypeValue, setContributionTypeValue)}
      {lookbackComponent}
    </>
  )

  const displayDataMap: Record<DisplayedDataType, JSX.Element> = {
    'current': currentData,
    'history': historyData
  }

  return (
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        <Text style={commonStyles.boldText}>Overview</Text>
        <View style={styles.dataContainer}>
          <Text style={styles.text}>Choose display data:</Text>
          {useDropdown(displayedDataOptions, displayedDataValue, setDisplayedDataValue)}
          {displayDataMap[displayedDataValue]}
        </View>
        <TouchableOpacity 
          style={[commonStyles.thinTextButton, {width: 50, alignSelf: 'center'}]}
          onPress={onPress}
        >
          <Text style={styles.text}>hide</Text>
        </TouchableOpacity>
      </View>
    </View>
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