/**
 * AI Manus Syria - Settings Screen
 * ===================================
 * App settings and configuration.
 * 
 * @design Syrian Sovereign Emerald – New Identity Edition
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { IslamicPattern } from '../../components/IslamicPattern';
import { SyrianEagle } from '../../components/SyrianEagle';
import { Card, Button, Theme } from '../../components/ui';

// Theme Colors
const Colors = Theme.colors;

interface SettingItem {
  icon: string;
  label: string;
  description?: string;
  type: 'toggle' | 'link' | 'button';
  value?: boolean;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    autoSave: true,
    hapticFeedback: true,
    streaming: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderSettingItem = (
    item: SettingItem,
    index: number
  ) => (
    <Animated.View
      entering={FadeInUp.delay(index * 50).duration(200)}
      style={styles.settingItem}
    >
      <TouchableOpacity
        style={styles.settingContent}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
        activeOpacity={0.7}
      >
        <View style={styles.settingIconContainer}>
          <Ionicons name={item.icon as any} size={22} color={Colors.accentGold} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>{item.label}</Text>
          {item.description && (
            <Text style={styles.settingDescription}>{item.description}</Text>
          )}
        </View>
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onPress}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.accentGold }}
            thumbColor={Colors.textPrimary}
          />
        )}
        {item.type === 'link' && (
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const settingsSections = [
    {
      title: 'AI Providers',
      items: [
        {
          icon: 'key',
          label: 'API Keys',
          description: 'Configure your AI provider keys',
          type: 'link' as const,
          onPress: () => Alert.alert('API Keys', 'Configure your API keys here'),
        },
        {
          icon: 'cloud',
          label: 'Default Provider',
          description: 'OpenAI',
          type: 'link' as const,
          onPress: () => Alert.alert('Provider', 'Select default AI provider'),
        },
        {
          icon: 'radio',
          label: 'Streaming Responses',
          type: 'toggle' as const,
          value: settings.streaming,
          onPress: () => toggleSetting('streaming'),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: 'moon',
          label: 'Dark Mode',
          type: 'toggle' as const,
          value: settings.darkMode,
          onPress: () => toggleSetting('darkMode'),
        },
        {
          icon: 'phone-portrait',
          label: 'Haptic Feedback',
          type: 'toggle' as const,
          value: settings.hapticFeedback,
          onPress: () => toggleSetting('hapticFeedback'),
        },
      ],
    },
    {
      title: 'Data & Storage',
      items: [
        {
          icon: 'save',
          label: 'Auto-save Conversations',
          type: 'toggle' as const,
          value: settings.autoSave,
          onPress: () => toggleSetting('autoSave'),
        },
        {
          icon: 'trash',
          label: 'Clear Cache',
          description: 'Free up storage space',
          type: 'button' as const,
          onPress: () => Alert.alert('Clear Cache', 'Cache cleared successfully'),
        },
        {
          icon: 'download',
          label: 'Export Data',
          description: 'Download your conversations',
          type: 'link' as const,
          onPress: () => Alert.alert('Export', 'Export your data'),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications',
          label: 'Push Notifications',
          type: 'toggle' as const,
          value: settings.notifications,
          onPress: () => toggleSetting('notifications'),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-circle',
          label: 'Version',
          description: '1.0.0',
          type: 'link' as const,
          onPress: () => {},
        },
        {
          icon: 'document-text',
          label: 'Terms of Service',
          type: 'link' as const,
          onPress: () => Alert.alert('Terms', 'View terms of service'),
        },
        {
          icon: 'shield',
          label: 'Privacy Policy',
          type: 'link' as const,
          onPress: () => Alert.alert('Privacy', 'View privacy policy'),
        },
        {
          icon: 'star',
          label: 'Rate App',
          type: 'link' as const,
          onPress: () => Alert.alert('Rate', 'Rate us on the App Store'),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Background Pattern */}
      <IslamicPattern opacity={0.03} color={Colors.accentGold} />
      
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Settings</Text>
        </LinearGradient>

        {/* Settings List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* App Info Card */}
          <Card style={styles.appInfoCard}>
            <View style={styles.appInfoContent}>
              <SyrianEagle size={60} color={Colors.accentGold} />
              <View style={styles.appInfoText}>
                <Text style={styles.appName}>AI Manus Syria</Text>
                <Text style={styles.appTagline}>Syrian Sovereign Emerald</Text>
                <Text style={styles.appVersion}>Version 1.0.0</Text>
              </View>
            </View>
          </Card>

          {settingsSections.map((section, sectionIndex) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map((item, itemIndex) =>
                  renderSettingItem(item, sectionIndex * 10 + itemIndex)
                )}
              </View>
            </View>
          ))}

          {/* Sign Out Button */}
          <TouchableOpacity style={styles.signOutButton} activeOpacity={0.7}>
            <Ionicons name="log-out" size={20} color="#f38ba8" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerDivider}>
              <LinearGradient
                colors={['transparent', Colors.accentGold, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.footerDividerLine}
              />
            </View>
            <Text style={styles.footerText}>AI Manus Syria v1.0.0</Text>
            <Text style={styles.footerSubtext}>Syrian Arab Republic 🇸🇾</Text>
            <Text style={styles.footerSubtext}>Made with ❤️ for AI enthusiasts</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,166,70,0.15)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.accentSoftGold,
  },
  scrollView: {
    flex: 1,
  },
  appInfoCard: {
    margin: 16,
    marginBottom: 8,
  },
  appInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appInfoText: {
    marginLeft: 16,
    flex: 1,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  appTagline: {
    fontSize: 13,
    color: Colors.accentGold,
    marginTop: 2,
  },
  appVersion: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201,166,70,0.15)',
  },
  settingItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,166,70,0.10)',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  settingIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(201,166,70,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(243,139,168,0.30)',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f38ba8',
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  footerDivider: {
    width: '60%',
    marginBottom: 16,
  },
  footerDividerLine: {
    height: 1,
    width: '100%',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
});