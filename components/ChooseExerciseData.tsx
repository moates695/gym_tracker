import React from "react"
import { Text, StyleSheet, View } from "react-native"

interface ChooseExerciseDataProps {
  exercise: Object
}

export default function ChooseExerciseData(props: ChooseExerciseDataProps) {
  return (
    <View style={styles.box}>
      <Text style={{color:"white"}}>test</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'black'
  },
  box: {
    backgroundColor: 'green',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    width: '100%',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center'
  },
  modalContainer: {
    margin: 20,
    height: 100,
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 5,
    alignItems: 'center',
    elevation: 5,
    borderColor: 'red',
    borderWidth: 2
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'white'
  },
});

