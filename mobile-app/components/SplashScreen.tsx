/**
 * Syrian Sovereign Emerald Splash Screen
 * =======================================
 * Animated splash screen with Syrian Eagle logo.
 * 
 * @design Syrian Sovereign Emerald – New Identity Edition
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
  ZoomIn,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';
import { SyrianEagle } from './SyrianEagle';
import { IslamicPattern } from './IslamicPattern';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export function SplashScreen({ onFinish, autoHide = true, duration = 2500 }: SplashScreenProps) {
  useEffect(() => {
    if (autoHide && onFinish) {
      const timer = setTimeout(onFinish, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onFinish]);

  return (
    <LinearGradient
      colors={['#0B2F24', '#071F18']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      {/* Background Pattern */}
      <IslamicPattern opacity={0.05} color="#C9A646" />
      
      {/* Eagle Logo */}
      <Animated.View 
        entering={ZoomIn.delay(200).duration(800).springify()}
        style={styles.logoContainer}
      >
        <SyrianEagle 
          size={width * 0.4} 
          color="#E5C878" 
          useGradient={true}
        />
      </Animated.View>
      
      {/* App Name */}
      <Animated.View 
        entering={FadeInUp.delay(600).duration(600)}
        style={styles.titleContainer}
      >
        <Text style={styles.title}>AI Manus</Text>
        <Text style={styles.subtitle}>Syrian Arab Republic</Text>
      </Animated.View>
      
      {/* Bottom Branding */}
      <Animated.View 
        entering={FadeIn.delay(1000).duration(600)}
        style={styles.bottomContainer}
      >
        <View style={styles.divider}>
          <LinearGradient
            colors={['transparent', '#C9A646', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dividerLine}
          />
        </View>
        <Text style={styles.brandText}>New Identity Edition</Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </Animated.View>
    </LinearGradient>
  );
}

// Mini Splash for transitions
export function MiniSplash({ visible }: { visible: boolean }) {
  if (!visible) return null;
  
  return (
    <View style={styles.miniSplashContainer}>
      <LinearGradient
        colors={['#0B2F24', '#071F18']}
        style={styles.miniSplash}
      >
        <SyrianEagle size={60} color="#E5C878" />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#E5C878',
    letterSpacing: 2,
    textShadowColor: 'rgba(201, 166, 70, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    letterSpacing: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  divider: {
    width: width * 0.6,
    marginBottom: 20,
  },
  dividerLine: {
    height: 1,
    width: '100%',
  },
  brandText: {
    fontSize: 14,
    color: '#C9A646',
    fontWeight: '500',
    letterSpacing: 2,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  miniSplashContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 31, 24, 0.95)',
    zIndex: 1000,
  },
  miniSplash: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreen;