import * as React from "react";
import Svg, { Path } from "react-native-svg";

interface MuscleGroupSvgProps {
  numValues: Record<string, number>
  colourScheme?: string
}

export default function MuscleGroupSvg(props: MuscleGroupSvgProps) {
  const {numValues, colourScheme = 'classic'} = props;

  const numToRgbString = (num: number): string => {
    if (num < 0 || num > 1) return "none";

    const colourSchemes: Record<string, any> = {
      classic: [
        { pos: 0.0, color: { r: 0, g: 0, b: 255 } },     // Blue (cold)
        { pos: 0.25, color: { r: 0, g: 255, b: 255 } },  // Cyan
        { pos: 0.5, color: { r: 0, g: 255, b: 0 } },     // Green
        { pos: 0.75, color: { r: 255, g: 255, b: 0 } },  // Yellow
        { pos: 1.0, color: { r: 255, g: 0, b: 0 } }      // Red (hot)
      ],
      viridis: [
        { pos: 0.0, color: { r: 68, g: 1, b: 84 } },     // Dark purple
        { pos: 0.25, color: { r: 59, g: 82, b: 139 } },  // Blue-purple
        { pos: 0.5, color: { r: 33, g: 144, b: 140 } },  // Teal
        { pos: 0.75, color: { r: 93, g: 201, b: 99 } },  // Light green
        { pos: 1.0, color: { r: 253, g: 231, b: 37 } }   // Yellow
      ],
      plasma: [
        { pos: 0.0, color: { r: 13, g: 8, b: 135 } },    // Dark blue
        { pos: 0.25, color: { r: 126, g: 3, b: 168 } },  // Purple
        { pos: 0.5, color: { r: 204, g: 71, b: 120 } },  // Pink
        { pos: 0.75, color: { r: 248, g: 149, b: 64 } }, // Orange
        { pos: 1.0, color: { r: 240, g: 249, b: 33 } }   // Yellow
      ],
      inferno: [
        { pos: 0.0, color: { r: 0, g: 0, b: 4 } },       // Black
        { pos: 0.25, color: { r: 87, g: 15, b: 109 } },  // Dark purple
        { pos: 0.5, color: { r: 188, g: 55, b: 84 } },   // Red-purple
        { pos: 0.75, color: { r: 249, g: 142, b: 8 } },  // Orange
        { pos: 1.0, color: { r: 252, g: 255, b: 164 } }  // Light yellow
      ]
    };

    const colours = colourSchemes[colourScheme] || colourSchemes.classic;

    let startColor = colours[0];
    let endColor = colours[1];

    for (let i = 0; i < colours.length - 1; i++) {
      if (num >= colours[i].pos && num <= colours[i + 1].pos) {
        startColor = colours[i];
        endColor = colours[i + 1];
        break;
      }
    }
    
    // Calculate interpolation factor
    const segmentRange = endColor.pos - startColor.pos;
    const factor = segmentRange === 0 ? 0 : (num - startColor.pos) / segmentRange;
    
    // Interpolate RGB values
    const r = Math.round(startColor.color.r + factor * (endColor.color.r - startColor.color.r));
    const g = Math.round(startColor.color.g + factor * (endColor.color.g - startColor.color.g));
    const b = Math.round(startColor.color.b + factor * (endColor.color.b - startColor.color.b));
  
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <Svg
      // width={544}
      // height={468}
      width={272}
      height={234}
      viewBox="0 0 544 468"
      fill="none"
      {...props}
    >
      <Path fill={numToRgbString(numValues["chest/upper"] ?? -1)} d="M0 0H220V225H0z" />
      <Path fill={"none"} d="M267 0H544V225H267z" />
      <Path fill={numToRgbString(numValues["chest/upper"] ?? 1)} d="M0 263H399V468H0z" />
      <Path fill={numToRgbString(numValues["chest/upper"] ?? 0)} d="M423 263H544V468H423z" />
    </Svg>
  )
}