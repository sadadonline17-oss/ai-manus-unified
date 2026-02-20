/**
 * Unified AI Manus - OpenAI Provider
 * Implementation for OpenAI GPT models
 */

import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText, embed } from 'ai';
import { BaseProvider, type ModelInfo } from './interface';
import type { ProviderResponse, StreamChunk, Message, EmbeddingResponse } from '../types';

/**
 * OpenAI Provider
 * Provides access to GPT-4, GPT-3.5, and other OpenAI models
 */
export class OpenAIProvider extends BaseProvider {
  readonly name = 'openai';
  readonly displayName = 'OpenAI';
  
  private client: ReturnType<typeof createOpenAI>;
  
  private staticModels: ModelInfo[] = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      contextWindow: 128000,
      maxOutputTokens: 16384,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsJson: true,
      pricing: { inputPerMillion: 2.5, outputPerMillion: 10 },
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      contextWindow: 128000,
      maxOutputTokens: 16384,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsJson: true,
      pricing: { inputPerMillion: 0.15, outputPerMillion: 0.6 },
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsJson: true,
      pricing: { inputPerMillion: 10, outputPerMillion: 30 },
    },
    {
      id: 'o1',
      name: 'o1',
      provider: 'openai',
      contextWindow: 200000,
      maxOutputTokens: 100000,
      supportsStreaming: true,
      supportsFunctionCalling: false,
      supportsVision: true,
      supportsJson: true,
      pricing: { inputPerMillion: 15, outputPerMillion: 60 },
    },
    {
      id: 'o1-mini',
      name: 'o1 Mini',
      provider: 'openai',
      contextWindow: 128000,
      maxOutputTokens: 65536,
      supportsStreaming: true,
      supportsFunctionCalling: false,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 1.5, outputPerMillion: 6 },
    },
    {
      id: 'o3-mini',
      name: 'o3 Mini',
      provider: 'openai',
      contextWindow: 200000,
      maxOutputTokens: 100000,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 1.1, outputPerMillion: 4.4 },
    },
  ];

  constructor(config: { apiKey?: string; apiBase?: string }) {
    super(config);
    this.client = createOpenAI({
      apiKey: config.apiKey,
      baseURL: config.apiBase,
    });
  }

  async generate(
    messages: Message[],
    options?: import('./interface').GenerateOptions
  ): Promise<ProviderResponse<string>> {
    const model = options?.model || 'gpt-4o-mini';
    const startTime = Date.now();

    try {
      const result = await generateText({
        model: this.client(model),
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
        topP: options?.topP,
        frequencyPenalty: options?.frequencyPenalty,
        presencePenalty: options?.presencePenalty,
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
    const model = options?.model || 'gpt-4o-mini';
    
    const result = streamText({
      model: this.client(model),
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      topP: options?.topP,
      frequencyPenalty: options?.frequencyPenalty,
      presencePenalty: options?.presencePenalty,
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
    const model = options?.model || 'text-embedding-3-small';
    const startTime = Date.now();

    try {
      const { embedding, usage } = await embed({
        model: this.client.embedding(model),
        value: Array.isArray(input) ? input.join('\n') : input,
      });

      return {
        success: true,
        data: {
          embeddings: [embedding],
          model,
          provider: this.name,
          usage: {
            promptTokens: usage.tokens,
            completionTokens: 0,
            totalTokens: usage.tokens,
          },
        },
        provider: this.name,
        model,
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        provider: this.name,
        model,
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.apiKey) return false;
      
      // Simple check - try to list models
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    return [...this.staticModels];
  }
}

export default OpenAIProvider;