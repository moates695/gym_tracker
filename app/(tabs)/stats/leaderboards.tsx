import LoadingScreen from "@/app/loading";
import { useDropdown } from "@/components/ExerciseData";
import { fetchWrapper } from "@/middleware/helpers";
import { LeaderboardData, repsLeaderboardAtom, setLeaderboardAtom, volumeLeaderboardAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

type LeaderboardType = 'overall' | 'exercise'
interface LeaderboardOption {
  label: string
  value: LeaderboardType
}

type OverallLeaderboardType = 'volume' | 'sets' | 'reps'
interface OverallLeaderboardOption {
  label: string
  value: OverallLeaderboardType
}

export default function StatsDistribution() {
  const router = useRouter();
  
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  const [volumeLeaderboard, setVolumeLeaderboard] = useAtom(volumeLeaderboardAtom);
  const [setLeaderboard, setSetLeaderboard] = useAtom(setLeaderboardAtom);
  const [repsLeaderboard, setRepsLeaderboard] = useAtom(repsLeaderboardAtom);

  const leaderboardOptions: LeaderboardOption[] = [
    { label: 'volume', value: 'overall' },
    { label: 'sets', value: 'exercise' },
  ]
  const [leaderboardOptionValue, setLeaderboardOptionValue] = useState<LeaderboardType>('overall');

  const overallOptions: OverallLeaderboardOption[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'sets' },
    { label: 'reps', value: 'reps' },
  ]
  const [overallOptionValue, setOverallOptionValue] = useState<OverallLeaderboardType>('volume');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoadingStats(true);
      try {
        const map: Record<OverallLeaderboardType, LeaderboardData | null> = {
          volume: volumeLeaderboard,
          sets: setLeaderboard,
          reps: repsLeaderboard,
        };
        if (map[overallOptionValue] != null) return;
        console.log(overallOptionValue)
        const data = await fetchWrapper({
          route: 'stats/leaderboards/overall',
          method: 'GET',
          params: {
            table: overallOptionValue,
            top_num: '10',
            side_num: '20'
          }
        });
        if (!data || !data.fracture || !data.leaderboard) throw new Error('bad response');
        if (overallOptionValue === 'volume') {
          setVolumeLeaderboard(data);
        } else if (overallOptionValue === 'sets') {
          setSetLeaderboard(data);
        } else if (overallOptionValue === 'reps') {
          setRepsLeaderboard(data);
        }
      } catch (error) {
        console.log(error);
      }
      setLoadingStats(false);
    };
    fetchLeaderboard();
  }, [overallOptionValue]);

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
      {loadingStats ?
        <LoadingScreen />
      :
        <>
          <Text style={commonStyles.text}>Choose leaderboard:</Text>
          {useDropdown(leaderboardOptions, leaderboardOptionValue, setLeaderboardOptionValue)}
          {leaderboardOptionValue === 'overall' &&
            <>
              <Text style={commonStyles.text}>Choose a metric:</Text>
              {useDropdown(overallOptions, overallOptionValue, setOverallOptionValue)}
            </>
          }
        </>
      }
    </View>
  )
}