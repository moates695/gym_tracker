import LoadingScreen from "@/app/loading";
import DataTable, { TableData } from "@/components/DataTable";
import { fetchWrapper, formatMagnitude, formatMinutes, pad, timeSplit } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { WorkoutTotalStats, workoutTotalStatsAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { Stack, useRouter } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import React, { Suspense, useEffect, useState } from "react";
import { SafeAreaView, View, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function Stats() {
  const router = useRouter();

  const [workoutTotalStats, setWorkoutTotalStats] = useAtom(workoutTotalStatsAtom);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const fetchWorkoutTotalStats = async () => {
    setLoadingStats(true);
    try {
      const data = await fetchWrapper({
        route: 'stats/workout_totals',
        method: 'GET'
      });
      if (data === null || data.totals == null) throw new Error('result is empty');
      setWorkoutTotalStats(data.totals);
    } catch (error) {
      addCaughtErrorLog(error, 'fetching workout totals');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    // if (workoutTotalStats !== null) return;
    fetchWorkoutTotalStats();
  }, []);

  const tableData1: TableData<string[], string | number> = {
    headers: ['volume','sets','reps'],
    rows: [
      {
        'volume': formatMagnitude(workoutTotalStats?.volume ?? 0),
        'sets': formatMagnitude(workoutTotalStats?.num_sets ?? 0),
        'reps': formatMagnitude(workoutTotalStats?.reps ?? 0),
      }
    ]
  }

  const getDuration = (minutes: number): string => {
    try {
      const {
        days,
        hours,
        mins
      } = timeSplit(minutes);
      return `${days}d ${hours}h ${mins}m`
    } catch (error) {
      addCaughtErrorLog(error, 'error getDuration');
      return '00:00:00'
    }
  };

  const tableData2: TableData<string[], string | number> = {
    headers: ['duration','workouts','exercises'],
    rows: [
      {
        'duration': getDuration(Math.round(workoutTotalStats?.duration ?? 0)),
        'workouts': formatMagnitude(workoutTotalStats?.num_workouts ?? 0),
        'exercises': formatMagnitude(workoutTotalStats?.num_exercises ?? 0),
      }
    ]
  }

  const statsTotals = (): JSX.Element => {
    if (loadingStats) {
      return (
        <View
          style={{
            height: 120,
            backgroundColor: 'red'
          }}
        > 
          <LoadingScreen />
        </View>
      )
    } else if (workoutTotalStats === null) {
      return (
        <View style={{height: 100, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={commonStyles.text}>stats haven't loaded</Text> 
        </View>
      )
    } else {
      return (
        <View
          style={{
            width: '100%',
            height: 120,
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <DataTable tableData={tableData1} />
          <DataTable tableData={tableData2} />
        </View>
      )
    }
  };

  return (
    <Suspense fallback={<View style={{ flex: 1, backgroundColor: 'black' }} />}>
      <SafeAreaView style={styles.container}>
        {statsTotals()}
        <TouchableOpacity
          style={[styles.button, {width: 200}]}
          onPress={() => router.replace('/(tabs)/stats/distributions')}
        >
          <Text style={styles.text}>Muscle Distributions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, {width: 200}]}
          onPress={() => router.replace('/(tabs)/stats/leaderboards')}
        >
          <Text style={styles.text}>Leaderboards</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, {width: 200}]}
          onPress={() => router.replace('/(tabs)/stats/favourites')}
        >
          <Text style={styles.text}>Favourite Exercises</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, {width: 200}]}
          onPress={() => router.replace('/(tabs)/stats/history')}
        >
          <Text style={styles.text}>Workout History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, {width: 200}]}
          onPress={() => router.replace('/(tabs)/stats/exercises')}
        >
          <Text style={styles.text}>Exercise History</Text>
        </TouchableOpacity>
        <View style={{alignItems: 'center'}}>
          <TouchableOpacity
            style={[commonStyles.thinTextButton, {width: 50, marginTop: 10}]}
            onPress={() => fetchWorkoutTotalStats()}
            disabled={loadingStats}
          >
            <Text style={styles.text}>refresh</Text>
          </TouchableOpacity>
        </View>
        
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
