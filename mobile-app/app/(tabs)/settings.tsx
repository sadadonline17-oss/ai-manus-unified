/**
 * AI Manus Unified - Settings Screen
 * =====================================
 * App settings and configuration.
 * 
 * @author AI Manus Unified Team
 * @license MIT
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
import Animated, { FadeInUp } from 'react-native-reanimated';

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
      >
        <View style={styles.settingIconContainer}>
          <Ionicons name={item.icon as any} size={22} color="#89b4fa" />
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
            trackColor={{ false: '#45475a', true: '#89b4fa' }}
            thumbColor="#cdd6f4"
          />
        )}
        {item.type === 'link' && (
          <Ionicons name="chevron-forward" size={20} color="#6c7086" />
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Settings List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
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
        <TouchableOpacity style={styles.signOutButton}>
          <Ionicons name="log-out" size={20} color="#f38ba8" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>AI Manus Unified v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ for AI enthusiasts</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11111b',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#313244',
    backgroundColor: '#1e1e2e',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#cdd6f4',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c7086',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#313244',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#313244',
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
    color: '#cdd6f4',
  },
  settingDescription: {
    fontSize: 12,
    color: '#6c7086',
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1e2e',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    gap: 8,
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
  footerText: {
    fontSize: 14,
    color: '#6c7086',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#45475a',
    marginTop: 4,
  },
});