/**
 * AI Manus Syria - Tabs Layout
 * ==============================
 * Bottom tab navigation for main app screens.
 * 
 * @design Syrian Sovereign Emerald – New Identity Edition
 */

import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MiniEagleMark } from '../../components/SyrianEagle';

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
    textMuted: 'rgba(255,255,255,0.5)',
    borderGold: 'rgba(201,166,70,0.30)',
  },
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Theme.colors.accentGold,
        tabBarInactiveTintColor: Theme.colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTintColor: Theme.colors.accentSoftGold,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
        headerBackground: () => (
          <LinearGradient
            colors={[Theme.colors.primaryDark, Theme.colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ),
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workflows"
        options={{
          title: 'Workflows',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="git-branch" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Theme.colors.primaryDark,
    borderTopColor: Theme.colors.borderGold,
    borderTopWidth: 1,
    height: 65,
    paddingBottom: 10,
    paddingTop: 10,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  header: {
    backgroundColor: Theme.colors.primaryDark,
    elevation: 0,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: Theme.colors.accentSoftGold,
  },
});