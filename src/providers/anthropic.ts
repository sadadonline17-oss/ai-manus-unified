/**
 * Unified AI Manus - Anthropic Provider
 * Implementation for Claude models
 */

import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText, streamText } from 'ai';
import { BaseProvider, type ModelInfo } from './interface';
import type { ProviderResponse, StreamChunk, Message, EmbeddingResponse } from '../types';

/**
 * Anthropic Provider
 * Provides access to Claude 3.5, Claude 3, and other Anthropic models
 */
export class AnthropicProvider extends BaseProvider {
  readonly name = 'anthropic';
  readonly displayName = 'Anthropic';
  
  private client: ReturnType<typeof createAnthropic>;
  
  private staticModels: ModelInfo[] = [
    {
      id: 'claude-sonnet-4-20250514',
      name: 'Claude Sonnet 4',
      provider: 'anthropic',
      contextWindow: 200000,
      maxOutputTokens: 16000,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsJson: true,
      pricing: { inputPerMillion: 3, outputPerMillion: 15 },
    },
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      contextWindow: 200000,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsJson: true,
      pricing: { inputPerMillion: 3, outputPerMillion: 15 },
    },
    {
      id: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku',
      provider: 'anthropic',
      contextWindow: 200000,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsJson: true,
      pricing: { inputPerMillion: 0.8, outputPerMillion: 4 },
    },
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      contextWindow: 200000,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsJson: true,
      pricing: { inputPerMillion: 15, outputPerMillion: 75 },
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      contextWindow: 200000,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsJson: true,
      pricing: { inputPerMillion: 3, outputPerMillion: 15 },
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      contextWindow: 200000,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsJson: true,
      pricing: { inputPerMillion: 0.25, outputPerMillion: 1.25 },
    },
  ];

  constructor(config: { apiKey?: string }) {
    super(config);
    this.client = createAnthropic({
      apiKey: config.apiKey,
    });
  }

  async generate(
    messages: Message[],
    options?: import('./interface').GenerateOptions
  ): Promise<ProviderResponse<string>> {
    const model = options?.model || 'claude-3-5-sonnet-20241022';
    const startTime = Date.now();

    try {
      // Extract system message if present
      const systemMessage = messages.find((m) => m.role === 'system');
      const otherMessages = messages.filter((m) => m.role !== 'system');

      const result = await generateText({
        model: this.client(model),
        system: systemMessage?.content,
        messages: otherMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
        topP: options?.topP,
        stop: options?.stop,
      });

      return this.createSuccessResponse(result.text, model, {
        promptTokens: result.usage?.promptTokens ?? 0,
        completionTokens: result.usage?.completionTokens ?? 0,
        totalTokens: result.usage?.totalTokens ?? 0,
      }, Date.now() - startTime);
    } catch (error) {
      return this.createErrorResponse(error, model);
    }
  }

  async *stream(
    messages: Message[],
    options?: import('./interface').GenerateOptions
  ): AsyncGenerator<StreamChunk> {
    const model = options?.model || 'claude-3-5-sonnet-20241022';
    
    // Extract system message if present
    const systemMessage = messages.find((m) => m.role === 'system');
    const otherMessages = messages.filter((m) => m.role !== 'system');

    const result = streamText({
      model: this.client(model),
      system: systemMessage?.content,
      messages: otherMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      topP: options?.topP,
      stop: options?.stop,
    });

    for await (const chunk of result.textStream) {
      yield {
        content: chunk,
        done: false,
        provider: this.name,
        model,
      };
    }

    yield {
      content: '',
      done: true,
      provider: this.name,
      model,
    };
  }

  async embeddings(
    input: string | string[],
    options?: import('./interface').EmbeddingOptions
  ): Promise<ProviderResponse<EmbeddingResponse>> {
    // Anthropic doesn't have an embeddings API
    return {
      success: false,
      error: 'Anthropic does not provide an embeddings API. Use OpenAI or another provider for embeddings.',
      provider: this.name,
      model: options?.model || 'unknown',
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.apiKey) return false;
      
      // Anthropic doesn't have a simple health endpoint
      // Just check if API key is present and valid format
      return this.apiKey.startsWith('sk-ant-');
    } catch {
      return false;
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    return [...this.staticModels];
  }
}

export default AnthropicProvider;