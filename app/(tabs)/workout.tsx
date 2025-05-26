import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, ScrollView } from "react-native";
import { useAtom } from "jotai";

import { workoutAtom, exerciseListAtom, workoutExercisesAtom } from "@/store/general";
import ChooseExercise from "@/components/ChooseExercise";
import { fetchExercises } from "@/middleware/helpers";
import WorkoutExercise from "@/components/WorkoutExercise";

// workout overview: allow to see muscles worked, time, sets, volume (if on plan % completed)

export default function Workout() {
  const [workout, setWorkout] = useAtom(workoutAtom);
  const [exerciseList, setExerciseList] = useAtom(exerciseListAtom);

  const [showStartOptions, setShowStartOptions] = useState<boolean>(true);
  const [chooseNewExercise, setChooseNewExercise] = useState<boolean>(false);

  const setNewWorkout = () => {
    setWorkout({
      "start_timestamp": Date.now(),
      "exercises": []
    })
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

  useEffect(() => {
    // console.log(workout)
  }, [workout]);

  return (
    <SafeAreaView style={styles.container}> 
      {showStartOptions ?
        <View>
          {Object.keys(workout).length !== 0 &&
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
          {workout.exercises.length === 0 &&
            <Text style={{color:'white'}}>no exercises so far</Text>
          }
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContainer}
          >
            {workout.exercises.map((exercise, i) => {
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
            transparent={true}
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
    width: '100%'
  },
  scrollView: {
    width: '100%',
    height: '90%',
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
    alignItems: 'center'
  }
});