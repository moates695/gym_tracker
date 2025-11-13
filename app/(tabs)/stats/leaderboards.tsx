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

type OverallLeaderboardType = 'volume' | 'sets' | 'reps' | 'exercises' | 'workouts' | 'duration'
interface OverallLeaderboardOption {
  label: string
  value: OverallLeaderboardType
}

// todo add in per exercise, and per muscle group/target stats?

export default function StatsDistribution() {
  const router = useRouter();

  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);

  const leaderboardOptions: LeaderboardOption[] = [
    { label: 'overall stats', value: 'overall' },
    { label: 'per exercise', value: 'exercise' },
  ]
  const [leaderboardOptionValue, setLeaderboardOptionValue] = useState<LeaderboardType>('overall');

  const overallOptions: OverallLeaderboardOption[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'sets' },
    { label: 'reps', value: 'reps' },
    { label: '# exercises', value: 'exercises' },
    { label: '# workouts', value: 'workouts' },
    { label: 'duration', value: 'duration' },
  ]
  const [overallOptionValue, setOverallOptionValue] = useState<OverallLeaderboardType>('volume');

  const fetchLeaderboard = async () => {
    try {
      setLoadingStats(true);
      if (leaderboardOptionValue === 'overall') {
        const data = await fetchWrapper({
          route: 'stats/leaderboards/overall',
          method: 'GET',
          params: {
            top_num: '2',
            side_num: '3'
          }
        });
        if (!data || !data.leaderboards) throw new Error('bad response');
        const overallMap: Record<OverallLeaderboardType, string> = {
          volume: "overall_volume",
          sets: "overall_sets",
          reps: "overall_reps",
          exercises: "overall_exercises",
          workouts: "overall_workouts",
          duration: "overall_duration",
        }
        const overallData = data.leaderboards[overallMap[overallOptionValue]];
        setLeaderboardData(overallData);
      }
    } catch (error) {
      setLeaderboardData(null);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardOptionValue, overallOptionValue])

  const getPercentile = (rank: number | null, maxRank: number | null): number | null => {
    if (rank === null || !maxRank) return null;
    return parseFloat((((maxRank - rank) / maxRank) * 100).toFixed(3));
  };

  const renderLeaderboard = (): JSX.Element => {
    if (loadingStats) {
      return <LoadingScreen />;
    } else if (leaderboardData === null) {
      return (
        <Text style={commonStyles.text}>
          leaderboard data did not load
        </Text>
      )
    }
    return (
      <>
        <Leaderboard data={leaderboardData} />
        <View style={{height: 180}}>
          <RankChart data={leaderboardData.rank_data}/>
        </View>
        <Text 
          style={[commonStyles.text, {alignSelf: 'center', paddingBottom: 5}]}
        >
          Rank {leaderboardData.user_rank}/{leaderboardData.max_rank}, that's the {getPercentile(leaderboardData.user_rank, leaderboardData.max_rank)} percentile
        </Text>
      </>
    )
  };

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
        </>
      }
      {renderLeaderboard()}
    </View>
  )
}