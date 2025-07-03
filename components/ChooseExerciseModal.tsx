import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet, ScrollView, TextInput, Switch } from "react-native";

import { fetchExercises, fetchWrapper } from "@/middleware/helpers";
import { useAtom, useAtomValue } from "jotai";
import { exerciseListAtom, MuscleData, muscleGroupToTargetsAtom, WorkoutExercise } from "@/store/general";
import ChooseExerciseData from "./ChooseExerciseItem";
import { commonStyles } from "@/styles/commonStyles";
import InputField from "./InputField";
import workoutExercise from "./WorkoutExercise";
// import Dropdown, { DropdownOption } from "./Dropdown";
import { Dropdown } from "react-native-element-dropdown";

interface ChooseExerciseProps {
  onChoose: () => void
}

interface OptionsObject {
  label: string
  value: string
}

export default function ChooseExercise(props: ChooseExerciseProps) {
  const { onChoose } = props;
  
  const muscleGroupToTargets = useAtomValue(muscleGroupToTargetsAtom);

  const [exercises, setExercises] = useAtom(exerciseListAtom);
  const [displayedExercises, setDisplayedExercises] = useState<WorkoutExercise[]>(exercises); 
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchBar, setSearchBar] = useState<string>('');
  
  // const [selectedMuscleGroupIdx, setSelectedMuscleGroupIdx] = useState<number>(0);
  // const muscleGroupOptions = [
  //   { label: 'muscle group (all)', value: 'all' },
  //   { label: 'arms', value: 'arms' },
  //   { label: 'back', value: 'back' },
  //   { label: 'chest', value: 'chest' },
  //   { label: 'core', value: 'core' },
  //   { label: 'legs', value: 'legs' },
  //   { label: 'shoulders', value: 'shoulders' },
  // ]

  // const muscleGroupOptions: OptionsObject[] = Object.keys(muscleGroupToTargets).map(group => ({
  //   label: group,
  //   value: group
  // }));

  const muscleGroupOptions: OptionsObject[] = ((): OptionsObject[] => {
    const options = [{ label: 'muscle group (all)', value: 'all' }];
    options.push(...Object.keys(muscleGroupToTargets).map(group => ({
      label: group,
      value: group
    })))
    return options;
  })();
  const [muscleGroupValue, setMuscleGroupValue] = useState<string>('all');

  // const [selectedMuscleTargetIdx, setSelectedMuscleTargetIdx] = useState<number>(0);
  // const muscleTargetOptions: Record<string, any> = {
  //   arms: [
  //     { label: 'bicep', value: 'bicep' },
  //     { label: 'tricep', value: 'tricep' },
  //     { label: 'forearm', value: 'forearm' },
  //   ],
  //   back: [
  //     { label: 'lats', value: 'lats' },
  //     { label: 'upper middle', value: 'upper middle' },
  //     { label: 'exterior middle', value: 'exterior middle' },
  //     { label: 'traps', value: 'traps' },
  //     { label: 'erectors', value: 'erectors' },
  //   ],
  //   chest: [
  //     { label: 'upper', value: 'upper' },
  //     { label: 'lower', value: 'lower' },
  //   ],
  //   core: [
  //     { label: 'upper abs', value: 'upper abs' },
  //     { label: 'lower abs', value: 'lower abs' },
  //     { label: 'obliques', value: 'obliques' },
  //   ],
  //   legs: [
  //     { label: 'calves', value: 'calves' },
  //     { label: 'quads', value: 'quads' },
  //     { label: 'hamstrings', value: 'hamstrings' },
  //     { label: 'glutes', value: 'glutes' },
  //   ],
  //   shoulders: [
  //     { label: 'front', value: 'front' },
  //     { label: 'middle', value: 'middle' },
  //     { label: 'rear', value: 'rear' },
  //   ]
  // }

  const muscleTargetOptions = ((): Record<string, OptionsObject[]> => {
    const optionsMap: Record<string, OptionsObject[]> = {};
    for (const [group, targets] of Object.entries(muscleGroupToTargets)) {
      optionsMap[group] = targets.map(name => ({
        label: name,
        value: name
      }));
    }
    return optionsMap;
  })();

  // const [selectedRatioIdx, setSelectedRatioIdx] = useState<number>(0);
  const ratioOptions: OptionsObject[] = [
    { label: 'primary', value: '7' },
    { label: 'secondary', value: '4' },
    { label: 'stabiliser', value: '1' },
  ]

  const [selectedWeightTypeIdx, setSelectedWeightTypeIdx] = useState<number>(0);
   const weightTypeOptions = [
    { label: 'all', value: 'all' },
    { label: 'free', value: 'free' },
    { label: 'cable', value: 'cable' },
    { label: 'machine', value: 'machine' },
  ]

  const [customOnly, setCustomOnly] = useState<boolean>(false);

  const handleExercisesRefresh = async () => {
    const data = await fetchWrapper('exercises/list/all', 'GET');
    if (data === null) return;
    setExercises(data.exercises);
  };

  const handleToggleShowFilters =  () => {
    if (showFilters) {
      setDisplayedExercises(exercises);
      setSearchBar('');
      setSelectedMuscleGroupIdx(0);
      setSelectedMuscleTargetIdx(0);
    }
    setShowFilters(!showFilters);
  };

  const updateSelectedMuscleGroupIdx = (index: number) => {
    setSelectedMuscleGroupIdx(index);
    setSelectedMuscleTargetIdx(0);
  };

  const getMuscleTargetOptions = (): DropdownOption[] => {
    if (selectedMuscleGroupIdx === 0) return [
      { label: 'disabled', value: 'disabled' },
    ];
    const temp = muscleTargetOptions[muscleGroupOptions[selectedMuscleGroupIdx].value]
    return [{ label: 'muscle target (all)', value: 'all' }].concat(temp)
  };

  const getActivationThreshold = (): DropdownOption[] => {
    if (selectedMuscleGroupIdx === 0) return [
      { label: 'disabled', value: 'disabled' },
    ];
    return ratioOptions;
  };

  const searchBarFilter = (tempExercises: WorkoutExercise[]): WorkoutExercise[] => {
    if (searchBar === '') {
      return tempExercises;
    }

    let parts = [searchBar, ...searchBar.split(' ')];
    parts = parts.filter(part => 
      part.trim() !== ''
    );

    let filtered: WorkoutExercise[] = [];
    let matchingIds: string[] = [];
    for (const part of parts) {
      const temp = tempExercises.filter((exercise: WorkoutExercise) => 
        exercise.name.toLowerCase().includes(part.toLowerCase()) && !matchingIds.includes(exercise.id)
      );
      filtered = filtered.concat(temp);
      matchingIds = matchingIds.concat(temp.map((exercise: WorkoutExercise) => exercise.id));
    }

    return filtered
  };

  const muscleFilter = (tempExercises: WorkoutExercise[]): WorkoutExercise[] => {
    if (selectedMuscleGroupIdx === 0 && selectedMuscleTargetIdx === 0) return tempExercises;
    return tempExercises.filter((exercise: WorkoutExercise) => 
      muscleDataMatchesFilters(exercise.muscle_data)
    );
  };

  const muscleDataMatchesFilters = (muscle_data: MuscleData[]): boolean => {
    const groupName = muscleGroupOptions[selectedMuscleGroupIdx].value;
    const targetName = getMuscleTargetOptions()[selectedMuscleTargetIdx].value;
    const threshold = Number(ratioOptions[selectedRatioIdx].value);

    for (const group_data of muscle_data) {
      if (group_data.group_name !== groupName) continue
      for (const target_data of group_data.targets) {
        if (targetName !== 'all') {
          if (target_data.target_name !== targetName) continue
          return target_data.ratio >= threshold
        }
        if (target_data.ratio < threshold) continue
        return true;
      }
    }

    return false;
  };

  const weightTypeFilter = (tempExercises: WorkoutExercise[]): WorkoutExercise[] => {
    const weightType = weightTypeOptions[selectedWeightTypeIdx].value;
    if (weightType === 'all') return tempExercises;

    return tempExercises.filter((exercise: WorkoutExercise) => 
      exercise.weight_type === weightType
    )

  };

  const customExercisesFilter = (tempExercises: WorkoutExercise[]): WorkoutExercise[] => {
    if (!customOnly) return tempExercises;
    return tempExercises.filter((exercise: WorkoutExercise) => 
      exercise.is_custom
    )
  };

  const applyFilters = () => {
    let tempExercises: WorkoutExercise[] = [...exercises];
    tempExercises = searchBarFilter(tempExercises);
    tempExercises = muscleFilter(tempExercises);
    tempExercises = weightTypeFilter(tempExercises);
    tempExercises = customExercisesFilter(tempExercises)
    setDisplayedExercises(tempExercises);
  };

  useEffect(() => {
    applyFilters();
  }, [
    searchBar, 
    selectedMuscleGroupIdx, 
    selectedMuscleTargetIdx, 
    selectedRatioIdx, 
    selectedWeightTypeIdx,
    customOnly,
    exercises
  ]);

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
            onPress={handleToggleShowFilters}
            style={[commonStyles.thinTextButton, {marginBottom: 5}]}
          >
            <Text style={styles.text}>
              {showFilters ? 'hide filters' : 'show filters'}
            </Text>
          </TouchableOpacity>
        </View>
        {showFilters &&
          <View style={styles.filterContainer}>
            <View style={styles.filterInnerContainer}>
              <TextInput 
                value={searchBar}
                onChangeText={setSearchBar} 
                style={styles.input}
              />
              <Text style={styles.text}>Weight type:</Text>
              <Dropdown selectedIdx={selectedWeightTypeIdx} setSelectedIdx={setSelectedWeightTypeIdx} options={weightTypeOptions} />
              <View style={styles.switchContainer}>
                <Text style={styles.text}>Custom exercises only:</Text>
                <Switch
                  trackColor={{true: '#b4fcac', false: '#767577'}}
                  thumbColor={customOnly ? '#1aff00' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  value={customOnly}
                  onValueChange={setCustomOnly}
                />
              </View>
            </View>
            <View style={styles.filterInnerContainer}>
              <Text style={styles.text}>Muscle group:</Text>
              <Dropdown 
                selectedIdx={selectedMuscleGroupIdx} 
                setSelectedIdx={updateSelectedMuscleGroupIdx} 
                options={muscleGroupOptions} 
              />
              <Text style={styles.text}>Muscle target:</Text>
              <Dropdown 
                selectedIdx={selectedMuscleTargetIdx} 
                setSelectedIdx={setSelectedMuscleTargetIdx} 
                options={getMuscleTargetOptions()} 
                disabled={selectedMuscleGroupIdx === 0}
              />
              <Text style={styles.text}>Activation threshold:</Text>
              <Dropdown 
                selectedIdx={selectedRatioIdx} 
                setSelectedIdx={setSelectedRatioIdx} 
                options={getActivationThreshold()} 
                disabled={selectedMuscleGroupIdx === 0}
              />
              {/* {selectedMuscleGroupIdx !== 0 &&
                <>
                  <Text style={styles.text}>Muscle target:</Text>
                  <Dropdown selectedIdx={selectedMuscleTargetIdx} setSelectedIdx={setSelectedMuscleTargetIdx} options={getMuscleTargetOptions()} />
                  <Text style={styles.text}>Activation threshold:</Text>
                  <Dropdown selectedIdx={selectedRatioIdx} setSelectedIdx={setSelectedRatioIdx} options={ratioOptions} />
                </>
              } */}
            </View>
          </View>
        }
        {displayedExercises.length === 0 &&
          <Text style={styles.text}>no exercises</Text>
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
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingTop: 5,
  },
  filterInnerContainer: {
    justifyContent: 'center',
  }
});