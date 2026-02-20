/**
 * Unified AI Manus - Orchestrator
 * Provider routing, failover, and health monitoring
 */

import type {
  ProviderResponse,
  StreamChunk,
  Message,
  ProviderHealth,
  OrchestratorConfig,
  RoutingStrategy,
  GenerateOptions,
} from '../types';
import { providerRegistry } from '../providers';
import { configManager } from '../config';

/**
 * Orchestrator
 * Manages provider selection, failover, and health monitoring
 */
export class Orchestrator {
  private config: OrchestratorConfig;
  private providerHealth: Map<string, ProviderHealth> = new Map();
  private healthCheckInterval?: ReturnType<typeof setInterval>;
  private roundRobinIndex = 0;

  constructor(config?: Partial<OrchestratorConfig>) {
    this.config = {
      ...configManager.orchestrator,
      ...config,
    };
  }

  /**
   * Start the orchestrator
   */
  start(): void {
    console.log('🚀 Starting Orchestrator...');
    
    // Start health check loop
    if (this.config.healthCheckInterval) {
      this.healthCheckInterval = setInterval(
        () => this.runHealthChecks(),
        this.config.healthCheckInterval
      );
    }
    
    // Run initial health check
    this.runHealthChecks();
    
    console.log('✅ Orchestrator started');
  }

