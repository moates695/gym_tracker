import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, G, Path } from 'react-native-svg';

export default function TimeSeriesChart() {
  // Time series data with actual timestamps
  const data = [
    { timestamp: new Date('2024-01-01').getTime(), value: 13 },
    { timestamp: new Date('2024-01-03').getTime(), value: 18 }, // 2 day gap
    { timestamp: new Date('2024-01-10').getTime(), value: 15 }, // 7 day gap
    { timestamp: new Date('2024-01-12').getTime(), value: 22 }, // 2 day gap
    { timestamp: new Date('2024-01-20').getTime(), value: 28 }, // 8 day gap
    { timestamp: new Date('2024-01-21').getTime(), value: 25 }, // 1 day gap
  ];

  const width = Dimensions.get('window').width - 80;
  const height = 200;
  const padding = 40;
  
  // Calculate min/max values
  const minTime = Math.min(...data.map(d => d.timestamp));
  const maxTime = Math.max(...data.map(d => d.timestamp));
  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  
  // Position calculation functions
  const getXPosition = (timestamp: number) => {
    return padding + ((timestamp - minTime) / (maxTime - minTime)) * (width - 2 * padding);
  };
  
  const getYPosition = (value: number) => {
    return height - padding - ((value - minValue) / (maxValue - minValue)) * (height - 2 * padding);
  };

  // Generate path for line
  const pathData = data.map((point, index) => {
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
     <ScrollView style={styles.container}>
      <Text style={styles.title}>Time Series Chart with Proper Spacing</Text>
      
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
                stroke="#e0e0e0"
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
                fill="#666"
                textAnchor="end"
              >
                {value.toFixed(0)}
              </SvgText>
            );
          })}
          
          {/* X-axis labels */}
          {data.map((point, index) => (
            <SvgText
              key={`x-label-${index}`}
              x={getXPosition(point.timestamp)}
              y={height - 10}
              fontSize="12"
              fill="#666"
              textAnchor="middle"
            >
              {formatDate(point.timestamp)}
            </SvgText>
          ))}
          
          {/* Line path */}
          <Path
            d={pathData}
            stroke="#3f51b5"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Data points */}
          {data.map((point, index) => (
            <Circle
              key={`point-${index}`}
              cx={getXPosition(point.timestamp)}
              cy={getYPosition(point.value)}
              r="4"
              fill="#3f51b5"
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </Svg>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.infoTitle}>Installation:</Text>
        <Text style={styles.code}>npx expo install react-native-svg</Text>
        <Text style={styles.infoText}>
          True time series spacing - gaps represent actual time intervals.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  info: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
});