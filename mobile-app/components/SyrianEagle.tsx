/**
 * Syrian Eagle - New Visual Identity
 * ====================================
 * The new Syrian visual identity eagle symbol.
 * 
 * @design Syrian Sovereign Emerald – New Identity Edition
 * @usage Must be vector, centered, monochrome gold version available
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Circle, Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';

interface SyrianEagleProps {
  size?: number;
  color?: string;
  useGradient?: boolean;
  opacity?: number;
  showWatermark?: boolean;
}

export function SyrianEagle({ 
  size = 100, 
  color = '#E5C878',
  useGradient = false,
  opacity = 1,
  showWatermark = false
}: SyrianEagleProps) {
  const eagleColor = color;
  
  return (
    <View style={[styles.container, { width: size, height: size, opacity }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {useGradient && (
          <Defs>
            <LinearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#C9A646" />
              <Stop offset="100%" stopColor="#E5C878" />
            </LinearGradient>
          </Defs>
        )}
        <G fill={useGradient ? 'url(#goldGradient)' : eagleColor}>
          {/* Eagle Body - Central Shield Shape */}
          <Path
            d="M50 8 L65 25 L70 45 L65 65 L55 80 L50 92 L45 80 L35 65 L30 45 L35 25 Z"
            strokeWidth={0}
          />
          
          {/* Eagle Head */}
          <Circle cx="50" cy="18" r="8" />
          
          {/* Left Wing */}
          <Path
            d="M35 25 L15 20 L5 30 L10 45 L20 55 L30 50 L35 45 Z"
            strokeWidth={0}
          />
          
          {/* Right Wing */}
          <Path
            d="M65 25 L85 20 L95 30 L90 45 L80 55 L70 50 L65 45 Z"
            strokeWidth={0}
          />
          
          {/* Tail Feathers */}
          <Path
            d="M45 80 L40 95 L50 88 L60 95 L55 80 Z"
            strokeWidth={0}
          />
          
          {/* Eagle Beak */}
          <Polygon points="50,22 47,28 53,28" />
          
          {/* Eyes */}
          <Circle cx="47" cy="16" r="1.5" fill="#071F18" />
          <Circle cx="53" cy="16" r="1.5" fill="#071F18" />
          
          {/* Chest Detail - Three Stars */}
          <Circle cx="50" cy="45" r="2" fill="#071F18" />
          <Circle cx="45" cy="52" r="1.5" fill="#071F18" />
          <Circle cx="55" cy="52" r="1.5" fill="#071F18" />
        </G>
      </Svg>
    </View>
  );
}

// Mini Eagle Mark for App Bar
export function MiniEagleMark({ 
  size = 24, 
  color = '#E5C878',
  opacity = 0.05 
}: Omit<SyrianEagleProps, 'showWatermark' | 'useGradient'>) {
  return (
    <View style={[styles.miniContainer, { width: size, height: size, opacity }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G fill={color}>
          {/* Simplified Eagle for Mini Mark */}
          <Path
            d="M50 10 L62 22 L68 40 L62 58 L52 72 L50 85 L48 72 L38 58 L32 40 L38 22 Z"
            strokeWidth={0}
          />
          <Path
            d="M38 22 L18 18 L8 28 L14 42 L26 50 L32 45 Z"
            strokeWidth={0}
          />
          <Path
            d="M62 22 L82 18 L92 28 L86 42 L74 50 L68 45 Z"
            strokeWidth={0}
          />
        </G>
      </Svg>
    </View>
  );
}

// Watermark Eagle for Background
export function EagleWatermark({ 
  size = 300, 
  opacity = 0.03 
}: { size?: number; opacity?: number }) {
  return (
    <View style={[styles.watermarkContainer, { width: size, height: size, opacity }]}>
      <SyrianEagle size={size} color="#E5C878" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SyrianEagle;