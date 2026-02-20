/**
 * Unified AI Manus - Provider Interface
 * Standard interface that all AI providers must implement
 */

import type { ProviderResponse, StreamChunk, Message, EmbeddingResponse } from '../types';

/**
 * Model Information
 */
export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  maxOutputTokens: number;
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsVision: boolean;
  supportsJson: boolean;
  pricing?: {
    inputPerMillion: number;
    outputPerMillion: number;
  };
}

/**
 * Generate Options
 */
export interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  tools?: unknown[];
  toolChoice?: unknown;
  responseFormat?: { type: 'text' | 'json_object' };
  timeout?: number;
}

/**
 * Embedding Options
 */
export interface EmbeddingOptions {
  model?: string;
}

/**
 * Base Provider Interface
 * All providers must implement these methods
 */
export interface IProvider {
  readonly name: string;
  readonly displayName: string;
  
  /**
   * Check if provider is available (has API key configured)
   */
  isAvailable(): boolean;
  
  /**
   * Generate a completion
   */
  generate(
    messages: Message[],
    options?: GenerateOptions
  ): Promise<ProviderResponse<string>>;
  
  /**
   * Stream a completion
   */
  stream(
    messages: Message[],
    options?: GenerateOptions
  ): AsyncGenerator<StreamChunk, void, unknown>;
  
  /**
   * Generate embeddings
   */
  embeddings(
    input: string | string[],
    options?: EmbeddingOptions
  ): Promise<ProviderResponse<EmbeddingResponse>>;
  
  /**
   * Check provider health
   */
  healthCheck(): Promise<boolean>;
  
  /**
   * Get available models
   */
  getModels(): Promise<ModelInfo[]>;
}

/**
 * Abstract Base Provider
 * Provides common functionality for all providers
 */
export abstract class BaseProvider implements IProvider {
  abstract readonly name: string;
  abstract readonly displayName: string;
  
  protected apiKey?: string;
  protected apiBase?: string;
  
  constructor(config: { apiKey?: string; apiBase?: string }) {
    this.apiKey = config.apiKey;
    this.apiBase = config.apiBase;
  }
  
  isAvailable(): boolean {
    return !!this.apiKey;
  }
  
  abstract generate(
    messages: Message[],
    options?: GenerateOptions
  ): Promise<ProviderResponse<string>>;
  
  abstract stream(
    messages: Message[],
    options?: GenerateOptions
  ): AsyncGenerator<StreamChunk, void, unknown>;
  
  abstract embeddings(
    input: string | string[],
    options?: EmbeddingOptions
  ): Promise<ProviderResponse<EmbeddingResponse>>;
  
  abstract healthCheck(): Promise<boolean>;
  
  abstract getModels(): Promise<ModelInfo[]>;
  
  /**
   * Create a success response
   */
  protected createSuccessResponse(
    data: string,
    model: string,
    usage: { promptTokens: number; completionTokens: number; totalTokens: number },
    latency: number
  ): ProviderResponse<string> {
    return {
      success: true,
      data,
      provider: this.name,
      model,
      usage,
      latency,
    };
  }
  
  /**
   * Create an error response
   */
  protected createErrorResponse(error: unknown, model: string): ProviderResponse<string> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMessage,
      provider: this.name,
      model,
    };
  }
}

export type { IProvider as Provider };