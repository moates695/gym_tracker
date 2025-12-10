import LoadingScreen from "@/app/loading";
import { useDropdown } from "@/components/ExerciseData";
import { Leaderboard } from "@/components/Leaderboard";
import RankChart from "@/components/RankChart";
import { fetchWrapper, SafeError } from "@/middleware/helpers";
import { LeaderboardData, repsLeaderboardAtom, setLeaderboardAtom, volumeLeaderboardAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import cloneDeep from "lodash/cloneDeep";
import { OptionsObject } from "@/components/ChooseExerciseModal";
import { identity } from "lodash";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";

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

type ExerciseLeaderboardType = 'volume' | 'sets' | 'reps' | 'n_rep_max'
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

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [loadingExercisesMeta, setLoadingExercisesMeta] = useState<boolean>(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);

  const leaderboardOptions: LeaderboardOption[] = [
    { label: 'overall stats', value: 'overall' },
    { label: 'stats per exercise', value: 'exercise' },
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
  // const [exerciseReps, setExerciseReps] = useState<Record<string, number[]>>({});

  const exerciseOptions = useMemo<OptionsObject[]>(() => {
    return Object.entries(exercisesMeta).map(([id, value]) => ({
      label: value.name,
      value: id,
    }));
  }, [exercisesMeta]);
  const [exerciseValue, setExerciseValue] = useState<string | null>(null);

  const updateExerciseValue = (value: string) => {
    if (value === exerciseValue) return;
    setVariationValue('base');
    setExerciseValue(value);
  };

  // const [variationOptions, setVariationOptions] = useState<Record<string, OptionsObject[]>>({});

  // const updateVariationOptions = (exercisesMeta: ExercisesMeta) => {
  //   const optionsMap: Record<string, OptionsObject[]> = {};
  //   for (const [exerciseId, exerciseMeta] of Object.entries(exercisesMeta)) {
  //     optionsMap[exerciseId] = Object.entries(exerciseMeta.variations).map(([id, name]) => ({
  //       label: name,
  //       value: id
  //     }));
  //     optionsMap[exerciseId].unshift({
  //       label: 'base',
  //       value: 'base'
  //     })
  //   }
  //   setVariationOptions(optionsMap);
  // };
  
  const variationOptions = useMemo<Record<string, OptionsObject[]>>(() => {
    const optionsMap: Record<string, OptionsObject[]> = {};
    for (const [exerciseId, exerciseMeta] of Object.entries(exercisesMeta)) {
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

  const [variationValue, setVariationValue] = useState<string>('base');

  const [exerciseRepOptions, setExerciseRepOptions] = useState<Record<string, OptionsObject[]>>({});
  const updateExerciseRepOptions = (recordReps: Record<string, number[]>) => {
    const optionsMap: Record<string, OptionsObject[]> = {};
    for (const [exerciseId, repList] of Object.entries(recordReps)) {
      optionsMap[exerciseId] = repList.map((rep) => ({
        label: rep.toString(),
        value: rep.toString()
      }))
    }
    setExerciseRepOptions(optionsMap);
  };
  
  const [exerciseRepValue, setExerciseRepValue] = useState<string | null>(null);

  const exerciseMetricOptions: ExerciseLeaderboardOption[] = [
    { label: 'volume', value: 'volume' },
    { label: 'sets', value: 'sets' },
    { label: 'reps', value: 'reps' },
    { label: 'n rep max', value: 'n_rep_max' },
  ]
  const [exerciseMetricValue, setExerciseMetricValue] = useState<ExerciseLeaderboardType>('volume');

  const [storedLeaderboards, setStoredLeaderboards] = useState<Record<string, LeaderboardData>>({});

  const getStoredKey = (): string | null => {
    if (leaderboardValue === 'overall') {
      return `overall:${overallMetricValue}`;
    } else if (leaderboardValue === 'exercise') {
      if (exerciseMetricValue === 'n_rep_max') {
        return `exercise:${getExerciseId()}:${exerciseRepValue}:${exerciseMetricValue}`
      }
      return `exercise:${getExerciseId()}:${exerciseMetricValue}`
    }
    throw new Error("unknown leaderboard type");
  }; 

  const reload = async () => {
    if (leaderboardValue === 'overall') {
      await fetchLeaderboard();
      return;
    }
    await fetchExercisesMeta();
    await fetchLeaderboard();
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
      updateExerciseRepOptions(data.exercise_record_reps);

      if (Object.keys(exercisesMeta).length === 0) {
        setExerciseValue(null);
        setVariationValue('base');
        return
      }
      
      let exerciseId = exerciseValue;
      if (exerciseId === null || !(exerciseId in exercisesMeta)) {
        exerciseId = Object.keys(exercisesMeta)[0];
        setExerciseValue(exerciseId);
      }

      // updateVariationOptions(exercisesMeta);
      setVariationValue('base');

    } catch (error) {
      addCaughtErrorLog(error, 'error stats/exercises-meta')
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
      addCaughtErrorLog(error, 'error fetchLeaderboard')
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
        if (exerciseMetricValue !== 'n_rep_max') {
          return `stats/leaderboard/${leaderboardValue}/${getExerciseId()}/${exerciseMetricValue}`;
        }
        if (exerciseRepValue === null) throw new SafeError('exercise rep value is null');
        return `stats/leaderboard/record/${getExerciseId()}/${exerciseRepValue}`;
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
  }, [leaderboardValue, overallMetricValue, exerciseValue, variationValue, exerciseMetricValue, exerciseRepValue])

  const getPercentile = (rank: number | null, maxRank: number | null): number | null => {
    if (rank === null || !maxRank) return null;
    return parseFloat(((1 - (rank - 1) / maxRank) * 100).toFixed(3));
  };

  const isLoading = (): boolean => {
    return loadingStats || loadingExercisesMeta;
  }

  const getExerciseId = (): string | null => {
    return variationValue === 'base' ? exerciseValue : variationValue
  };

  const renderLeaderboard = (): JSX.Element => {
    if (isLoading()) {
      return <LoadingScreen />;
    } else if (leaderboardData === null) {
      return (
        <View
          style={{
            flex: 1,
            height: 200,
            width: '100%',
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
          {leaderboardData.rank_data.length > 1 ?
            <RankChart data={leaderboardData.rank_data}/>
          :
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={commonStyles.text}>not enough data to graph</Text>
            </View>
          }
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
            Rank: {leaderboardData.user_rank}/{leaderboardData.max_rank} | Percentile: {getPercentile(leaderboardData.user_rank, leaderboardData.max_rank)}
          </Text>
        }
      </>
    )
  };

  if (leaderboardValue === 'exercise' && exerciseValue === null) {
    return (
      <Text style={commonStyles.text}>error loading exercise data</Text>
    )
  }

  const chooseVariationDisabled = (): boolean => {
    if (exerciseValue === null) return true;
    if (!(exerciseValue in variationOptions)) return true;
    return variationOptions[exerciseValue].length <= 1
  };

  useEffect(() => {
    const tempReps = (exerciseRepOptions[getExerciseId() ?? ''] ?? []).map((obj) => {
      return obj.value;
    });
    if (tempReps.length === 0) return;
    if (exerciseRepValue === null) {
      setExerciseRepValue(tempReps[0]);
      return;
    }
    if (tempReps.includes(exerciseRepValue)) return;
    setExerciseRepValue(tempReps[0]);
  }, [exerciseMetricValue, exerciseValue, variationValue]);

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
      <TouchableOpacity
        onPress={() => reload()}
        style={[commonStyles.thinTextButton, {marginBottom: 4, marginLeft: 14}]}
      >
        <Text style={commonStyles.text}>reload</Text>
      </TouchableOpacity>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 4,
          marginLeft: 14,
          marginRight: 14,
        }}
      >
        <View>
          <Text style={commonStyles.text}>Choose leaderboard:</Text>
          {useDropdown(leaderboardOptions, leaderboardValue, setLeaderboardValue)}
        </View>
        <View>
          <Text style={commonStyles.text}>Choose a metric:</Text>
          {leaderboardValue === 'overall' &&
            useDropdown(overallMetricOptions, overallMetricValue, setOverallMetricValue)
          }
          {leaderboardValue === 'exercise' &&
            useDropdown(exerciseMetricOptions, exerciseMetricValue, setExerciseMetricValue)
          }
        </View>
      </View>
      {leaderboardValue === 'exercise' &&
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginLeft: 14,
            marginRight: 14,  
            marginBottom: 4,
          }}
        >
          <View>
            <Text style={commonStyles.text}>Choose an exercise:</Text>
            {useDropdown(exerciseOptions, exerciseValue, updateExerciseValue)}
          </View>
          <View>
            <Text style={commonStyles.text}>Choose a variation:</Text>
            {useDropdown(
              variationOptions[exerciseValue ?? ''],
              variationValue,
              setVariationValue,
              chooseVariationDisabled()
            )}
          </View>
        </View>
      }
      {(leaderboardValue === 'exercise' && exerciseMetricValue === 'n_rep_max') &&
        <View
          style={{
            marginLeft: 14,
          }}
        >
          <Text style={commonStyles.text}>Choose a rep number:</Text>
          {useDropdown(
            exerciseRepOptions[getExerciseId() ?? ''] ?? [],
            exerciseRepValue,
            setExerciseRepValue,
            // chooseVariationDisabled()
          )}
        </View>
      }
      {renderLeaderboard()}
    </View>
  )
}