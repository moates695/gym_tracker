import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from 'expo-linear-gradient';
import { View } from "react-native";

interface MuscleGroupSvgProps {
  valueMap: Record<string, number>
}

export default function MuscleGroupSvg(props: MuscleGroupSvgProps) {
  const {valueMap} = props;

  const normalize = (valueMap: Record<string, number>): Record<string, number> => {
    const normalizedMap: Record<string, number> = {};
    const values = Object.values(valueMap);
    const min = Math.min(...values);
    const max = Math.max(...values);
    for (const [key, value] of Object.entries(valueMap)) {
      normalizedMap[key] = (value - min) / (max - min || 1)
    }
    return normalizedMap;
  }

  const normalizedMap = normalize(valueMap);
  console.log(normalizedMap)

  const numToRgbString = (num: number): string => {
    if (num < 0 || num > 1) return "none";

    const colours = [
        { pos: 0.0, color: { r: 0, g: 0, b: 255 } },     // Blue (cold)
        { pos: 0.25, color: { r: 0, g: 255, b: 255 } },  // Cyan
        { pos: 0.5, color: { r: 0, g: 255, b: 0 } },     // Green
        { pos: 0.75, color: { r: 255, g: 255, b: 0 } },  // Yellow
        { pos: 1.0, color: { r: 255, g: 0, b: 0 } }      // Red (hot)
      ]

    let startColor = colours[0];
    let endColor = colours[1];

    for (let i = 0; i < colours.length - 1; i++) {
      if (num >= colours[i].pos && num <= colours[i + 1].pos) {
        startColor = colours[i];
        endColor = colours[i + 1];
        break;
      }
    }
    
    const segmentRange = endColor.pos - startColor.pos;
    const factor = segmentRange === 0 ? 0 : (num - startColor.pos) / segmentRange;
    
    const r = Math.round(startColor.color.r + factor * (endColor.color.r - startColor.color.r));
    const g = Math.round(startColor.color.g + factor * (endColor.color.g - startColor.color.g));
    const b = Math.round(startColor.color.b + factor * (endColor.color.b - startColor.color.b));
  
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <View>
      <Svg
        // width={544}
        // height={468}
        width={272}
        height={234}
        viewBox="0 0 544 468"
        fill="none"
        {...props}
      >
        <Path fill={numToRgbString(normalizedMap["arms"] ?? -1)} d="M0 0H220V225H0z" />
        <Path fill={numToRgbString(normalizedMap["back"] ?? -1)} d="M267 0H544V225H267z" />
        <Path fill={numToRgbString(normalizedMap["core"] ?? -1)} d="M0 263H399V468H0z" />
        <Path fill={numToRgbString(normalizedMap["legs"] ?? -1)} d="M423 263H544V468H423z" />
      </Svg>

      <LinearGradient
        colors={[
          'rgb(0,0,255)',
          'rgb(0,255,255)',
          'rgb(0,255,0)',
          'rgb(255,255,0)',
          'rgb(255,0,0)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          height: 10,
          width: 200,
          borderWidth: 1,
          borderColor: '#000',
          borderRadius: 0,
          marginTop: 10, 
        }}
      />
    </View>
  )
}