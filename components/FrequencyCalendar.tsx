import React from "react";
import { Col, Row, Grid } from "react-native-easy-grid";
import { View, Text, StyleSheet } from "react-native";
import { useSetAtom } from "jotai";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";

export interface FrequencyCalendarProps {
  frequencyData: Record<number, number>
}

export default function FrequencyCalendar(props: FrequencyCalendarProps) {
  const { frequencyData } = props;

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const offset = 7 - ((new Date().getDay() + 6) % 7);
  const minRadius = 10;
  const maxRadius = 20;

  const getRadius = (volume: number): number => {
    try {
      if (Object.keys(frequencyData).length < 2) {
        return (maxRadius + minRadius) / 2;
      }
      const minVolume = Math.min(...Object.values(frequencyData));
      const maxVolume = Math.max(...Object.values(frequencyData));
      if (minVolume === maxVolume) {
        return (maxRadius - minRadius) / 2;
      }
      
      return minRadius + (volume - minVolume) * (maxRadius - minRadius) / (maxVolume - minVolume);
    } catch (error) {
      addCaughtErrorLog(error, 'error getRadius');
      return (maxRadius + minRadius) / 2;
    }
  };

  const getDayDate = (daysAgo: number): number => {
    try {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date.getDate();
    } catch (error) {
      addCaughtErrorLog(error, 'error getDayDate');
      return 0;
    }
  };

  const rows: any[] = [];
  try {
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
                <Text style={[daysAgo === 0 ? {color: 'red'} : daysAgo < 0 ? {opacity: 0}: styles.text]}>{dayDate}</Text>
              </View>
            </Col>
          )
          continue;
        }
        const radius = getRadius(volume);
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
                }}
              />
              <Text 
                style={[
                  styles.text,
                  {zIndex: 5}
                ]}
              >
                {dayDate}
              </Text>
            </View>
          </Col>
        )
      }
      rows.push(
        <Row key={i} style={{alignItems: 'center'}}>
          {cols}
        </Row>
      )
    }
  } catch (error) {
    addCaughtErrorLog(error, 'error build freq rows');
  }

  return (
    <View 
      style={{
        width: '100%',
        alignItems: 'center',
      }}
    >
      <View style={styles.container}>
        <Grid>
          <Row style={{alignItems: 'center'}}>
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
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  container: {
    width: '70%',
    height: 250,
  },
  cellContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  }
})