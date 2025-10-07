import React from "react";
import { View, Dimensions  } from "react-native";
import { LineChart } from 'react-native-gifted-charts';

export interface RankChartProps {
  data: any[]
}

export default function RankChart(props: RankChartProps) {
  const { data } = props;

  const chart_width = 350;
  const calculatedSpacing = chart_width / (data.length - 1);

  return (
    <View 
      style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 150,
        alignSelf: 'center',
        paddingRight: 80,
        marginBottom: -30,
      }}
    >
      <LineChart
        dataSet={[{ data: data }]}
        height={150}
        isAnimated
        curved
        color='purple' 
        dataPointsColor="purple"
        hideAxesAndRules
        hideDataPoints={true}
        spacing={calculatedSpacing}
        width={chart_width}
      />
    </View>
  )
}