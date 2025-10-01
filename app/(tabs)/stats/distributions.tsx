import { OptionsObject } from "@/components/ChooseExerciseModal";
import DataTable, { TableData } from "@/components/DataTable";
import { useDropdown } from "@/components/ExerciseData";
import MuscleGroupSvg from "@/components/MuscleGroupSvg";
import { fetchWrapper } from "@/middleware/helpers";
import { distributionStatsAtom, DistributionStatsMetric, muscleGroupToTargetsAtom, muscleTargetoGroupAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { RadarChart } from "@salmonco/react-native-radar-chart";
import { useRouter } from "expo-router";
import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

// change to: for radar select muscle group, for heatmap select group or target for display

interface MetricOption {
  label: string
  value: DistributionStatsMetric
}

type DisplayOptionValue = 'radar' | 'heatmap'
interface DisplayOption {
  label: string
  value: DisplayOptionValue
}

export default function StatsDistribution() {
  const router = useRouter();
  
  const [distributions, setDistributions] = useAtom(distributionStatsAtom);
  const [groupToTargets, setGroupToTargets] = useAtom(muscleGroupToTargetsAtom);
  const [, setTargetoGroup] = useAtom(muscleTargetoGroupAtom);

  const [loadingDistributions, setLoadingDistributions] = useState<boolean>(false);

  const muscleGroupOptions: OptionsObject[] = useMemo((): OptionsObject[] => {
    const options = [{ label: 'all groups', value: 'all' }];
    options.push(...Object.keys(groupToTargets).map(group => ({
      label: group,
      value: group
    })))
    return options;
  }, [groupToTargets]);
  const [muscleGroupValue, setMuscleGroupValue] = useState<string>('all');

  const metricOptions: MetricOption[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'num_sets' },
    { label: 'reps', value: 'reps' },
    { label: 'num_exercises', value: 'num_exercises' },
  ]
  const [metricOptionValue, setMetricOptionValue] = useState<DistributionStatsMetric>('volume');

  const displayOptions: DisplayOption[] = [
    { label: 'radar chart', value: 'radar' },
    { label: 'heatmap', value: 'heatmap' },
  ]
  const [displayOptionValue, setDisplayOptionValue] = useState<DisplayOptionValue>('radar');

  const fetchDistributionStats = async () => {
    setLoadingDistributions(true);
    try {
      const data = await fetchWrapper({
        route: 'stats/distributions',
        method: 'GET'
      });
      if (data === null || data.distributions == null) throw new Error('result is empty');
      setDistributions(data.distributions);
    } catch (error) {
      console.log(error);
    }
    setLoadingDistributions(false);
  };
  
  useEffect(() => {
    if (distributions !== null) return;
    fetchDistributionStats();
  }, []);

  const getMuscleMaps = async () => {
    const data = await fetchWrapper({
      route: 'muscles/get_maps',
      method: 'GET'
    });
    if (data === null) return;
    setGroupToTargets(data.group_to_targets);
    setTargetoGroup(data.target_to_group);
  };

  useEffect(() => {
    if (Object.keys(groupToTargets).length > 0) return;
    getMuscleMaps();
  }, []);

  const refreshData = async () => {
    await Promise.all([
      fetchDistributionStats(),
      getMuscleMaps()
    ])
  };

  const getRadarData = (): any[] => {
    const data: any[] = [];
    if (distributions === null) return data;
    try {
      if (muscleGroupValue === 'all') {
        for (const [groupName, groupStats] of Object.entries(distributions)) {
          data.push(
            {
              label: groupName,
              value: groupStats[metricOptionValue]
            }
          )
        }
      } else {
        for (const [targetName, targetStats] of Object.entries(distributions[muscleGroupValue]["targets"])) {
          data.push(
            {
              label: targetName,
              value: targetStats[metricOptionValue] ?? 0
            }
          )
        }
      }
    } catch (error) {
      console.log(error)
    }

    return data;
  };

  const getValueMap = (): Record<string, number> => {
    const map: Record<string, number> = {};
    if (distributions === null) return map;

    try {
      for (const [groupName, groupStats] of Object.entries(distributions)) {
        if (muscleGroupValue === 'all') {
          if (groupStats[metricOptionValue] === 0) continue;
          map[groupName] = groupStats[metricOptionValue];
          continue;
        } 
        for (const [targetName, targetStats] of Object.entries(distributions[muscleGroupValue]["targets"])) {
          if (targetStats[metricOptionValue] === 0) continue;
          map[`${groupName}/${targetName}`] = targetStats[metricOptionValue];
        }
      }

      // for (const [groupName, groupStats] of Object.entries(stats.workout_muscle_stats)) {
      //   if (muscleOptionValue === 'group') {
      //     if (groupStats[statOptionValue] === 0) continue;
      //     map[groupName] = groupStats[statOptionValue];
      //   } else {
      //     for (const [targetName, targetStats] of Object.entries(groupStats.targets)) {
      //       if (targetStats[statOptionValue] === 0) continue;
      //       map[`${groupName}/${targetName}`] = targetStats[statOptionValue]
      //     }
      //   }
      // }
    } catch (error) {
      console.log(error);
    }
    return map;
  }

  const getTableData = (): TableData<string[], string | number> => {
    const headers: string[] = ['volume', 'sets', 'reps', 'exercises'];
    const rows: Record<string, string | number>[] = [];

    return {
      headers,
      rows
    }
  };

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
      <TouchableOpacity
        style={[commonStyles.button, {width: 50}]}
        onPress={refreshData}
        disabled={loadingDistributions}
      >
        <Text style={commonStyles.text}>refresh</Text>
      </TouchableOpacity>
      <Text style={commonStyles.text}>Choose a metric:</Text>
      {useDropdown(metricOptions, metricOptionValue, setMetricOptionValue)}
      <Text style={commonStyles.text}>Choose a display:</Text>
      {useDropdown(displayOptions, displayOptionValue, setDisplayOptionValue)}
      <Text style={commonStyles.text}>Choose a muscle group:</Text>
      {useDropdown(muscleGroupOptions, muscleGroupValue, setMuscleGroupValue)}
      {displayOptionValue === 'radar' &&
        <>
          {muscleGroupValue !== 'chest' ? 
            <View 
              style={{
                width: '100%',
                alignItems: 'center'
              }}
            >
              <RadarChart 
                data={getRadarData()}
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
                labelSize={12}
              />
            </View>
          :
            <Text style={commonStyles.text}>chest does not have enough targets to show a radar :(</Text>
          }
        </>
      }
      {displayOptionValue === 'heatmap' &&
        <View style={{marginBottom: 20, marginTop: 20}}>
          <MuscleGroupSvg 
            valueMap={getValueMap()} 
            showGroups={muscleGroupValue === 'all'}
          />
        </View>
      }
      <DataTable tableData={getTableData()}/>
    </View>
  )
}