  /**
   * Stop the orchestrator
   */
  stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    console.log('🛑 Orchestrator stopped');
  }

  /**
   * Generate completion with automatic provider selection and failover
   */
  async generate(
    messages: Message[],
    options?: GenerateOptions
  ): Promise<ProviderResponse> {
    const providers = this.getAvailableProviders();
    
    if (providers.length === 0) {
      return {
        success: false,
        error: 'No providers available',
        provider: 'none',
        model: options?.model || 'unknown',
      };
    }

    const selectedProviders = this.selectProviders(providers, options);
    
    let lastError: string | undefined;
    
    for (const providerName of selectedProviders) {
      const provider = providerRegistry.get(providerName);
      if (!provider || !provider.isAvailable()) continue;

      try {
        const startTime = Date.now();
        const result = await this.executeWithRetry(
          providerName,
          messages,
          options
        );
        
        // Update health stats on success
        this.updateHealthStats(providerName, Date.now() - startTime, true);
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        this.updateHealthStats(providerName, 0, false);
        
        console.warn(`Provider ${providerName} failed: ${lastError}`);
        
        // Try next provider
        continue;
      }
    }

    return {
      success: false,
      error: `All providers failed. Last error: ${lastError}`,
      provider: 'orchestrator',
      model: options?.model || 'unknown',
    };
  }

  /**
   * Stream completion with automatic provider selection
   */
  async *stream(
    messages: Message[],
    options?: GenerateOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const providers = this.getAvailableProviders();
    
    if (providers.length === 0) {
      yield {
        content: '',
        done: true,
        provider: 'none',
        model: options?.model || 'unknown',
      };
      return;
    }

    const selectedProvider = this.selectProviders(providers, options)[0];
    
    if (!selectedProvider) {
      yield {
        content: '',
        done: true,
        provider: 'none',
        model: options?.model || 'unknown',
      };
      return;
    }

    yield* providerRegistry.stream(selectedProvider, messages, options);
  }

  /**
   * Get available providers
   */
  private getAvailableProviders(): string[] {
    return providerRegistry.getAvailable().map((p) => p.name);
  }

  /**
   * Select providers based on routing strategy
   */
  private selectProviders(
    available: string[],
    options?: GenerateOptions
  ): string[] {
    // If specific provider requested, use it
    if (options?.provider) {
      return [options.provider, ...this.config.fallbackProviders || []];
    }

    // If specific model requested, find its provider
    if (options?.model) {
      // For now, use default provider for specific models
      // In production, would look up model -> provider mapping
    }

    // Apply routing strategy
    switch (this.config.routingStrategy.type) {
      case 'round-robin':
        return this.roundRobinSelect(available);
      
      case 'least-latency':
        return this.leastLatencySelect(available);
      
      case 'cost-aware':
        return this.costAwareSelect(available);
      
      case 'region-based':
        return this.regionBasedSelect(available);
      
      case 'failover':
      default:
        return this.failoverSelect(available);
    }
  }

  /**
   * Round-robin provider selection
   */
  private roundRobinSelect(available: string[]): string[] {
    const sorted = [...available].sort();
    const selected = sorted[this.roundRobinIndex % sorted.length];
    this.roundRobinIndex++;
    
    return [
      selected,
      ...sorted.filter((p) => p !== selected),
      ...(this.config.fallbackProviders || []),
    ];
  }

  /**
   * Least-latency provider selection
   */
  private leastLatencySelect(available: string[]): string[] {
    const withLatency = available.map((name) => ({
      name,
      latency: this.providerHealth.get(name)?.latency || Infinity,
    }));

    withLatency.sort((a, b) => a.latency - b.latency);

    return [
      ...withLatency.map((p) => p.name),
      ...(this.config.fallbackProviders || []),
    ];
  }

  /**
   * Cost-aware provider selection
   */
  private costAwareSelect(available: string[]): string[] {
    // Order by cost (cheapest first)
    const costOrder = ['ollama', 'lmstudio', 'deepseek', 'groq', 'mistral', 'openai', 'anthropic'];
    
    const sorted = [...available].sort((a, b) => {
      const aIndex = costOrder.indexOf(a);
      const bIndex = costOrder.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    return [...sorted, ...(this.config.fallbackProviders || [])];
  }

  /**
   * Region-based provider selection
   */
  private regionBasedSelect(available: string[]): string[] {
    // For now, just use default provider order
    // In production, would consider user region and provider regions
    const defaultOrder = [this.config.defaultProvider, ...available.filter(p => p !== this.config.defaultProvider)];
    return [...new Set([...defaultOrder, ...(this.config.fallbackProviders || [])])];
  }

  /**
   * Failover provider selection
   */
  private failoverSelect(available: string[]): string[] {
    const defaultProvider = this.config.defaultProvider;
    
    if (defaultProvider && available.includes(defaultProvider)) {
      return [
        defaultProvider,
        ...available.filter((p) => p !== defaultProvider),
        ...(this.config.fallbackProviders || []),
      ];
    }

    return [...available, ...(this.config.fallbackProviders || [])];
  }

  /**
   * Execute with retry logic
   */
  private async executeWithRetry(
    providerName: string,
    messages: Message[],
    options?: GenerateOptions,
    attempt = 1
  ): Promise<ProviderResponse> {
    try {
      return await providerRegistry.generate(providerName, messages, {
        ...options,
        timeout: options?.timeout || this.config.timeout,
      });
    } catch (error) {
      if (attempt < (this.config.maxRetries || 3)) {
        const backoff = (this.config.retryBackoffMs || 1000) * attempt;
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return this.executeWithRetry(providerName, messages, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Run health checks on all providers
   */
  private async runHealthChecks(): Promise<void> {
    const providers = providerRegistry.getAll();
    
    await Promise.all(
      providers.map(async (provider) => {
        const startTime = Date.now();
        try {
          const healthy = await provider.healthCheck();
          const latency = Date.now() - startTime;
          
          this.updateHealth(provider.name, {
            name: provider.name,
            status: healthy ? 'healthy' : 'unhealthy',
            latency,
            lastCheck: new Date(),
            errorRate: this.calculateErrorRate(provider.name),
            totalRequests: this.getTotalRequests(provider.name),
            failedRequests: this.getFailedRequests(provider.name),
          });
        } catch {
          this.updateHealth(provider.name, {
            name: provider.name,
            status: 'unhealthy',
            latency: 0,
            lastCheck: new Date(),
            errorRate: 1,
            totalRequests: this.getTotalRequests(provider.name),
            failedRequests: this.getFailedRequests(provider.name) + 1,
          });
        }
      })
    );
  }

  /**
   * Update health stats for a provider
   */
  private updateHealthStats(provider: string, latency: number, success: boolean): void {
    const current = this.providerHealth.get(provider);
    
    this.providerHealth.set(provider, {
      name: provider,
      status: success ? 'healthy' : 'degraded',
      latency: current ? (current.latency + latency) / 2 : latency,
      lastCheck: new Date(),
      errorRate: this.calculateErrorRate(provider, success),
      totalRequests: (current?.totalRequests || 0) + 1,
      failedRequests: (current?.failedRequests || 0) + (success ? 0 : 1),
    });
  }

  /**
   * Update health for a provider
   */
  private updateHealth(provider: string, health: ProviderHealth): void {
    this.providerHealth.set(provider, health);
  }

  /**
   * Calculate error rate for a provider
   */
  private calculateErrorRate(provider: string, success?: boolean): number {
    const health = this.providerHealth.get(provider);
    if (!health) return success === false ? 1 : 0;
    
    const total = health.totalRequests + 1;
    const failed = health.failedRequests + (success === false ? 1 : 0);
    return failed / total;
  }

  /**
   * Get total requests for a provider
   */
  private getTotalRequests(provider: string): number {
    return this.providerHealth.get(provider)?.totalRequests || 0;
  }

  /**
   * Get failed requests for a provider
   */
  private getFailedRequests(provider: string): number {
    return this.providerHealth.get(provider)?.failedRequests || 0;
  }

  /**
   * Get health status for all providers
   */
  getHealthStatus(): Map<string, ProviderHealth> {
    return new Map(this.providerHealth);
  }

  /**
   * Get orchestrator statistics
   */
  getStats(): {
    config: OrchestratorConfig;
    providers: number;
    healthyProviders: number;
    healthStatus: Map<string, ProviderHealth>;
  } {
    const healthy = Array.from(this.providerHealth.values()).filter(
      (h) => h.status === 'healthy'
    ).length;

    return {
      config: this.config,
      providers: this.providerHealth.size,
      healthyProviders: healthy,
      healthStatus: this.getHealthStatus(),
    };
  }
}

// Export singleton instance
export const orchestrator = new Orchestrator();
export default orchestrator;