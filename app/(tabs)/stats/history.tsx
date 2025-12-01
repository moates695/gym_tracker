import LoadingScreen from "@/app/loading";
import HistoryStatsItem from "@/components/HistoryStatsItem";
import { fetchWrapper } from "@/middleware/helpers";
import { workoutHistoryStatsAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, FlatList } from "react-native";

export default function StatsDistribution() {
  const [workoutHistoryStats, setWorkoutHistoryStats] = useAtom(workoutHistoryStatsAtom);
    
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const fetchWorkoutHistoryStats = async () => {
    setLoadingHistory(true);
    try {
      const data = await fetchWrapper({
        route: 'stats/history',
        method: 'GET'
      });
      if (data === null || data.stats == null) throw new Error('result is empty');
      setWorkoutHistoryStats(data.stats);
    } catch (error) {
      console.log(error);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    if (workoutHistoryStats !== null) return;
    fetchWorkoutHistoryStats();
  }, []);

  return (
    <SafeAreaView 
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
      <TouchableOpacity
        style={[commonStyles.thinTextButton, {width: 50}]}
        onPress={() => fetchWorkoutHistoryStats()}
        disabled={loadingHistory}
      >
        <Text style={commonStyles.text}>refresh</Text>
      </TouchableOpacity>
      {loadingHistory ?
        <LoadingScreen />
      :
        <>

          {workoutHistoryStats === null || workoutHistoryStats.length === 0 ?
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={commonStyles.text}>no previous workouts!</Text>
            </View>
          :
            <FlatList 
              style={{
                marginTop: 10,
                marginBottom: 10,
              }}
              data={workoutHistoryStats}
              renderItem={({ item }) => (
                <HistoryStatsItem stats={item} />
              )}
              showsVerticalScrollIndicator={false}
            />
          }      
        </>
      }
    </SafeAreaView>
  )
}