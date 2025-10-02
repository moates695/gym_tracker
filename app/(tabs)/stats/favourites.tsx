import { fetchWrapper } from "@/middleware/helpers";
import { favouriteExerciseStatsAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function StatsDistribution() {
  const router = useRouter();
  
  const [favouriteStats, setFavouriteStats] = useAtom(favouriteExerciseStatsAtom);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  const fetchFavouriteStats = async () => {
    setLoadingStats(true);
    try {
      const data = await fetchWrapper({
        route: 'stats/favourites',
        method: 'GET'
      });
      if (data === null || data.favourites == null) throw new Error('result is empty');
      setFavouriteStats(data.favourites);
    } catch (error) {
      console.log(error);
    }
    setLoadingStats(false);
  };

  useEffect(() => {
    if (favouriteStats !== null) return;
    fetchFavouriteStats();
  }, []);

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
      <TouchableOpacity
        style={[commonStyles.button, {width: 50}]}
        onPress={() => fetchFavouriteStats()}
        disabled={loadingStats}
      >
        <Text style={commonStyles.text}>refresh</Text>
      </TouchableOpacity>
    </View>
  )
}