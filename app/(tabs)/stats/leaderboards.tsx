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
import { OptionsObject } from "@/components/ChooseExerciseModal";

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
  // exercise: StoredExerciseLeaderboardData
  exercise: any
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

interface ExerciseMetaValue {
  name: string
  variations: Record<string, string> //? id: name
}

type ExercisesMeta = Record<string, ExerciseMetaValue>;

export default function StatsDistribution() {
  const router = useRouter();

  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [loadingExercisesMeta, setLoadingExercisesMeta] = useState<boolean>(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);

  const leaderboardOptions: LeaderboardOption[] = [
    { label: 'overall stats', value: 'overall' },
    { label: 'per exercise', value: 'exercise' },
  ]
  const [leaderboardValue, setLeaderboardValue] = useState<LeaderboardType>('overall');

  const overallMetricOptions: OverallLeaderboardOption[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'sets' },
    { label: 'reps', value: 'reps' },
    { label: '# exercises', value: 'exercises' },
    { label: '# workouts', value: 'workouts' },
    { label: 'duration', value: 'duration' },
  ]
  const [overallMetricValue, setOverallMetricValue] = useState<OverallLeaderboardType>('volume');

  const [exercisesMeta, setExercisesMeta] = useState<ExercisesMeta>({});

  // todo convert to memo
  const exerciseOptions = ((): OptionsObject[] => {
    const options: OptionsObject[] = [];
    for (const [id, value] of Object.entries(exercisesMeta)) {
      options.push({
        label: value.name,
        value: id
      })
    }
    return options;
  })();
  const [exerciseValue, setExerciseValue] = useState<string | null>(null);
  
  useEffect(() => {
    const firstId = Object.keys(exercisesMeta)[0] ?? null;
    if (exerciseValue === null) {
      setExerciseValue(firstId);
    } else if (!(exerciseValue in exercisesMeta)) {
      setExerciseValue(firstId);
    }
  }, [exercisesMeta]);

  // const variationOptions = ((): Record<string, OptionsObject[]> => {
  //   const optionsMap: Record<string, OptionsObject[]> = {};
  //   for (const [exerciseId, exerciseValue] of Object.entries(exercisesMeta)) {
  //     optionsMap[exerciseId] = [];
  //     for (const [variationId, variationName] of Object.entries(exerciseValue.variations)) {
  //       optionsMap[exerciseId].push({
  //         label: variationName,
  //         value: variationId
  //       })
  //     }
  //   }
  //   return optionsMap;
  // })();
  // const [variationValue, setVariationValue] = useState<string | null>(null);

  const exerciseMetricOptions: ExerciseLeaderboardOption[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'sets' },
    { label: 'reps', value: 'reps' },
  ]
  const [exerciseMetricValue, setExerciseMetricValue] = useState<ExerciseLeaderboardType>('volume');

  const optionValueMap: OptionValueMap = {
    overall: overallMetricValue,
    exercise: exerciseMetricValue
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
    exercise: {}
  });

  const reload = async () => {
    if (leaderboardValue === 'exercise') {
      fetchExercisesMeta();
    }
    fetchLeaderboard();
  };

  const fetchExercisesMeta = async () => {
    try {
      setLoadingExercisesMeta(true);
      const data = await fetchWrapper({
        route: 'stats/exercises-meta',
        method: 'GET',
        params: {}
      });
      if (!data || !data.exercises) throw new Error('bad response');
      
      const exercisesMeta = data.exercises;
      setExercisesMeta(exercisesMeta);
      
      const tempExerciseStored: Record<string, any> = cloneDeep(storedLeaderboardData.exercise);
      for (const id of Object.keys(exercisesMeta)) {
        if (id in tempExerciseStored) continue;
        tempExerciseStored[id] = {
          volume: null,
          sets: null,
          reps: null,
          workouts: null,
        }
      }
      setStoredLeaderboardData(prev => ({
        ...prev,
        exercise: tempExerciseStored
      }));
    
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingExercisesMeta(false);
    }
  };

  useEffect(() => {
    fetchExercisesMeta();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoadingStats(true);
      const data = await fetchWrapper({
        route: leaderboardRoute(),
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
      // todo differnet for exercises
      if (leaderboardValue === "overall") {
        setStoredLeaderboardData(prev => ({
          ...prev,
          [leaderboardValue]: {
            ...prev[leaderboardValue], 
            [optionValueMap[leaderboardValue]]: leaderboard
          }
        }));
      } else if (leaderboardValue === "exercise" && exerciseValue !== null) {
        setStoredLeaderboardData(prev => ({
          ...prev,
          [leaderboardValue]: {
            ...prev[leaderboardValue], 
            [exerciseValue]: {
              ...prev[leaderboardValue][exerciseValue],
              [exerciseMetricValue]: leaderboard
            }
          }
        }));
      } 

    } catch (error) {
      console.log(error)
      setLeaderboardData(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const leaderboardRoute = (): string => {
    switch (leaderboardValue) {
      case 'overall':
        return `stats/leaderboard/${leaderboardValue}/${optionValueMap[leaderboardValue]}`;
      case 'exercise':
        return `stats/leaderboard/${leaderboardValue}/${exerciseValue}/${optionValueMap[leaderboardValue]}`;
    }
  };

  useEffect(() => {
    try {
      if (leaderboardValue === 'overall') {
        // const metric = optionValueMap[leaderboardValue] as keyof typeof storedLeaderboardData[typeof leaderboardValue];
        const stored = storedLeaderboardData[leaderboardValue][overallMetricValue];
        if (stored !== null) {
          setLeaderboardData(stored);
          return;
        }
      } else if (leaderboardValue === 'exercise' && exerciseValue !== null) {
        const stored = storedLeaderboardData[leaderboardValue][exerciseValue]?.[exerciseMetricValue] ?? null
        if (stored !== null) {
          setLeaderboardData(stored);
          return;
        }
      }
    } catch(error) {
      console.log(error)
    }
    fetchLeaderboard();
  }, [leaderboardValue, overallMetricValue, exerciseValue])

  const getPercentile = (rank: number | null, maxRank: number | null): number | null => {
    if (rank === null || !maxRank) return null;
    return parseFloat((((maxRank - rank) / maxRank) * 100).toFixed(3));
  };

  const isLoading = (): boolean => {
    return loadingStats || loadingExercisesMeta;
  }

  const renderLeaderboard = (): JSX.Element => {
    if (isLoading()) {
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
      {useDropdown(leaderboardOptions, leaderboardValue, setLeaderboardValue)}
      {leaderboardValue === 'overall' &&
        <>
          <Text style={commonStyles.text}>Choose a metric:</Text>
          {useDropdown(overallMetricOptions, overallMetricValue, setOverallMetricValue)}
        </>
      }
      {leaderboardValue === 'exercise' &&
        <>
          {exerciseValue === null ?
            <>
              <Text>error loading exercise data</Text>
            </>
          :
            <>
              <Text style={commonStyles.text}>Choose an exercise:</Text>
              {useDropdown(exerciseOptions, exerciseValue, setExerciseValue)}
              <Text style={commonStyles.text}>Choose a metric:</Text>
              {useDropdown(exerciseMetricOptions, exerciseMetricValue, setExerciseMetricValue)}
            </>
          }
        </>
      }
      <TouchableOpacity
        onPress={() => reload()}
        style={[commonStyles.thinTextButton, {marginTop: 8}]}
      >
        <Text style={commonStyles.text}>reload</Text>
      </TouchableOpacity>
      {renderLeaderboard()}
    </View>
  )
}