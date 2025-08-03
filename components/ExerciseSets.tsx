import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import React, { View, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native"
import { SetData, WorkoutExercise, workoutExercisesAtom, emptySetData, SetClass} from "@/store/general";
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
  
  const [openOptions, setOpenOptions] = useState<boolean>(false);
  
  const updateExerciseSetData = (set_data: any) => {
    const tempExercises: WorkoutExercise[] = [...exercises];
    tempExercises[exerciseIndex].set_data = set_data;
    setExercises(tempExercises);
  };

  const handleNewSet = (setClass: SetClass) => {
    const tempSets = [...exercise.set_data];
    const tempSet = {...emptySetData};
    tempSet.class = setClass;
    tempSets.push(tempSet);
    updateExerciseSetData(tempSets);
  }

  useEffect(() => {
    if (exercise.set_data.length > 0) return;
    const tempExercises = [...exercises];
    tempExercises[exerciseIndex].set_data = [{ ...emptySetData }]
    setExercises(tempExercises);
  }, [exercise.set_data])

  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.headerRow]}>
        {!openOptions &&
          <>
            <Text style={[styles.text, styles.header]}>reps</Text>
            <Text style={[styles.text, styles.header]}>{exercise.is_body_weight ? '+/- weight' : 'weight'}</Text>
            <Text style={[styles.text, styles.header]}>sets</Text>
          </>
        }
      </View>
      {exercise.set_data.map((set_data: SetData, index: number) => (
        <ExerciseSet 
          key={index} 
          exercise={exercise} 
          exerciseIndex={exerciseIndex} 
          set_data={set_data} 
          setIndex={index} 
          openOptions={openOptions}
        />
      ))}
      <View style={styles.row}>
        <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => handleNewSet('working')}
            style={[commonStyles.thinTextButton, {borderColor: 'green', marginTop: 5}]}
          >
            <Text style={styles.text}>new set</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleNewSet('dropset')}
            style={[commonStyles.thinTextButton, {borderColor: 'green', marginTop: 5, marginLeft: 20}]}
          >
            <Text style={styles.text}>dropset</Text>
          </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TouchableOpacity
            onPress={() => setOpenOptions(!openOptions)}
            style={styles.button}
            activeOpacity={1}
          >
            <Ionicons name={openOptions ? 'options' : 'options-outline'} color={openOptions ? 'red': 'white'} size={25} />
          </TouchableOpacity>
        </View>
      </View>
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
    width: '100%',
  },
  header: {
    width: '33%',
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