/**
 * AI Manus Syria - Root Layout
 * ==============================
 * Root layout component for Expo Router navigation.
 * 
 * @design Syrian Sovereign Emerald – New Identity Edition
 * @country Syria
 */

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { SyrianEagle } from '../components/SyrianEagle';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Theme Colors
const Theme = {
  colors: {
    primary: '#0F3D2E',
    primaryDark: '#0B2F24',
    secondary: '#1C5C45',
    accentGold: '#C9A646',
    accentSoftGold: '#E5C878',
    background: '#071F18',
    surface: 'rgba(15,61,46,0.90)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.75)',
  },
};

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulate loading resources
    const prepare = async () => {
      try {
        // Pre-load fonts, make API calls, etc.
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style="light" backgroundColor={Theme.colors.primaryDark} />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: Theme.colors.primaryDark,
              },
              headerTintColor: Theme.colors.accentSoftGold,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              headerTitleAlign: 'center',
              contentStyle: {
                backgroundColor: Theme.colors.background,
              },
              animation: 'slide_from_right',
              headerBackground: () => (
                <LinearGradient
                  colors={[Theme.colors.primaryDark, Theme.colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              ),
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                title: 'AI Manus Syria',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="login"
              options={{
                title: 'Sign In',
                headerShown: true,
              }}
            />
          </Stack>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
});