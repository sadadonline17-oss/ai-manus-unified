/**
 * Unified AI Manus - Type Definitions
 * Central type definitions for the entire platform
 */

// ============================================================================
// Provider Types
// ============================================================================

export interface ProviderConfig {
  name: string;
  apiKey?: string;
  apiBase?: string;
  settings?: ProviderSettings;
}

export interface ProviderSettings {
  enabled?: boolean;
  baseUrl?: string;
  region?: string;
  [key: string]: unknown;
}

export interface ProviderResponse<T = string> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: TokenUsage;
  provider: string;
  model: string;
  latency?: number;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  provider: string;
  model: string;
  toolCalls?: ToolCall[];
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  provider: string;
  usage: TokenUsage;
}

export interface ProviderHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency: number;
  lastCheck: Date;
  errorRate: number;
  totalRequests: number;
  failedRequests: number;
}

// ============================================================================
// Message Types
// ============================================================================

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  timestamp?: Date;
  toolCalls?: ToolCall[];
  toolCallId?: string;
  functionName?: string;
}

export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolSchema {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

// ============================================================================
// Tool Types
// ============================================================================

export type ToolCategory = 'shell' | 'file' | 'browser' | 'search' | 'mcp' | 'message' | 'plan' | 'other';

export interface ToolResult {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

export interface ToolExecutionContext {
  sessionId?: string;
  agentId?: string;
  userId?: string;
  [key: string]: unknown;
}

// ============================================================================
// Agent Types
// ============================================================================

export interface AgentConfig {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  provider: string;
  tools?: string[];
  maxIterations?: number;
  temperature?: number;
  maxTokens?: number;
}

export type AgentStatus = 'idle' | 'thinking' | 'executing' | 'error';

export interface AgentState {
  id: string;
  status: AgentStatus;
  memory: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentEvent {
  type: 'message' | 'tool_call' | 'tool_result' | 'error' | 'done';
  message?: string;
  toolCallId?: string;
  toolName?: string;
  functionName?: string;
  functionArgs?: Record<string, unknown>;
  functionResult?: ToolResult;
  status?: 'calling' | 'success' | 'error';
  error?: string;
  success?: boolean;
  timestamp: Date;
}

// ============================================================================
// Orchestrator Types
// ============================================================================

export interface OrchestratorConfig {
  providers: ProviderConfig[];
  defaultProvider: string;
  fallbackProviders: string[];
  routingStrategy: RoutingStrategy;
  healthCheckInterval: number;
  maxRetries: number;
  retryBackoffMs: number;
  timeout: number;
}

export interface RoutingStrategy {
  type: 'round-robin' | 'least-latency' | 'cost-aware' | 'region-based' | 'failover';
  region?: string;
}

export interface GenerateOptions {
  model?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  tools?: ToolSchema[];
  toolChoice?: 'auto' | 'none' | 'required' | { type: 'function'; function: { name: string } };
  responseFormat?: { type: 'text' | 'json_object' };
  stream?: boolean;
  timeout?: number;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface AppConfig {
  port: number;
  host: string;
  nodeEnv: 'development' | 'production' | 'test';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  database: DatabaseConfig;
  redis: RedisConfig;
  sandbox: SandboxConfig;
  search: SearchConfig;
  auth: AuthConfig;
  orchestrator: OrchestratorConfig;
}

export interface DatabaseConfig {
  uri: string;
  name: string;
  username?: string;
  password?: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  db: number;
  password?: string;
}

export interface SandboxConfig {
  image: string;
  namePrefix: string;
  ttlMinutes: number;
  network: string;
  chromeArgs?: string[];
  httpsProxy?: string;
  httpProxy?: string;
  noProxy?: string[];
}

export interface SearchConfig {
  provider: 'baidu' | 'google' | 'bing';
  apiKey?: string;
  engineId?: string;
}

export interface AuthConfig {
  provider: 'password' | 'none' | 'local';
  jwtSecret: string;
  jwtAlgorithm: string;
  accessTokenExpireMinutes: number;
  refreshTokenExpireDays: number;
}

// ============================================================================
// API Types
// ============================================================================

export interface ChatRequest {
  messages: Message[];
  model?: string;
  provider?: string;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
  provider: string;
  model: string;
  usage?: TokenUsage;
}

// ============================================================================
// Event Types
// ============================================================================

export interface BaseEvent {
  type: string;
  timestamp: Date;
}

export interface ToolEvent extends BaseEvent {
  type: 'tool_call' | 'tool_result';
  toolCallId: string;
  toolName: string;
  functionName: string;
  functionArgs: Record<string, unknown>;
  functionResult?: ToolResult;
  status: 'calling' | 'called' | 'success' | 'error';
}

export interface MessageEvent extends BaseEvent {
  type: 'message';
  message: string;
}

export interface ErrorEvent extends BaseEvent {
  type: 'error';
  error: string;
}

export interface DoneEvent extends BaseEvent {
  type: 'done';
  success: boolean;
}

export type Event = ToolEvent | MessageEvent | ErrorEvent | DoneEvent;