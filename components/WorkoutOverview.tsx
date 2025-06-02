import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal } from "react-native";
import { commonStyles } from "@/styles/commonStyles";
import WorkoutFinishOptions from "./WorkoutFinishOptions";

interface WorkoutOverviewProps {
  onPress: () => void
}

// todo: add workout stats
// show total volume, sets, reps, number of exercises
// show volume, sets, reps per muscle group
// show comparison to historical data for muscle group?
// add finish (save, continue later, discard, cancel options)

export default function WorkoutOverview(props: WorkoutOverviewProps) {
  const { onPress } = props;

  const [showFinishOptions, setShowFinishOptions] = useState<boolean>(false);
  
  return (
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        <View style={styles.headerRow}>
          <Text style={commonStyles.boldText}>Overview</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowFinishOptions(true)}
          >
            <Text style={styles.text}>finish</Text>
          </TouchableOpacity>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showFinishOptions}
          onRequestClose={() => setShowFinishOptions(false)}
        >
          <WorkoutFinishOptions onPress={() => setShowFinishOptions(false)}/>
        </Modal>
        <View style={styles.dataContainer}>
          
        </View>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onPress}
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
    backgroundColor: 'black',
    padding: 15,
    // alignItems: 'center',
    elevation: 5,
    borderColor: 'red',
    borderTopWidth: 2,
    maxHeight: '95%',
    width: '100%',
  },
  dataContainer: {
    minHeight: 300,
    padding: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    justifyContent: 'center',
    width: 50,
    alignSelf: 'center',
    textAlign: 'center',
    alignItems: 'center'
  }
})