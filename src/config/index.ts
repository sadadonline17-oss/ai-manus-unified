/**
 * Unified AI Manus - Configuration Manager
 * Centralized configuration loading and validation
 */

import { config } from 'dotenv';
import { z } from 'zod';
import type {
  AppConfig,
  DatabaseConfig,
  RedisConfig,
  SandboxConfig,
  SearchConfig,
  AuthConfig,
  OrchestratorConfig,
} from '../types';

// Load environment variables
config();

// ============================================================================
// Configuration Schemas
// ============================================================================

const ApiKeysSchema = z.object({
  openai: z.string().optional(),
  anthropic: z.string().optional(),
  google: z.string().optional(),
  groq: z.string().optional(),
  mistral: z.string().optional(),
  deepseek: z.string().optional(),
  openrouter: z.string().optional(),
  xai: z.string().optional(),
  cohere: z.string().optional(),
  together: z.string().optional(),
  perplexity: z.string().optional(),
  huggingface: z.string().optional(),
  moonshot: z.string().optional(),
  hyperbolic: z.string().optional(),
  github: z.string().optional(),
  ollama: z.string().optional(),
  lmstudio: z.string().optional(),
});

// ============================================================================
// Configuration Manager
// ============================================================================

class ConfigManager {
  private _config: AppConfig;
  private _apiKeys: z.infer<typeof ApiKeysSchema>;

  constructor() {
    this._apiKeys = this.loadApiKeys();
    this._config = this.loadConfig();
  }

  private loadApiKeys(): z.infer<typeof ApiKeysSchema> {
    return {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      groq: process.env.GROQ_API_KEY,
      mistral: process.env.MISTRAL_API_KEY,
      deepseek: process.env.DEEPSEEK_API_KEY,
      openrouter: process.env.OPEN_ROUTER_API_KEY,
      xai: process.env.XAI_API_KEY,
      cohere: process.env.COHERE_API_KEY,
      together: process.env.TOGETHER_API_KEY,
      perplexity: process.env.PERPLEXITY_API_KEY,
      huggingface: process.env.HUGGINGFACE_API_KEY,
      moonshot: process.env.MOONSHOT_API_KEY,
      hyperbolic: process.env.HYPERBOLIC_API_KEY,
      github: process.env.GITHUB_TOKEN,
      ollama: process.env.OLLAMA_API_BASE_URL,
      lmstudio: process.env.LMSTUDIO_API_BASE_URL,
    };
  }

  private loadConfig(): AppConfig {
    return {
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || '0.0.0.0',
      nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      logLevel: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
      database: this.loadDatabaseConfig(),
      redis: this.loadRedisConfig(),
      sandbox: this.loadSandboxConfig(),
      search: this.loadSearchConfig(),
      auth: this.loadAuthConfig(),
      orchestrator: this.loadOrchestratorConfig(),
    };
  }

  private loadDatabaseConfig(): DatabaseConfig {
    return {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      name: process.env.MONGODB_DATABASE || 'manus',
      username: process.env.MONGODB_USERNAME,
      password: process.env.MONGODB_PASSWORD,
    };
  }

