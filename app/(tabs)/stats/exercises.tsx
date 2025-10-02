import ChooseExerciseItem from "@/components/ChooseExerciseItem";
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
      <TouchableOpacity
        style={[commonStyles.button, {width: 50}]}
        onPress={handleExercisesRefresh}
        disabled={loadingExerciseList}
      >
        <Text style={commonStyles.text}>refresh</Text>
      </TouchableOpacity>
      {displayedExercises.length === 0 &&
        <Text style={styles.text}>no exercises</Text>
      }
      <ScrollView style={styles.scrollView}>
        {displayedExercises.map((displayedExercise, i) => {
          return (
            <View 
              key={displayedExercise.id}
              style={styles.box}
            >
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
    width: '100%',
  },
  modalContainer: {
    // marginTop: 50,
    backgroundColor: 'black',
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    elevation: 5,
    borderWidth: 2,
    // height: '95%',
    flex: 0.95,
    width: '100%',
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'white'
  },
  scrollView: {
    marginVertical: 10,
    width: '100%',
  },
  input: {
    width: 200,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: 'black',
    color: "white",
    marginBottom: 5
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    width: '100%',
    paddingTop: 5,
  },
  box: {
    backgroundColor: 'black',
    padding: 10,
    marginVertical: 2,
    borderRadius: 8,
    width: '100%',
    borderColor: 'red',
    borderWidth: 2
  }
});