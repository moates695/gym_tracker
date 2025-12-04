import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React from "react";
import * as Font from 'expo-font';
import { MaterialIcons, AntDesign, Ionicons, Feather } from '@expo/vector-icons';
import { fetchWrapper, loadFonts, SafeError, safeErrorMessage, useAwaitLoadable } from "@/middleware/helpers";
import { useColorScheme, View, Image } from 'react-native';
import * as SystemUI from "expo-system-ui"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useAtom, useSetAtom } from "jotai";
import { distributionStatsAtom, exerciseListAtom, favouriteExerciseStatsAtom, loadableChosenHeatMap, muscleGroupToTargetsAtom, muscleTargetoGroupAtom, previousWorkoutStatsAtom, SetClass, userDataAtom, workoutExercisesAtom, workoutHistoryStatsAtom, workoutTotalStatsAtom } from "@/store/general";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from 'expo-status-bar';
import { classImageMap } from "@/components/ExerciseSet";
import 'react-native-get-random-values';
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";

export interface DecodedJWT {
  email: string
  user_id: string
  exp: number
  iat: number
}

// todo: load in all required atoms before allowing to go to main screen
// todo: load in secondary data async after transiting to home screen

export default function RootLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [,] = useAtom(workoutExercisesAtom); // to prevent screen flashbang  
  const [, setUserData] = useAtom(userDataAtom);
  const [, setGroupToTargets] = useAtom(muscleGroupToTargetsAtom);
  const [, setTargetoGroup] = useAtom(muscleTargetoGroupAtom);
  const [, setExerciseList] = useAtom(exerciseListAtom);
  const [, setOverviewHistoricalStats] = useAtom(previousWorkoutStatsAtom);
  const [, setWorkoutHistoryStats] = useAtom(workoutHistoryStatsAtom);
  const [, setWorkoutTotalStats] = useAtom(workoutTotalStatsAtom);
  const [, setDistributions] = useAtom(distributionStatsAtom);
  const [, setFavouriteStats] = useAtom(favouriteExerciseStatsAtom);
  
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  SystemUI.setBackgroundColorAsync("black");

  const checkUserState = async () => {
    // await SecureStore.deleteItemAsync("auth_token"); //!!!! for testing new user
    // await AsyncStorage.clear(); //!!!!! clear storage
    router.replace("/loading");

    const auth_token = await SecureStore.getItemAsync("auth_token");
    if (!auth_token) {
      addErrorLog('auth token not found in secure store', 'warn');
      router.replace("/sign-up");
      return;
    }

    try {
      const decoded: DecodedJWT = jwtDecode(auth_token);
      
      if (decoded.exp < Date.now() / 1000) {
        addErrorLog('auth token is past expiry', 'warn');
        await SecureStore.deleteItemAsync("auth_token");
        router.replace("/sign-in");
        return;
      }

      const data = await fetchWrapper({
        route: 'register/login',
        method: 'GET',
      });
      if (!data || !data.account_state) throw new Error("response not ok");

      if (data.account_state !== "good") {
        setUserData(null);
        await SecureStore.deleteItemAsync("auth_token");
      }
      if (data.account_state !== "unverified") {
        await SecureStore.deleteItemAsync("temp_token");
      }

      if (data.account_state == "none") {
        router.replace("/sign-up");
      } else if (data.account_state == "unverified") {
        router.replace({
          pathname: "/validate",
          params: {
            previousScreen: 'sign-in'
          }
        })
      } else if (data.account_state == "good") {
        // todo: group these into a single request (get all startup data at once) ?
        try {
          await Promise.all([
            loadFonts(),
            fetchUserData(),
            fetchMappings(),
          ])
        } catch (error) {
          throw new SafeError(`fetching required startup data: ${safeErrorMessage(error)}`);
        }
        router.replace("/(tabs)");
        try {
          await Promise.all([
            fetchExerciseList(),
            fetchOverviewStats(),
            fetchHistoryStats(),
            fetchWorkoutTotalStats(),
            fetchDistributionStats(),
            fetchFavouriteStats(),
            preloadImages()
          ])
        } catch (error) {
          addCaughtErrorLog(error, `fetching non-required startup data: ${safeErrorMessage(error)}`, 'warn');
        }
      } else {
        throw new SafeError("login response state not recognised");
      }

    } catch (error) {
      addCaughtErrorLog(error, 'checking user state');
      router.replace("/sign-up");
    }
  };

  const fetchUserData = async () => {
    try {
      const data = await fetchWrapper({
        route: 'users/data/get',
        method: 'GET'
      })
      if (!data || !data.user_data) throw new SafeError('error fetching user data');
      setUserData(data.user_data);
    } catch (error) {
      addCaughtErrorLog(error, 'fetching user data');
      if (error instanceof SafeError) throw error;
      throw new SafeError('uncaught fetchUserData error');
    }
  };

  const fetchMappings = async () => {
    try {
      const data = await fetchWrapper({
        route: 'muscles/get_maps',
        method: 'GET'
      })
      if (!data || !data.group_to_targets || !data.target_to_group) throw new Error('muscle maps bad response');
      setGroupToTargets(data.group_to_targets);
      setTargetoGroup(data.target_to_group);
    } catch (error) {
      addCaughtErrorLog(error, 'fetching muscle maps');
      if (error instanceof SafeError) throw error;
      throw new SafeError('uncaught fetchMappings error');
    }
  };

  const fetchExerciseList = async () => {
    try {
      const data = await fetchWrapper({
        route: 'exercises/list/all',
        method: 'GET'
      });
      if (!data || !data.exercises) throw new Error('bad exercise list response');
      setExerciseList(data.exercises)
    } catch (error) {
      addCaughtErrorLog(error, 'fetching exercise list');
      if (error instanceof SafeError) throw error;
      throw new SafeError('uncaught fetchExerciseList error');
    }
  }

  const fetchOverviewStats = async () => {
    try {
      const data = await fetchWrapper({
        route: 'workout/overview/stats',
        method: 'GET'
      });
      if (!data || !data.workouts) throw new Error('bad overview stats response');
      setOverviewHistoricalStats(data.workouts);
    } catch (error) {
      addCaughtErrorLog(error, 'fetching overview stats');
      if (error instanceof SafeError) throw error;
      throw new SafeError('uncaught fetchOverviewStats error');
    }
  };

  const fetchHistoryStats = async () => {
    try {
      const data = await fetchWrapper({
        route: 'stats/history',
        method: 'GET'
      });
      if (!data || !data.stats) throw new Error('stats history result is empty');
      setWorkoutHistoryStats(data.stats);
    } catch (error) {
      addCaughtErrorLog(error, 'fetching history stats');
      if (error instanceof SafeError) throw error;
      throw new SafeError('uncaught fetchHistoryStats error');
    }
  };
    
  const fetchWorkoutTotalStats = async () => {
    try {
      const data = await fetchWrapper({
        route: 'stats/workout_totals',
        method: 'GET'
      });
      if (!data || !data.totals == null) throw new Error('result is empty');
      setWorkoutTotalStats(data.totals);
    } catch (error) {
      addCaughtErrorLog(error, 'fetching workout totals');
      if (error instanceof SafeError) throw error;
      throw new SafeError('uncaught fetchWorkoutTotalStats error');
    }
  };

  const fetchDistributionStats = async () => {
    try {
      const data = await fetchWrapper({
        route: 'stats/distributions',
        method: 'GET'
      });
      if (!data || !data.distributions) throw new Error('distribution stats result is empty');
      setDistributions(data.distributions);
    } catch (error) {
      addCaughtErrorLog(error, 'fetching distribution stats');
      if (error instanceof SafeError) throw error;
      throw new SafeError('uncaught fetchDistributionStats error');
    }
  };

  const fetchFavouriteStats = async () => {
    try {
      const data = await fetchWrapper({
        route: 'stats/favourites',
        method: 'GET'
      });
      if (data === null || data.favourites == null) throw new Error('result is empty');
      setFavouriteStats(data.favourites);
    } catch (error) {
      addCaughtErrorLog(error, 'fetching favourite stats');
      if (error instanceof SafeError) throw error;
      throw new SafeError('uncaught fetchFavouriteStats error');
    }
  };

  const preloadImages = () => {
    Object.values(classImageMap).forEach(img => {
      Image.resolveAssetSource(img)
    })
  };

  const initialSetup = async () => {
    await Promise.all([
      checkUserState(),
    ]);
  };

  useEffect(() => {
    initialSetup();
  }, []);

  return (
    // <SafeAreaProvider style={{ backgroundColor: 'black' }}>
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }} edges={[]}>
        {/* <View style={{ flex: 1, backgroundColor: 'black' }}> */}
          <StatusBar 
            style='dark'
            backgroundColor='red' 
          /> 
          <Stack
            screenOptions={{
              headerShown: false,
              headerStyle: {
                backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
              },
              headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
              contentStyle: {
                backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
              },
              animation: "none"
            }}
          >
            <Stack.Screen name="loading"/>
            <Stack.Screen name="(tabs)"/>
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="sign-up"/>
            <Stack.Screen name="sign-in"/>
            <Stack.Screen name="validate"/>
            <Stack.Screen name="error"/>
          </Stack>
        {/* </View> */}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
