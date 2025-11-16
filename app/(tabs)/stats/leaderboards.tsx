import LoadingScreen from "@/app/loading";
import { useDropdown } from "@/components/ExerciseData";
import { Leaderboard } from "@/components/Leaderboard";
import RankChart from "@/components/RankChart";
import { fetchWrapper } from "@/middleware/helpers";
import { LeaderboardData, repsLeaderboardAtom, setLeaderboardAtom, volumeLeaderboardAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import cloneDeep from "lodash/cloneDeep";
import { OptionsObject } from "@/components/ChooseExerciseModal";
import { identity } from "lodash";

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

  const exerciseOptions = useMemo<OptionsObject[]>(() => {
    return Object.entries(exercisesMeta).map(([id, value]) => ({
      label: value.name,
      value: id,
    }));
  }, [exercisesMeta]);
  const [exerciseValue, setExerciseValue] = useState<string | null>(null);

  const variationOptions = useMemo<Record<string, OptionsObject[]>>(() => {
    const optionsMap: Record<string, OptionsObject[]> = {};
    for (const [exerciseId, exerciseMeta] of Object.entries(exercisesMeta)) {
      if (Object.keys(exerciseMeta.variations).length === 0) continue;
      optionsMap[exerciseId] = Object.entries(exerciseMeta.variations).map(([id, name]) => ({
        label: name,
        value: id
      }));
      optionsMap[exerciseId].unshift({
        label: 'base',
        value: 'base'
      })
    }
    return optionsMap;
  }, [exercisesMeta]);
  const [variationValue, setVariationValue] = useState<string | null>(null);

  const exerciseMetricOptions: ExerciseLeaderboardOption[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'sets' },
    { label: 'reps', value: 'reps' },
  ]
  const [exerciseMetricValue, setExerciseMetricValue] = useState<ExerciseLeaderboardType>('volume');

  const [storedLeaderboards, setStoredLeaderboards] = useState<Record<string, LeaderboardData>>({});

  const getStoredKey = (): string | null => {
    if (leaderboardValue === 'overall') {
      return `overall:${overallMetricValue}`;
    } else if (leaderboardValue === 'exercise') {
      if (exerciseMetricValue === null) return null;
      if (variationValue === null || variationValue === 'base') {
        return `exercise:${exerciseValue}:${exerciseMetricValue}`
      } else {
        return `exercise:${exerciseValue}:${variationValue}:${exerciseMetricValue}`
      }
    }
    throw new Error("unknown leaderboard type")
  }; 

  const reload = async () => {
    const promises = [fetchLeaderboard()];
    if (leaderboardValue === 'exercise') {
      promises.push(fetchExercisesMeta());
    }
    await Promise.all(promises);
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

      if (Object.keys(exercisesMeta).length === 0) {
        setExerciseValue(null);
        setVariationValue(null);
        return
      }
      
      let exerciseId = exerciseValue;
      if (exerciseId === null || !(exerciseId in exercisesMeta)) {
        exerciseId = Object.keys(exercisesMeta)[0];
        setExerciseValue(exerciseId);
      }

      const variationIds = Object.keys(exercisesMeta[exerciseId].variations); 
      if (variationIds.length === 0) {
        setVariationValue(null);
      } else if (variationValue === null || !(variationValue in exercisesMeta[exerciseId].variations)) {
        setVariationValue(variationIds[0]);
      }

    } catch (error) {
      console.log(error);
    } finally {
      setLoadingExercisesMeta(false);
    }
  };

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

      const storedKey = getStoredKey();
      if (storedKey !== null) {
        setStoredLeaderboards(prev => ({
          ...prev,
          [storedKey]: leaderboard
        }))
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
        return `stats/leaderboard/${leaderboardValue}/${overallMetricValue}`;
      case 'exercise':
        if (variationValue === null || variationValue === 'base') {
          return `stats/leaderboard/${leaderboardValue}/${exerciseValue}/${exerciseMetricValue}`;
        } else {
          return `stats/leaderboard/${leaderboardValue}/${variationValue}/${exerciseMetricValue}`;
        }
    }
  };

  useEffect(() => {
    fetchExercisesMeta();
  }, []);

  useEffect(() => {
    const storedKey = getStoredKey();
    if (storedKey !== null && storedKey in storedLeaderboards) {
      setLeaderboardData(storedLeaderboards[storedKey]);
      return;
    }
    fetchLeaderboard();
  }, [leaderboardValue, overallMetricValue, exerciseValue, variationValue, exerciseMetricValue])

  const getPercentile = (rank: number | null, maxRank: number | null): number | null => {
    if (rank === null || !maxRank) return null;
    return parseFloat(((1 - (rank - 1) / maxRank) * 100).toFixed(3));
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
        {leaderboardData.user_rank === null ?
          <Text 
            style={[commonStyles.text, {alignSelf: 'center', paddingBottom: 5}]}
          >
            you don't have a rank yet
          </Text>
        :
          <Text 
            style={[commonStyles.text, {alignSelf: 'center', paddingBottom: 5}]}
          >
            Rank {leaderboardData.user_rank}/{leaderboardData.max_rank}, that's the {getPercentile(leaderboardData.user_rank, leaderboardData.max_rank)} percentile
          </Text>
        }
        
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
              {/* {(variationOptions?.[exerciseValue] ?? []).length > 0 &&
                <>
                  <Text style={commonStyles.text}>Choose a variation:</Text>
                  {useDropdown(variationOptions[exerciseValue], variationValue, setVariationValue)}
                </>
              } */}
              {(variationOptions?.[exerciseValue] ?? []).length > 0 &&
                <>
                  <Text style={commonStyles.text}>Choose a variation:</Text>
                  {useDropdown(variationOptions[exerciseValue], variationValue, setVariationValue)}
                </>
              }
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