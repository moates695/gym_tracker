import LoadingScreen from "@/app/loading";
import { OptionsObject } from "@/components/ChooseExerciseModal";
import { TimeSpanOption, TimeSpanOptionObject, useDropdown } from "@/components/ExerciseData";
import MuscleGroupSvg from "@/components/MuscleGroupSvg";
import { fetchWrapper } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { homeMuscleHistoryAtom, muscleGroupToTargetsAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { get } from "lodash";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { RadarChart } from "@salmonco/react-native-radar-chart";

// if have a schedule, see todays workout(s)
// button to start workout
// see previous workouts and their target muscles
// see previous <day number> workouts and muscles worked
// other stats and info
// switch to see friends workouts?

type MuscleHistoryVisual = 'heatmap' | 'radar';

export default function Home() {
  const router = useRouter();

  const [homeMuscleHistory, setHomeMuscleHistory] = useAtom(homeMuscleHistoryAtom);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  
  const muscleGroupToTargets = useAtomValue(muscleGroupToTargetsAtom);

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

  const [muscleVisual, setMuscleVisual] = useState<MuscleHistoryVisual>('heatmap');

  // const muscleGroupOptions: OptionsObject[] = ((): OptionsObject[] => {
  //   const options = [{ label: 'all groups', value: 'all' }];
  //   options.push(...Object.keys(muscleGroupToTargets).map(group => ({
  //     label: group,
  //     value: group
  //   })))
  //   return options;
  // })();
  // const [muscleGroupValue, setMuscleGroupValue] = useState<string>('all');

  // const muscleTargetOptions = ((): Record<string, OptionsObject[]> => {
  //   const optionsMap: Record<string, OptionsObject[]> = {};
  //   for (const [group, targets] of Object.entries(muscleGroupToTargets)) {
  //     optionsMap[group] = targets.map(name => ({
  //       label: name,
  //       value: name
  //     }));
  //   }
  //   return optionsMap;
  // })();
  // const [muscleTargetValue, setMuscleTargetValue] = useState<string>('disabled');

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  // const updateSelectedMuscleGroup = (value: string) => {
  //   setMuscleGroupValue(value);
  //   if (value === 'all') {
  //     setMuscleTargetValue('disabled');
  //     // setRatioOptionsValue('disabled');
  //   } else {
  //     setMuscleTargetValue('all');
  //     // setRatioOptionsValue('7');
  //   }
  // };

  // const getMuscleTargetOptions = (): OptionsObject[] => {
  //   if (muscleGroupValue === 'all') {
  //     return [{ label: 'disabled (select group)', value: 'disabled' }];
  //   }
  //   const temp = muscleTargetOptions[muscleGroupValue];
  //   return [{ label: 'muscle target (all)', value: 'all' }].concat(temp);
  // };

  // const updateSelectedMuscleTarget = (value: string) => {
  //   if (muscleGroupValue === 'all') return;
  //   setMuscleTargetValue(value);
  // };

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
        for (const [targetName, targetStats] of Object.entries((groupStats as any)["targets"])) {
          const targetStat = targetStats as Record<string, any>;
          if (targetStat[metricValue] <= 0) continue;
          map[`${groupName}/${targetName}`] = targetStat[metricValue];
        }
      }
    } catch (error) {
      addCaughtErrorLog(error, 'error building value map');
    }

    return map;
  }

  const radarData = useMemo(() => {
    const data: any[] = [];
    if (homeMuscleHistory === null) return data;
    try {
      const timeData = homeMuscleHistory[timeSpanValue];
      for (const [groupName, groupStats] of Object.entries(timeData)) {
        data.push({
          label: groupName,
          value: (groupStats as any)[metricValue]
        })
      }
    } catch (error) {
      addCaughtErrorLog(error, 'error building radar data');
    }
    return data;
  }, [homeMuscleHistory, timeSpanValue, metricValue]);

  const canDisplayRadarData = (radarData: any) => {
    let count = 0;
    for (const data of radarData) {
      if (data.value === 0) count++;
    }
    return count < radarData.length;
  };

  const radarComponent = (() => {
    if (!canDisplayRadarData(radarData)) {
      return (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: 200,
          }}
        >
          <Text style={commonStyles.text}>
            Not enough data to display radar chart :(
          </Text>
        </View>
      )
    }
    return (
      <RadarChart 
        data={radarData}
        gradientColor={{
          startColor: '#00000000',
          endColor: '#00000000',
          count: 4,
        }}
        strokeWidth={[0.5, 0.5, 0.5, 0.5, 1]}
        strokeOpacity={[1, 1, 1, 1, 0.13]}
        labelColor="#f6f6f6ff"
        dataFillColor="#ff9430ff"
        dataFillOpacity={0.8}
        dataStroke="#ff7f08ff"
        labelSize={10}
      />
    )
  })();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'black',
        // justifyContent: 'center',
        alignItems: 'center',
      }}
    >       
      <View
        style={{
          // flex: 1,
          alignItems: 'center',
          borderColor: '#ccc',
          borderWidth: 1,
          borderRadius: 10,
          padding: 10,
          width: '100%',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            width: '100%',
            // marginTop: 10,
          }}
        >
          <View>
            <Text style={commonStyles.text}>Choose a lookback:</Text>
            {useDropdown(timeSpanOptions, timeSpanValue, setTimeSpanValue)}
          </View> 
          <View 
            style={{marginLeft: 10}}
          >
            <Text style={commonStyles.text}>Choose a metric:</Text>
            {useDropdown(metricOptions, metricValue, setMetricValue)}
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <TouchableOpacity
            style={[
              commonStyles.thinTextButton,
              muscleVisual === 'heatmap' && commonStyles.thinTextButtonHighlighted
            ]}
            onPress={() => setMuscleVisual('heatmap')}
          >
            <Text 
              style={[
                commonStyles.text,
                muscleVisual === 'heatmap' && {
                  color: 'black'
                }
              ]}
            >
              heatmap
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              commonStyles.thinTextButton,
              {marginLeft: 10},
              muscleVisual === 'radar' && commonStyles.thinTextButtonHighlighted
            ]}
            onPress={() => setMuscleVisual('radar')}
          >
            <Text 
              style={[
                commonStyles.text,
                muscleVisual === 'radar' && {
                  color: 'black'
                }
              ]}
            >
              radar chart
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{paddingTop: 10}}/>
        {muscleVisual === 'heatmap' &&
          <MuscleGroupSvg 
            valueMap={getValueMap()} 
            showGroups={false}
          />
        }
        {muscleVisual === 'radar' &&
          radarComponent 
        }
      </View>
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