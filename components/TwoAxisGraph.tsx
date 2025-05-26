import * as React from 'react';
import {ScrollView, StyleSheet, Text, View, Dimensions} from 'react-native'
import { LineChart } from 'react-native-chart-kit';

export default function TwoAxisChart() {
   const chartData = {
    labels: ['1/1', '1/2', '1/3'],
    datasets: [
      {
        data: [13, 18, 15, 22, 28, 25],
        color: (opacity = 1) => `rgba(63, 81, 181, ${opacity})`,
        strokeWidth: 2,
      }
    ]
  };

  const chartConfig = {
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(3, 223, 252, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: '2',
      strokeWidth: '1',
      stroke: 'cyan'
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 64}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: 'white',
  },
  chartContainer: {
    backgroundColor: 'black',
    margin: 0,
    borderRadius: 8,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  info: {
    backgroundColor: 'black',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    fontSize: 14,
    color: '#d63384',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginTop: 10,
  },
});