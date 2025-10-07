import LoadingScreen from "@/app/loading";
import { useDropdown } from "@/components/ExerciseData";
import { Leaderboard } from "@/components/Leaderboard";
import RankChart from "@/components/RankChart";
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

// todo add in per exercise, and per muscle group/target stats?

export default function StatsDistribution() {
  const router = useRouter();
  
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  const [volumeLeaderboard, setVolumeLeaderboard] = useAtom(volumeLeaderboardAtom);
  const [setLeaderboard, setSetLeaderboard] = useAtom(setLeaderboardAtom);
  const [repsLeaderboard, setRepsLeaderboard] = useAtom(repsLeaderboardAtom);

  interface MapObject {
    value: LeaderboardData | null
    setter: any
  }
  const overallMap: Record<OverallLeaderboardType, MapObject> = {
    volume: {
      value: volumeLeaderboard,
      setter: setVolumeLeaderboard
    },
    sets: {
      value: setLeaderboard,
      setter: setSetLeaderboard
    },
    reps: {
      value: repsLeaderboard,
      setter: setRepsLeaderboard
    },
  };

  const leaderboardOptions: LeaderboardOption[] = [
    { label: 'overall stats', value: 'overall' },
    { label: 'per exercise', value: 'exercise' },
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
      if (overallMap[overallOptionValue]['value'] !== null) return;
      
      setLoadingStats(true);
      try {
        const data = await fetchWrapper({
          route: 'stats/leaderboards/overall',
          method: 'GET',
          params: {
            table: overallOptionValue,
            top_num: '20',
            side_num: '20'
          }
        });
        if (!data || !data.leaderboard) throw new Error('bad response');
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

  const getPercentile = (rank: number | undefined, maxRank: number | undefined): number | null => {
    if (!rank || ! maxRank) return null;
    return parseFloat((((maxRank - rank) / maxRank) * 100).toFixed(3));
  };

  const userRank = overallMap[overallOptionValue].value?.user_rank;
  const maxRank = overallMap[overallOptionValue].value?.max_rank;

  const rankChart = overallMap[overallOptionValue].value?.rank_data ?? [];

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
      <Text style={commonStyles.text}>Choose leaderboard:</Text>
      {useDropdown(leaderboardOptions, leaderboardOptionValue, setLeaderboardOptionValue)}
      {leaderboardOptionValue === 'overall' &&
        <>
          <Text style={commonStyles.text}>Choose a metric:</Text>
          {useDropdown(overallOptions, overallOptionValue, setOverallOptionValue)}
          {loadingStats ?
            <LoadingScreen />
          :
            <>
              {overallMap[overallOptionValue].value === null ?
                <Text>leaderboard data is empty</Text>
              :
                <>
                  <Leaderboard data={overallMap[overallOptionValue].value} />
                  <View style={{height: 180}}>
                    <RankChart data={rankChart}/>
                  </View>
                  <Text 
                    style={[commonStyles.text, {alignSelf: 'center', paddingBottom: 5}]}
                  >
                    Rank {userRank}/{maxRank}, that's the {getPercentile(userRank, maxRank)} percentile
                  </Text>
                </>
              }
            </>
          }
        </>
      }
    </View>
  )
}