import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, Text } from "react-native";

interface MuscleGroupSvgProps {
  valueMap: Record<string, number>
  showGroups: boolean
}

export default function MuscleGroupSvg(props: MuscleGroupSvgProps) {
  const {valueMap, showGroups} = props;

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
  // console.log(normalizedMap);

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

  const getValue = (group: string, target: string): number => {
    if (showGroups) {
      return normalizedMap[group] ?? -1;
    } else {
      return normalizedMap[`${group}/${target}`] ?? -1;
    }
  };

  return (
    <View>
      <Svg
        width={250}
        height={296}
        viewBox="0 0 500 592"
        fill="none"
        {...props}
      >
        <Path fill={numToRgbString(getValue('arms', 'bicep'))} d="M242 184H279V316H242z" />
        <Path
          d="M19 248L34.47 5 218 227.68 19 248z"
          fill={numToRgbString(getValue('arms', 'tricep'))}
          stroke="#fff"
        />
        <Path fill={numToRgbString(getValue('arms', 'forearm'))} d="M157 0H279V130H157z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('legs', 'calves'))} d="M303 0H367V398H303z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('legs', 'quads'))} d="M386 0H500V240H386z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('legs', 'hamstrings'))} d="M386 258H500V398H386z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('legs', 'glutes'))} d="M205 408H500V476H205z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('chest', 'upper'))} d="M335 492H500V592H335z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('chest', 'lower'))} d="M72 492H316V592H72z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('back', 'lats'))} d="M72 408H194V476H72z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('back', 'traps'))} d="M72 328H175V398H72z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('back', 'erectors'))} d="M0 328H57V442H0z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('back', 'upper middle'))} d="M0 455H57V518H0z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('back', 'exterior middle'))} d="M0 532H57V592H0z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('shoulders', 'front'))} d="M194 328H290V398H194z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('shoulders', 'middle'))} d="M0 258H57V316H0z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('shoulders', 'rear'))} d="M72 258H118V316H72z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('core', 'lower abs'))} d="M133 258H175V316H133z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('core', 'upper abs'))} d="M95 0H148V55H95z" stroke="#fff" />
        <Path fill={numToRgbString(getValue('core', 'obliques'))} d="M186 138H279V172H186z" stroke="#fff" />
        {/* <Path fill="#D9D9D9" d="M242 184H279V316H242z" /> */}
        {/* <Path fill="#D9D9D9" d="M186 240H232V316H186z" /> */}
      </Svg>

      <View style={styles.row}>
        <Text style={styles.text}>min</Text>
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
        <Text style={styles.text}>max</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  row: {
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center'
  }
})