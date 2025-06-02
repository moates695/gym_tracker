import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, ScrollView, Platform } from "react-native";
import { useAtom } from "jotai";
import { StatusBar } from 'expo-status-bar';

import { exerciseListAtom, workoutExercisesAtom, workoutStartTimeAtom, showWorkoutStartOptionsAtom } from "@/store/general";
import ChooseExercise from "@/components/ChooseExerciseModal";
import { fetchExercises } from "@/middleware/helpers";
import WorkoutExercise from "@/components/WorkoutExercise";
import WorkoutOverview from "@/components/WorkoutOverview";
import { commonStyles } from "@/styles/commonStyles";

// todo: workout overview -> allow to see muscles worked, time, sets, volume (if on plan % completed)

export default function Workout() {
  const [workoutExercises, setWorkoutExercises] = useAtom(workoutExercisesAtom);
  const [workoutStartTime, setWorkoutStartTime] = useAtom(workoutStartTimeAtom);
  const [exerciseList, setExerciseList] = useAtom(exerciseListAtom);

  const [showStartOptions, setShowStartOptions] = useAtom(showWorkoutStartOptionsAtom);

  const [chooseNewExercise, setChooseNewExercise] = useState<boolean>(false);
  const [showOverview, setShowOverview] = useState<boolean>(false);
  const [editExercises, setEditExercises] = useState<boolean>(false);

  const createNewWorkout = () => {
    setWorkoutExercises([]);
    setWorkoutStartTime(Date.now());
  };

  const handleContinueWorkout = () => {
    setShowStartOptions(false);
  } 

  const handleStartNewWorkout = () => {
    createNewWorkout();
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
              style={styles.button}
              onPress={() => handleContinueWorkout()}
            >
              <Text style={{ color: "white"}}>continue workout</Text>
            </TouchableOpacity>
          }
          <TouchableOpacity 
            style={styles.button}
            onPress={() => handleStartNewWorkout()}
          >
            <Text style={{ color: "white"}}>start new workout</Text>
          </TouchableOpacity>
        </View> 
      : 
        <View style={styles.workoutContainer}>
          {workoutExercises.length === 0 &&
            <Text style={{color:'white'}}>no exercises yet</Text>
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
          <View style={styles.row}>
            <View style={styles.textContainer}>
              <TouchableOpacity 
                style={commonStyles.textButton}
                onPress={() => handleAddNewExercise()}
              >
                <Text style={{ color: "white"}}>add new exercise</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.textContainer}>
              <TouchableOpacity 
                style={commonStyles.textButton}
                onPress={() => setShowOverview(true)}
              >
                <Text style={{ color: "white"}}>overview</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.textContainer}>
              <TouchableOpacity 
                style={commonStyles.textButton}
                onPress={() => {}}
              >
                <Text style={{ color: "white"}}>edit exercises</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={chooseNewExercise}
            onRequestClose={() => setChooseNewExercise(false)}
          >
            <ChooseExercise onChoose={() => setChooseNewExercise(false)}/>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={showOverview}
            onRequestClose={() => setShowOverview(false)}
          >
            <WorkoutOverview onPress={() => setShowOverview(false)}/>
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
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
  },
  textContainer: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    borderWidth: 2,
    borderRadius: 5,
    borderColor: 'gray',
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }
});