import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import React, { View, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native"
import { emptySetData, SetClass, SetData, WorkoutExercise, workoutExercisesAtom } from "@/store/general";
import ConfirmationModal from "./ConfirmationModal";
import ShiftTextInput from "./ShiftTextInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { commonStyles } from "@/styles/commonStyles";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useDropdown } from "./ExerciseData";

interface ExerciseSetProps {
  exercise: WorkoutExercise
  exerciseIndex: number
  set_data: SetData
  setIndex: number
  openOptions: boolean
}

export default function ExerciseSet(props: ExerciseSetProps) {
  const { exercise, exerciseIndex, set_data, setIndex, openOptions } = props;

  const [exercises, setExercises] = useAtom(workoutExercisesAtom);

  const [displayWeight, setDisplayWeight] = useState<string>('');
  const [copyPressOn, setCopyPressOn] = useState<boolean>(false);
  const [deletePressOn, setDeletePressOn] = useState<boolean>(false);
  const [moveUpPressOn, setMoveUpPressOn] = useState<boolean>(false);
  const [moveDownPressOn, setMoveDownPressOn] = useState<boolean>(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  interface SetClassOption {
    label: string
    value: SetClass
  }

  const classOptions: SetClassOption[] = [
    { label: 'working', value: 'working' },
    { label: 'dropset', value: 'dropset' },
    { label: 'warmup', value: 'warmup' },
    { label: 'cooldown', value: 'cooldown' },
  ]
  const [classOptionValue, setClassOptionValue] = useState<SetClass>(set_data.class);

  const handleUpdateInteger = (text: string, key: 'reps' | 'num_sets') => {
    text = text.replace(/\D/g, '');
    let num: any = parseInt(text);
    if (isNaN(num)) num = null;

    const tempSetData: SetData[] = [...exercise.set_data];
    tempSetData[setIndex][key] = num;
    updateExerciseSetData(tempSetData);
  }

  const handleUpdateWeight = (text: string) => {
    const cleanedText = text.replace(/[^0-9.]/g, '');
    const formattedText = formatFloatString(cleanedText);

    setDisplayWeight(formattedText)

    let weight = null;
    if (formattedText !== '' && formattedText !== '.') {
      weight = Math.abs(parseFloat(formattedText) || 0);
    }
    const tempSetData: SetData[] = [...exercise.set_data];
    tempSetData[setIndex].weight = weight;
    updateExerciseSetData(tempSetData);
  };

  const updateExerciseSetData = (set_data: any) => {
    const tempExercises: WorkoutExercise[] = [...exercises];
    tempExercises[exerciseIndex].set_data = set_data;
    setExercises(tempExercises);
  };

  const handleShiftSet = (increase: boolean) => {
    const tempSetData = [...exercise.set_data];
    let num = tempSetData[setIndex].num_sets;
    if (increase) {
      num = num !== null ? ++num : 1
    } else {
      if (num === 0 || num === null) return;
      tempSetData[setIndex].num_sets = --num;
    }
    tempSetData[setIndex].num_sets = num;
    updateExerciseSetData(tempSetData);
  }

  useEffect(() => {
    setDisplayWeight(formatFloatString((set_data.weight ?? '').toString()));
  }, []);
  
  const formatFloatString = (text: string): string => {
    const parts = text.split('.');
    let formattedText = parts[0];
    if (parts.length > 1) {
      formattedText += '.' + parts[1].substring(0, 3);
    }
    return formattedText;
  };

  const handleCopySet = () => {
    const tempSetData = [...exercise.set_data];
    const tempSet = { ...tempSetData[setIndex] };
    tempSetData.push(tempSet);
    updateExerciseSetData(tempSetData);
  }

  const handleDeleteSet = () => {
    let tempSetData = [...exercise.set_data];
    setDisplayWeight('');
    if (tempSetData.length <= 1) {
      tempSetData = [{ ...emptySetData }]
      updateExerciseSetData(tempSetData);
      return;
    }

    tempSetData.splice(setIndex, 1);
    updateExerciseSetData(tempSetData);
  }

  const openConfirm = (): Promise<boolean> => {
    setDeleteModalVisible(true);
    return new Promise(resolve => setResolver(() => resolve));
  };

  const handleDeletePress = async () => {
    const confirmed = await openConfirm();
    if (!confirmed) return;
    handleDeleteSet();
  };

  const handleConfirm = () => {
    resolver?.(true);
    setDeleteModalVisible(false);
  };

  const handleCancel = () => {
    resolver?.(false);
    setDeleteModalVisible(false);
  };

  const handleMoveUp = () => {
    const tempSetData = [...exercise.set_data];
    const tempSet = tempSetData[setIndex];
    tempSetData[setIndex] = tempSetData[setIndex - 1];
    tempSetData[setIndex - 1] = tempSet;
    updateExerciseSetData(tempSetData);
  };

  const handleMoveDown = () => {
    const tempSetData = [...exercise.set_data];
    const tempSet = tempSetData[setIndex];
    tempSetData[setIndex] = tempSetData[setIndex + 1];
    tempSetData[setIndex + 1] = tempSet;
    updateExerciseSetData(tempSetData);
  };

  const handleUpdateSetClass = (newClass: SetClass) => {
    setClassOptionValue(newClass);

    const tempSetData = [...exercise.set_data];
    const tempSet = tempSetData[setIndex];
    tempSet.class = newClass
    updateExerciseSetData(tempSetData);
  };

  useEffect(() => {
    setClassOptionValue(set_data.class);
  }, [set_data])

  return (
    <>
      <View style={styles.row}>
        {openOptions ?
          <>
            <View style={styles.valueRow}>
              <Text style={styles.text}>{set_data.reps ?? 0}</Text>
              <Text style={styles.text}>{displayWeight !== '' ? displayWeight : '0.0'}</Text>
              <Text style={styles.text}>{set_data.num_sets ?? 0}</Text>
            </View>
            <TouchableOpacity
              onPress={handleDeletePress}
              style={styles.button}
              onPressIn={() => setDeletePressOn(true)}
              onPressOut={() =>  setDeletePressOn(false)}
              activeOpacity={1}
            >
              <MaterialIcons name={deletePressOn ? 'delete' : "delete-outline"} size={20} color="red" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCopySet}
              style={styles.button}
              onPressIn={() => setCopyPressOn(true)}
              onPressOut={() => setCopyPressOn(false)}
              activeOpacity={1}
            >
              <Ionicons name={copyPressOn ? 'copy' : 'copy-outline'} color={'green'} size={20} />
            </TouchableOpacity>
            {useDropdown(classOptions, classOptionValue, handleUpdateSetClass, undefined, {width: 100})}
            <TouchableOpacity
              onPress={handleMoveUp}
              style={styles.button}
              onPressIn={() => setMoveUpPressOn(true)}
              onPressOut={() => setMoveUpPressOn(false)}
              activeOpacity={1}
              disabled={setIndex === 0}
            >
              <AntDesign name='arrowup' size={20} color={moveUpPressOn ? "cyan" : "#ccc"} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleMoveDown}
              style={styles.button}
              onPressIn={() => setMoveDownPressOn(true)}
              onPressOut={() => setMoveDownPressOn(false)}
              activeOpacity={1}
              disabled={setIndex === exercise.set_data.length - 1}
            >
              <AntDesign name='arrowdown' size={20} color={moveDownPressOn ? "cyan" : "#ccc"} />
            </TouchableOpacity>
          </>
        :
          <>
            <TextInput 
              style={styles.textInput}
              keyboardType="number-pad"
              onChangeText={(text) => handleUpdateInteger(text, 'reps')}
              value={(set_data.reps ?? '').toString()}
            />
            <TextInput 
              style={styles.textInput}
              keyboardType="number-pad"
              onChangeText={(text) => handleUpdateWeight(text)}
              value={displayWeight}
            />
            <ShiftTextInput
              onChangeText={(text) => handleUpdateInteger(text, 'num_sets')}
              value={(set_data.num_sets ?? '').toString()}
              shiftPress={(increase: boolean) => handleShiftSet(increase)}
            />
          </>
        }
      </View>
      <ConfirmationModal visible={deleteModalVisible} onConfirm={handleConfirm} onCancel={handleCancel} message="Delete set?" confirm_string="yeah" cancel_string="nah"/>
    </>
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
  headerRow: {
    width: '93.5%'
  },
  header: {
    width: '25%',
    textAlign: 'center',
  },
  textButton: {
    padding: 8
  },
  button: {
    padding: 0,
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '30%'
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'green',
    width: '100%'
  }
})