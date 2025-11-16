import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet, ScrollView, TextInput, Switch, FlatList } from "react-native";

import { fetchWrapper } from "@/middleware/helpers";
import { useAtom, useAtomValue } from "jotai";
import { exerciseListAtom, MuscleData, muscleGroupToTargetsAtom, WorkoutExercise, WeightType, ExerciseListItem } from "@/store/general";
import ChooseExerciseItem from "./ChooseExerciseItem";
import { commonStyles } from "@/styles/commonStyles";
import InputField from "./InputField";
import workoutExercise from "./WorkoutExercise";
import { Dropdown } from "react-native-element-dropdown";
import { useDropdown } from "./ExerciseData";
import ExerciseListFilter from "./ExerciseListFilter";

interface ChooseExerciseProps {
  onChoose: () => void
}

export interface OptionsObject {
  label: string
  value: string
}

export default function ChooseExercise(props: ChooseExerciseProps) {
  const { onChoose } = props;
  
  const [exercisesList, setExercisesList] = useAtom(exerciseListAtom);

  const [displayedExercises, setDisplayedExercises] = useState<ExerciseListItem[]>(exercisesList); 
  const [showFilters, setShowFilters] = useState<boolean>(false);  

  const handleExercisesRefresh = async () => {
    const data = await fetchWrapper({
      route: 'exercises/list/all',
      method: 'GET'
    });
    if (!data || !data.exercises) return;
    setExercisesList(data.exercises);
  };

  useEffect(() => {
    if (exercisesList.length > 0) return;
    handleExercisesRefresh();
  }, [exercisesList]);

  useEffect(() => {
    setShowFilters(true);
  }, []);

  return (
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        <View style={styles.row}>
          <TouchableOpacity 
            onPress={handleExercisesRefresh}
            style={[commonStyles.thinTextButton, {marginBottom: 5}]}
          >
            <Text style={styles.text}>refresh exercises</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={[commonStyles.thinTextButton, {marginBottom: 5}]}
          >
            <Text style={styles.text}>
              {showFilters ? 'hide filters' : 'show filters'}
            </Text>
          </TouchableOpacity>
        </View>
        <ExerciseListFilter showFilters={showFilters} exercisesList={exercisesList} setDisplayedExercises={setDisplayedExercises} />
        {displayedExercises.length === 0 &&
          <Text style={styles.text}>no exercises</Text>
        }
        <FlatList 
          style={styles.scrollView}
          data={displayedExercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChooseExerciseItem exercise={item} onChoose={onChoose} />
          )}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity 
          onPress={onChoose}
          style={[commonStyles.thinTextButton, {
            alignSelf: 'center'
          }]}
        >
          <Text style={styles.text}>close</Text>
        </TouchableOpacity>
      </View>
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
    // backgroundColor: 'purple'
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
});