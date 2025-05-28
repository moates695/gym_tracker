import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, G, Path } from 'react-native-svg';

interface TimeSeriesPoint {
  value: number
  timestamp: number
}

interface TimeSeriesChartProps  {
  points: TimeSeriesPoint[]
}

export default function TimeSeriesChart(props: TimeSeriesChartProps) {
  const {points} = props;

  // Time series data with actual timestamps
  // const data = [
  //   { timestamp: new Date('2024-02-03').getTime(), value: 18 }, // 2 day gap
  //   { timestamp: new Date('2024-01-21').getTime(), value: 25 }, // 1 day gap
  //   { timestamp: new Date('2024-01-10').getTime(), value: 15 }, // 7 day gap
  //   { timestamp: new Date('2024-01-01').getTime(), value: 13 },
  //   { timestamp: new Date('2023-11-12').getTime(), value: 22 }, // 2 day gap
  //   { timestamp: new Date('2023-09-20').getTime(), value: 28 }, // 8 day gap
  // ];

  const width = Dimensions.get('window').width - 80;
  const height = 250;
  const padding = 40;
  
  // Calculate min/max values
  const minTime = Math.min(...points.map(d => d.timestamp));
  const maxTime = Math.max(...points.map(d => d.timestamp));
  const minValue = Math.min(...points.map(d => d.value));
  const maxValue = Math.max(...points.map(d => d.value));
  
  // Position calculation functions
  const getXPosition = (timestamp: number) => {
    return padding + ((timestamp - minTime) / (maxTime - minTime)) * (width - 2 * padding);
  };
  
  const getYPosition = (value: number) => {
    return height - padding - ((value - minValue) / (maxValue - minValue)) * (height - 2 * padding);
  };

  // Generate path for line
  const pathData = points.map((point, index) => {
    const x = getXPosition(point.timestamp);
    const y = getYPosition(point.value);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Format date for labels
  const formatDate = (timestamp: string | number | Date) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
     <View style={styles.container}>
      {points.length > 0 ?      
        <View style={styles.chartContainer}>
          <Svg width={width} height={height}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <G key={`grid-${index}`}>
                <Line
                  x1={padding}
                  y1={padding + ratio * (height - 2 * padding)}
                  x2={width - padding}
                  y2={padding + ratio * (height - 2 * padding)}
                  stroke="#999"
                  strokeWidth="1"
                />
              </G>
            ))}
            
            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const value = maxValue - ratio * (maxValue - minValue);
              return (
                <SvgText
                  key={`y-label-${index}`}
                  x={padding - 10}
                  y={padding + ratio * (height - 2 * padding) + 5}
                  fontSize="12"
                  fill="#999"
                  textAnchor="end"
                >
                  {value.toFixed(1)}
                </SvgText>
              );
            })}
            
            {/* X-axis labels */}
            {[0, 0.5, 1].map((ratio, index) => {
              const value = maxTime - ratio * (maxTime - minTime);
              // const dd = String(new Date(value).getDate()).padStart(2,'0');
              const mm = String(new Date(value).getMonth()+1).padStart(2,'0');
              const yy = String(new Date(value).getFullYear()).slice(-2);
              const dateStr = `${mm}/${yy}`;
              return (
                <SvgText
                  key={`x-label-${index}`}
                  // x={padding + ratio * (height - 2 * padding) + 5}
                  x={getXPosition(value) + padding / 2}
                  y={height - 10}
                  fontSize="12"
                  fill="#999"
                  textAnchor="end"
                >
                  {dateStr}
                </SvgText>
              );
            })}
            
            {/* Line path */}
            <Path
              d={pathData}
              stroke="cyan"
              strokeWidth="2"
              fill="none"
            />
            
            {/* Data points */}
            {points.map((point, index) => (
              <Circle
                key={`point-${index}`}
                cx={getXPosition(point.timestamp)}
                cy={getYPosition(point.value)}
                r="4"
                fill="black"
                stroke="cyan"
                strokeWidth="2"
              />
            ))}
          </Svg>
        </View>
      :
        <View>
          <Text style={styles.text}>no data</Text>
        </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  chartContainer: {
    backgroundColor: 'black',
    margin: 0,
    borderRadius: 0,
    padding: 0,
    elevation: 3,
  },
});