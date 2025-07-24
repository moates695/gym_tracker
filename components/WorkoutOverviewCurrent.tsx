import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal, Switch } from "react-native";
import { commonStyles } from "@/styles/commonStyles";
import WorkoutFinishOptions from "./WorkoutFinishOptions";
import { useAtom, useAtomValue } from "jotai";
import { muscleGroupToTargetsAtom, muscleTargetoGroupAtom, overviewHistoricalStatsAtom, WorkoutExercise, workoutExercisesAtom, workoutStartTimeAtom } from "@/store/general";
import { fetchWrapper, getBodyWeight, getValidSets } from "@/middleware/helpers";
import MuscleGroupSvg from "./MuscleGroupSvg";
import { filterTimeSeries, timeSpanToMs, useDropdown } from "./ExerciseData";
import { TimeSpanOption, TimeSpanOptionObject } from "./ExerciseData";
import { Dropdown } from "react-native-element-dropdown";
import DataTable from "./DataTable";
import LineGraph, { LineGraphPoint } from "./LineGraph";
import { OptionsObject } from "./ChooseExerciseModal";

interface WorkoutOverviewCurrentProps {}

type MuscleType = 'group' | 'target';
interface MuscleTypeOption {
  label: string,
  value: MuscleType
}

type ContributionType = 'volume' | 'num_sets' | 'reps';
interface ContributionTypeOption {
  label: string
  value: ContributionType
}

export default function WorkoutOverviewCurrent(props: WorkoutOverviewCurrentProps) {
  const exercises = useAtomValue(workoutExercisesAtom);

  const muscleTypeOptions: MuscleTypeOption[] = [
    { label: 'muscle heads', value: 'target' },
    { label: 'muscle groups', value: 'group' },
  ]
  const [muscleTypeValue, setMuscleTypeValue] = useState<MuscleType>('target');

   const contributionTypeOptions: ContributionTypeOption[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'num_sets' },
    { label: 'reps', value: 'reps' },
  ]
  const [contributionTypeValue, setContributionTypeValue] = useState<ContributionType>('volume');

  const currentStats = (() => {
    const stats = {
      volume: 0,
      reps: 0,
      num_sets: 0,
      num_valid_exercises: 0
    }

    for (const exercise of exercises) {
      const validSets = getValidSets(exercise);
      if (validSets.length > 0) stats.num_valid_exercises++;

      for (const set_data of validSets) {
        const weight = exercise.is_body_weight ? getBodyWeight(exercise) : (set_data.weight ?? 0);
        const tempReps = (set_data.reps ?? 0);
        const tempSets = (set_data.num_sets ?? 0);

        stats.volume += tempReps * weight * tempSets;
        stats.reps += tempReps;
        stats.num_sets += tempSets;
      }
    }

    return stats;
  })();
  
  const currentDataTableHeaders: string[] = ['Volume', 'Reps', 'Sets', 'Exercises'];
  const currentDataTableRows: (number | string)[][] = [
    [currentStats.volume, currentStats.reps, currentStats.num_sets, currentStats.num_valid_exercises]
  ];

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
        const weight = exercise.is_body_weight ? getBodyWeight(exercise) : set_data.weight;
        const sets = set_data.num_sets;
        const reps = set_data.reps;
        
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
        const sum: number = targetValues.reduce((a, b) => a + b, 0);
        groupData["value"] = sum / targetValues.length;
      }
    }

    return ratios;
  };

  const getValueMap = (): Record<string, number> => {
    const ratios = getMuscleStats()[contributionTypeValue] ?? {};

    const valueMap: Record<string, number> = {};
    for (const [group, groupData] of Object.entries(ratios) as [string, {value: number, targets: Record<string, number>}][]) {
      if (muscleTypeValue === 'group') {
        valueMap[group] = groupData["value"];
        continue;
      }
      for (const [target, value] of Object.entries(groupData["targets"]) as [string, number][]) {
        valueMap[`${group}/${target}`] = value;
      }
    }

    return valueMap;
  };

  return (
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