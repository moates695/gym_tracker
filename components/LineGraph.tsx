import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, G, Path } from 'react-native-svg';

export interface LineGraphPoint {
  x: number
  y: number
}

export type LineGraphScale = 'time' | 'value'

interface LineGraphProps  {
  points: LineGraphPoint[]
  scale_type: LineGraphScale
}

// todo: ability to click on point and see data for it ?
// todo: option to normalize time series data (even spread) ?

export default function LineGraph(props: LineGraphProps) {
  const {points, scale_type} = props;

  if (points.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>no data</Text>
      </View>
    )
  }

  const width = Dimensions.get('window').width - 40;
  const height = 250;
  const padding = 40;
  
  // Calculate min/max values
  const xMin = Math.min(...points.map(p => p.x));
  const xMax = Math.max(...points.map(p => p.x));
  const yMin = Math.min(...points.map(p => p.y));
  const yMax = Math.max(...points.map(p => p.y));
  
  // Position calculation functions
  const getXPosition = (x: number) => {
    return padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
  };
  
  const getYPosition = (y: number) => {
    return height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);
  };

  // Generate path for line
  const pathData = points.map((point, index) => {
    const x = getXPosition(point.x);
    const y = getYPosition(point.y);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Format date for labels
  const formatDate = (timestamp: string | number | Date) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatXLabel = (x: number) => {
    if (scale_type === "value") {
      return x.toPrecision(0)
    }
    const date = new Date(x);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
     <View style={styles.container}>
      {points.length >= 2 ?      
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
              const value = yMax - ratio * (yMax - yMin);
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
            {/* {scale_type === 'value' && 
              points.map((point, index) => {
                const label = point.x.toFixed(0);
                return (
                  <SvgText
                    key={`x-label-${index}`}
                    x={getXPosition(point.x) + padding / 2 - 10}
                    y={height - 10}
                    fontSize="12"
                    fill="#999"
                    textAnchor="end"
                  >
                    {label}
                  </SvgText>
                );
              })
            } */}
            {scale_type === 'value' && 
              [0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, index) => {
                const value = xMax - ratio * (xMax - xMin);
                return (
                  <SvgText
                    key={`x-label-${index}`}
                    x={getXPosition(value) + padding / 2 - 15}
                    y={height - 10}
                    fontSize="12"
                    fill="#999"
                    textAnchor="end"
                  >
                    {Math.round(value)}
                  </SvgText>
                );
              })
            }
            {scale_type === 'time' &&
              [0, 0.33, 0.67, 1].map((ratio, index) => {
                const value = xMax - ratio * (xMax - xMin);
                // const dd = String(new Date(value).getDate()).padStart(2,'0');
                const mm = String(new Date(value).getMonth()+1).padStart(2,'0');
                const yy = String(new Date(value).getFullYear()).slice(-2);
                const dateStr = `${mm}/${yy}`;
                return (
                  <SvgText
                    key={`x-label-${index}`}
                    x={getXPosition(value) + padding / 2}
                    y={height - 10}
                    fontSize="12"
                    fill="#999"
                    textAnchor="end"
                  >
                    {dateStr}
                  </SvgText>
                );
              })
            }
            
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
                cx={getXPosition(point.x)}
                cy={getYPosition(point.y)}
                r="3"
                fill="black"
                stroke="cyan"
                strokeWidth="2"
              />
            ))}
          </Svg>
        </View>
      :
        <>
          {points.length > 0 ?
            <View>
              <Text style={styles.text}>not enough data to graph</Text>
            </View>
          :
            <View>
              <Text style={styles.text}>no data</Text>
            </View>
          }
        </>
        
        
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
    margin: 0,
    marginLeft: 20,
    borderRadius: 0,
    padding: 0,
    elevation: 3,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
});