import React, { useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet, ScrollView, TextInput } from "react-native";

import { fetchExercises, fetchWrapper } from "@/middleware/helpers";
import { useAtom } from "jotai";
import { exerciseListAtom, WorkoutExercise } from "@/store/general";
import ChooseExerciseData from "./ChooseExerciseItem";
import { commonStyles } from "@/styles/commonStyles";
import InputField from "./InputField";
import workoutExercise from "./WorkoutExercise";
import Dropdown, { DropdownOption } from "./Dropdown";

interface ChooseExerciseProps {
  onChoose: () => void
}

export default function ChooseExercise(props: ChooseExerciseProps) {
  const { onChoose } = props;
  
  const [exercises, setExercises] = useAtom(exerciseListAtom);
  const [displayedExercises, setDisplayedExercises] = useState<WorkoutExercise[]>(exercises); 
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchBar, setSearchBar] = useState<string>('');
  
  const [selectedMuscleGroupIdx, setSelectedMuscleGroupIdx] = useState<number>(0);
  const muscleGroupOptions = [
    { label: 'muscle group', value: 'all' },
    { label: 'arms', value: 'arms' },
    { label: 'back', value: 'back' },
    { label: 'chest', value: 'chest' },
    { label: 'core', value: 'core' },
    { label: 'legs', value: 'legs' },
    { label: 'shoulders', value: 'shoulders' },
  ]

  const [selectedMuscleTargetIdx, setSelectedMuscleTargetIdx] = useState<number>(0);
  const muscleTargetOptions: Record<string, any> = {
    arms: [
      { label: 'bicep', value: 'bicep' },
      { label: 'tricep', value: 'tricep' },
      { label: 'forearm', value: 'forearm' },
    ],
    back: [
      { label: 'lats', value: 'lats' },
      { label: 'upper middle', value: 'upper middle' },
      { label: 'exterior middle', value: 'exterior middle' },
      { label: 'traps', value: 'traps' },
      { label: 'erectors', value: 'erectors' },
    ],
    chest: [
      { label: 'upper', value: 'upper' },
      { label: 'lower', value: 'lower' },
    ],
    core: [
      { label: 'upper abs', value: 'upper abs' },
      { label: 'lower abs', value: 'lower abs' },
      { label: 'obliques', value: 'obliques' },
    ],
    legs: [
      { label: 'calves', value: 'calves' },
      { label: 'quads', value: 'quads' },
      { label: 'hamstrings', value: 'hamstrings' },
      { label: 'glutes', value: 'glutes' },
    ],
    shoulders: [
      { label: 'front', value: 'front' },
      { label: 'middle', value: 'middle' },
      { label: 'rear', value: 'rear' },
    ]
  }

  const handleExercisesRefresh = async () => {
    const data = await fetchWrapper('exercises/list/all', 'GET');
    if (data === null) return;
    setExercises(data.exercises);
  };

  // search bar
  // filters:
  //    muscle group
  //      muscle target
  //    is/is not custom exercise
  //    weight type
  // exercise buttons -> click to expand details

  const handleToggleShowFilters =  () => {
    if (showFilters) {
      setDisplayedExercises(exercises);
      setSearchBar('');
      setSelectedMuscleGroupIdx(0);
      setSelectedMuscleTargetIdx(0);
    }
    setShowFilters(!showFilters);
  };

  const handleSearchBarUpdate = (text: string) => {
    setSearchBar(text);
    if (text === '') {
      setDisplayedExercises(exercises);
    }

    let parts = [text, ...text.split(' ')];
    parts = parts.filter(part => 
      part.trim() !== ''
    );

    let matching: WorkoutExercise[] = [];
    let matchingIds: string[] = [];
    for (const part of parts) {
      const temp = exercises.filter((exercise: WorkoutExercise) => 
        exercise.name.toLowerCase().includes(part.toLowerCase()) && !matchingIds.includes(exercise.id)
      );
      matching = matching.concat(temp);
      matchingIds = matchingIds.concat(temp.map((exercise: WorkoutExercise) => exercise.id));
    }

    setDisplayedExercises(matching);
  };

  const updateSelectedMuscleGroupIdx = (index: number) => {
    setSelectedMuscleGroupIdx(index);
    setSelectedMuscleTargetIdx(0);
  };

  const getMuscleTargetOptions = (): DropdownOption[] => {
    const temp = muscleTargetOptions[muscleGroupOptions[selectedMuscleGroupIdx].value]
    return [{ label: 'muscle target', value: 'all' }].concat(temp)
  };


  return (
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        <View style={styles.row}>
          <TouchableOpacity 
            onPress={handleExercisesRefresh}
            style={[commonStyles.thinTextButton, {marginBottom: 5}]}
          >
            <Text style={{ color: "white"}}>refresh exercises</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleToggleShowFilters}
            style={[commonStyles.thinTextButton, {marginBottom: 5}]}
          >
            <Text style={{ color: "white"}}>
              {showFilters ? 'hide filters' : 'show filters'}
            </Text>
          </TouchableOpacity>
        </View>
        {showFilters &&
          <View>
            <TextInput 
              value={searchBar}
              onChangeText={handleSearchBarUpdate} 
              style={styles.input}
            />
            <Dropdown selectedIdx={selectedMuscleGroupIdx} setSelectedIdx={updateSelectedMuscleGroupIdx} options={muscleGroupOptions} />
            {selectedMuscleGroupIdx !== 0 &&
              <Dropdown selectedIdx={selectedMuscleTargetIdx} setSelectedIdx={setSelectedMuscleTargetIdx} options={getMuscleTargetOptions()} />
            }
          </View>
        }
        <ScrollView style={styles.scrollView}>
          {displayedExercises.map((exercise, i) => {
            return (
              <ChooseExerciseData key={i} exercise={exercise} onChoose={onChoose}/>
            )
          })}
        </ScrollView>
        <TouchableOpacity 
          onPress={onChoose}
          style={commonStyles.thinTextButton}
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
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    elevation: 5,
    borderWidth: 2,
    height: '95%',
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
    color: "white"
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  }
});