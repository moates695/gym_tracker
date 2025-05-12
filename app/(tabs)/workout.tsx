import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal } from "react-native";
import { useAtom } from "jotai";

import { workoutAtom, exerciseListAtom, workoutExercisesAtom } from "@/store/general";
import ChooseExercise from "@/components/ChooseExercise";
import { fetchExercises } from "@/middleware/helpers";
import WorkoutExercise from "@/components/WorkoutExercise";

// workout has:
// a start time
// contain list exercises
// has list of sets
// exercises are performed for reps at a weight

export default function Workout() {
  const [workout, setWorkout] = useAtom(workoutAtom);
  const [workoutExercises, setWorkoutExercises] = useAtom(workoutExercisesAtom);
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
    console.log(workout)
  }, [workout]);

  return (
    <SafeAreaView style={styles.container}> 
      {showStartOptions ?
        <>
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
        </> 
        : 
        <>
          {workout.exercises.length === 0 &&
            <Text style={{color:'white'}}>no exercises so far</Text>
          }
          {workoutExercises.map((exercise, i) => {
            return (
              <WorkoutExercise key={i} exercise={exercise}/>
            )
          })}
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
        </>
      }    
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center'
  },
});