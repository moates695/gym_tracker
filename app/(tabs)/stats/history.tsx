import HistoryStatsItem from "@/components/HistoryStatsItem";
import { fetchWrapper } from "@/middleware/helpers";
import { workoutHistoryStatsAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";

export default function StatsDistribution() {
  const [workoutHistoryStats, setWorkoutHistoryStats] = useAtom(workoutHistoryStatsAtom);
    
  const fetchWorkoutTotalStats = async () => {
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
  };

  useEffect(() => {
    if (workoutHistoryStats !== null) return;
    fetchWorkoutTotalStats();
  }, []);

  return (
    <SafeAreaView 
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
      {workoutHistoryStats === null ?
        <Text style={commonStyles.text}>no previous workouts!</Text>
      :
        <View>
          <TouchableOpacity
            style={[commonStyles.button, {width: 50}]}
          >
            <Text style={commonStyles.text}>refresh</Text>
          </TouchableOpacity>
          <ScrollView
            style={{
              marginBottom: 30
            }}
          >
            {workoutHistoryStats.map((historyStats, i) => {
              return (
                <HistoryStatsItem 
                  key={i}
                  stats={historyStats}
                />
              )
            })}
          </ScrollView>
        </View>
      }      
    </SafeAreaView>
  )
}