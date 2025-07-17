import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import React, { View, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native"
import { SetData, WorkoutExercise, workoutExercisesAtom } from "@/store/general";
import ConfirmationModal from "./ConfirmationModal";
import ShiftTextInput from "./ShiftTextInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { commonStyles } from "@/styles/commonStyles";
import ExerciseSet from "./ExerciseSet";

interface ExerciseSetsProps {
  exercise: WorkoutExercise
  exerciseIndex: number
}

// todo: numeric weight in storage
// todo: handle partial reps?

export default function ExerciseSets(props: ExerciseSetsProps) {
  const { exercise, exerciseIndex } = props; 

  const [exercises, setExercises] = useAtom(workoutExercisesAtom);
  
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);
  const [displayWeights, setDisplayWeights] = useState<string[]>([]);

  const [deletePressOn, setDeletePressOn] = useState<boolean[]>(Array(exercise.set_data.length).fill(false));
  const [copyPressOn, setCopyPressOn] = useState<boolean[]>(Array(exercise.set_data.length).fill(false));

  const updateExerciseSetData = (set_data: any) => {
    const tempExercises: WorkoutExercise[] = [...exercises];
    tempExercises[exerciseIndex].set_data = set_data;
    setExercises(tempExercises);
  };

  const handleCopySet = (index: number) => {
    const tempSetData = [...exercise.set_data];
    const tempSet = { ...tempSetData[index] };
    tempSetData.push(tempSet);
    updateExerciseSetData(tempSetData);
    
    const tempDisplayWeights = [...displayWeights];
    tempDisplayWeights.push(tempDisplayWeights[index])
    setDisplayWeights(tempDisplayWeights)
  }

  const handleDeleteSet = (index: number) => {
    let tempSetData = [...exercise.set_data];
    if (tempSetData.length <= 1) {
      tempSetData = [
        {
          "reps": null,
          "weight": null,
          "num_sets": null,
        }
      ]
      updateExerciseSetData(tempSetData);
      setDisplayWeights(['']);
      return;
    }

    tempSetData.splice(index, 1);
    updateExerciseSetData(tempSetData);

    const tempDisplayWeights = [...displayWeights];
    tempDisplayWeights.splice(index, 1);
    setDisplayWeights(tempDisplayWeights);
  }

  const openConfirm = (): Promise<boolean> => {
    setDeleteModalVisible(true);
    return new Promise(resolve => setResolver(() => resolve));
  };

  const handleDeletePress = async (index: number) => {
    const confirmed = await openConfirm();
    if (!confirmed) return;
    handleDeleteSet(index);
  };

  const handleConfirm = () => {
    resolver?.(true);
    setDeleteModalVisible(false);
  };

  const handleCancel = () => {
    resolver?.(false);
    setDeleteModalVisible(false);
  };

  const handleNewSet = () => {
    const tempSets = [...exercise.set_data];
    tempSets.push({
      "reps": null,
      "weight": null,
      "num_sets": null,
    })
    updateExerciseSetData(tempSets);

    const tempDisplayWeights = [...displayWeights];
    tempDisplayWeights.push('')
    setDisplayWeights(tempDisplayWeights);
  }

  useEffect(() => {
    if (exercise.set_data.length > 0) return;
    const tempExercises = [...exercises];
    tempExercises[exerciseIndex].set_data = [
      {
        "reps": null,
        "weight": null,
        "num_sets": null,
      }
    ]
    setExercises(tempExercises);
  }, [exercise.set_data])

  const handleDeletePressOn = (index: number, bool: boolean) => {
    const tempDeletePressOn = [...deletePressOn];
    tempDeletePressOn[index] = bool;
    setDeletePressOn(tempDeletePressOn);
  };

  const handleCopyPressOn = (index: number, bool: boolean) => {
    const tempCopyPressOn = [...copyPressOn];
    tempCopyPressOn[index] = bool;
    setCopyPressOn(tempCopyPressOn);
  };

  useEffect(() => {
    setDeletePressOn(Array(exercise.set_data.length).fill(false));
    setCopyPressOn(Array(exercise.set_data.length).fill(false));
  }, [exercise.set_data.length])

  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.headerRow]}>
        <View style={styles.button}/>
        <Text style={[styles.text, styles.header]}>reps</Text>
        <Text style={[styles.text, styles.header]}>weight</Text>
        <Text style={[styles.text, styles.header]}>sets</Text>
        <View style={styles.button}/>
      </View>
      {exercise.set_data.map((set_data: SetData, index: number) => (
        <ExerciseSet key={index} exercise={exercise} exerciseIndex={exerciseIndex} set_data={set_data} setIndex={index}/>
      ))}
      <View style={styles.row}>
        <TouchableOpacity
          onPress={handleNewSet}
          style={[commonStyles.thinTextButton, {borderColor: 'green', marginTop: 5}]}
        >
          <Text style={styles.text}>new set</Text>
        </TouchableOpacity>
      </View>
      <ConfirmationModal visible={deleteModalVisible} onConfirm={handleConfirm} onCancel={handleCancel} message="Delete set?" confirm_string="yeah" cancel_string="nah"/>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  textInput: {
    color: 'white',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '25%',
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingBottom: 5
  },
  headerRow: {
    width: '93.5%'
  },
  header: {
    width: '25%',
    textAlign: 'center',
  },
  textButton: {
    padding: 8
  },
  button: {
    padding: 0,
    justifyContent: 'center',
  },
})