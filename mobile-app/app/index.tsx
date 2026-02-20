/**
 * AI Manus Syria - Entry Point
 * ==============================
 * Initial splash screen with Syrian Eagle logo.
 * 
 * @design Syrian Sovereign Emerald – New Identity Edition
 */

import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SplashScreen } from '../components/SplashScreen';

export default function IndexScreen() {
  const router = useRouter();
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const handleSplashFinish = () => {
    setIsSplashVisible(false);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <SplashScreen onFinish={handleSplashFinish} autoHide={true} duration={2500} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});