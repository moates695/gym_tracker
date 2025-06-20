import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import React, { useState } from "react"
import { TouchableOpacity, View, StyleSheet } from "react-native"
import WorkoutExerciseComponent from "./WorkoutExercise"
import { WorkoutExercise, workoutExercisesAtom } from "@/store/general"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useAtom } from "jotai"
import ConfirmationModal from "./ConfirmationModal"


interface WorkoutExerciseRowProps {
  exercise: WorkoutExercise
  exerciseIndex: number
  editExercises: boolean
}

export default function WorkoutExerciseRow(props: WorkoutExerciseRowProps) {
  const {exercise, exerciseIndex, editExercises} = props;
  
  const [exercises, setExercises] = useAtom(workoutExercisesAtom);

  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);
  
  const [deletePressed, setDeletePressed] = useState<boolean>(false);
  const [copyPressed, setCopyPressed] = useState<boolean>(false);

  const handleDeleteExercise = () => {
    const tempExercises = [...exercises];
    tempExercises.splice(exerciseIndex, 1);
    setExercises(tempExercises);
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
          <TouchableOpacity
            onPress={() => {}}
            onPressIn={() => setCopyPressed(true)}
            onPressOut={() =>  setCopyPressed(false)}
            activeOpacity={1}
            style={styles.editButtons}
          >
            <Ionicons name={copyPressed ? 'copy' : "copy-outline"} size={20} color="green" />
          </TouchableOpacity>
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
  }
})