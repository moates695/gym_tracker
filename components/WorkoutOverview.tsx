import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal } from "react-native";
import { commonStyles } from "@/styles/commonStyles";
import WorkoutFinishOptions from "./WorkoutFinishOptions";
import { useAtom } from "jotai";
import { muscleGroupToTargetsAtom, muscleTargetoGroupAtom, WorkoutExercise, workoutExercisesAtom } from "@/store/general";
import { fetchWrapper, getValidSets } from "@/middleware/helpers";
import MuscleGroupSvg from "./MuscleGroupSvg";

interface WorkoutOverviewProps {
  onPress: () => void
}

// todo: add workout stats
// show which muscle groups have been worked
// compare muscle groups have been worked based on ratio & volume
// show volume ratios per muscle group?
// show comparison to historical data for muscle group (how does volume from this chest day compare to previous)?

export default function WorkoutOverview(props: WorkoutOverviewProps) {
  const { onPress } = props;

  const [exercises, _] = useAtom(workoutExercisesAtom);

  // const [groupToTargets, setGroupToTargets] = useAtom(muscleGroupToTargetsAtom);
  // const [targetToGroup, setTargetoGroup] = useAtom(muscleTargetoGroupAtom);

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

  ratios = {
    "arms": {
      "value": 8,
      "targets": {
        "bicep": 8,
        "tricep": 6
      }
    }
  }

  const getMuscleStats = () => {
    const muscleTargetRatios: Record<string, number> = {};
    const muscleGroupRatios: Record<string, number> = {};

    const muscleTargetCumulativeRatios: Record<string, number> = {};
    const muscleGroupCumulativeRatios: Record<string, number> = {};

    for (const exercise of exercises) {
      const validSets = getValidSets(exercise);
      if (validSets.length === 0) continue;

      for (const muscleData of exercise.muscle_data) {
        const groupName = muscleData.group_name;
        for (const targetData of muscleData.targets) {
          const targetName = targetData.target_name;
          if (!muscleTargetRatios.hasOwnProperty(targetName)) {
            muscleTargetRatios[targetName] = targetData.ratio;
          } else if (muscleTargetRatios[targetName] < targetData.ratio) {
            muscleTargetRatios[targetName] = targetData.ratio
          }
          
          if (!muscleGroupRatios.hasOwnProperty(groupName)) {
            muscleGroupRatios[groupName] = targetData.ratio
          } else if (muscleGroupRatios[targetName] < targetData.ratio) {
            muscleGroupRatios[groupName] = targetData.ratio
          }

          if (!muscleTargetCumulativeRatios.hasOwnProperty(targetName)) {
            muscleTargetCumulativeRatios[targetName] = 0
          }
          muscleTargetCumulativeRatios[targetName] += targetData.ratio

          if (!muscleGroupCumulativeRatios.hasOwnProperty(groupName)) {
            muscleGroupCumulativeRatios[groupName] = 0;
          }
          muscleGroupCumulativeRatios[groupName] += targetData.ratio;
        }
      }
    }

    const muscleRatios: any = {};

    for (const exercise of exercises) {
      const validSets = getValidSets(exercise);
      if (validSets.length === 0) continue;

      for (const muscleData of exercise.muscle_data) {
        const groupName = muscleData.group_name;
        
        if (!muscleRatios.hasOwnProperty(groupName)) {
          muscleRatios[groupName] = {};
        }
        
        for (const targetData of muscleData.targets) {
          const targetName = targetData.target_name;
          
          if (!muscleRatios.hasOwnProperty(groupName)) {
          muscleRatios[groupName]["targets"] = {};
        }

        }
      }
    }

    console.log('newline')
    console.log(muscleTargetRatios);
    console.log(muscleGroupRatios);
    console.log(muscleTargetCumulativeRatios);
    console.log(muscleGroupCumulativeRatios);
  };

  getMuscleStats();

  // useEffect(() => {
  //   if (Object.keys(groupToTargets).length !== 0 && Object.keys(targetToGroup).length !== 0) return;

  //   const fetchMaps = async () => {
  //     const data = await fetchWrapper('muscles/get_maps', 'GET');
  //     if (data === null) {
  //       console.error('map load failed');
  //       return;
  //     }
  //     setGroupToTargets(data.group_to_targets);
  //     setTargetoGroup(data.target_to_group);
  //   };

  //   fetchMaps();
  // }, []);

  return (
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        <Text style={commonStyles.boldText}>Overview</Text>
        <View style={styles.dataContainer}>
          <Text style={styles.text}>Total volume: {totalVolume} kg</Text>
          <Text style={styles.text}>Reps: {totalReps}</Text>
          <Text style={styles.text}>Sets: {totalSets}</Text>
          <Text style={styles.text}>Exercises: {numExercises}</Text>
          <MuscleGroupSvg numValues={{}}/>
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
  }
})