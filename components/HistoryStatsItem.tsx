import { timestampToDateStr } from "@/middleware/helpers";
import { WorkoutHistoryStats } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {RadarChart} from '@salmonco/react-native-radar-chart';

interface HistoryStatsItemProps {
  stats: WorkoutHistoryStats
}

export default function HistoryStatsItem(props: HistoryStatsItemProps) {
  const { stats } = props;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const getFriendlyDuration = (duration_secs: number): string => {
    const seconds = duration_secs % 60;
    const minutes = Math.floor(duration_secs / 60) % 60;
    const hours = Math.floor(duration_secs / 60 / 60);

    if (hours === 0) {
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

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
    <TouchableOpacity
      onPress={() => setIsExpanded(!isExpanded)}
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
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}
          >
            <Text style={commonStyles.text}>
              {timestampToDateStr(stats.metadata.started_at)}
            </Text>
            <RadarChart 
              data={getGroupRadarData()}
              // maxValue={100}
              gradientColor={{
                startColor: '#000000ff',
                endColor: '#ff5900ff',
                count: 5,
              }}
              stroke={['#FFE8D3', '#FFE8D3', '#FFE8D3', '#FFE8D3', '#ff9532']}
              strokeWidth={[0.5, 0.5, 0.5, 0.5, 1]}
              strokeOpacity={[1, 1, 1, 1, 0.13]}
              labelColor="#433D3A"
              dataFillColor="#FF9432"
              dataFillOpacity={0.8}
              dataStroke="salmon"
            />
            <Text style={commonStyles.text}>
              {getFriendlyDuration(stats.metadata.duration)}
            </Text>
          </View>
        </View>
      :
        <View
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
        </View>
      }
    </TouchableOpacity>
  )
}