import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal } from "react-native";
import { useAtom } from "jotai";

import { workoutAtom, exercisesAtom } from "@/store/workout";
import ChooseExercise from "@/components/ChooseExercise";
import { fetchExercises } from "@/middleware/helpers";

// workout has:
// a start time
// contain list exercises
// has list of sets
// exercises are performed for reps at a weight

export default function Workout() {
  const [workout, setWorkout] = useAtom(workoutAtom);
  const [exercises, setExercises] = useAtom(exercisesAtom);

  const [showStartOptions, setShowStartOptions] = useState<boolean>(true);
  const [chooseNewExercise, setChooseNewExercise] = useState<boolean>(false);

  const setNewWorkout = () => {
    // setWorkout({
    //   "start_timestamp": Date.now(),
    //   "exercises": []
    // })
  };

  const handleContinueWorkout = () => {
    setShowStartOptions(false);
  }

  const handleStartNewWorkout = () => {
    setNewWorkout();
    setShowStartOptions(false);
  };

  useEffect(() => {
    if (Object.keys(workout).length !== 0) return;
    setNewWorkout();
  }, []);

  const handleAddNewExercise = () => {
    setChooseNewExercise(true);
  };

  useEffect(() => {
    fetchExercises(setExercises);
  }, []);

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
  imageContainer: {
    flex: 1,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center'
  },
  modalContainer: {
    margin: 10,
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    elevation: 5,
    borderColor: 'red',
    borderWidth: 1
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'white'
  },
});