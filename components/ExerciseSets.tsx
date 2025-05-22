import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import React, { View, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native"
import { workoutExercisesAtom } from "@/store/general";

interface ExerciseSetsProps {
  exercise: any
  exerciseIndex: number
}

export default function ExerciseSets(props: ExerciseSetsProps) {
  const { exercise, exerciseIndex } = props; 

  const [exercises, setExercises] = useAtom(workoutExercisesAtom);

  const handleUpdateReps = (text: string, index: number) => {
    text = text.replace(/\D/g, '');
    const tempSets = [...exercise.sets];
    let num: any = parseFloat(text);
    if (isNaN(num)) {
      num = null;
    }
    tempSets[index].reps = num;
    updateExerciseSets(tempSets);
  };

  const handleUpdateWeight = (text: string, index: number) => {
    text = text.replace(/[^0-9.]+/g, '');
    const tempSets = [...exercise.sets];
    let num: any = parseFloat(text);
    if (isNaN(num)) {
      num = null;
    }
    tempSets[index].weight = num;
    updateExerciseSets(tempSets);
  };

  const handleUpdateSets = (text: string, index: number) => {
    text = text.replace(/\D/g, '');
    const tempSets = [...exercise.sets];
    let num: any = parseFloat(text);
    if (isNaN(num)) {
      num = null;
    }
    tempSets[index].sets = num;
    updateExerciseSets(tempSets);
  };

  const updateExerciseSets = (sets: any) => {
    const tempExercises = [...exercises];
    tempExercises[exerciseIndex].sets = sets;
    setExercises(tempExercises);
  };

  const handleIncrementSet = (index: number) => {
    const tempSets = [...exercise.sets];
    let num = tempSets[index].sets;
    num = num !== null ? ++num : 1
    tempSets[index].sets = num;
    updateExerciseSets(tempSets);
  };

  const handleDecrementSet = (index: number) => {
    const tempSets = [...exercise.sets];
    let num = tempSets[index].sets;
    if (num === 0 || num === null) return;
    tempSets[index].sets = --num;
    updateExerciseSets(tempSets);
  };

  const handleCopySet = (index: number) => {
    const tempSets = [...exercise.sets];
    tempSets.push(exercise.sets[index]);
    updateExerciseSets(tempSets);
  }

  const handleDeleteSet = (index: number) => {
    let tempSets = [...exercise.sets];
    if (tempSets.length > 1) {
      tempSets.splice(index, 1);
      updateExerciseSets(tempSets);
      return;
    }
    tempSets = [
      {
        "reps": null,
        "weight": null,
        "sets": null,
      }
    ]
    updateExerciseSets(tempSets)
  }

  const handleNewSet = () => {
    const tempSets = [...exercise.sets];
    tempSets.push({
      "reps": null,
      "weight": null,
      "sets": null,
    })
    updateExerciseSets(tempSets);
  }

  useEffect(() => {
    if (exercise.sets.length > 0) return;
    const tempExercises = [...exercises];
    tempExercises[exerciseIndex].sets = [
      {
        "reps": null,
        "weight": null,
        "sets": null,
      }
    ]
    setExercises(tempExercises);
  }, [exercise.sets])

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.text}>reps</Text>
        <Text style={styles.text}>weight</Text>
        <Text style={styles.text}>sets</Text>
      </View>
      {exercise.sets.map((set: any, index: number) => (
        <View key={index} style={{width:'100%'}}>
          <View style={styles.row}>
            <TextInput 
              style={styles.textInput}
              keyboardType="number-pad"
              onChangeText={(text) => handleUpdateReps(text, index)}
              value={set.reps !== null ? set.reps.toString() : ''}
            />
            <TextInput 
              style={styles.textInput}
              keyboardType="number-pad"
              onChangeText={(text) => handleUpdateWeight(text, index)}
              value={set.weight !== null ? set.weight.toString() : ''}
            />
            <TextInput 
              style={styles.textInput}
              keyboardType="number-pad"
              onChangeText={(text) => handleUpdateSets(text, index)}
              value={set.sets !== null ? set.sets.toString() : ''}
            />
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => handleIncrementSet(index)}
              style={styles.textButton}
            >
              <Text style={styles.text}>++sets</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDecrementSet(index)}
              style={styles.textButton}
            >
              <Text style={styles.text}>sets--</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => handleDeleteSet(index)}
              style={styles.textButton}
            >
              <Text style={styles.text}>delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCopySet(index)}
              style={styles.textButton}
            >
              <Text style={styles.text}>copy</Text>
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
    </View>
    
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  textInput: {
    color: 'white',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 5,
    width: '20%',
    justifyContent: 'center',
    alignContent: 'center',
  },
  container: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around'
  },
  textButton: {
    padding: 8
  },

})