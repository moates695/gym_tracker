import ChooseExerciseItem from "@/components/ChooseExerciseItem";
import ExerciseListFilter from "@/components/ExerciseListFilter";
import ExerciseStatsItem from "@/components/ExerciseStatsItem";
import { fetchWrapper } from "@/middleware/helpers";
import { exerciseListAtom, ExerciseListItem } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export default function StatsExercises() {
  const router = useRouter();

  const [exercisesList, setExercisesList] = useAtom(exerciseListAtom);

  const [displayedExercises, setDisplayedExercises] = useState<ExerciseListItem[]>(exercisesList); 
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [loadingExerciseList, setLoadingExerciseList] = useState<boolean>(false); 

  const handleExercisesRefresh = async () => {
    setLoadingExerciseList(true);
    const data = await fetchWrapper({
      route: 'exercises/list/all',
      method: 'GET'
    });
    if (!data || !data.exercises) return;
    setExercisesList(data.exercises);
    setLoadingExerciseList(false);
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
          style={[commonStyles.button, {width: 50}]}
          onPress={handleExercisesRefresh}
          disabled={loadingExerciseList}
        >
          <Text style={commonStyles.text}>refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={[commonStyles.thinTextButton]}
        >
          <Text style={commonStyles.text}>
            {showFilters ? 'hide filters' : 'show filters'}
          </Text>
        </TouchableOpacity>
      </View>
      <ExerciseListFilter showFilters={showFilters} exercisesList={exercisesList} setDisplayedExercises={setDisplayedExercises} />
      {displayedExercises.length === 0 &&
        <Text style={commonStyles.text}>no exercises</Text>
      }
      <ScrollView style={styles.scrollView}>
        {displayedExercises.map((displayedExercise, i) => {
          return (
            <ExerciseStatsItem 
              key={displayedExercise.id}
              exercise={displayedExercise}
            />
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    marginVertical: 10,
    width: '100%',
  },
});