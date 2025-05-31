import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import React, { View, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native"
import { SetData, WorkoutExercise, workoutExercisesAtom } from "@/store/general";
import ConfirmationModal from "./ConfirmationModal";
import ShiftTextInput from "./ShiftTextInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ExerciseSetsProps {
  exercise: WorkoutExercise
  exerciseIndex: number
}

// todo: fix column spacing with adjacent buttons
// todo: fix onDeleteSet, update displayWeight for index

// todo: numeric weight in storage
// todo: handle partial reps?

export default function ExerciseSets(props: ExerciseSetsProps) {
  const { exercise, exerciseIndex } = props; 

  const [exercises, setExercises] = useAtom(workoutExercisesAtom);
  
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);
  const [displayWeights, setDisplayWeights] = useState<string[]>([]);

  useEffect(() => {
    const temp: string[] = [];
    for (const data of exercise.set_data) {
      temp.push(formatFloatString((data.num_sets ?? '').toString()));
    }
    setDisplayWeights(temp);
  }, []);

  const handleUpdateInteger = (text: string, index: number, key: 'reps' | 'num_sets') => {
    text = text.replace(/\D/g, '');
    const tempSetData: SetData[] = [...exercise.set_data];
    let num: any = parseInt(text);
    if (isNaN(num)) num = null;
    tempSetData[index][key] = num;
    updateExerciseSetData(tempSetData);
  }

  const handleUpdateWeight = (text: string, index: number) => {
    const cleanedText = text.replace(/[^0-9.]/g, '');
    const formattedText = formatFloatString(cleanedText);

    const tempDisplayWeights: string[] = [...displayWeights];
    tempDisplayWeights[index] = formattedText;
    setDisplayWeights(tempDisplayWeights);

    let weight = null;
    if (formattedText !== '' && formattedText !== '.') {
      weight = Math.abs(parseFloat(formattedText) || 0);
    }
    const tempSetData: SetData[] = [...exercise.set_data];
    tempSetData[index].weight = weight;
    updateExerciseSetData(tempSetData);
  };

  const formatFloatString = (text: string): string => {
    const parts = text.split('.');
    let formattedText = parts[0];
    if (parts.length > 1) {
      formattedText += '.' + parts[1].substring(0, 3);
    }
    return formattedText;
  };

  const updateExerciseSetData = (set_data: any) => {
    const tempExercises: WorkoutExercise[] = [...exercises];
    tempExercises[exerciseIndex].set_data = set_data;
    setExercises(tempExercises);
  };

  const handleShiftSet = (index: number, increase: boolean) => {
    const tempSetData = [...exercise.set_data];
    let num = tempSetData[index].num_sets;
    if (increase) {
      num = num !== null ? ++num : 1
    } else {
      if (num === 0 || num === null) return;
      tempSetData[index].num_sets = --num;
    }
    tempSetData[index].num_sets = num;
    updateExerciseSetData(tempSetData);
  }

  const handleCopySet = (index: number) => {
    const tempSets = [...exercise.set_data];
    const tempSet = { ...tempSets[index] };
    tempSets.push(tempSet);
    updateExerciseSetData(tempSets);
  }

  const handleDeleteSet = (index: number) => {
    let tempSets = [...exercise.set_data];
    if (tempSets.length > 1) {
      tempSets.splice(index, 1);
      updateExerciseSetData(tempSets);
      return;
    }
    tempSets = [
      {
        "reps": null,
        "weight": null,
        "num_sets": null,
      }
    ]
    updateExerciseSetData(tempSets)
  }

  const openConfirm = (): Promise<boolean> => {
    setDeleteModalVisible(true);
    return new Promise(resolve => setResolver(() => resolve));
  };

  const handleDeletePress = async (index: number) => {
    const confirmed = await openConfirm();
    if (!confirmed) return;
    handleDeleteSet(index);
  };

   const handleConfirm = () => {
    resolver?.(true);
    setDeleteModalVisible(false);
  };

  const handleCancel = () => {
    resolver?.(false);
    setDeleteModalVisible(false);
  };

  const handleNewSet = () => {
    const tempSets = [...exercise.set_data];
    tempSets.push({
      "reps": null,
      "weight": null,
      "num_sets": null,
    })
    updateExerciseSetData(tempSets);
  }

  useEffect(() => {
    if (exercise.set_data.length > 0) return;
    const tempExercises = [...exercises];
    tempExercises[exerciseIndex].set_data = [
      {
        "reps": null,
        "weight": null,
        "num_sets": null,
      }
    ]
    setExercises(tempExercises);
  }, [exercise.set_data])

  // useEffect(() => {
  //   console.log(exercise.set_data)
  // }, [exercise.set_data])

  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.header]}>
        <Text style={styles.text}>reps</Text>
        <Text style={styles.text}>weight</Text>
        <Text style={styles.text}>sets</Text>
      </View>
      {exercise.set_data.map((set_data: SetData, index: number) => (
        <View key={index} style={styles.container}>
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => handleDeletePress(index)}
              style={styles.textButton}
            >
              {/* <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} /> */}
              <MaterialIcons name="delete-outline" size={20} color="red" />
            </TouchableOpacity>
            <TextInput 
              style={styles.textInput}
              keyboardType="number-pad"
              onChangeText={(text) => handleUpdateInteger(text, index, 'reps')}
              value={(set_data.reps ?? '').toString()}
            />
            <TextInput 
              style={styles.textInput}
              keyboardType="number-pad"
              onChangeText={(text) => handleUpdateWeight(text, index)}
              value={displayWeights[index]}
            />
            <ShiftTextInput
              onChangeText={(text) => handleUpdateInteger(text, index, 'num_sets')}
              value={(set_data.num_sets ?? '').toString()}
              shiftPress={(increase: boolean) => handleShiftSet(index, increase)}
            />
            <TouchableOpacity
              onPress={() => handleCopySet(index)}
              style={styles.textButton}
            >
              <Ionicons name={'copy-outline'} color={'red'} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <View style={styles.row}>
        <TouchableOpacity
          onPress={handleNewSet}
          style={styles.textButton}
        >
          <Text style={styles.text}>new</Text>
        </TouchableOpacity>
      </View>
      <ConfirmationModal visible={deleteModalVisible} onConfirm={handleConfirm} onCancel={handleCancel} message="Delete set?" confirm_string="yeah" cancel_string="nah"/>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  textInput: {
    color: 'white',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '25%',
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingBottom: 5
  },
  header: {
    // paddingBottom: 5,
  },
  textButton: {
    padding: 8
  },

})