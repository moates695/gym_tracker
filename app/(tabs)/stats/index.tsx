import { fetchWrapper } from "@/middleware/helpers";
import { workoutTotalStatsAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { Stack, useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { Suspense, useEffect } from "react";
import { SafeAreaView, View, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function Stats() {
  const router = useRouter();

  const [workoutTotalStats, setWorkoutTotalStats] = useAtom(workoutTotalStatsAtom);
  
  const fetchWorkoutTotalStats = async () => {
    try {
      const data = await fetchWrapper({
        route: 'stats/workout_totals',
        method: 'GET'
      });
      if (data === null || data.totals == null) throw new Error('result is empty');
      setWorkoutTotalStats(data.totals);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (workoutTotalStats !== null) return;
    fetchWorkoutTotalStats();
  }, []);

  return (
    <Suspense fallback={<View style={{ flex: 1, backgroundColor: 'black' }} />}>
      <SafeAreaView style={styles.container}>
        {workoutTotalStats === null ?
          <>
            <Text style={commonStyles.text}>stats haven't loaded</Text> 
          </>
        :
          <>
            <Text style={commonStyles.text}>Volume: {workoutTotalStats?.volume}</Text>
            <Text style={commonStyles.text}>Sets: {workoutTotalStats?.num_sets}</Text>
            <Text style={commonStyles.text}>Reps: {workoutTotalStats?.reps}</Text>
            <Text style={commonStyles.text}>Duration: {workoutTotalStats?.duration}</Text>
            <Text style={commonStyles.text}># workouts: {workoutTotalStats?.num_workouts}</Text>
            <Text style={commonStyles.text}># exercises : {workoutTotalStats?.num_exercises}</Text>
          </>
        }
        
        <TouchableOpacity
          style={[styles.button, {width: 150}]}
          onPress={() => router.replace('/(tabs)/stats/distribution')}
        >
          <Text style={styles.text}>Distributions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, {width: 150}]}
          onPress={() => router.replace('/(tabs)/stats/leaderboards')}
        >
          <Text style={styles.text}>Leaderboards</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, {width: 150}]}
          onPress={() => router.replace('/(tabs)/stats/favourites')}
        >
          <Text style={styles.text}>Favourites</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, {width: 150}]}
          onPress={() => router.replace('/(tabs)/stats/history')}
        >
          <Text style={styles.text}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[commonStyles.thinTextButton, {width: 50}]}
          onPress={() => fetchWorkoutTotalStats()}
        >
          <Text style={styles.text}>refresh</Text>
        </TouchableOpacity>
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
  },
  text: {
    color: 'white'
  },
  buttonContainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  }
});
