import { OptionsObject } from "@/components/ChooseExerciseModal";
import { TimeSpanOption, TimeSpanOptionObject, useDropdown } from "@/components/ExerciseData";
import MuscleGroupSvg from "@/components/MuscleGroupSvg";
import { fetchWrapper } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { homeMuscleHistoryAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtom, useSetAtom } from "jotai";
import React, { Suspense, useEffect, useState } from "react";
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";

// if have a schedule, see todays workout(s)
// button to start workout
// see previous workouts and their target muscles
// see previous <day number> workouts and muscles worked
// other stats and info
// switch to see friends workouts?

export default function Home() {
  const router = useRouter();

  const [homeMuscleHistory, setHomeMuscleHistory] = useAtom(homeMuscleHistoryAtom);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  const timeSpanOptions: TimeSpanOptionObject[] = [
    { label: 'week', value: 'week' },
    { label: 'month', value: 'month' },
    { label: '3 months', value: '3_months' },
    { label: '6 months', value: '6_months' },
    { label: 'year', value: 'year' },
    { label: 'all', value: 'all' },
  ]
  const [timeSpanValue, setTimeSpanValue] = useState<TimeSpanOption>('month');

  const metricOptions: OptionsObject[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'sets' },
    { label: 'reps', value: 'reps' },
  ]
  const [metricValue, setMetricValue] = useState<string>('volume');

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom)

  const loadData = async () => {
    try {
      setLoadingData(true);
      const data = await fetchWrapper({
        route: 'home/muscles-history',
        method: 'GET'
      })
      if (!data || !data.data) throw new Error('loadData bad response');

      setHomeMuscleHistory(data.data);

    } catch (error) {
      addCaughtErrorLog(error, 'fetching home/muscles-history');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (homeMuscleHistory !== null) return;
    loadData();
  }, []);

  const getValueMap = (): Record<string, number> => {
    const map: Record<string, number> = {};
    if (homeMuscleHistory === null) return map;

    try {
      const data = homeMuscleHistory[timeSpanValue];
      for (const [groupName, groupStats] of Object.entries(data)) {
        const stats = groupStats as Record<string, any>;
        if (stats[metricValue] === 0) continue;
        map[groupName] = stats[metricValue];
        for (const [targetName, targetStats] of Object.entries(stats["targets"])) {
          const targetStat = targetStats as Record<string, any>;
          if (targetStat[metricValue] === 0) continue;
          map[`${groupName}/${targetName}`] = targetStat[metricValue];
        }
      }

      // for (const [groupName, groupStats] of Object.entries(distributions)) {
      //   if (heatmapDisplayValue === 'group') {
      //     if (groupStats[metricOptionValue] === 0) continue;
      //     map[groupName] = groupStats[metricOptionValue];
      //     continue;
      //   } 
      //   for (const [targetName, targetStats] of Object.entries(groupStats["targets"])) {
      //     if (targetStats[metricOptionValue] === 0) continue;
      //     map[`${groupName}/${targetName}`] = targetStats[metricOptionValue];
      //   }
      // }
    } catch (error) {
      addCaughtErrorLog(error, 'error building value map');
    }
    return map;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >       
      <View>
        <Text style={commonStyles.text}>Choose a view:</Text>
        {useDropdown(timeSpanOptions, timeSpanValue, setTimeSpanValue)}
      </View> 
      <View>
        <Text style={commonStyles.text}>Choose a metric:</Text>
        {useDropdown(metricOptions, metricValue, setMetricValue)}
      </View> 
      {/* <TouchableOpacity
        style={[styles.button, {width: 200}]}
        onPress={() => router.replace('/(tabs)/home/friends')}
      >
        <Text style={commonStyles.text}>friends</Text>
      </TouchableOpacity> */}
      <View style={{marginBottom: 20, marginTop: 20}}>
        <MuscleGroupSvg 
          valueMap={getValueMap()} 
          showGroups={false}
          // showGroups={heatmapDisplayValue === 'group'}
        />
      </View>
      <StatusBar style='dark' />
    </View>        
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
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
});