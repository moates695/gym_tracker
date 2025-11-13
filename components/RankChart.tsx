import { commonStyles } from "@/styles/commonStyles";
import React from "react";
import { View, Dimensions, Text } from "react-native";
import { LineChart } from 'react-native-gifted-charts';

export interface RankChartProps {
  data: any[]
}

//! CHECK that full graph is shown based on spacing
export default function RankChart(props: RankChartProps) {
  const { data } = props;

  const chart_width = 300;
  const calculatedSpacing = (chart_width * 0.8) / (data.length - 1);
  // data[0]["showVerticalLine"] = true
  // data[data.length - 1]["showVerticalLine"] = true

  if (data === null) {
    return (
      <Text style={commonStyles.text}>
        rank data is empty
      </Text>
    )
  }

  return (
    <View 
      style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        // height: 150,
        alignSelf: 'center',
        paddingRight: 35,
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