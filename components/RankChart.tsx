import React from "react";
import { View, Dimensions  } from "react-native";
import { LineChart } from 'react-native-gifted-charts';

export default function RankChart() {

  // const data = [
  //   { x: 0, y: 10 },
  //   { x: 1, y: 20 },
  //   { x: 2, y: 30 },
  //   { x: 3, y: 40 },
  //   { x: 4, y: 50 },
  //   { x: 5, y: 60 },
  //   { x: 6, y: 70 },
  //   { x: 7, y: 80 },
  //   { x: 8, y: 90 },
  //   { x: 9, y: 100 },
  // ];
  // const formattedData = data.map(item => ({ value: item.y }));

  const data = [
  { value: 10 },
  { value: 20 },
  { value: 30 },
  { value: 50 },
  { value: 70 },
  { value: 80, showVerticalLine: true }, // Mark this point with a vertical line
  { value: 60 },
  { value: 20 },
  { value: 10 },
  { value: 5 },
];

  const userPosition = 5;

  return (
    <View 
      style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        // backgroundColor: 'purple',
        height: 150
      }}
    >
      <LineChart
        dataSet={[{ data: data }]}
        width={Dimensions.get('window').width - 80}
        height={150}
        isAnimated
        curved
        color='purple' 
        dataPointsColor="purple"
        hideAxesAndRules
      />
    </View>
  )
}