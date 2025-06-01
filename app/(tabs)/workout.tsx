import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, ScrollView, Platform } from "react-native";
import { useAtom } from "jotai";
import { StatusBar } from 'expo-status-bar';

import { exerciseListAtom, workoutExercisesAtom, workoutStartTimeAtom, showWorkoutStartOptionsAtom } from "@/store/general";
import ChooseExercise from "@/components/ChooseExercise";
import { fetchExercises } from "@/middleware/helpers";
import WorkoutExercise from "@/components/WorkoutExercise";

// todo: workout overview -> allow to see muscles worked, time, sets, volume (if on plan % completed)

export default function Workout() {
  const [workoutExercises, setWorkoutExercises] = useAtom(workoutExercisesAtom);
  const [workoutStartTime, setWorkoutStartTime] = useAtom(workoutStartTimeAtom);
  const [exerciseList, setExerciseList] = useAtom(exerciseListAtom);

  const [showStartOptions, setShowStartOptions] = useAtom(showWorkoutStartOptionsAtom);

  const [chooseNewExercise, setChooseNewExercise] = useState<boolean>(false);

  const setNewWorkout = () => {
    setWorkoutExercises([]);
    setWorkoutStartTime(Date.now());
  };

  const handleContinueWorkout = () => {
    setShowStartOptions(false);
  } 

  const handleStartNewWorkout = () => {
    setNewWorkout();
    setShowStartOptions(false);
  };

  const handleAddNewExercise = () => {
    setChooseNewExercise(true);
  };

  useEffect(() => {
    fetchExercises(setExerciseList);
  }, []);

  return (
    <SafeAreaView style={styles.container}> 
      {Platform.OS == 'android' &&
        <StatusBar style="light" backgroundColor="black" translucent={false} />
      }
      {showStartOptions ?
        <View>
          {Object.keys(workoutExercises).length !== 0 &&
            <TouchableOpacity 
              onPress={() => handleContinueWorkout()}
            >
              <Text style={{ color: "white"}}>continue workout</Text>
            </TouchableOpacity>
          }
          <TouchableOpacity 
            onPress={() => handleStartNewWorkout()}
          >
            <Text style={{ color: "white"}}>start new workout</Text>
          </TouchableOpacity>
        </View> 
      : 
        <View style={styles.workoutContainer}>
          {workoutExercises.length === 0 &&
            <Text style={{color:'white'}}>no exercises so far</Text>
          }
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContainer}
          >
            {workoutExercises.map((exercise, i) => {
              return (
                <WorkoutExercise key={i} exercise={exercise} exerciseIndex={i}/>
              )
            })}
          </ScrollView>
          <TouchableOpacity 
            onPress={() => handleAddNewExercise()}
          >
            <Text style={{ color: "white"}}>add new exercise</Text>
          </TouchableOpacity>
          <Modal
            animationType="slide"
            transparent={false}
            visible={chooseNewExercise}
            onRequestClose={() => setChooseNewExercise(false)}
          >
            <ChooseExercise onPress={() => setChooseNewExercise(false)}/>
          </Modal>
        </View>
      }    
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  scrollView: {
    width: '100%',
    height: '100%',
  },
  scrollViewContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  workoutContainer: {
    height: '100%',
    width: '100%',
    paddingBottom: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  }
});