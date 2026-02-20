/**
 * AI Manus Unified - Mobile App Layout
 * ======================================
 * Root layout component for Expo Router navigation.
 * 
 * @author AI Manus Unified Team
 * @license MIT
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after app loads
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style="light" backgroundColor="#1e1e2e" />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1e1e2e',
              },
              headerTintColor: '#cdd6f4',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              contentStyle: {
                backgroundColor: '#11111b',
              },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                title: 'AI Manus Unified',
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
    backgroundColor: '#11111b',
  },
});