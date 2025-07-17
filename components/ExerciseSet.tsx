import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import React, { View, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native"
import { SetData, WorkoutExercise, workoutExercisesAtom } from "@/store/general";
import ConfirmationModal from "./ConfirmationModal";
import ShiftTextInput from "./ShiftTextInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { commonStyles } from "@/styles/commonStyles";

interface ExerciseSetProps {
  exercise: WorkoutExercise
  exerciseIndex: number
  set_data: SetData
  setIndex: number
}

export default function ExerciseSet(props: ExerciseSetProps) {
  const { exercise, exerciseIndex, set_data, setIndex } = props;

  const [exercises, setExercises] = useAtom(workoutExercisesAtom);

  const [displayWeight, setDisplayWeight] = useState<string>('');
  const [openOptions, setOpenOptions] = useState<boolean>(false);
  const [openOptionsPressOn, setOpenOptionsPressOn] = useState<boolean>(false);
  const [copyPressOn, setCopyPressOn] = useState<boolean>(false);


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

  const handleOpenOptions = () => {
    setOpenOptions(!openOptions)
  }
  
  const handleCopySet = () => {
    const tempSetData = [...exercise.set_data];
    const tempSet = { ...tempSetData[setIndex] };
    tempSetData.push(tempSet);
    updateExerciseSetData(tempSetData);
    
    // const tempDisplayWeights = [...displayWeights];
    // tempDisplayWeights.push(tempDisplayWeights[index])
    // setDisplayWeights(tempDisplayWeights)
  }

  // const handleDeleteSet = (index: number) => {
  //   let tempSetData = [...exercise.set_data];
  //   if (tempSetData.length <= 1) {
  //     tempSetData = [
  //       {
  //         "reps": null,
  //         "weight": null,
  //         "num_sets": null,
  //       }
  //     ]
  //     updateExerciseSetData(tempSetData);
  //     setDisplayWeights(['']);
  //     return;
  //   }

  //   tempSetData.splice(index, 1);
  //   updateExerciseSetData(tempSetData);

  //   const tempDisplayWeights = [...displayWeights];
  //   tempDisplayWeights.splice(index, 1);
  //   setDisplayWeights(tempDisplayWeights);
  // }

  // const openConfirm = (): Promise<boolean> => {
  //   setDeleteModalVisible(true);
  //   return new Promise(resolve => setResolver(() => resolve));
  // };

  // const handleDeletePress = async (index: number) => {
  //   const confirmed = await openConfirm();
  //   if (!confirmed) return;
  //   handleDeleteSet(index);
  // };

  // const handleConfirm = () => {
  //   resolver?.(true);
  //   setDeleteModalVisible(false);
  // };

  // const handleCancel = () => {
  //   resolver?.(false);
  //   setDeleteModalVisible(false);
  // };

  return (
    <View style={styles.row}>
      {openOptions ?
        <>
          <Text style={styles.text}>{set_data.reps}</Text>
          <Text style={styles.text}>{displayWeight}</Text>
          <Text style={styles.text}>{set_data.num_sets}</Text>
          {/* <TouchableOpacity
            onPress={() => handleDeletePress(index)}
            style={styles.button}
            onPressIn={() => handleDeletePressOn(index, true)}
            onPressOut={() =>  handleDeletePressOn(index, false)}
            activeOpacity={1}
          >
            <MaterialIcons name={deletePressOn[index] ? 'delete' : "delete-outline"} size={20} color="red" />
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={handleCopySet}
            style={styles.button}
            onPressIn={() => setCopyPressOn(true)}
            onPressOut={() => setCopyPressOn(false)}
            activeOpacity={1}
          >
            <Ionicons name={copyPressOn ? 'copy' : 'copy-outline'} color={'green'} size={20} />
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
      
      
      
      <TouchableOpacity
        onPress={handleOpenOptions}
        style={styles.button}
        activeOpacity={1}
      >
        <Ionicons name={openOptions ? 'options' : 'options-outline'} color={openOptions ? 'red': 'white'} size={25} />
      </TouchableOpacity>
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
})