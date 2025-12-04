import LoadingScreen from "@/app/loading";
import { OptionsObject } from "@/components/ChooseExerciseModal";
import { useDropdown } from "@/components/ExerciseData";
import { fetchWrapper } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { FavouriteExercisesStats, favouriteExerciseStatsAtom, FavouriteStatsMetric, muscleGroupToTargetsAtom, muscleTargetoGroupAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, FlatList, StyleSheet } from "react-native";

interface MetricOption {
  label: string
  value: FavouriteStatsMetric
}

export default function StatsFavourites() {
  const router = useRouter();
  
  const [favouriteStats, setFavouriteStats] = useAtom(favouriteExerciseStatsAtom);
  const [groupToTargets, setGroupToTargets] = useAtom(muscleGroupToTargetsAtom);
  const [, setTargetoGroup] = useAtom(muscleTargetoGroupAtom);
  
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  const metricOptions: MetricOption[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'num_sets' },
    { label: 'reps', value: 'reps' },
    { label: 'frequency', value: 'counter' },
  ]
  const [metricOptionValue, setMetricOptionValue] = useState<FavouriteStatsMetric>('volume');

  const muscleGroupOptions: OptionsObject[] = useMemo((): OptionsObject[] => {
      const options = [{ label: 'all groups', value: 'all' }];
      options.push(...Object.keys(groupToTargets).map(group => ({
        label: group,
        value: group
      })))
      return options;
    }, [groupToTargets]);
    const [muscleGroupValue, setMuscleGroupValue] = useState<string>('all');

  const fetchFavouriteStats = async () => {
    try {
      const data = await fetchWrapper({
        route: 'stats/favourites',
        method: 'GET'
      });
      if (data === null || data.favourites == null) throw new Error('result is empty');
      setFavouriteStats(data.favourites);
    } catch (error) {
      addCaughtErrorLog(error, 'error stats/favourites');
    }
  };

  const getMuscleMaps = async () => {
    try {
      const data = await fetchWrapper({
        route: 'muscles/get_maps',
        method: 'GET'
      });
      if (!data || !data.group_to_targets || !data.target_to_group) throw new Error('muscle maps bad response');
      setGroupToTargets(data.group_to_targets);
      setTargetoGroup(data.target_to_group);
    } catch (error) {
      addCaughtErrorLog(error, 'error muscles/get_maps');
    }
  };

  const refreshData = async () => {
    setLoadingStats(true);
    await Promise.all([
      fetchFavouriteStats(),
      getMuscleMaps()
    ]);
    setLoadingStats(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const getFilteredData = (): FavouriteExercisesStats[] => {
    if (favouriteStats === null) return [];
    try {
      return favouriteStats
              .filter((stats) => { 
                if (muscleGroupValue === 'all') return true;
                return stats.groups.includes(muscleGroupValue); 
              })
              .sort((a, b) => b[metricOptionValue] - a[metricOptionValue])
    } catch (error) {
      addCaughtErrorLog(error, 'error filtering favourite stats');
      return [];
    }        
  };

  return (
    <View 
      style={{
        flex: 1
      }}
    >
      <TouchableOpacity
        style={[commonStyles.thinTextButton, {width: 50, marginLeft: 12}]}
        onPress={refreshData}
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
            <View 
              style={{
                marginTop: 10,
                flex: 1,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginLeft: 12,
                  marginRight: 12,
                }}
              >
                <View>
                  <Text style={commonStyles.text}>Choose a metric:</Text>
                  {useDropdown(metricOptions, metricOptionValue, setMetricOptionValue)}
                </View>
                <View>
                  <Text style={commonStyles.text}>Choose a muscle group:</Text>
                  {useDropdown(muscleGroupOptions, muscleGroupValue, setMuscleGroupValue)}
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                }}
              >
                <FlatList 
                  style={{
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                  contentContainerStyle={{
                    alignItems: 'center'
                  }}
                  data={getFilteredData()}
                  keyExtractor={(item) => item.exercise_id}
                  renderItem={({ item, index }) => (
                    <View 
                      style={{
                        flexDirection: 'row',
                        width: '98%',
                        justifyContent: 'space-between',
                        padding: 5,
                        backgroundColor: index % 2 ? '#000000': '#222328ff',
                        borderRadius: 5,
                      }}
                    >
                      <View>
                        <Text style={commonStyles.text}>
                          {item.exercise_name}
                        </Text>
                        {item.variation_name && 
                          <Text style={commonStyles.text}>
                            ({item.variation_name})
                          </Text>
                        }
                      </View>
                      <Text style={commonStyles.text}>{item[metricOptionValue]}</Text>
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>
          }
        </>
      }
    </View>
  )
}