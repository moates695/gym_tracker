import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import ConfirmationModal from "./ConfirmationModal";
import { useAtom, useAtomValue } from "jotai";
import { SetData, showWorkoutStartOptionsAtom, userDataAtom, WorkoutExercise, workoutExercisesAtom, workoutStartTimeAtom } from "@/store/general";
import { useRouter } from "expo-router";
import { calcBodyWeight, fetchWrapper, getValidSets, isValidSet } from "@/middleware/helpers";
import { commonStyles } from "@/styles/commonStyles";

interface WorkoutFinishOptionsProps {
  onPress: () => void
}

type ConfirmationType = 'save' | 'discard'

export default function WorkoutFinishOptions(props: WorkoutFinishOptionsProps) {
  const { onPress } = props;

  const userData = useAtomValue(userDataAtom);

  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);
  const [modalMessage, setModalMessage] = useState<string>('');

  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [confirmationType, setConfirmationType] = useState<ConfirmationType | null>(null);
  
  const [workoutExercises, setWorkoutExercises] = useAtom(workoutExercisesAtom)
  const [workoutStartTime, setWorkoutStartTime] = useAtom(workoutStartTimeAtom)
  const [, setShowWorkoutStartOptions] = useAtom(showWorkoutStartOptionsAtom)

  const router = useRouter();
  
  const handleSavePress = () => {
    setModalMessage('Save this workout?');
    setConfirmationType('save');
    handleOptionPress('save');
  };

  const handleDiscardPress = () => {
    setModalMessage('You sure you want to discard workout?');
    setConfirmationType('discard');
    handleOptionPress('discard');
  };

  const handleFinishOption = (option: 'save' | 'discard') => {
    option === 'save' ? saveWorkout() : discardWorkout();
  };

  const handleOptionPress = async (option: 'save' | 'discard') => {
    const confirmed = await openConfirm();
    if (!confirmed) return;
    handleFinishOption(option);
  };

  const openConfirm = (): Promise<boolean> => {
    setShowConfirmation(true);
    return new Promise(resolve => setResolver(() => resolve));
  };

  const handleConfirm = () => {
    resolver?.(true);
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    resolver?.(false);
    setShowConfirmation(false);
  };

  const saveWorkout = async () => {
    const exerciseData: any = [];
    for (const exercise of workoutExercises) {
      const validSets = getValidSets(exercise);
      if (validSets.length === 0) continue;

      const updatedValidSets = validSets.map(({ class: set_class, ...rest}) => ({
        ...rest,
        set_class
      }));
      
      if (exercise.is_body_weight) {
        for (const set_data of updatedValidSets) {
          set_data.weight = calcBodyWeight(userData, exercise.ratios!, set_data.weight);
        }
      }

      exerciseData.push({
        "id": exercise.id,
        "set_data": updatedValidSets,
      })
    }

    const body = {
      "exercises": exerciseData,
      "start_time": workoutStartTime,
      "duration": Date.now() - workoutStartTime!
    };
    
    const data = await fetchWrapper({
      route: 'workout/save',
      method: 'POST',
      body: body
    });
    if (data === null || data.status === 'error') {
      Alert.alert("error saving workout");
      return;
    }

    setWorkoutExercises([]);
    setWorkoutStartTime(null);
    setShowWorkoutStartOptions('start');
    onPress();
    router.replace('/(tabs)/workout'); //? go to recap screen?
  };

  const discardWorkout = () => {
    setWorkoutExercises([]);
    setWorkoutStartTime(null);
    setShowWorkoutStartOptions('start');
    onPress();
    router.replace('/(tabs)/workout');
  };  

  const canSaveWorkout = (): boolean => {
    for (const exercise of workoutExercises) {
      if (getValidSets(exercise).length === 0) continue;
      return true;
    }
    return false;
  };

  return (
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        {!showConfirmation ? 
          <>
            <Text style={[styles.text, {marginBottom: 5}]}>
              What do you want to do?
            </Text>
            <View style={styles.row}>
              {canSaveWorkout() &&
                <TouchableOpacity 
                  style={[styles.button, {borderColor: 'green'}]}
                  onPress={handleSavePress}
                >
                  <Text style={styles.text}>save</Text>
                </TouchableOpacity>
              }
              <TouchableOpacity 
                style={[styles.button, {borderColor: 'red'}]}
                onPress={handleDiscardPress}
              >
                <Text style={styles.text}>discard</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[commonStyles.thinTextButton, {
                borderColor: 'grey', 
                alignSelf: 'center',
                marginTop: 10,
              }]}
              onPress={onPress}
            >
              <Text style={styles.text}>back</Text>
            </TouchableOpacity>
          </>
        :
          <>
            <Text style={[styles.text, {marginBottom: 5}]}>
              {modalMessage}
            </Text>
            <View style={styles.row}>
              <TouchableOpacity 
                style={[styles.button, {borderColor: confirmationType === 'save' ? 'green' : 'red'}]}
                onPress={handleConfirm}
              >
                <Text style={styles.text}>yeah</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, {borderColor: 'grey'}]}
                onPress={handleCancel}
              >
                <Text style={styles.text}>nah</Text>
              </TouchableOpacity>
            </View>
          </>
        }
      </View>
      {/* <ConfirmationModal visible={modalVisible} onConfirm={handleConfirm} onCancel={handleCancel} message={modalMessage} confirm_string="yeah" cancel_string="nah"/> */}
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    backgroundColor: 'black',
    padding: 15,
    elevation: 5,
    borderColor: 'red',
    borderWidth: 2,
    borderRadius: 5,
    width: '70%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    borderWidth: 2,
    borderRadius: 2,
    padding: 10,
    paddingLeft: 10,
    paddingRight: 10,
    margin: 5,
    minWidth: 100,
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
})