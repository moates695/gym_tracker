import { timestampToDateStr } from "@/middleware/helpers";
import { muscleGroupToTargetsAtom, WorkoutHistoryStats } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {RadarChart} from '@salmonco/react-native-radar-chart';
import { useAtom } from "jotai";
import DataTable from "./DataTable";
import { OptionsObject } from "./ChooseExerciseModal";
import { useDropdown } from "./ExerciseData";
import MuscleGroupSvg from "./MuscleGroupSvg";

interface HistoryStatsItemProps {
  stats: WorkoutHistoryStats
}

// todo: workout replay list

type DisplayOptionValue = 'radar' | 'heatmap' | 'replay'
interface DisplayOption {
  label: string
  value: DisplayOptionValue
}

type MuscleOptionValue = 'group' | 'target'
interface MuscleOption {
  label: string
  value: MuscleOptionValue
}

type StatOptionValue = 'volume' | 'num_sets' | 'reps'
interface StatOption {
  label: string
  value: StatOptionValue
}

export default function HistoryStatsItem(props: HistoryStatsItemProps) {
  const { stats } = props;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const displayOptions: DisplayOption[] = [
    { label: 'heatmap', value: 'heatmap' },
    { label: 'radar chart', value: 'radar' },
    { label: 'workout details', value: 'replay' },
  ]
  const [displayOptionValue, setDisplayOptionValue] = useState<DisplayOptionValue>('heatmap');

  const statOptions: StatOption[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'num_sets' },
    { label: 'reps', value: 'reps' },
  ]
  const [statOptionValue, setStatOptionValue] = useState<StatOptionValue>('volume');

  const muscleOptions: MuscleOption[] = [
    { label: 'muscle groups', value: 'group' },
    { label: 'muscle targets', value: 'target' },
  ]
  const [muscleOptionValue, setMuscleOptionValue] = useState<MuscleOptionValue>('target');

  const getFriendlyDuration = (duration_secs: number): string => {
    const seconds = duration_secs % 60;
    const minutes = Math.floor(duration_secs / 60) % 60;
    const hours = Math.floor(duration_secs / 60 / 60);

    if (hours === 0) {
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const getTableData = () => {
    return {
      "headers": ["volume", "exercises", "sets", "reps"],
      "rows": [
        {
          "volume": stats.workout_stats.volume,
          "exercises": stats.workout_stats.num_exercises,
          "sets": stats.workout_stats.num_sets,
          "reps": stats.workout_stats.reps,
        }
      ]
    }
  };

  const getGroupRadarData = (): any[] => {
    const data: any[] = [];
    for (const [group, groupStats] of Object.entries(stats.workout_muscle_stats)) {
      data.push({
        label: group,
        value: groupStats[statOptionValue]
      })
    }
    return data;
  };

  const getValueMap = (): Record<string, number> => {
    const map: Record<string, number> = {};
    try {
      for (const [groupName, groupStats] of Object.entries(stats.workout_muscle_stats)) {
        if (muscleOptionValue === 'group') {
          if (groupStats[statOptionValue] === 0) continue;
          map[groupName] = groupStats[statOptionValue];
        } else {
          for (const [targetName, targetStats] of Object.entries(groupStats.targets)) {
            if (targetStats[statOptionValue] === 0) continue;
            map[`${groupName}/${targetName}`] = targetStats[statOptionValue]
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
    return map;
  };

  return (
    <View
      style={{
        borderColor: 'red',
        borderStyle: 'solid',
        borderWidth: 1,
        padding: 5,
        paddingLeft: 12,
        paddingRight: 12,
        borderRadius: 5,
        margin: 2,
      }}
    >
      {isExpanded ?
        <View>
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}
          >
            <Text style={commonStyles.text}>
              {timestampToDateStr(stats.metadata.started_at)}
            </Text>
            <Text style={commonStyles.text}>
              {getFriendlyDuration(stats.metadata.duration)}
            </Text>
          </TouchableOpacity>
          <DataTable tableData={getTableData()} />
          <Text style={commonStyles.text}>Choose a data display:</Text>
          {useDropdown(displayOptions, displayOptionValue, setDisplayOptionValue)}
          {displayOptionValue !== 'replay' &&
            <>
              <Text style={commonStyles.text}>Choose a metric:</Text>
              {useDropdown(statOptions, statOptionValue, setStatOptionValue)}
            </>
          }
          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {displayOptionValue === 'radar' &&
              <RadarChart 
                data={getGroupRadarData()}
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
            }
            {displayOptionValue === 'heatmap' &&
              <>
                <View
                  style={{
                    alignSelf: 'flex-start'
                  }}
                >
                  <Text style={commonStyles.text}>Choose a muscle grouping:</Text>
                  {useDropdown(muscleOptions, muscleOptionValue, setMuscleOptionValue)}
                </View>
                <MuscleGroupSvg valueMap={getValueMap()} showGroups={muscleOptionValue === 'group'}/>
              </>
            }   
            {displayOptionValue === 'replay' &&
              <>
                {stats.replay.map((exerciseStats, i) => {
                  return (
                    <View 
                      key={i}
                      style={{
                        borderColor: 'gray',
                        borderWidth: 1,
                        borderRadius: 5,
                        padding: 5,
                        margin: 2,
                        width: '90%',
                      }}
                    >
                      <Text style={commonStyles.text}>{exerciseStats.exercise_name}</Text>
                      {exerciseStats.variation_name !== null &&
                        <Text style={commonStyles.text}>{exerciseStats.variation_name}</Text>
                      }
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-around',
                          width: '100%',
                        }}
                      >
                        <Text style={[commonStyles.text, {width: '25%', textAlign: 'center'}]}>
                          Reps
                        </Text>
                        <Text style={[commonStyles.text, {width: '25%', textAlign: 'center'}]}>
                          Weight
                        </Text>
                        <Text style={[commonStyles.text, {width: '25%', textAlign: 'center'}]}>
                          Sets
                        </Text>
                        <Text style={[commonStyles.text, {width: '25%', textAlign: 'center'}]}>
                          Class
                        </Text>
                      </View>
                      {exerciseStats.set_data.map((setData, j) => {
                        return (
                          <View
                            key={j}
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-around',
                              width: '100%',
                            }}
                          >
                            <Text style={[commonStyles.text, {width: '25%', textAlign: 'center'}]}>
                              {setData.reps}
                            </Text>
                            <Text style={[commonStyles.text, {width: '25%', textAlign: 'center'}]}>
                              {setData.weight}
                            </Text>
                            <Text style={[commonStyles.text, {width: '25%', textAlign: 'center'}]}>
                              {setData.num_sets}
                            </Text>
                            <Text style={[commonStyles.text, {width: '25%', textAlign: 'center'}]}>
                              {setData.class}
                            </Text>
                          </View>
                        )
                      })}
                    </View>
                  )
                })}
              </>
            } 
          </View>
        </View>
      :
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Text style={commonStyles.text}>
            {timestampToDateStr(stats.metadata.started_at)}
          </Text>
          <Text style={commonStyles.text}>
            {stats.metadata.top_groups.join(', ')}
          </Text>
          <Text style={commonStyles.text}>
            {getFriendlyDuration(stats.metadata.duration)}
          </Text>
        </TouchableOpacity>
      }
    </View>
  )
}