  private loadRedisConfig(): RedisConfig {
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      db: parseInt(process.env.REDIS_DB || '0', 10),
      password: process.env.REDIS_PASSWORD,
    };
  }

  private loadSandboxConfig(): SandboxConfig {
    return {
      image: process.env.SANDBOX_IMAGE || 'ai-manus-sandbox',
      namePrefix: process.env.SANDBOX_NAME_PREFIX || 'sandbox',
      ttlMinutes: parseInt(process.env.SANDBOX_TTL_MINUTES || '30', 10),
      network: process.env.SANDBOX_NETWORK || 'manus-network',
      chromeArgs: process.env.SANDBOX_CHROME_ARGS?.split(','),
      httpsProxy: process.env.SANDBOX_HTTPS_PROXY,
      httpProxy: process.env.SANDBOX_HTTP_PROXY,
      noProxy: process.env.SANDBOX_NO_PROXY?.split(','),
    };
  }

  private loadSearchConfig(): SearchConfig {
    return {
      provider: (process.env.SEARCH_PROVIDER as 'baidu' | 'google' | 'bing') || 'bing',
      apiKey: process.env.GOOGLE_SEARCH_API_KEY || process.env.BING_SEARCH_API_KEY,
      engineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
    };
  }

  private loadAuthConfig(): AuthConfig {
    return {
      provider: (process.env.AUTH_PROVIDER as 'password' | 'none' | 'local') || 'local',
      jwtSecret: process.env.JWT_SECRET_KEY || 'dev-secret-key-change-in-production',
      jwtAlgorithm: process.env.JWT_ALGORITHM || 'HS256',
      accessTokenExpireMinutes: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRE_MINUTES || '30', 10),
      refreshTokenExpireDays: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRE_DAYS || '7', 10),
    };
  }

  private loadOrchestratorConfig(): OrchestratorConfig {
    return {
      providers: [],
      defaultProvider: process.env.ORCHESTRATOR_DEFAULT_PROVIDER || 'openai',
      fallbackProviders: (process.env.ORCHESTRATOR_FALLBACK_PROVIDERS || 'anthropic,deepseek').split(','),
      routingStrategy: {
        type: (process.env.ORCHESTRATOR_ROUTING_STRATEGY as 'round-robin' | 'least-latency' | 'cost-aware' | 'region-based' | 'failover') || 'least-latency',
      },
      healthCheckInterval: parseInt(process.env.ORCHESTRATOR_HEALTH_CHECK_INTERVAL || '60000', 10),
      maxRetries: parseInt(process.env.ORCHESTRATOR_MAX_RETRIES || '3', 10),
      retryBackoffMs: parseInt(process.env.ORCHESTRATOR_RETRY_BACKOFF_MS || '1000', 10),
      timeout: parseInt(process.env.ORCHESTRATOR_TIMEOUT || '30000', 10),
    };
  }

  // ==========================================================================
  // Public Getters
  // ==========================================================================

  get config(): AppConfig {
    return this._config;
  }

  get apiKeys(): z.infer<typeof ApiKeysSchema> {
    return this._apiKeys;
  }

  get port(): number {
    return this._config.port;
  }

  get host(): string {
    return this._config.host;
  }

  get nodeEnv(): string {
    return this._config.nodeEnv;
  }

  get database(): DatabaseConfig {
    return this._config.database;
  }

  get redis(): RedisConfig {
    return this._config.redis;
  }

  get sandbox(): SandboxConfig {
    return this._config.sandbox;
  }

  get search(): SearchConfig {
    return this._config.search;
  }

  get auth(): AuthConfig {
    return this._config.auth;
  }

  get orchestrator(): OrchestratorConfig {
    return this._config.orchestrator;
  }

  // ==========================================================================
  // Validation
  // ==========================================================================

  /**
   * Validate configuration for production
   */
  validateProduction(): void {
    const errors: string[] = [];

    // Check for default JWT secret
    if (this._config.auth.jwtSecret === 'dev-secret-key-change-in-production') {
      errors.push('JWT_SECRET_KEY must be set in production');
    }

    // Check for at least one AI provider
    const hasProvider = Object.values(this._apiKeys).some((key) => key && key.length > 0);
    if (!hasProvider) {
      errors.push('At least one AI provider API key must be configured');
    }

    if (errors.length > 0) {
      console.warn('\n⚠️  Configuration warnings:');
      errors.forEach((err) => console.warn(`   - ${err}`));
      console.warn('');
    }
  }

  /**
   * Get available providers (those with API keys configured)
   */
  getAvailableProviders(): string[] {
    const available: string[] = [];
    
    for (const [provider, key] of Object.entries(this._apiKeys)) {
      if (key && key.length > 0) {
        available.push(provider);
      }
    }
    
    return available;
  }

  /**
   * Print configuration summary
   */
  printSummary(): void {
    console.log('\n📋 Configuration Summary:');
    console.log(`   Environment: ${this._config.nodeEnv}`);
    console.log(`   Port: ${this._config.port}`);
    console.log(`   Host: ${this._config.host}`);
    console.log(`   Database: ${this._config.database.uri}/${this._config.database.name}`);
    console.log(`   Redis: ${this._config.redis.host}:${this._config.redis.port}`);
    console.log(`   Search Provider: ${this._config.search.provider}`);
    console.log(`   Default AI Provider: ${this._config.orchestrator.defaultProvider}`);
    console.log(`   Available Providers: ${this.getAvailableProviders().join(', ') || 'None configured'}`);
    console.log('');
  }
}

// Export singleton instance
export const configManager = new ConfigManager();
export default configManager;