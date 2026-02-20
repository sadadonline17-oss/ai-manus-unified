/**
 * AI Manus Syria - Workflows Screen
 * ====================================
 * Display and manage automation workflows.
 * 
 * @design Syrian Sovereign Emerald – New Identity Edition
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { IslamicPattern } from '../../components/IslamicPattern';
import { Card, Button, Badge, Theme } from '../../components/ui';

// Theme Colors
const Colors = Theme.colors;

// Sample workflows
const SAMPLE_WORKFLOWS = [
  {
    id: '1',
    name: 'Daily Report Generator',
    description: 'Generate daily reports from multiple data sources',
    nodes: 5,
    status: 'active',
    lastRun: '2 hours ago',
    icon: '📊',
  },
  {
    id: '2',
    name: 'Email Automation',
    description: 'Automatically process and respond to emails',
    nodes: 8,
    status: 'paused',
    lastRun: '1 day ago',
    icon: '📧',
  },
  {
    id: '3',
    name: 'Data Sync Pipeline',
    description: 'Sync data between databases and APIs',
    nodes: 12,
    status: 'active',
    lastRun: '30 minutes ago',
    icon: '🔄',
  },
  {
    id: '4',
    name: 'AI Content Generator',
    description: 'Generate blog posts and social media content',
    nodes: 6,
    status: 'active',
    lastRun: '3 hours ago',
    icon: '✍️',
  },
];

export default function WorkflowsScreen() {
  const [workflows, setWorkflows] = useState(SAMPLE_WORKFLOWS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#a6e3a1';
      case 'paused':
        return Colors.accentGold;
      case 'error':
        return '#f38ba8';
      default:
        return Colors.textMuted;
    }
  };

  const renderWorkflow = ({ item, index }: { item: typeof SAMPLE_WORKFLOWS[0]; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(300)}
      style={styles.workflowCard}
    >
      <TouchableOpacity style={styles.workflowContent} activeOpacity={0.7}>
        <View style={styles.workflowHeader}>
          <View style={styles.workflowIconContainer}>
            <Text style={styles.workflowIcon}>{item.icon}</Text>
          </View>
          <View style={styles.workflowInfo}>
            <Text style={styles.workflowName}>{item.name}</Text>
            <Text style={styles.workflowDescription}>{item.description}</Text>
          </View>
        </View>
        
        <View style={styles.workflowMeta}>
          <View style={styles.workflowStats}>
            <View style={styles.statItem}>
              <Ionicons name="git-branch" size={14} color={Colors.accentGold} />
              <Text style={styles.statText}>{item.nodes} nodes</Text>
            </View>
            <Badge 
              text={item.status} 
              variant={item.status === 'active' ? 'success' : item.status === 'paused' ? 'warning' : 'error'} 
            />
          </View>
          <Text style={styles.lastRun}>Last run: {item.lastRun}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.workflowActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="play" size={18} color="#a6e3a1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create-outline" size={18} color={Colors.accentGold} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="trash-outline" size={18} color="#f38ba8" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

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
          <Text style={styles.headerTitle}>Workflows</Text>
          <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
            <Ionicons name="add" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{workflows.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#a6e3a1' }]}>
              {workflows.filter(w => w.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.accentGold }]}>
              {workflows.filter(w => w.status === 'paused').length}
            </Text>
            <Text style={styles.statLabel}>Paused</Text>
          </Card>
        </View>

        {/* Workflows List */}
        <FlatList
          data={workflows}
          renderItem={renderWorkflow}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accentGold}
              colors={[Colors.accentGold]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔄</Text>
              <Text style={styles.emptyTitle}>No Workflows</Text>
              <Text style={styles.emptySubtitle}>
                Create your first workflow to automate tasks
              </Text>
            </View>
          }
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentGold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accentGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  workflowCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201,166,70,0.15)',
  },
  workflowContent: {
    padding: 16,
  },
  workflowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workflowIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(201,166,70,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workflowIcon: {
    fontSize: 24,
  },
  workflowInfo: {
    flex: 1,
  },
  workflowName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  workflowDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  workflowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workflowStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lastRun: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  workflowActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,166,70,0.15)',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(201,166,70,0.15)',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});