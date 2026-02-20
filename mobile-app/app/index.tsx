/**
 * AI Manus Unified - Home Screen
 * =================================
 * Main entry point with splash/landing screen.
 * 
 * @author AI Manus Unified Team
 * @license MIT
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp 
} from 'react-native-reanimated';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#1e1e2e', '#11111b', '#1e1e2e']}
        style={styles.gradient}
      />

      {/* Logo & Title */}
      <Animated.View 
        entering={FadeIn.delay(200).duration(800)}
        style={styles.logoContainer}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🤖</Text>
        </View>
        <Text style={styles.title}>AI Manus</Text>
        <Text style={styles.subtitle}>Unified</Text>
      </Animated.View>

      {/* Features */}
      <Animated.View 
        entering={FadeInDown.delay(600).duration(800)}
        style={styles.featuresContainer}
      >
        <Text style={styles.featureText}>✨ 17+ AI Providers</Text>
        <Text style={styles.featureText}>🔄 Visual Workflow Builder</Text>
        <Text style={styles.featureText}>🛠️ 20+ Pre-built Skills</Text>
        <Text style={styles.featureText}>📱 Mobile-First Design</Text>
      </Animated.View>

      {/* Buttons */}
      <Animated.View 
        entering={FadeInUp.delay(1000).duration(800)}
        style={styles.buttonsContainer}
      >
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/(tabs)/chat')}
        >
          <Text style={styles.primaryButtonText}>🚀 Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.secondaryButtonText}>Sign In</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Footer */}
      <Animated.View 
        entering={FadeIn.delay(1200).duration(800)}
        style={styles.footer}
      >
        <Text style={styles.footerText}>
          Powered by AI • Built with ❤️
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11111b',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#313244',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#89b4fa',
    shadowColor: '#89b4fa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  logoEmoji: {
    fontSize: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#cdd6f4',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#89b4fa',
    marginTop: 5,
  },
  featuresContainer: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  featureText: {
    fontSize: 16,
    color: '#a6adc8',
    textAlign: 'center',
    marginVertical: 8,
  },
  buttonsContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#89b4fa',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#1e1e2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#45475a',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#cdd6f4',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#6c7086',
    fontSize: 12,
  },
});