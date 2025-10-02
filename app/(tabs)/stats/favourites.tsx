import LoadingScreen from "@/app/loading";
import { useDropdown } from "@/components/ExerciseData";
import { fetchWrapper } from "@/middleware/helpers";
import { favouriteExerciseStatsAtom, FavouriteStatsMetric } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

interface MetricOption {
  label: string
  value: FavouriteStatsMetric
}

export default function StatsDistribution() {
  const router = useRouter();
  
  const [favouriteStats, setFavouriteStats] = useAtom(favouriteExerciseStatsAtom);
  
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  const metricOptions: MetricOption[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'num_sets' },
    { label: 'reps', value: 'reps' },
    { label: 'frequency', value: 'counter' },
  ]
  const [metricOptionValue, setMetricOptionValue] = useState<FavouriteStatsMetric>('volume');

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
      {loadingStats ?
        <LoadingScreen />
      :
        <>
          {favouriteStats === null ?
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={commonStyles.text}>you haven't done any exercises yet!</Text>
            </View>
          :
            <ScrollView
              style={{
                marginTop: 10,
                marginBottom: 10
              }}
            >
              {useDropdown(metricOptions, metricOptionValue, setMetricOptionValue)}
              {favouriteStats
                .sort((a, b) => a[metricOptionValue] - b[metricOptionValue])
                .map((stats) => {
                  return (
                    <View key={stats.exercise_id}>
                      
                    </View>
                  )
                })
              } 
            </ScrollView>
          }
        </>
      }
    </View>
  )
}