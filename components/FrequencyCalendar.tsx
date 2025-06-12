import React from "react";
import { ExerciseFrequencyData } from "@/store/general";
import { Col, Row, Grid } from "react-native-easy-grid";
import { View, Text, StyleSheet } from "react-native";

export interface FrequencyCalendarProps {
  frequencyData: Record<number, number>
}

export default function FrequencyCalendar(props: FrequencyCalendarProps) {
  const { frequencyData } = props;
  
  // todo: handle less than 2 frequency data
  if (Object.keys(frequencyData).length <= 2) {
    return (
      <Text style={styles.text}>not enough data</Text>
    )
  }

  const offset = 7 - ((new Date().getDay() + 6) % 7);
  const minVolume = Math.min(...Object.values(frequencyData));
  const maxVolume = Math.max(...Object.values(frequencyData));
  const minRadius = 8;
  const maxRadius = 20;

  const getDayDate = (daysAgo: number): number => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.getDate(); 
  };

  const rows: any[] = [];
  for (let i = 4; i > 0; i--) {
    const cols: any[] = [];
    for (let j = 0; j < 7; j++) {
      const daysAgo = i * 7 - j - offset;
      const volume = frequencyData[i * 7 - j - offset] ?? null;
      const dayDate = getDayDate(daysAgo);
      if (volume === null) {
        cols.push(
          <Col key={j}>
            <View style={styles.cellContainer}>
              <Text style={[daysAgo === 0 ? {color: 'red'} : styles.text]}>{dayDate}</Text>
            </View>
          </Col>
        )
        continue;
      }
      const radius = minRadius + (volume - minVolume) * (maxRadius - minRadius) / (maxVolume - minVolume);
      cols.push(
        <Col key={j}>
          <View style={styles.cellContainer}>
            <View
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: radius * 2,
                height: radius * 2,
                borderRadius: radius,
                backgroundColor: 'green',
                transform: [
                  { translateX: -radius },
                  { translateY: -radius },
                ],
                zIndex: -1,
              }}
            />
            <Text style={styles.text}>{dayDate}</Text>
          </View>
        </Col>
      )
    }
    
    rows.push(
      <Row key={i}>
        {cols}
      </Row>
    )
  }

  

  return (
    <View style={styles.container}>
      <Grid>
        <Row>
          {['M','T','W','T','F','S','S'].map((day_letter, i) => {
            return (
              <Col key={i}>
                <View style={styles.cellContainer}>
                  <Text style={styles.text}>{day_letter}</Text>
                </View>
              </Col>
            )
          })}
        </Row>
        {rows}
      </Grid>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  container: {
    // backgroundColor: 'purple',
    width: '70%',
    height: 250,
  },
  cellContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  }
})