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
import cloneDeep from "lodash/cloneDeep";

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

type ExerciseLeaderboardType = 'volume' | 'sets' | 'reps'
interface ExerciseLeaderboardOption {
  label: string
  value: ExerciseLeaderboardType
}

type StoredOverallLeaderboardData = Record<OverallLeaderboardType, LeaderboardData | null>
type StoredExerciseLeaderboardData = Record<ExerciseLeaderboardType, LeaderboardData | null>

type StoredLeaderboardDataValues = {
  overall: StoredOverallLeaderboardData
  exercise: StoredExerciseLeaderboardData
}

type StoredLeaderboardData = {
  [K in LeaderboardType]: StoredLeaderboardDataValues[K]
}

type OptionValueMapValues = {
  overall: OverallLeaderboardType
  exercise: ExerciseLeaderboardType
}

type OptionValueMap = {
  [K in LeaderboardType]: OptionValueMapValues[K]
}

// todo add in per exercise, and per muscle group/target stats?
// todo once fetched for leaderboard type, save in this component
// todo provide reload button

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

  const exerciseOptions: ExerciseLeaderboardOption[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'sets' },
    { label: 'reps', value: 'reps' },
  ]
  const [exerciseOptionValue, setExerciseOptionValue] = useState<ExerciseLeaderboardType>('volume');

  const optionValueMap: OptionValueMap = {
    overall: overallOptionValue,
    exercise: exerciseOptionValue
  }

  const [storedLeaderboardData, setStoredLeaderboardData] = useState<StoredLeaderboardData>({
    overall: {
      volume: null,
      sets: null,
      reps: null,
      exercises: null,
      workouts: null,
      duration: null,
    },
    exercise: {
      volume: null,
      sets: null,
      reps: null,
    }
  });

  // const fetchLeaderboards = async () => {
  //   // let leaderboardData: LeaderboardData | null = null;
  //   try {
  //     setLoadingStats(true);
  //     if (leaderboardOptionValue === 'overall') {
  //       const data = await fetchWrapper({
  //         route: 'stats/leaderboards/overall',
  //         method: 'GET',
  //         params: {
  //           top_num: '10',
  //           side_num: '20',
  //           num_rank_points: '50'
  //         }
  //       });
  //       if (!data || !data.leaderboards) throw new Error('bad response');
  //       const overallMap: Record<OverallLeaderboardType, string> = {
  //         volume: "overall:volume:leaderboard",
  //         sets: "overall:sets:leaderboard",
  //         reps: "overall:reps:leaderboard",
  //         exercises: "overall:exercises:leaderboard",
  //         workouts: "overall:workouts:leaderboard",
  //         duration: "overall:duration:leaderboard",
  //       }
  //       setLeaderboardData(data.leaderboards[overallMap[overallOptionValue]]);
  //       const tempStoredOverall = cloneDeep(storedLeaderboardData.overall);
  //       for () {

  //       }
  //       setStoredLeaderboardData(prev => ({
  //         ...prev,
  //         overall
  //       }))
  //     }

  //   } catch (error) {
  //     setLeaderboardData(null);
  //   } finally {
  //     setLoadingStats(false);
  //     // setLeaderboardData(leaderboardData); 
  //     // setStoredLeaderboardData(prev => ({
  //     //   ...prev,
  //     //   [leaderboardOptionValue]: {
  //     //     ...prev[leaderboardOptionValue],
  //     //     [optionValueMap[leaderboardOptionValue]]: leaderboardData
  //     //   }
  //     // }));
  //   }
  // };

  // todo store the data in state
  const fetchLeaderboard = async () => {
    try {
      setLoadingStats(true);
      const data = await fetchWrapper({
        route: `stats/leaderboard/${leaderboardOptionValue}/${optionValueMap[leaderboardOptionValue]}`,
        method: 'GET',
        params: {
          top_num: '10',
          side_num: '20',
          num_rank_points: '50'
        }
      });
      if (!data || !data.leaderboard) throw new Error('bad response');
      
      const leaderboard = data.leaderboard;
      setLeaderboardData(leaderboard);

    } catch (error) {
      console.log(error)
      setLeaderboardData(null);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    try {
      const optionKey = optionValueMap[leaderboardOptionValue] as keyof typeof storedLeaderboardData[typeof leaderboardOptionValue];
      const stored = storedLeaderboardData[leaderboardOptionValue][optionKey];
      if (stored !== null) {
        setLeaderboardData(stored);
        return;
      }
    } catch(error) {
      console.log(error)
    }
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
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text style={commonStyles.text}>
            leaderboard data did not load {':('}
          </Text>
        </View>
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
      <TouchableOpacity
        onPress={() => fetchLeaderboard()}
        style={[commonStyles.thinTextButton, {marginTop: 8}]}
      >
        <Text style={commonStyles.text}>reload</Text>
      </TouchableOpacity>
      {renderLeaderboard()}
    </View>
  )
}