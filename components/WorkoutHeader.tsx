import React, { useEffect, useState } from 'react'
import { Text, StyleSheet, View } from 'react-native'
import { workoutStartTimeAtom } from '@/store/general'
import { useAtom } from 'jotai';

export default function WorkoutHeader() {
  const [workoutStartTime, setWorkoutStartTime] = useAtom(workoutStartTimeAtom);
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const timeDelta = Math.floor((Date.now() - workoutStartTime) / 1000);
      const hours = String(Math.floor(timeDelta / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((timeDelta % (3600)) / 60)).padStart(2, '0');
      const seconds = String(Math.floor(timeDelta % 60)).padStart(2, '0');
      setTimeString(`${hours}:${minutes}:${seconds}`)
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  
  }, [workoutStartTime]);

  return (
    <View style={styles.row}>
      <Text style={[styles.text, styles.boldText]}>Workout</Text>
      <Text style={[styles.text, {fontFamily: 'monospace'}]}>{timeString}</Text>
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
    alignItems: 'center'
  }
})