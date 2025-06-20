import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal } from "react-native";
import { commonStyles } from "@/styles/commonStyles";
import WorkoutFinishOptions from "./WorkoutFinishOptions";
import { useAtom } from "jotai";
import { WorkoutExercise, workoutExercisesAtom } from "@/store/general";
import { getValidSets } from "@/middleware/helpers";

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

  const [showFinishOptions, setShowFinishOptions] = useState<boolean>(false);
  
  const getBodyWeight = (exercise: WorkoutExercise): number => {
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
    const largestMuscleTargets: Record<string, number> = {};

    for (const exercise of exercises) {
      const validSets = getValidSets(exercise);
      if (validSets.length === 0) continue;

      for (const muscleData of exercise.muscle_data) {
        for (const targetData of muscleData.targets) {
          if (!largestMuscleTargets.hasOwnProperty(targetData.target_id)) {
            largestMuscleTargets[targetData.target_id] = targetData.ratio;
          } else if (largestMuscleTargets[targetData.target_id] < targetData.ratio) {
            largestMuscleTargets[targetData.target_id] = targetData.ratio
          }
        }
      }
    }

    console.log(largestMuscleTargets);
  };

  getMuscleStats();

  return (
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        <Text style={commonStyles.boldText}>Overview</Text>
        <View style={styles.dataContainer}>
          <Text style={styles.text}>Total volume: {totalVolume} kg</Text>
          <Text style={styles.text}>Reps: {totalReps}</Text>
          <Text style={styles.text}>Sets: {totalSets}</Text>
          <Text style={styles.text}>Exercises: {numExercises}</Text>
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