import React, { useEffect, useState } from "react";
import { TextInput, View, Text, Switch, StyleSheet } from "react-native";
import { useDropdown } from "./ExerciseData";
import { ExerciseListItem, MuscleData, muscleGroupToTargetsAtom, WeightType } from "@/store/general";
import { OptionsObject } from "./ChooseExerciseModal";
import { useAtomValue, useSetAtom } from "jotai";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";

type WeightTypeExtended = WeightType | 'all';
interface WeightTypeOption {
  label: string
  value: WeightTypeExtended
}

type RatioType = '7' | '4' | '1' | 'disabled';
interface RatioTypeOption {
  label: string
  value: RatioType
}

export interface ExerciseListFilterProps {
  showFilters: boolean
  exercisesList: ExerciseListItem[]
  setDisplayedExercises: (exercises: ExerciseListItem[]) => void
}

export default function ExerciseListFilter(props: ExerciseListFilterProps) {
  const {showFilters, exercisesList, setDisplayedExercises} = props;

  const muscleGroupToTargets = useAtomValue(muscleGroupToTargetsAtom);

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const [searchBar, setSearchBar] = useState<string>('');
  const [customOnly, setCustomOnly] = useState<boolean>(false);
  
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

  const weightTypeOptions: WeightTypeOption[] = [
    { label: 'all', value: 'all' },
    { label: 'free', value: 'free' },
    { label: 'cable', value: 'cable' },
    { label: 'machine', value: 'machine' },
    { label: 'calisthenic', value: 'calisthenic' },
  ]
  const [weightTypeValue, setWeightTypeValue] = useState<WeightTypeExtended>('all');

  const ratioOptions: RatioTypeOption[] = [
    { label: 'primary (7)', value: '7' },
    { label: 'secondary (4)', value: '4' },
    { label: 'stabiliser (1)', value: '1' },
  ]
  const [ratioOptionsValue, setRatioOptionsValue] = useState<RatioType>('disabled');

  const updateSelectedMuscleGroup = (value: string) => {
    setMuscleGroupValue(value);
    if (value === 'all') {
      setMuscleTargetValue('disabled');
      setRatioOptionsValue('disabled');
    } else {
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

  const searchBarFilter = (tempExercises: ExerciseListItem[]): ExerciseListItem[] => {
    try {
      if (searchBar === '') {
        return tempExercises;
      }

      let parts = [searchBar, ...searchBar.split(' ')];
      parts = parts.filter(part => 
        part.trim() !== ''
      );

      let filtered: ExerciseListItem[] = [];
      let matchingIds: string[] = [];
      for (const part of parts) {
        const temp = tempExercises.filter((exercise: ExerciseListItem) => 
          exercise.name.toLowerCase().includes(part.toLowerCase()) && !matchingIds.includes(exercise.id)
        );
        filtered = filtered.concat(temp);
        matchingIds = matchingIds.concat(temp.map((exercise: ExerciseListItem) => exercise.id));
      }

      return filtered;
    
    } catch (error) {
      addCaughtErrorLog(error, 'error searchBarFilter');
      return [];
    }
  };

  const muscleFilter = (tempExercises: ExerciseListItem[]): ExerciseListItem[] => {
    if (muscleGroupValue === 'all') return tempExercises;
    return tempExercises.filter((exercise: ExerciseListItem) => 
      muscleDataMatchesFilters(exercise.muscle_data)
    );
  };

  const muscleDataMatchesFilters = (muscle_data: MuscleData[]): boolean => {
    try {
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
    } catch (error) {
      addCaughtErrorLog(error, 'error muscleDataMatchesFilters'); 
    }
    return false;
  };

  const weightTypeFilter = (tempExercises: ExerciseListItem[]): ExerciseListItem[] => {
    const weightType = weightTypeValue;
    if (weightType === 'all') return tempExercises;

    return tempExercises.filter((exercise: ExerciseListItem) => 
      exercise.weight_type === weightType
    )
  };
  
  const customExercisesFilter = (tempExercises: ExerciseListItem[]): ExerciseListItem[] => {
    if (!customOnly) return tempExercises;
    return tempExercises.filter((exercise: ExerciseListItem) => 
      exercise.is_custom
    )
  };

  const applyFilters = () => {
    if (!showFilters) return;
    let tempExercises: ExerciseListItem[] = [...exercisesList];
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
    exercisesList,
    showFilters
  ]);

  useEffect(() => {
    if (!showFilters) return;
    setDisplayedExercises(exercisesList);
    setSearchBar('');
    setMuscleGroupValue('all');
    setMuscleTargetValue('disabled');
    setRatioOptionsValue('disabled');
    setCustomOnly(false);
  }, [showFilters]);

  return (
    <>
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
    </>
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
  }
});