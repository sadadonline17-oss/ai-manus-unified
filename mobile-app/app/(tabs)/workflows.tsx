/**
 * AI Manus Unified - Workflows Screen
 * =====================================
 * Display and manage automation workflows.
 * 
 * @author AI Manus Unified Team
 * @license MIT
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
import Animated, { FadeInUp } from 'react-native-reanimated';

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
        return '#f9e2af';
      case 'error':
        return '#f38ba8';
      default:
        return '#6c7086';
    }
  };

  const renderWorkflow = ({ item, index }: { item: typeof SAMPLE_WORKFLOWS[0]; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(300)}
      style={styles.workflowCard}
    >
      <TouchableOpacity style={styles.workflowContent}>
        <View style={styles.workflowHeader}>
          <Text style={styles.workflowIcon}>{item.icon}</Text>
          <View style={styles.workflowInfo}>
            <Text style={styles.workflowName}>{item.name}</Text>
            <Text style={styles.workflowDescription}>{item.description}</Text>
          </View>
        </View>
        
        <View style={styles.workflowMeta}>
          <View style={styles.workflowStats}>
            <View style={styles.statItem}>
              <Ionicons name="git-branch" size={14} color="#89b4fa" />
              <Text style={styles.statText}>{item.nodes} nodes</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.lastRun}>Last run: {item.lastRun}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.workflowActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="play" size={18} color="#a6e3a1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create-outline" size={18} color="#89b4fa" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="trash-outline" size={18} color="#f38ba8" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workflows</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#1e1e2e" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{workflows.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#a6e3a1' }]}>
            {workflows.filter(w => w.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#f9e2af' }]}>
            {workflows.filter(w => w.status === 'paused').length}
          </Text>
          <Text style={styles.statLabel}>Paused</Text>
        </View>
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
            tintColor="#89b4fa"
            colors={['#89b4fa']}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11111b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#89b4fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#cdd6f4',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c7086',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  workflowCard: {
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  workflowContent: {
    padding: 16,
  },
  workflowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workflowIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  workflowInfo: {
    flex: 1,
  },
  workflowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#cdd6f4',
    marginBottom: 4,
  },
  workflowDescription: {
    fontSize: 13,
    color: '#6c7086',
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
    color: '#a6adc8',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e1e2e',
    textTransform: 'uppercase',
  },
  lastRun: {
    fontSize: 11,
    color: '#6c7086',
  },
  workflowActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#313244',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#313244',
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
    color: '#cdd6f4',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6c7086',
    textAlign: 'center',
  },
});