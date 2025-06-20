import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, ScrollView, Platform } from "react-native";
import { useAtom } from "jotai";
import { StatusBar } from 'expo-status-bar';

import { exerciseListAtom, workoutExercisesAtom, workoutStartTimeAtom, showWorkoutStartOptionsAtom, editWorkoutExercisesAtom } from "@/store/general";
import ChooseExercise from "@/components/ChooseExerciseModal";
import WorkoutOverview from "@/components/WorkoutOverview";
import { commonStyles } from "@/styles/commonStyles";
import { fetchWrapper } from "@/middleware/helpers";
import WorkoutExerciseRow from "@/components/WorkoutExerciseRow";

export default function Workout() {
  const [workoutExercises, setWorkoutExercises] = useAtom(workoutExercisesAtom);
  const [workoutStartTime, setWorkoutStartTime] = useAtom(workoutStartTimeAtom);
  const [exerciseList, setExerciseList] = useAtom(exerciseListAtom);
  const [exercises, _] = useAtom(workoutExercisesAtom);
  const [showStartOptions, setShowStartOptions] = useAtom(showWorkoutStartOptionsAtom);
  const [editExercises, setEditExercises] = useAtom(editWorkoutExercisesAtom);

  const [chooseNewExercise, setChooseNewExercise] = useState<boolean>(false);
  const [showOverview, setShowOverview] = useState<boolean>(false);

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
    setEditExercises(false);
    setChooseNewExercise(true);
  };

  const handleShowOverview = () => {
    setEditExercises(false);
    setShowOverview(true)
  };

  useEffect(() => {
    const getData = async () => {
      const data = await fetchWrapper('exercises/list/all', 'GET');
      if (data === null) return;
      setExerciseList(data.exercises)
    };

    getData();
  }, []);

  useEffect(() => {
    if (exercises.length > 0) return;
    setEditExercises(false);
  }, [exercises.length, editExercises])

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
                  <WorkoutExerciseRow 
                    key={i}
                    exercise={exercise} 
                    exerciseIndex={i}
                  />
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
                onPress={handleShowOverview}
              >
                <Text style={{ color: "white"}}>overview</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.textContainer}>
              <TouchableOpacity 
                style={[commonStyles.textButton, editExercises && {borderColor: 'green', backgroundColor: 'green'}]}
                onPress={() => setEditExercises(!editExercises)}
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
    paddingBottom: 100
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