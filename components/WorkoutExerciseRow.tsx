import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import React, { useState } from "react"
import { TouchableOpacity, View, StyleSheet } from "react-native"
import WorkoutExerciseComponent from "./WorkoutExercise"
import { editWorkoutExercisesAtom, WorkoutExercise, workoutExercisesAtom } from "@/store/general"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useAtom, useSetAtom } from "jotai"
import ConfirmationModal from "./ConfirmationModal"
import cloneDeep from 'lodash/cloneDeep';
import { AntDesign } from "@expo/vector-icons"
// import { set } from "lodash"
import LoadingScreen from "@/app/loading"
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions"

interface WorkoutExerciseRowProps {
  exercise: WorkoutExercise
  exerciseIndex: number
  // editExercises: boolean
}

export default function WorkoutExerciseRow(props: WorkoutExerciseRowProps) {
  const {exercise, exerciseIndex} = props;
  
  const [exercises, setExercises] = useAtom(workoutExercisesAtom);
  const [editExercises, _] = useAtom(editWorkoutExercisesAtom);

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);
  
  const [deletePressed, setDeletePressed] = useState<boolean>(false);
  const [copyPressed, setCopyPressed] = useState<boolean>(false);
  const [moveUpPressOn, setMoveUpPressOn] = useState<boolean>(false);
  const [moveDownPressOn, setMoveDownPressOn] = useState<boolean>(false);

  if (exercises === null) {
    return <LoadingScreen delay={1000} />
  }

  const handleDeleteExercise = () => {
    try {
      const tempExercises = [...exercises];
      tempExercises.splice(exerciseIndex, 1);
      setExercises(tempExercises);
    } catch (error) {
      addCaughtErrorLog(error, 'error handleDeleteExercise');
    }
  };

  const openConfirm = (): Promise<boolean> => {
    setDeleteModalVisible(true);
    return new Promise(resolve => setResolver(() => resolve));
  };

  const handleDeletePress = async () => {
    const confirmed = await openConfirm();
    if (!confirmed) return;
    handleDeleteExercise();
  };

  const handleConfirm = () => {
    resolver?.(true);
    setDeleteModalVisible(false);
  };

  const handleCancel = () => {
    resolver?.(false);
    setDeleteModalVisible(false);
  };

  const handleCopyExercise = () => {
    try {
      const tempExercises = [...exercises];
      const copy = cloneDeep(exercises[exerciseIndex]);
      tempExercises.splice(exerciseIndex, 0, copy);
      setExercises(tempExercises);
    } catch (error) {
      addCaughtErrorLog(error, 'error handleCopyExercise');
    }
  };

  const handleMoveUp = () => {
    try {
      const tempExercises = [...exercises];
      const tempExercise = exercises[exerciseIndex];
      tempExercises[exerciseIndex] = tempExercises[exerciseIndex - 1];
      tempExercises[exerciseIndex - 1] = tempExercise;
      setExercises(tempExercises);
    } catch (error) {
      addCaughtErrorLog(error, 'error handleMoveUp');
    }
  };

  const handleMoveDown = () => {
    try {
      const tempExercises = [...exercises];
      const tempExercise = exercises[exerciseIndex];
      tempExercises[exerciseIndex] = tempExercises[exerciseIndex + 1];
      tempExercises[exerciseIndex + 1] = tempExercise;
      setExercises(tempExercises);
    } catch (error) {
      addCaughtErrorLog(error, 'error handleMoveDown');
    }
  };

  return (
    <>
      <View style={styles.workoutRow}>
        {editExercises && 
          <TouchableOpacity
            onPress={() => handleDeletePress()}
            onPressIn={() => setDeletePressed(true)}
            onPressOut={() => setDeletePressed(false)}
            activeOpacity={1}
            style={styles.editButtons}
          >
            <MaterialIcons name={deletePressed ? 'delete' : "delete-outline"} size={20} color="red" />
          </TouchableOpacity>
        }
        <View style={{flex: 1}}>
          <WorkoutExerciseComponent exercise={exercise} exerciseIndex={exerciseIndex}/>
        </View>
        {editExercises && 
          <>
            <TouchableOpacity
              onPress={() => handleCopyExercise()}
              onPressIn={() => setCopyPressed(true)}
              onPressOut={() =>  setCopyPressed(false)}
              activeOpacity={1}
              style={styles.editButtons}
            >
              <Ionicons name={copyPressed ? 'copy' : "copy-outline"} size={20} color="green" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleMoveUp}
              style={styles.editButtons}
              onPressIn={() => setMoveUpPressOn(true)}
              onPressOut={() => setMoveUpPressOn(false)}
              activeOpacity={1}
              disabled={exerciseIndex === 0}
            >
              <AntDesign name='arrow-up' size={20} color={moveUpPressOn ? "cyan" : "#ccc"} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleMoveDown}
              style={styles.editButtons}
              onPressIn={() => setMoveDownPressOn(true)}
              onPressOut={() => setMoveDownPressOn(false)}
              activeOpacity={1}
              disabled={exerciseIndex === exercises.length - 1}
            >
              <AntDesign name='arrow-down' size={20} color={moveDownPressOn ? "cyan" : "#ccc"} />
            </TouchableOpacity>
          </>
        }
      </View>
      <ConfirmationModal 
        visible={deleteModalVisible} 
        onConfirm={handleConfirm} 
        onCancel={handleCancel} 
        message="Delete exercise?" 
        confirm_string="yeah" 
        cancel_string="nah"
      />
    </>
  )
}

const styles = StyleSheet.create({
  workoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  editButtons: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 0,
    justifyContent: 'center',
  },
})