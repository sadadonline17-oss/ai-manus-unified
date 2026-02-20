/**
 * AI Manus Syria - Home Tab
 * ===========================
 * Dashboard home screen with quick actions.
 * 
 * @design Syrian Sovereign Emerald – New Identity Edition
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { SyrianEagle, MiniEagleMark } from '../../components/SyrianEagle';
import { IslamicPattern } from '../../components/IslamicPattern';
import { Card, Theme } from '../../components/ui';

// Theme Colors
const Colors = Theme.colors;

const QUICK_ACTIONS = [
  { icon: 'chatbubbles', label: 'New Chat', route: '/(tabs)/chat', color: Colors.accentGold },
  { icon: 'git-branch', label: 'Workflows', route: '/(tabs)/workflows', color: Colors.accentSoftGold },
  { icon: 'code', label: 'Code', route: '/(tabs)/chat', color: '#a6e3a1' },
  { icon: 'image', label: 'Generate', route: '/(tabs)/chat', color: '#89b4fa' },
];

const RECENT_CHATS = [
  { id: '1', title: 'Python Script Help', preview: 'Can you help me write a script...', time: '2m ago' },
  { id: '2', title: 'Data Analysis', preview: 'Analyze this CSV file...', time: '1h ago' },
  { id: '3', title: 'API Integration', preview: 'How do I connect to...', time: '3h ago' },
];

export default function HomeTab() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Background Pattern */}
      <IslamicPattern opacity={0.05} color={Colors.accentGold} />
      
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Welcome Section */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.welcomeSection}>
            <View style={styles.welcomeHeader}>
              <View>
                <Text style={styles.welcomeGreeting}>Welcome back! 👋</Text>
                <Text style={styles.welcomeTitle}>What would you like to create?</Text>
              </View>
              <SyrianEagle size={50} color={Colors.accentGold} />
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {QUICK_ACTIONS.map((action, index) => (
                <TouchableOpacity
                  key={action.label}
                  style={styles.quickActionCard}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['rgba(15,61,46,0.90)', 'rgba(11,47,36,0.95)']}
                    style={styles.quickActionGradient}
                  >
                    <View style={[styles.quickActionIcon, { borderColor: action.color }]}>
                      <Ionicons name={action.icon as any} size={24} color={action.color} />
                    </View>
                    <Text style={styles.quickActionLabel}>{action.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Stats */}
          <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.statsSection}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>127</Text>
              <Text style={styles.statLabel}>Messages</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Workflows</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Providers</Text>
            </Card>
          </Animated.View>

          {/* Recent Chats */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Chats</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {RECENT_CHATS.map((chat, index) => (
              <TouchableOpacity key={chat.id} style={styles.chatItem} activeOpacity={0.7}>
                <View style={styles.chatIcon}>
                  <Ionicons name="chatbubble-outline" size={20} color={Colors.accentGold} />
                </View>
                <View style={styles.chatContent}>
                  <Text style={styles.chatTitle}>{chat.title}</Text>
                  <Text style={styles.chatPreview}>{chat.preview}</Text>
                </View>
                <Text style={styles.chatTime}>{chat.time}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* AI Providers */}
          <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Available Providers</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['🤖 OpenAI', '🧠 Anthropic', '💎 Google', '🔮 DeepSeek', '⚡ Groq', '🦙 Ollama'].map((provider) => (
                <View key={provider} style={styles.providerChip}>
                  <Text style={styles.providerText}>{provider}</Text>
                </View>
              ))}
            </ScrollView>
          </Animated.View>
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
  welcomeSection: {
    padding: 20,
    paddingTop: 10,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeGreeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.accentGold,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '47%',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201,166,70,0.15)',
  },
  quickActionGradient: {
    padding: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
  },
  quickActionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.accentGold,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(201,166,70,0.15)',
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(201,166,70,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  chatPreview: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  chatTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  providerChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(201,166,70,0.15)',
  },
  providerText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});