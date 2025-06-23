import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal, Switch } from "react-native";
import { commonStyles } from "@/styles/commonStyles";
import WorkoutFinishOptions from "./WorkoutFinishOptions";
import { useAtom } from "jotai";
import { muscleGroupToTargetsAtom, muscleTargetoGroupAtom, WorkoutExercise, workoutExercisesAtom } from "@/store/general";
import { fetchWrapper, getValidSets } from "@/middleware/helpers";
import MuscleGroupSvg from "./MuscleGroupSvg";
import { useDropdown } from "./ExerciseData";

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

type ContributionType = 'maximal' | 'cumulative' | 'volume';
interface ContributionTypeOption {
  label: string
  value: ContributionType
}

export default function WorkoutOverview(props: WorkoutOverviewProps) {
  const { onPress } = props;

  const [exercises, _] = useAtom(workoutExercisesAtom);

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
    { label: 'maximal', value: 'maximal' },
    { label: 'cumulative', value: 'cumulative' },
  ]
  const [contributionTypeValue, setContributionTypeValue] = useState<ContributionType>('volume');

  // const [evenDistrbution, setEvenDistrbution] = useState<boolean>(false);

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
    const muscleRatios: any = {};
    const cumulativeMuscleRatios: any = {};
    const volumeMuscleRatios: any = {};

    for (const exercise of exercises) {
      const validSets = getValidSets(exercise);
      if (validSets.length === 0) continue;

      let volume = 0;
      for (const set_data of validSets) {
        const weight = exercise.is_body_weight ? getBodyWeight(exercise) : (set_data.weight ?? 0);
        const reps = (set_data.reps ?? 0);
        const sets = (set_data.num_sets ?? 0);
        
        volume += reps * weight * sets;
      }

      for (const muscleData of exercise.muscle_data) {
        const groupName = muscleData.group_name;
        
        if (!muscleRatios.hasOwnProperty(groupName)) {
          muscleRatios[groupName] = {
            "targets": {}
          };
          cumulativeMuscleRatios[groupName] = {
            "targets": {}
          };
          volumeMuscleRatios[groupName] = {
            "targets": {}
          };
        }
        
        for (const targetData of muscleData.targets) {
          const targetName = targetData.target_name;
          const targets = muscleRatios[groupName]["targets"];

          const currRatio = targets[targetName] ?? 0;
          if (currRatio < targetData.ratio) {
            targets[targetName] = targetData.ratio;
          }

          const cumulativeTargets = cumulativeMuscleRatios[groupName]["targets"];
          if (!cumulativeTargets.hasOwnProperty(targetName)) {
            cumulativeTargets[targetName] = 0;
          }
          cumulativeTargets[targetName] += targetData.ratio;

          const volumeTargets = volumeMuscleRatios[groupName]["targets"];
          if (!volumeTargets.hasOwnProperty(targetName)) {
            volumeTargets[targetName] = 0;
          }
          volumeTargets[targetName] += volume * targetData.ratio;

        }
      }
    }

    for (const groupData of Object.values(muscleRatios) as Record<string, any>[]) {
      const ratio = Math.max(...Object.values(groupData["targets"] as Record<string, number>))
      groupData["value"] = ratio;
    }

    for (const groupData of Object.values(cumulativeMuscleRatios) as Record<string, any>[]) {
      const targetValues: number[] = Object.values(groupData["targets"]);
      const sum: number = targetValues.reduce((a, b) => (a as number) + (b as number), 0);
      groupData["value"] = sum / targetValues.length;
    }

    for (const groupData of Object.values(volumeMuscleRatios) as Record<string, any>[]) {
      const targetValues: number[] = Object.values(groupData["targets"]);
      const sum: number = targetValues.reduce((a, b) => (a as number) + (b as number), 0);
      groupData["value"] = sum / targetValues.length;
    }

    return {
      muscleRatios,
      cumulativeMuscleRatios,
      volumeMuscleRatios
    }
  };

  const getValueMap = (): Record<string, number> => {
    const {
      muscleRatios,
      cumulativeMuscleRatios,
      volumeMuscleRatios
    } = getMuscleStats();

    const ratiosMap: Record<ContributionType, any> = {
      'maximal': muscleRatios,
      'cumulative': cumulativeMuscleRatios,
      'volume': volumeMuscleRatios
    }
    const ratios = ratiosMap[contributionTypeValue] ?? {};

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

  const currentData = (
    <>
      <Text style={styles.text}>Total volume: {totalVolume} kg</Text>
      <Text style={styles.text}>Reps: {totalReps}</Text>
      <Text style={styles.text}>Sets: {totalSets}</Text>
      <Text style={styles.text}>Exercises: {numExercises}</Text>

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
    <></>
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
          
          {/* <View style={styles.switchContainer}>
            <Text style={styles.text}>Evenly distribute:</Text>
            <Switch
              trackColor={{true: '#b4fcac', false: '#767577'}}
              thumbColor={evenDistrbution ? '#1aff00' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              value={evenDistrbution}
              onValueChange={setEvenDistrbution}
            />
          </View> */}

          
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
})