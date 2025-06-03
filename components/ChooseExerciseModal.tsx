import React from "react";
import { TouchableOpacity, View, Text, StyleSheet, ScrollView } from "react-native";

import { fetchExercises, fetchWrapper } from "@/middleware/helpers";
import { useAtom } from "jotai";
import { exerciseListAtom } from "@/store/general";
import ChooseExerciseData from "./ChooseExerciseItem";

interface ChooseExerciseProps {
  onChoose: () => void
}

export default function ChooseExercise(props: ChooseExerciseProps) {
  const { onChoose: onPress } = props;
  const [exercises, setExercises] = useAtom(exerciseListAtom);
  
  const handleExercisesRefresh = async () => {
    const data = await fetchWrapper('exercises/list/all', 'GET');
    if (data === null) return;
    setExercises(data.exercises);
  };

  // search bar
  // filters
  // exercise buttons -> click to expand details

  return (
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          onPress={handleExercisesRefresh}
        >
          <Text style={{ color: "white"}}>refresh exercises</Text>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView}>
          {exercises.map((exercise, i) => {
            return (
              <ChooseExerciseData key={i} exercise={exercise} onChoose={onPress}/>
            )
          })}
        </ScrollView>

        <TouchableOpacity 
          onPress={onPress}
        >
          <Text style={{ color: "white"}}>close</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
    width: '100%',
  },
  modalContainer: {
    // marginTop: 50,
    backgroundColor: 'black',
    borderRadius: 10,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    elevation: 5,
    // borderColor: 'red',
    borderWidth: 2,
    maxHeight: '95%',
    width: '100%'
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'white'
  },
  scrollView: {
    marginVertical: 10,
    width: '100%',
    // backgroundColor: 'purple'
  }
});