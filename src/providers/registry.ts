/**
 * Unified AI Manus - Provider Registry
 * Dynamic provider registration and management
 */

import type { IProvider, ModelInfo, GenerateOptions } from './interface';
import type { ProviderResponse, StreamChunk, Message } from '../types';

/**
 * Provider Registry
 * Manages all registered AI providers
 */
class ProviderRegistry {
  private providers: Map<string, IProvider> = new Map();

  /**
   * Register a provider
   */
  register(provider: IProvider): void {
    if (this.providers.has(provider.name)) {
      console.warn(`Provider "${provider.name}" already registered, replacing...`);
    }
    
    this.providers.set(provider.name, provider);
    console.log(`✅ Registered provider: ${provider.displayName} (${provider.name})`);
  }

  /**
   * Unregister a provider
   */
  unregister(name: string): boolean {
    return this.providers.delete(name);
  }

  /**
   * Get a provider by name
   */
  get(name: string): IProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Check if a provider is registered
   */
  has(name: string): boolean {
    return this.providers.has(name);
  }

  /**
   * Get all registered providers
   */
  getAll(): IProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get all available providers (those with API keys)
   */
  getAvailable(): IProvider[] {
    return this.getAll().filter((p) => p.isAvailable());
  }

  /**
   * Get all provider names
   */
  getNames(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get all models from all providers
   */
  async getAllModels(): Promise<ModelInfo[]> {
    const models: ModelInfo[] = [];
    
    for (const provider of this.providers.values()) {
      try {
        const providerModels = await provider.getModels();
        models.push(...providerModels);
      } catch (error) {
        console.warn(`Failed to get models from ${provider.name}:`, error);
      }
    }
    
    return models;
  }

  /**
   * Generate completion using specified provider
   */
  async generate(
    providerName: string,
    messages: Message[],
    options?: GenerateOptions
  ): Promise<ProviderResponse<string>> {
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      return {
        success: false,
        error: `Provider "${providerName}" not found`,
        provider: providerName,
        model: options?.model || 'unknown',
      };
    }
    
    if (!provider.isAvailable()) {
      return {
        success: false,
        error: `Provider "${providerName}" is not available (missing API key)`,
        provider: providerName,
        model: options?.model || 'unknown',
      };
    }
    
    return provider.generate(messages, options);
  }

  /**
   * Stream completion using specified provider
   */
  async *stream(
    providerName: string,
    messages: Message[],
    options?: GenerateOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      yield {
        content: '',
        done: true,
        provider: providerName,
        model: options?.model || 'unknown',
      };
      return;
    }
    
    if (!provider.isAvailable()) {
      yield {
        content: '',
        done: true,
        provider: providerName,
        model: options?.model || 'unknown',
      };
      return;
    }
    
    yield* provider.stream(messages, options);
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalProviders: number;
    availableProviders: number;
    providers: Array<{ name: string; displayName: string; available: boolean }>;
  } {
    const providers = this.getAll().map((p) => ({
      name: p.name,
      displayName: p.displayName,
      available: p.isAvailable(),
    }));
    
    return {
      totalProviders: this.providers.size,
      availableProviders: providers.filter((p) => p.available).length,
      providers,
    };
  }

  /**
   * Clear all registered providers
   */
  clear(): void {
    this.providers.clear();
  }
}

// Export singleton instance
export const providerRegistry = new ProviderRegistry();
export default providerRegistry;