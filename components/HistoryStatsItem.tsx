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

interface HistoryStatsItemProps {
  stats: WorkoutHistoryStats
}

// workout stats (table)
// radar graph: groups, targets
// muscle svg (groups, targets)
// workout replay

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

export default function HistoryStatsItem(props: HistoryStatsItemProps) {
  const { stats } = props;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const displayOptions: DisplayOption[] = [
    { label: 'radar chart', value: 'radar' },
    { label: 'heatmap', value: 'heatmap' },
    { label: 'workout replay', value: 'replay' },
  ]
  const [displayOptionValue, setDisplayOptionValue] = useState<DisplayOptionValue>('radar');

  const muscleOptions: MuscleOption[] = [
    { label: 'muscle groups', value: 'group' },
    { label: 'muscle targets', value: 'target' },
  ]
  const [muscleOptionValue, setMuscleOptionValue] = useState<MuscleOptionValue>('group');

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
      "headers": ["volume", "sets", "reps"],
      "rows": [
        {
          "volume": stats.workout_stats.volume,
          "sets": stats.workout_stats.num_sets,
          "reps": stats.workout_stats.reps,
        }
      ]
    }
  };

  const getGroupRadarData = () => {
    const data: any[] = [];
    for (const [group, groupStats] of Object.entries(stats.workout_muscle_stats)) {
      data.push({
        label: group,
        value: groupStats.volume
      })
    }
    return data;
  };

  return (
    <View
      style={{
        borderColor: 'red',
        borderStyle: 'solid',
        borderWidth: 1,
        padding: 5,
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
          {useDropdown(displayOptions, displayOptionValue, setDisplayOptionValue)}
          {displayOptionValue === 'heatmap' &&
            <>
              {useDropdown(muscleOptions, muscleOptionValue, setMuscleOptionValue)}
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
              <></>
            }   
            {displayOptionValue === 'replay' &&
              <></>
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