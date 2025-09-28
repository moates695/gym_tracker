import { fetchWrapper } from "@/middleware/helpers";
import { workoutHistoryStatsAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";

// get workout stat + muscle stat
// get actual workout set_data
// show muscle distribution on svg and chart

export default function StatsDistribution() {
  const router = useRouter();

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
    <View 
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
      <TouchableOpacity
        style={commonStyles.button}
        onPress={() => router.replace('/(tabs)/stats')}
      >
        <Text style={commonStyles.text}>back</Text>
      </TouchableOpacity>
      <Text style={commonStyles.text}>history</Text>
    </View>
  )
}