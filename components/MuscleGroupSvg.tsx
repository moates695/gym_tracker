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
        width={183}
        height={435.5}
        viewBox="0 0 366 871"
        fill="none"
        {...props}
      >
      <Path
        d="M182.893 211.465l-.073 37.811c-6.334 24.642-51.746 26.655-64.351 21.283-15.341-9.226-31.483-20.77-38.469-42.919 38.924-12.585 65.537-16.175 102.893-16.175z"
        stroke="#fff" fill={numToRgbString(getValue('chest', 'lower'))}
      />
      <Path
        d="M182.893 211.465l.18 37.018c6.341 24.427 51.8 26.423 64.418 21.097 15.357-9.145 31.515-20.588 38.509-42.543-38.965-12.475-65.712-15.572-103.107-15.572z"
        stroke="#fff" fill={numToRgbString(getValue('chest', 'lower'))}
      />
      <Path
        d="M118.884 172C98.445 188 87.976 203 80 227c38.884-12.5 65.576-15.535 102.893-15.535l.107-21.981C178.38 182.965 158.44 172 118.884 172z"
        stroke="#fff" fill={numToRgbString(getValue('chest', 'upper'))}
      />
      <Path
        d="M247.116 172c20.439 16 30.908 31 38.884 55-38.884-12.5-65.789-15.535-103.107-15.535l.107-21.981c4.62-6.519 24.56-17.484 64.116-17.484z"
        stroke="#fff" fill={numToRgbString(getValue('chest', 'upper'))}
      />
      <Path
        d="M43.726 257.616c8.933-19.986 31.762-25.005 34.56-30.616 5.955 23.011 4.762 57.78-3.674 74.24-8.553 21.306-22.945 48.786-35.733 42.969-8.932-28.002-4.582-64.632 4.847-86.593z"
        stroke="#fff" fill={numToRgbString(getValue('arms', 'bicep'))}
      />
      <Path
        d="M322.274 257.616c-8.933-19.986-31.762-25.005-34.56-30.616-5.955 23.011-4.762 57.78 3.674 74.24 8.553 21.306 22.945 48.786 35.733 42.969 8.932-28.002 4.582-64.632-4.847-86.593z"
        stroke="#fff" fill={numToRgbString(getValue('arms', 'bicep'))}
      />
      <Path
        d="M182.5 1C167 .5 158 4.5 150 11.5c-11.508 10.089-11.5 30.5-8.492 49.411-3.257-3.57-8.018-9.51-10.018-4.01-2.49 10.599 2.51 21.599 6 30 2 3.5 4.01 3.599 6.51.099 1.5 23 10 31.5 19.5 39.5 6.335 5.472 10.5 7.028 19.665 7.028s13.211-1.074 19.545-6.546c9.5-8 18-16.5 19.5-39.5 2.5 3.5 4.51 3.402 6.51-.098 3.49-8.402 8.49-19.402 6-30-2-5.5-6.76.438-10.018 4.009 3.008-18.911 3.017-39.323-8.491-49.411C208.21 4.982 198 .5 182.5 1z"
        stroke="#fff"
      />
      <Path
        d="M138.5 169.5c12.004-23.059 9.922-36.833 7.918-68.774C149 114 158 122 162.5 125.5c2.5 18.5 1.515 30.121 12 48.5-10.582-4.507-19.582-6.007-36-4.5z"
        stroke="#fff"
      />
      <Path
        d="M228.308 169.774c-12.003-23.06-9.922-36.833-7.918-68.774-2.582 13.274-11.582 21.274-16.082 24.774-2.5 18.5-1.515 30.121-12 48.5 10.582-4.507 19.582-6.007 36-4.5z"
        stroke="#fff"
      />
      <Path
        d="M148 134.5c-14 12-35 22-53.5 30 16.5 1.5 27 6 43.568 5.005C144 161 147.5 147.5 148 134.5z"
        stroke="#fff" fill={numToRgbString(getValue('back', 'traps'))}
      />
      <Path
        d="M219.363 135c14 12 35 22 53.5 30-16.5 1.5-27 6-43.568 5.005-5.932-8.505-9.432-22.005-9.932-35.005z"
        stroke="#fff" fill={numToRgbString(getValue('back', 'traps'))}
      />
      <Path
        d="M92.5 168c11 1 17.5 4.5 26 3.5-20 15-29.831 25.626-39.831 54.126C78 229.5 72 231.5 65.5 235.5c-5.039-29.306 4-57.5 27.5-67.5"
        stroke="#fff" fill={numToRgbString(getValue('shoulders', 'front'))}
      />
      <Path
        d="M38.652 199.641C30.65 213.597 33.5 243 43.502 257.044 49 247.5 56 241 65.5 235.5c-5.04-29.306 4-57.5 27.5-67.5-6.5-1-15.5-1-22 1-12 4-26 16-32.348 30.641z"
        stroke="#fff" fill={numToRgbString(getValue('shoulders', 'middle'))}
      />
      <Path
        d="M274 167.657c-11 1-17.5 4.5-26 3.5 20 15 29.832 25.625 39.831 54.125.669 3.875 6.669 5.875 13.169 9.875 5.039-29.307-4-57.5-27.5-67.5"
        stroke="#fff" fill={numToRgbString(getValue('shoulders', 'front'))}
      />
      <Path
        d="M327.848 199.298c8.002 13.956 5.152 43.359-4.85 57.403-5.498-9.544-12.498-16.044-21.998-21.544 5.039-29.306-4-57.5-27.5-67.5 6.5-1 15.5-1 22 1 12 4 26 16 32.348 30.641z"
        stroke="#fff" fill={numToRgbString(getValue('shoulders', 'middle'))}
      />
      <Path
        d="M22.5 279.5c2-20 8-30.5 14-38 2.5 7 3.5 10.5 7 16.5-10 25.5-11.5 49-7.5 75.5-5.419-4.727-9.5-10.5-14.581-20.773m1.08-33.712C21.5 292 20.5 302.485 21.5 313"
        stroke="#fff" fill={numToRgbString(getValue('arms', 'tricep'))}
      />
      <Path
        d="M344 280c-2-20-8-30.5-14-38-2.5 7-3.5 10.5-7 16.5 10 25.5 11.5 49 7.5 75.5 5.419-4.727 9.5-10.5 14.581-20.773M344 279.515c1 12.985 2 23.47 1 33.985"
        stroke="#fff" fill={numToRgbString(getValue('arms', 'tricep'))}
      />
      <Path
        d="M1.503 365.053C2.5 341 11.5 320 21.5 312.5c12.511 29.106 12 47 12.983 56.629C21.5 403 16 443 11.483 455.129 8.5 454.5 8 452 4.5 451c2-7 4.5-50.5 1-57.947-2-4.553-5-8.553-3.997-28z"
        stroke="#fff" fill={numToRgbString(getValue('arms', 'exterior forearm'))}
      />
      <Path
        d="M364.98 365.553c-.997-24.053-9.997-45.053-19.997-52.553-12.511 29.106-12 47-12.983 56.629 12.983 33.871 18.483 73.871 23 86 2.983-.629 3.483-3.129 6.983-4.129-2-7-4.5-50.5-1-57.947 2-4.553 5-8.553 3.997-28z"
        stroke="#fff" fill={numToRgbString(getValue('arms', 'exterior forearm'))}
      />
      <Path
        d="M13 450.5c4.517-12.129 8.5-47.5 21.483-81.371C41.5 351.5 50.5 343 62.6 329.702 63.5 366.5 59.503 372.944 57 383c-8 24-31 47.5-36.45 75.781C17.5 457 15.5 455 13 450.5z"
        stroke="#fff" fill={numToRgbString(getValue('arms', 'interior forearm'))}
      />
      <Path
        d="M352.729 449.798c-4.517-12.129-8.5-47.5-21.483-81.37-7.017-17.63-16.017-26.13-28.116-39.428-.901 36.798 3.095 43.242 5.599 53.298 8 24 31 47.5 36.449 75.781 3.051-1.781 5.051-3.781 7.551-8.281z"
        stroke="#fff" fill={numToRgbString(getValue('arms', 'interior forearm'))}
      />
      <Path
        d="M137.5 312c-7-13-7-26.5 0-39 17 0 29-5 45.36-14.48L182.5 302m-45 10c22-3 25.5-10 45-10m-45 10c-3.501 10-3.5 29.5 3 37 25-1.5 37.5-8.494 42.423-8.494L182.5 302"
        stroke="#fff" fill={numToRgbString(getValue('core', 'upper abs'))}
      />
      <Path
        d="M228.553 312.196c7.045-12.931 7.045-26.359 0-38.793-17.11 0-29.088-5.473-45.553-14.903l-.163 43.5m45.716 10.196C206.411 309.212 202.462 302 182.837 302m45.716 10.196c3.523 9.947 3.522 29.344-3.02 36.804-25.161-1.492-37.741-8.449-42.696-8.449V302"
        stroke="#fff" fill={numToRgbString(getValue('core', 'upper abs'))}
      />
      <Path
        d="M141 383.958c-1.5-5.958-9-27.458-.5-34.958 27-2 39-9 42.409-8.492 3.408-.508 15.791 7.158 42.791 9.158 8.5 7.5-.2 29.376-1.7 35.334-4 19.042-4.514 57-17.5 73.883-7.602-5-13.602-7.894-23.5-6.383-9.898-1.511-15.912 1.383-23.514 6.383C146.5 442 145 403 141 383.958z"
        stroke="#fff" fill={numToRgbString(getValue('core', 'lower abs'))}
      />
      <Path
        d="M182.909 382.5v-41.992m0 0C179.5 340 167.5 347 140.5 349c-8.5 7.5-1 29 .5 34.958 4 19.042 5.5 58.042 18.486 74.925 7.602-5 13.616-7.894 23.514-6.383 9.898-1.511 15.898 1.383 23.5 6.383C219.486 442 220 404.042 224 385c1.5-5.958 10.2-27.834 1.7-35.334-27-2-39.383-9.666-42.791-9.158z"
        stroke="#fff" fill={numToRgbString(getValue('core', 'lower abs'))}
      />
      <Path
        d="M147.5 426c-19.346-12.639-46.346-32.136-45-45.997 1.154-21.139 3.5-34.503.5-53.003-1.5-8.5 2.993-17.891 2.501-22.976 0-11.024-3.501-10.024-2-42C116 271 121 274.5 137.171 273.53c-7.167 13.963-6.172 25.958.32 38.452-4.987 14.037-1.489 32.52 3.007 36.978-6.999 5.513-3.498 22.54 1.002 36.026 2.851 16.017 3.005 25.086 6 41.014z"
        stroke="#fff" fill={numToRgbString(getValue('core', 'obliques'))} 
      />
      <Path
        d="M218 425.976c19.346-12.638 46.346-32.136 45-45.997-1.154-21.139-3.5-34.503-.5-53.003 1.5-8.5-2.993-17.89-2.501-22.976 0-11.024 3.501-10.024 2-42-12.499 8.976-17.499 12.476-33.67 11.507 7.168 13.963 6.172 25.958-.319 38.451 4.986 14.038 1.488 32.521-3.008 36.978 6.999 5.514 3.498 22.54-1.002 36.027-2.851 16.017-3.005 25.086-6 41.013z"
        stroke="#fff" fill={numToRgbString(getValue('core', 'obliques'))}
      />
      <Path
        d="M103 328c-4.5-10.5-17-26-21-68.5 0-11.47-.5-17.97-2.5-31.5 3.582 16.775 17 30.5 23.918 33.725C102.5 280 104 294.5 105 298.5c2.5 11.5-4 16-2 29.5z"
        stroke="#fff" fill={numToRgbString(getValue('back', 'lats'))}
      />
      <Path
        d="M262.581 327c4.5-10.5 17-26 21-68.5 0-11.47.5-17.97 2.5-31.5-3.582 16.775-17 30.5-23.918 33.725.918 18.275-.582 32.775-1.582 36.775-2.5 11.5 4 16 2 29.5z"
        stroke="#fff" fill={numToRgbString(getValue('back', 'lats'))}
      />
      <Path
        d="M99.487 522.885C102 475.5 116.5 433.5 119.49 418.094 123.5 471.5 133 485 141.49 526.901 142.5 540 138 555.5 135 566.5c-4.5 15.5-8 27.5-14.5 43-6.5-13.5-22.5-51-21.013-86.615z"
        stroke="#fff" fill={numToRgbString(getValue('legs', 'quads'))}
      />
      <Path
        d="M141.472 526.835c-8.49-41.901-17.972-55.335-21.981-108.741C136 437.5 145.094 450.292 154 465.5c-3.5 29 2 45.5 3.501 63.534.999 13.466 4 35.466 4 58C158.5 562.5 146.5 541.5 141.472 526.835z"
        stroke="#fff" fill={numToRgbString(getValue('legs', 'quads'))}
      />
      <Path
        d="M101 506c5-44.5 15.5-72.5 18.491-87.907C116 413 109 403.5 104.509 391.904c-.509 24.096-9.009 37.596-12 61C92 468 97 492 101 506z"
        stroke="#fff" fill={numToRgbString(getValue('legs', 'hip flexors'))}
      />
      <Path
        d="M157.501 529.034C156 511 150.5 494.5 154 465.5c8.5 14 15 22 22.494 27.579-.994 34.921 0 79.921-15 94 0-22.535-2.994-44.579-3.993-58.045z"
        stroke="#fff" fill={numToRgbString(getValue('legs', 'abductors'))}
      />
      <Path
        d="M141.49 526.901C142.5 540 138 555.5 135 566.5c-4.5 15.5-8 27.5-14.5 43 11 19.5 5.063 21.744 24 35 9.063-6.756 15.5-16 17-27.5 1.5-10 0-20 0-30-3.001-24.534-15-45.5-20.028-60.165"
        stroke="#fff" fill={numToRgbString(getValue('legs', 'quads'))}
      />
      <Path
        d="M118 604.5c-11.5-26.5-22-58.5-17.5-97.587-3.5-17.413-7.5-31.413-8-51.921-13 66.508-23 128.508 10 190.008 3.464-11.814 12.5-18.5 15.5-40.5z"
        stroke="#fff" fill={numToRgbString(getValue('legs', 'quads'))} 
      />
      <Path
        d="M265.007 522.982c-2.513-47.385-17.013-89.385-20.004-104.792-4.009 53.406-13.509 66.907-21.999 108.808-1.01 13.099 3.49 28.599 6.49 39.599 4.5 15.5 8 27.5 14.5 43 6.5-13.5 22.5-51.001 21.013-86.615z"
        stroke="#fff" fill={numToRgbString(getValue('legs', 'quads'))} 
      />
      <Path
        d="M223.022 526.931c8.49-41.901 17.972-55.334 21.981-108.741-16.509 19.407-25.603 32.199-34.509 47.407 3.5 29-2 45.5-3.501 63.534-.999 13.466-4 35.466-4 58 3.001-24.534 15.001-45.534 20.029-60.2z"
        stroke="#fff" fill={numToRgbString(getValue('legs', 'quads'))} 
      />
      <Path
        d="M263.494 506.096c-5-44.5-15.5-72.5-18.491-87.906 3.491-5.094 10.491-14.594 14.981-26.19.51 24.096 9.01 37.597 12 61 .51 15.096-4.49 39.096-8.49 53.096z"
        stroke="#fff" fill={numToRgbString(getValue('legs', 'hip flexors'))}
      />
      <Path
        d="M206.993 529.131c1.501-18.034 7.001-34.534 3.501-63.535-8.5 14-15 22-22.494 27.579.994 34.922 0 79.922 15 94 0-22.534 2.994-44.579 3.993-58.044z"
        stroke="#fff" fill={numToRgbString(getValue('legs', 'abductors'))}
      />
      <Path
        d="M223.004 526.998c-1.01 13.099 3.49 28.599 6.49 39.599 4.5 15.5 8 27.5 14.5 43-11 19.5-5.064 21.743-24 35-9.064-6.757-15.5-16-17-27.5-1.5-10 0-20 0-30 3.001-24.535 15-45.5 20.028-60.166"
        stroke="#fff" fill={numToRgbString(getValue('legs', 'quads'))} 
      />
      <Path
        d="M246.494 604.597c11.5-26.501 22-58.501 17.5-97.587 3.5-17.413 7.5-31.414 8-51.922 13 66.508 23 128.508-10 190.008-3.465-11.814-12.5-18.499-15.5-40.499z"
        stroke="#fff" fill={numToRgbString(getValue('legs', 'quads'))} 
      />
      <Path
        d="M84.485 745.121C84.485 721.5 89 707 96 685.051c12 23.949 12 113.949 21.503 185C112.5 869 108 870.051 104.5 868c2-26.5-18-83.5-20.015-122.879z"
        stroke="#fff" fill={numToRgbString(getValue('legs', 'calves'))} 
      />
      <Path
        d="M281.018 745.07c0-23.621-4.515-38.121-11.515-60.07-12 23.949-12 113.949-21.503 185 5.003-1.051 9.503 0 13.003-2.051-2-26.5 18-83.5 20.015-122.879z"
        stroke="#fff" fill={numToRgbString(getValue('legs', 'calves'))} 
      />
      <Path
        d="M156 749.926c2-23.926-6-42.926-8.506-60C141.5 703.5 135.5 714 131.54 724.803 128.5 737 128 749.5 127.502 764.95c0 37.05.998 70.55 9.003 93.981 1.495-23.931 3.495-53.931 10-72C152 775 155 762 156 749.926z"
        stroke="#fff" fill={numToRgbString(getValue('legs', 'calves'))} 
      />
      <Path
        d="M209.318 750c-2-23.926 6-42.926 8.505-60 5.995 13.574 11.995 24.074 15.954 34.877 3.041 12.197 3.541 24.697 4.038 40.147 0 37.05-.997 70.55-9.002 93.981-1.495-23.931-3.495-53.931-10-72-5.495-11.931-8.495-24.931-9.495-37.005z"
        stroke="#fff" fill={numToRgbString(getValue('legs', 'calves'))} 
      />
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