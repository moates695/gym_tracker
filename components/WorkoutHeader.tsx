import React, { useEffect, useState } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, Modal } from 'react-native'
import { workoutStartTimeAtom, showWorkoutStartOptionsAtom} from '@/store/general'
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { commonStyles } from '@/styles/commonStyles';
import WorkoutFinishOptions from './WorkoutFinishOptions';
import { addCaughtErrorLogAtom, addErrorLogAtom } from '@/store/actions';

export default function WorkoutHeader() {
  const workoutStartTime = useAtomValue(workoutStartTimeAtom);
  const showStartOptions = useAtomValue(showWorkoutStartOptionsAtom);
  const [timeString, setTimeString] = useState<string>('');
  const [showFinishOptions, setShowFinishOptions] = useState<boolean>(false);

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  useEffect(() => {
    if (workoutStartTime === null) return;

    const updateTime = () => {
      try {
        const timeDelta = Math.floor((Date.now() - workoutStartTime) / 1000);
        const hours = String(Math.floor(timeDelta / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((timeDelta % (3600)) / 60)).padStart(2, '0');
        const seconds = String(Math.floor(timeDelta % 60)).padStart(2, '0');
        setTimeString(`${hours}:${minutes}:${seconds}`)
      } catch (error) {
        addCaughtErrorLog(error, 'error updateTime');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  
  }, [workoutStartTime]);

  return (
    <View style={styles.row}>
      <View style={[styles.rowObject, {width: showStartOptions !== 'workout' ? '100%' : '30%'}]}>
        <Text style={commonStyles.boldText}>Workout</Text>
      </View>
      {showStartOptions === 'workout' &&
        <>
          <View style={[styles.rowObject, {alignItems: 'center'}]}>
            <Text style={[styles.text, {fontFamily: 'monospace'}]}>{timeString}</Text>
          </View>
          <View style={[styles.rowObject, {alignItems: 'flex-end'}]}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowFinishOptions(true)}
            >
              <Text style={styles.text}>finish</Text>
            </TouchableOpacity>
          </View>
        </>
      }
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFinishOptions}
        onRequestClose={() => setShowFinishOptions(false)}
      >
        <WorkoutFinishOptions onPress={() => setShowFinishOptions(false)}/>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white',
  },
  boldText: {
    fontWeight: 500,
    fontSize: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  rowObject: {
    width: '30%',
    justifyContent: 'center',
  },
  button: {
    padding: 1,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: 'green',
    alignItems: 'center',
    width: 80
  },
})