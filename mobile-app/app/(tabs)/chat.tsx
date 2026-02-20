/**
 * AI Manus Syria - Chat Screen
 * ==============================
 * Main AI chat interface with provider selection.
 * 
 * @design Syrian Sovereign Emerald – New Identity Edition
 */

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { IslamicPattern } from '../../components/IslamicPattern';
import { Card, Button, Theme } from '../../components/ui';

// Theme Colors
const Colors = Theme.colors;

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  provider?: string;
}

// Available providers
const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', icon: '🤖', color: '#10a37f' },
  { id: 'anthropic', name: 'Anthropic', icon: '🧠', color: '#d97706' },
  { id: 'google', name: 'Google AI', icon: '💎', color: '#4285f4' },
  { id: 'deepseek', name: 'DeepSeek', icon: '🔮', color: '#6366f1' },
  { id: 'groq', name: 'Groq', icon: '⚡', color: '#f97316' },
  { id: 'ollama', name: 'Ollama', icon: '🦙', color: '#22c55e' },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0]);
  const [showProviders, setShowProviders] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Hello! I'm powered by ${selectedProvider.name}. You said: "${userMessage.content}"\n\nI can help you with:\n• Writing code\n• Answering questions\n• Analyzing data\n• And much more!`,
        timestamp: new Date(),
        provider: selectedProvider.name,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  // Render message
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.role === 'user';
    
    return (
      <Animated.View
        entering={FadeInUp.delay(100).duration(300)}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.assistantHeader}>
            <Text style={styles.assistantIcon}>🤖</Text>
            <Text style={styles.assistantName}>{item.provider || 'AI'}</Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Animated.View>
    );
  };

  // Provider selector
  const renderProviderSelector = () => (
    <Animated.View
      entering={FadeInDown.duration(200)}
      style={styles.providerSelector}
    >
      <Text style={styles.providerSelectorTitle}>Select AI Provider</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {PROVIDERS.map(provider => (
          <TouchableOpacity
            key={provider.id}
            style={[
              styles.providerButton,
              selectedProvider.id === provider.id && styles.providerButtonActive,
              { borderColor: provider.color },
            ]}
            onPress={() => {
              setSelectedProvider(provider);
              setShowProviders(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.providerIcon}>{provider.icon}</Text>
            <Text style={styles.providerName}>{provider.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
          <TouchableOpacity
            style={styles.providerSelectorButton}
            onPress={() => setShowProviders(!showProviders)}
            activeOpacity={0.7}
          >
            <Text style={styles.providerSelectorIcon}>{selectedProvider.icon}</Text>
            <Text style={styles.providerSelectorText}>{selectedProvider.name}</Text>
            <Ionicons
              name={showProviders ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.accentSoftGold}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color="#f38ba8" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Provider Selector */}
        {showProviders && renderProviderSelector()}

        {/* Messages */}
        <KeyboardAvoidingView
          style={styles.messagesContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>Start a Conversation</Text>
              <Text style={styles.emptySubtitle}>
                Choose an AI provider and send a message to begin
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={4000}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.primary} size="small" />
              ) : (
                <Ionicons name="send" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  providerSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(201,166,70,0.20)',
  },
  providerSelectorIcon: {
    fontSize: 18,
  },
  providerSelectorText: {
    color: Colors.accentSoftGold,
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    padding: 8,
  },
  providerSelector: {
    backgroundColor: Colors.primaryDark,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,166,70,0.15)',
  },
  providerSelectorTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 4,
    gap: 6,
    borderWidth: 2,
  },
  providerButtonActive: {
    backgroundColor: 'rgba(201,166,70,0.15)',
  },
  providerIcon: {
    fontSize: 16,
  },
  providerName: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  assistantIcon: {
    fontSize: 14,
  },
  assistantName: {
    fontSize: 12,
    color: Colors.accentGold,
    fontWeight: '600',
  },
  messageBubble: {
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: Colors.accentGold,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(201,166,70,0.15)',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  userMessageText: {
    color: Colors.primary,
  },
  timestamp: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    backgroundColor: Colors.primaryDark,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,166,70,0.15)',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(201,166,70,0.15)',
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.accentGold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accentGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(201,166,70,0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
});