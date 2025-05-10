import React from "react";
import { TouchableOpacity, View, Text, StyleSheet, ScrollView } from "react-native";

import { fetchExercises } from "@/middleware/helpers";
import { useAtom } from "jotai";
import { exercisesAtom } from "@/store/workout";
import ChooseExerciseData from "./ChooseExerciseData";

interface ChooseExerciseProps {
  onPress: () => void
}

export default function ChooseExercise(props: ChooseExerciseProps) {
  const { onPress } = props;
  const [exercises, setExercises] = useAtom(exercisesAtom);
  

  const handleExercisesRefresh = async () => {
    await fetchExercises(setExercises);
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
              <ChooseExerciseData key={i} exercise={exercise} onPress={onPress}/>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center'
  },
  modalContainer: {
    margin: 20,
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    elevation: 5,
    borderColor: 'red',
    borderWidth: 2,
    maxHeight: '80%'
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'white'
  },
  scrollView: {
    marginVertical: 10,
    width: '100%'
  }
});