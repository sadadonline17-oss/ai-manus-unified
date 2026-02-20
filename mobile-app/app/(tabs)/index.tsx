/**
 * AI Manus Unified - Home Tab
 * =============================
 * Dashboard home screen with quick actions.
 * 
 * @author AI Manus Unified Team
 * @license MIT
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

const QUICK_ACTIONS = [
  { icon: 'chatbubbles', label: 'New Chat', route: '/(tabs)/chat', color: '#89b4fa' },
  { icon: 'git-branch', label: 'Workflows', route: '/(tabs)/workflows', color: '#a6e3a1' },
  { icon: 'code', label: 'Code', route: '/(tabs)/chat', color: '#f9e2af' },
  { icon: 'image', label: 'Generate', route: '/(tabs)/chat', color: '#cba6f7' },
];

const RECENT_CHATS = [
  { id: '1', title: 'Python Script Help', preview: 'Can you help me write a script...', time: '2m ago' },
  { id: '2', title: 'Data Analysis', preview: 'Analyze this CSV file...', time: '1h ago' },
  { id: '3', title: 'API Integration', preview: 'How do I connect to...', time: '3h ago' },
];

export default function HomeTab() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.welcomeSection}>
          <Text style={styles.welcomeGreeting}>Welcome back! 👋</Text>
          <Text style={styles.welcomeTitle}>What would you like to create?</Text>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action, index) => (
              <TouchableOpacity
                key={action.label}
                style={[styles.quickActionCard, { borderColor: action.color }]}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>127</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Workflows</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Providers</Text>
          </View>
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
            <TouchableOpacity key={chat.id} style={styles.chatItem}>
              <View style={styles.chatIcon}>
                <Ionicons name="chatbubble-outline" size={20} color="#89b4fa" />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11111b',
  },
  welcomeSection: {
    padding: 20,
    paddingTop: 10,
  },
  welcomeGreeting: {
    fontSize: 16,
    color: '#6c7086',
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#cdd6f4',
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
    color: '#cdd6f4',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#89b4fa',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#cdd6f4',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#89b4fa',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c7086',
    marginTop: 4,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#313244',
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
    color: '#cdd6f4',
    marginBottom: 2,
  },
  chatPreview: {
    fontSize: 13,
    color: '#6c7086',
  },
  chatTime: {
    fontSize: 12,
    color: '#45475a',
  },
  providerChip: {
    backgroundColor: '#1e1e2e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  providerText: {
    fontSize: 13,
    color: '#a6adc8',
  },
});