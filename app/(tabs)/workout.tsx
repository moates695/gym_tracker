import React, { Suspense, useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, ScrollView, Platform, Alert, FlatList } from "react-native";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { StatusBar } from 'expo-status-bar';

import { exerciseListAtom, workoutExercisesAtom, workoutStartTimeAtom, showWorkoutStartOptionsAtom, editWorkoutExercisesAtom, muscleGroupToTargetsAtom, muscleTargetoGroupAtom, previousWorkoutStatsAtom, loadableWorkoutExercisesAtom, exercisesHistoricalDataAtom, userDataAtom, loadableUserDataAtom } from "@/store/general";
import ChooseExercise from "@/components/ChooseExerciseModal";
import WorkoutOverview from "@/components/WorkoutOverview";
import { commonStyles } from "@/styles/commonStyles";
import { fetchWrapper } from "@/middleware/helpers";
import WorkoutExerciseRow from "@/components/WorkoutExerciseRow";
import LoadingScreen from "../loading";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";

export default function Workout() {
  const [workoutExercises, setWorkoutExercises] = useAtom(workoutExercisesAtom);
  const loadableWorkoutExercises = useAtomValue(loadableWorkoutExercisesAtom);
  const [, setWorkoutStartTime] = useAtom(workoutStartTimeAtom);
  const [userData, setUserData] = useAtom(userDataAtom);
  const loadableUserData = useAtomValue(loadableUserDataAtom);

  const [, setExerciseList] = useAtom(exerciseListAtom);
  const [showStartOptions, setShowStartOptions] = useAtom(showWorkoutStartOptionsAtom);
  const [editExercises, setEditExercises] = useAtom(editWorkoutExercisesAtom);
  const [, setOverviewHistoricalStats] = useAtom(previousWorkoutStatsAtom);
  const [, setexercisesHistoricalData] = useAtom(exercisesHistoricalDataAtom);

  const [, setGroupToTargets] = useAtom(muscleGroupToTargetsAtom);
  const [, setTargetoGroup] = useAtom(muscleTargetoGroupAtom);

  const [chooseNewExercise, setChooseNewExercise] = useState<boolean>(false);
  const [showOverview, setShowOverview] = useState<boolean>(false);

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const getMuscleMaps = async () => {
    try {
      const data = await fetchWrapper({
        route: 'muscles/get_maps',
        method: 'GET'
      });
      if (data === null) return;
      setGroupToTargets(data.group_to_targets);
      setTargetoGroup(data.target_to_group);
    } catch (error) {
      addCaughtErrorLog(error, 'error muscles/get_maps');
    }    
  };

  const getOverviewStats = async () => {
    try {
      const data = await fetchWrapper({
        route: 'workout/overview/stats',
        method: 'GET'
      });
      if (data === null) return;
      setOverviewHistoricalStats(data.workouts);
    } catch (error) {
      addCaughtErrorLog(error, 'error workout/overview/stats');
    }
  };

  const startNewWorkout = async () => {
    setWorkoutExercises([]);
    setWorkoutStartTime(Date.now());
    setexercisesHistoricalData({});

    getMuscleMaps();
    getOverviewStats();
  };

  const handleContinueWorkout = () => {
    setShowStartOptions('workout');
  }

  const handlePressNewWorkout = () => {
    if (Object.keys(workoutExercises).length === 0) {
      handleStartNewWorkout();
      return;
    }
    setShowStartOptions('confirm');
  };

  const handleCancelNewWorkout = () => {
    setShowStartOptions('start');
  };

  const handleStartNewWorkout = () => {
    startNewWorkout();
    setShowStartOptions('workout');
  };

  const handleAddNewExercise = () => {
    setEditExercises(false);
    setChooseNewExercise(true);
  };

  const handleShowOverview = () => {
    setEditExercises(false);
    setShowOverview(true);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchWrapper({
          route: 'exercises/list/all',
          method: 'GET'
        });
        if (data === null) return;
        setExerciseList(data.exercises)
      } catch (error) {
        addCaughtErrorLog(error, 'error exercises/list/all');
      }
    };

    getData();
  }, []);

  useEffect(() => {
    if (workoutExercises.length > 0) return;
    setEditExercises(false);
  }, [workoutExercises, editExercises])

  useEffect(() => {
    getMuscleMaps();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await fetchWrapper({
        route: 'users/data/get',
        method: 'GET'
      })
      if (data === null) return;
      setUserData(data.user_data);
    } catch (error) {
      addCaughtErrorLog(error, 'error users/data/get');
    }
  };

  if (loadableWorkoutExercises.state === 'loading' || loadableUserData.state === 'loading') {
    return <LoadingScreen delay={1000}/>
  }
  if (loadableWorkoutExercises.state === 'hasError') {
    Alert.alert('error loading current workout data');
    setWorkoutExercises([]);
  } 
  if (loadableUserData.state === 'hasError') {
    Alert.alert('error loading user data');
    fetchUserData();
  } else if (loadableUserData.state === 'hasData' && userData === null) {
    return (
      <Suspense fallback={<View style={{ flex: 1, backgroundColor: 'black' }} />}>
        <SafeAreaView style={styles.container}> 
          <Text style={commonStyles.text}>could not load user data</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={fetchUserData}
          >
            <Text style={{ color: "white"}}>refresh</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<View style={{ flex: 1, backgroundColor: 'black' }} />}>
      <SafeAreaView style={styles.container}> 
        {Platform.OS == 'android' &&
          <StatusBar style="light" backgroundColor="black" translucent={false} />
        }
        {showStartOptions === 'start' &&
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
              onPress={() => handlePressNewWorkout()}
            >
              <Text style={{ color: "white"}}>start new workout</Text>
            </TouchableOpacity>
          </View> 
        }
        {showStartOptions === 'confirm' &&
          <>
            <Text style={commonStyles.text}>New workout will override existing</Text>
            <View style={{marginTop: 8}}>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => handleStartNewWorkout()}
              >
                <Text style={{ color: "white"}}>start new</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => handleCancelNewWorkout()}
              >
                <Text style={{ color: "white"}}>back</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        {showStartOptions === 'workout' &&
          <View style={styles.workoutContainer}>
            {workoutExercises.length === 0 &&
              <Text style={{color:'white'}}>no exercises yet</Text>
            }
            <FlatList 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContainer}
              data={workoutExercises}
              renderItem={({ item, index }) => (
                <WorkoutExerciseRow 
                  exercise={item} 
                  exerciseIndex={index}
                />
              )}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <TouchableOpacity 
                  style={commonStyles.textButton}
                  onPress={() => handleAddNewExercise()}
                >
                  <Text style={{ color: "white"}}>choose exercise</Text>
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
                  disabled={workoutExercises.length === 0}
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
    </Suspense>
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