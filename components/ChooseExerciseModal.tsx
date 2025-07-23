import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet, ScrollView, TextInput, Switch } from "react-native";

import { fetchExercises, fetchWrapper } from "@/middleware/helpers";
import { useAtom, useAtomValue } from "jotai";
import { exerciseListAtom, MuscleData, muscleGroupToTargetsAtom, WorkoutExercise, WeightType } from "@/store/general";
import ChooseExerciseData from "./ChooseExerciseItem";
import { commonStyles } from "@/styles/commonStyles";
import InputField from "./InputField";
import workoutExercise from "./WorkoutExercise";
import { Dropdown } from "react-native-element-dropdown";
import { useDropdown } from "./ExerciseData";

interface ChooseExerciseProps {
  onChoose: () => void
}

export interface OptionsObject {
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
  
  const muscleGroupOptions: OptionsObject[] = ((): OptionsObject[] => {
    const options = [{ label: 'all groups', value: 'all' }];
    options.push(...Object.keys(muscleGroupToTargets).map(group => ({
      label: group,
      value: group
    })))
    return options;
  })();
  const [muscleGroupValue, setMuscleGroupValue] = useState<string>('all');

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
  const [muscleTargetValue, setMuscleTargetValue] = useState<string>('disabled');

  type RatioType = '7' | '4' | '1' | 'disabled';
  interface RatioTypeOption {
    label: string
    value: RatioType
  }
  
  const ratioOptions: RatioTypeOption[] = [
    { label: 'primary', value: '7' },
    { label: 'secondary', value: '4' },
    { label: 'stabiliser', value: '1' },
  ]
  const [ratioOptionsValue, setRatioOptionsValue] = useState<RatioType>('disabled');

  type WeightTypeExtended = WeightType | 'all';
  interface WeightTypeOption {
    label: string
    value: WeightTypeExtended
  }

  const weightTypeOptions: WeightTypeOption[] = [
    { label: 'all', value: 'all' },
    { label: 'free', value: 'free' },
    { label: 'cable', value: 'cable' },
    { label: 'machine', value: 'machine' },
  ]
  const [weightTypeValue, setWeightTypeValue] = useState<WeightTypeExtended>('all');

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
      setMuscleGroupValue('all');
      setMuscleTargetValue('disabled');
    }
    setShowFilters(!showFilters);
  };

  const updateSelectedMuscleGroup = (value: string) => {
    setMuscleGroupValue(value);
    if (value === 'all') {
      setMuscleTargetValue('disabled');
      setRatioOptionsValue('disabled');
    } else {
      // setMuscleTargetValue(muscleTargetOptions[value][0].value);
      setMuscleTargetValue('all');
      setRatioOptionsValue('7');
    }
  };

  const getMuscleTargetOptions = (): OptionsObject[] => {
    if (muscleGroupValue === 'all') {
      return [{ label: 'disabled (select group)', value: 'disabled' }];
    }
    const temp = muscleTargetOptions[muscleGroupValue];
    return [{ label: 'muscle target (all)', value: 'all' }].concat(temp);
  };

  const updateSelectedMuscleTarget = (value: string) => {
    if (muscleGroupValue === 'all') return;
    setMuscleTargetValue(value);
  };

  const getActivationThreshold = (): OptionsObject[] => {
    if (muscleGroupValue === 'all') {
      return [{ label: 'disabled (select group)', value: 'disabled' }];
    }
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

    return filtered;
  };

  const muscleFilter = (tempExercises: WorkoutExercise[]): WorkoutExercise[] => {
    if (muscleGroupValue === 'all') return tempExercises;
    return tempExercises.filter((exercise: WorkoutExercise) => 
      muscleDataMatchesFilters(exercise.muscle_data)
    );
  };

  const muscleDataMatchesFilters = (muscle_data: MuscleData[]): boolean => {
    const threshold = Number(ratioOptionsValue);

    for (const group_data of muscle_data) {
      if (group_data.group_name !== muscleGroupValue) continue
      for (const target_data of group_data.targets) {
        if (muscleTargetValue !== 'all') {
          if (target_data.target_name !== muscleTargetValue) continue
          return target_data.ratio >= threshold
        }
        if (target_data.ratio < threshold) continue
        return true;
      }
    }

    return false;
  };

  const weightTypeFilter = (tempExercises: WorkoutExercise[]): WorkoutExercise[] => {
    const weightType = weightTypeValue;
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
    muscleGroupValue, 
    muscleTargetValue, 
    ratioOptionsValue, 
    weightTypeValue,
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
            <View style={{marginTop: 18}}>
              <TextInput 
                value={searchBar}
                onChangeText={setSearchBar} 
                style={styles.input}
                placeholder="search..."
                placeholderTextColor={'#ccc'}
              />
              <Text style={styles.text}>Weight type:</Text>
              {useDropdown(weightTypeOptions, weightTypeValue, setWeightTypeValue)}
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
            <View>
              <Text style={styles.text}>Muscle group:</Text>
              {useDropdown(muscleGroupOptions, muscleGroupValue, updateSelectedMuscleGroup)}
              <Text style={styles.text}>Muscle target:</Text>
              {useDropdown(getMuscleTargetOptions(), muscleTargetValue, updateSelectedMuscleTarget, muscleGroupValue==='all')}
              <Text style={styles.text}>Activation threshold:</Text>
              {useDropdown(getActivationThreshold(), ratioOptionsValue, setRatioOptionsValue, muscleGroupValue==='all')}
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
    alignItems: 'flex-start',
    width: '100%',
    paddingTop: 5,
  }
});