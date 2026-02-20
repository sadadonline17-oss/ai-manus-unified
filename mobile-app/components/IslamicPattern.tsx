/**
 * Islamic Geometric Pattern Background
 * ======================================
 * Subtle Islamic geometric pattern for background design.
 * 
 * @design Syrian Sovereign Emerald – New Identity Edition
 * @patternOpacity 0.05
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Defs, Pattern, Rect, Use, Circle, Polygon } from 'react-native-svg';

interface IslamicPatternProps {
  opacity?: number;
  color?: string;
}

export function IslamicPattern({ 
  opacity = 0.05, 
  color = '#C9A646' 
}: IslamicPatternProps) {
  return (
    <View style={[styles.container, { opacity }]}>
      <Svg width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <Pattern id="islamicPattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            {/* Eight-pointed star pattern */}
            <G fill="none" stroke={color} strokeWidth="0.5">
              {/* Central star */}
              <Polygon 
                points="25,5 30,20 45,25 30,30 25,45 20,30 5,25 20,20"
                strokeWidth={0.5}
              />
              {/* Inner circle */}
              <Circle cx="25" cy="25" r="8" />
              {/* Corner decorations */}
              <Path d="M0,0 L10,0 L0,10 Z" />
              <Path d="M50,0 L40,0 L50,10 Z" />
              <Path d="M0,50 L10,50 L0,40 Z" />
              <Path d="M50,50 L40,50 L50,40 Z" />
              {/* Connecting lines */}
              <Path d="M25,0 L25,5 M25,45 L25,50" />
              <Path d="M0,25 L5,25 M45,25 L50,25" />
            </G>
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#islamicPattern)" />
      </Svg>
    </View>
  );
}

// Alternative: Arabesque Pattern
export function ArabesquePattern({ 
  opacity = 0.05, 
  color = '#C9A646' 
}: IslamicPatternProps) {
  return (
    <View style={[styles.container, { opacity }]}>
      <Svg width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <Pattern id="arabesquePattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <G fill="none" stroke={color} strokeWidth="0.4">
              {/* Vine pattern */}
              <Path d="M0,30 Q15,15 30,30 T60,30" />
              <Path d="M30,0 Q15,15 30,30 T30,60" />
              {/* Leaf shapes */}
              <Path d="M15,15 Q20,10 25,15 Q20,20 15,15" />
              <Path d="M45,15 Q50,10 55,15 Q50,20 45,15" />
              <Path d="M15,45 Q20,40 25,45 Q20,50 15,45" />
              <Path d="M45,45 Q50,40 55,45 Q50,50 45,45" />
              {/* Small circles */}
              <Circle cx="30" cy="30" r="3" />
            </G>
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#arabesquePattern)" />
      </Svg>
    </View>
  );
}

// Hexagonal Pattern
export function HexagonalPattern({ 
  opacity = 0.05, 
  color = '#C9A646' 
}: IslamicPatternProps) {
  return (
    <View style={[styles.container, { opacity }]}>
      <Svg width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <Pattern id="hexPattern" x="0" y="0" width="40" height="46" patternUnits="userSpaceOnUse">
            <G fill="none" stroke={color} strokeWidth="0.3}>
              {/* Hexagon */}
              <Path d="M20,0 L40,11.5 L40,34.5 L20,46 L0,34.5 L0,11.5 Z" />
              {/* Inner hexagon */}
              <Path d="M20,8 L32,15.5 L32,30.5 L20,38 L8,30.5 L8,15.5 Z" />
              {/* Connecting points */}
              <Circle cx="20" cy="0" r="1" />
              <Circle cx="40" cy="11.5" r="1" />
              <Circle cx="40" cy="34.5" r="1" />
              <Circle cx="20" cy="46" r="1" />
              <Circle cx="0" cy="34.5" r="1" />
              <Circle cx="0" cy="11.5" r="1" />
            </G>
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#hexPattern)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default IslamicPattern;