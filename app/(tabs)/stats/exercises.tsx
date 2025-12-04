import LoadingScreen from "@/app/loading";
import ChooseExerciseItem from "@/components/ChooseExerciseItem";
import ExerciseListFilter from "@/components/ExerciseListFilter";
import ExerciseStatsItem from "@/components/ExerciseStatsItem";
import { fetchWrapper } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { exerciseListAtom, ExerciseListItem } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from "react-native";

export default function StatsExercises() {
  const router = useRouter();

  const [exercisesList, setExercisesList] = useAtom(exerciseListAtom);

  const [displayedExercises, setDisplayedExercises] = useState<ExerciseListItem[]>(exercisesList); 
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [loadingExerciseList, setLoadingExerciseList] = useState<boolean>(false); 
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const handleExercisesRefresh = async () => {
    try {
      setLoadingExerciseList(true);
      const data = await fetchWrapper({
        route: 'exercises/list/all',
        method: 'GET'
      });
      if (!data || !data.exercises) throw new Error('bad response');
      setExercisesList(data.exercises);
    } catch (error) {
      addCaughtErrorLog(error, 'error exercises/list/all')
      setExercisesList([]);
    } finally {
      setLoadingExerciseList(false);
    }
  };

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <TouchableOpacity
          style={[commonStyles.thinTextButton, {width: 50, marginLeft: 12}]}
          onPress={handleExercisesRefresh}
          disabled={loadingExerciseList}
        >
          <Text style={commonStyles.text}>refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={[commonStyles.thinTextButton, {marginRight: 12}]}
        >
          <Text style={commonStyles.text}>
            {showFilters ? 'hide filters' : 'show filters'}
          </Text>
        </TouchableOpacity>
      </View>
      <ExerciseListFilter showFilters={showFilters} exercisesList={exercisesList} setDisplayedExercises={setDisplayedExercises} />
      {loadingExerciseList ?
        <LoadingScreen />
      :
        <>
          {displayedExercises.length === 0 &&
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={commonStyles.text}>
                no exercises
              </Text>
            </View>
          }
          <FlatList 
            style={{
              marginTop: 10,
              marginBottom: 10,
            }}
            data={displayedExercises}
            renderItem={({ item }) => (
              <ExerciseStatsItem exercise={item} />
            )}
            showsVerticalScrollIndicator={false}
          />
        </>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    marginVertical: 10,
    width: '100%',
  },
});