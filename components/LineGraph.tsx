import { SafeError } from '@/middleware/helpers';
import { addCaughtErrorLogAtom, addErrorLogAtom } from '@/store/actions';
import { useSetAtom } from 'jotai';
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
  barValue?: number | null
  currentPoints?: LineGraphPoint[]
}

// todo: ability to click on point and see data for it ?

export default function LineGraph(props: LineGraphProps) {
  const {
    points, 
    scale_type, 
    barValue = null, 
    currentPoints = []
  } = props;

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  console.log(points);
  if (points.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>no data</Text>
      </View>
    )
  }

  const width = Dimensions.get('window').width - 40;
  const height = 250;
  const padding = 50;
  
  let xMin = 0;
  let xMax = 0;
  let yMin = 0;
  let yMax = 0;
  try {
    xMin = Math.min(...points.map(p => p.x));
    xMax = Math.max(...points.map(p => p.x));
    if (currentPoints.length !== 0) {
      const currXMax = Math.max(...currentPoints.map(p => p.x));
      if (currXMax > xMax) xMax = currXMax;
    }
    if (xMin === xMax) {
      xMin = xMin - 100
      xMax = xMax + 100
    }

    yMin = 0;
    yMax = Math.max(...points.map(p => p.y));
    if (barValue !== null && barValue > yMax) {
      yMax = barValue;
    } else if (currentPoints.length !== 0) {
      const currYMax = Math.max(...currentPoints.map(p => p.y));
      if (currYMax > yMax) yMax = currYMax;
    }
    if (yMin === yMax) {
      yMax = 100;
    }
  } catch (error) {
    addCaughtErrorLog(error, 'error computing graph min max');
    return (
      <View style={styles.container}>
        <Text style={styles.text}>error on compute</Text>
      </View>
    )
  }

  const getXPosition = (x: number): number => {
    try {
      const pos = padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
      if (!Number.isFinite(pos)) throw new SafeError('number is not finite');
      return pos;
    } catch (error) {
      addCaughtErrorLog(error, 'error getXPosition');
      return 0;
    }
  };
  
  const getYPosition = (y: number): number => {
    try {
      const pos = height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);
      if (!Number.isFinite(pos)) throw new SafeError('number is not finite');
      return pos;
    } catch (error) {
      addCaughtErrorLog(error, 'error getYPosition');
      return 0;
    }
  };

  const getPath = (points: LineGraphPoint[]): string => {
    try {
      return points.map((point, index) => {
        const x = getXPosition(point.x);
        const y = getYPosition(point.y);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ')
    } catch (error) {
      addCaughtErrorLog(error, 'error getPath');
      return '';
    }
  };

  const getBarPoints = (): string => {
    try {
      if (barValue == null) return '';
      const x1 = getXPosition(xMin);
      const x2 = getXPosition(xMax);
      const y = getYPosition(barValue < yMax ? barValue : yMax);
      return `M ${x1} ${y} L ${x2} ${y}`;

    } catch (error) {
      addCaughtErrorLog(error, 'error getPath');
      return '';
    }
  };

  const circleRadius = 3;

  const getBackgroundCircleRadius = (point: LineGraphPoint, points: LineGraphPoint[]): number => {
    try {
      for (const pt of points) {
        const dist = Math.sqrt(Math.pow((point.x - pt.x), 2) + Math.pow((point.y - pt.y), 2));
        if (dist >= circleRadius) continue;
        return circleRadius + 2;
      }
    } catch (error) {
      addCaughtErrorLog(error, 'error getBackgroundCircleRadius');
    }
    return circleRadius;
  };

  return (
    <View style={styles.container}>
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
              const mm = String(new Date(value).getMonth() + 1).padStart(2,'0');
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
          
          {currentPoints.length > 1 &&
            <Path
              d={getPath(currentPoints)}
              stroke="orange"
              strokeWidth="5"
              fill="none"
            />
          }
          {currentPoints.map((point, index) => (
            <Circle
              key={`point-${index}`}
              cx={getXPosition(point.x)}
              cy={getYPosition(point.y)}
              r={getBackgroundCircleRadius(point, points)}
              fill="black"
              stroke="orange"
              strokeWidth="2"
            />
          ))}          

          {points.length > 1 &&
            <Path
              d={getPath(points)}
              stroke="cyan"
              strokeWidth="2"
              fill="none"
            />
          }
          {points.map((point, index) => (
            <Circle
              key={`point-${index}`}
              cx={getXPosition(point.x)}
              cy={getYPosition(point.y)}
              r={circleRadius}
              fill="black"
              stroke="cyan"
              strokeWidth="2"
            />
          ))}

          {barValue !== null &&
            <Path
              d={getBarPoints()}
              stroke="orange"
              strokeWidth="2"
              fill="none"
            />
          }
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  container: {
    // flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
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
    // zIndex: 10,
    // elevation: 3,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});