/**
 * Unified AI Manus - Additional Providers
 * Google, DeepSeek, Groq, Mistral, OpenRouter, xAI, Cohere, Ollama, LMStudio, etc.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createGroq } from '@ai-sdk/openai';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI as createOpenAIClient } from '@ai-sdk/openai';
import { createXai } from '@ai-sdk/xai';
import { createCohere } from '@ai-sdk/cohere';
import { generateText, streamText } from 'ai';
import { BaseProvider, type ModelInfo } from './interface';
import type { ProviderResponse, StreamChunk, Message, EmbeddingResponse } from '../types';

// ============================================================================
// Google Provider
// ============================================================================

export class GoogleProvider extends BaseProvider {
  readonly name = 'google';
  readonly displayName = 'Google AI';
  
  private client: ReturnType<typeof createGoogleGenerativeAI>;
  
  private staticModels: ModelInfo[] = [
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      provider: 'google',
      contextWindow: 1000000,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsJson: true,
      pricing: { inputPerMillion: 0.1, outputPerMillion: 0.4 },
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'google',
      contextWindow: 2000000,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsJson: true,
      pricing: { inputPerMillion: 1.25, outputPerMillion: 5 },
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'google',
      contextWindow: 1000000,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsJson: true,
      pricing: { inputPerMillion: 0.075, outputPerMillion: 0.3 },
    },
  ];

  constructor(config: { apiKey?: string }) {
    super(config);
    this.client = createGoogleGenerativeAI({ apiKey: config.apiKey });
  }

  async generate(messages: Message[], options?: import('./interface').GenerateOptions): Promise<ProviderResponse<string>> {
    const model = options?.model || 'gemini-1.5-flash';
    const startTime = Date.now();

    try {
      const result = await generateText({
        model: this.client(model),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
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

  async *stream(messages: Message[], options?: import('./interface').GenerateOptions): AsyncGenerator<StreamChunk> {
    const model = options?.model || 'gemini-1.5-flash';
    const result = streamText({
      model: this.client(model),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });

    for await (const chunk of result.textStream) {
      yield { content: chunk, done: false, provider: this.name, model };
    }
    yield { content: '', done: true, provider: this.name, model };
  }

  async embeddings(input: string | string[], options?: import('./interface').EmbeddingOptions): Promise<ProviderResponse<EmbeddingResponse>> {
    return { success: false, error: 'Use OpenAI for embeddings', provider: this.name, model: options?.model || 'unknown' };
  }

  async healthCheck(): Promise<boolean> { return !!this.apiKey; }
  async getModels(): Promise<ModelInfo[]> { return [...this.staticModels]; }
}

// ============================================================================
// DeepSeek Provider
// ============================================================================

export class DeepSeekProvider extends BaseProvider {
  readonly name = 'deepseek';
  readonly displayName = 'DeepSeek';
  
  private client: ReturnType<typeof createDeepSeek>;
  
  private staticModels: ModelInfo[] = [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      provider: 'deepseek',
      contextWindow: 64000,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 0.14, outputPerMillion: 0.28 },
    },
    {
      id: 'deepseek-reasoner',
      name: 'DeepSeek Reasoner',
      provider: 'deepseek',
      contextWindow: 64000,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctionCalling: false,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 0.55, outputPerMillion: 2.19 },
    },
  ];

  constructor(config: { apiKey?: string }) {
    super(config);
    this.client = createDeepSeek({ apiKey: config.apiKey });
  }

  async generate(messages: Message[], options?: import('./interface').GenerateOptions): Promise<ProviderResponse<string>> {
    const model = options?.model || 'deepseek-chat';
    const startTime = Date.now();

    try {
      const result = await generateText({
        model: this.client(model),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
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

  async *stream(messages: Message[], options?: import('./interface').GenerateOptions): AsyncGenerator<StreamChunk> {
    const model = options?.model || 'deepseek-chat';
    const result = streamText({
      model: this.client(model),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });

    for await (const chunk of result.textStream) {
      yield { content: chunk, done: false, provider: this.name, model };
    }
    yield { content: '', done: true, provider: this.name, model };
  }

  async embeddings(input: string | string[], options?: import('./interface').EmbeddingOptions): Promise<ProviderResponse<EmbeddingResponse>> {
    return { success: false, error: 'DeepSeek embeddings not implemented', provider: this.name, model: options?.model || 'unknown' };
  }

  async healthCheck(): Promise<boolean> { return !!this.apiKey; }
  async getModels(): Promise<ModelInfo[]> { return [...this.staticModels]; }
}

// ============================================================================
// Groq Provider
// ============================================================================

export class GroqProvider extends BaseProvider {
  readonly name = 'groq';
  readonly displayName = 'Groq';
  
  private client: ReturnType<typeof createOpenAIClient>;
  
  private staticModels: ModelInfo[] = [
    {
      id: 'llama-3.3-70b-versatile',
      name: 'Llama 3.3 70B Versatile',
      provider: 'groq',
      contextWindow: 128000,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 0.59, outputPerMillion: 0.79 },
    },
    {
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B Instant',
      provider: 'groq',
      contextWindow: 128000,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 0.05, outputPerMillion: 0.08 },
    },
    {
      id: 'mixtral-8x7b-32768',
      name: 'Mixtral 8x7B',
      provider: 'groq',
      contextWindow: 32768,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 0.24, outputPerMillion: 0.24 },
    },
  ];

  constructor(config: { apiKey?: string }) {
    super(config);
    this.client = createOpenAIClient({
      apiKey: config.apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async generate(messages: Message[], options?: import('./interface').GenerateOptions): Promise<ProviderResponse<string>> {
    const model = options?.model || 'llama-3.3-70b-versatile';
    const startTime = Date.now();

    try {
      const result = await generateText({
        model: this.client(model),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
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

  async *stream(messages: Message[], options?: import('./interface').GenerateOptions): AsyncGenerator<StreamChunk> {
    const model = options?.model || 'llama-3.3-70b-versatile';
    const result = streamText({
      model: this.client(model),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });

    for await (const chunk of result.textStream) {
      yield { content: chunk, done: false, provider: this.name, model };
    }
    yield { content: '', done: true, provider: this.name, model };
  }

  async embeddings(input: string | string[], options?: import('./interface').EmbeddingOptions): Promise<ProviderResponse<EmbeddingResponse>> {
    return { success: false, error: 'Groq embeddings not available', provider: this.name, model: options?.model || 'unknown' };
  }

  async healthCheck(): Promise<boolean> { return !!this.apiKey; }
  async getModels(): Promise<ModelInfo[]> { return [...this.staticModels]; }
}

// ============================================================================
// Mistral Provider
// ============================================================================

export class MistralProvider extends BaseProvider {
  readonly name = 'mistral';
  readonly displayName = 'Mistral AI';
  
  private client: ReturnType<typeof createMistral>;
  
  private staticModels: ModelInfo[] = [
    {
      id: 'mistral-large-latest',
      name: 'Mistral Large',
      provider: 'mistral',
      contextWindow: 128000,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 2, outputPerMillion: 6 },
    },
    {
      id: 'mistral-small-latest',
      name: 'Mistral Small',
      provider: 'mistral',
      contextWindow: 128000,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 0.2, outputPerMillion: 0.6 },
    },
    {
      id: 'codestral-latest',
      name: 'Codestral',
      provider: 'mistral',
      contextWindow: 32000,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 0.3, outputPerMillion: 0.9 },
    },
  ];

  constructor(config: { apiKey?: string }) {
    super(config);
    this.client = createMistral({ apiKey: config.apiKey });
  }

  async generate(messages: Message[], options?: import('./interface').GenerateOptions): Promise<ProviderResponse<string>> {
    const model = options?.model || 'mistral-small-latest';
    const startTime = Date.now();

    try {
      const result = await generateText({
        model: this.client(model),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
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

  async *stream(messages: Message[], options?: import('./interface').GenerateOptions): AsyncGenerator<StreamChunk> {
    const model = options?.model || 'mistral-small-latest';
    const result = streamText({
      model: this.client(model),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });

    for await (const chunk of result.textStream) {
      yield { content: chunk, done: false, provider: this.name, model };
    }
    yield { content: '', done: true, provider: this.name, model };
  }

  async embeddings(input: string | string[], options?: import('./interface').EmbeddingOptions): Promise<ProviderResponse<EmbeddingResponse>> {
    return { success: false, error: 'Mistral embeddings not implemented', provider: this.name, model: options?.model || 'unknown' };
  }

  async healthCheck(): Promise<boolean> { return !!this.apiKey; }
  async getModels(): Promise<ModelInfo[]> { return [...this.staticModels]; }
}

// ============================================================================
// xAI Provider
// ============================================================================

export class XAIProvider extends BaseProvider {
  readonly name = 'xai';
  readonly displayName = 'xAI (Grok)';
  
  private client: ReturnType<typeof createXai>;
  
  private staticModels: ModelInfo[] = [
    {
      id: 'grok-2-1212',
      name: 'Grok 2',
      provider: 'xai',
      contextWindow: 131072,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 2, outputPerMillion: 10 },
    },
    {
      id: 'grok-2-vision-1212',
      name: 'Grok 2 Vision',
      provider: 'xai',
      contextWindow: 32768,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsJson: true,
      pricing: { inputPerMillion: 2, outputPerMillion: 10 },
    },
  ];

  constructor(config: { apiKey?: string }) {
    super(config);
    this.client = createXai({ apiKey: config.apiKey });
  }

  async generate(messages: Message[], options?: import('./interface').GenerateOptions): Promise<ProviderResponse<string>> {
    const model = options?.model || 'grok-2-1212';
    const startTime = Date.now();

    try {
      const result = await generateText({
        model: this.client(model),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
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

  async *stream(messages: Message[], options?: import('./interface').GenerateOptions): AsyncGenerator<StreamChunk> {
    const model = options?.model || 'grok-2-1212';
    const result = streamText({
      model: this.client(model),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });

    for await (const chunk of result.textStream) {
      yield { content: chunk, done: false, provider: this.name, model };
    }
    yield { content: '', done: true, provider: this.name, model };
  }

  async embeddings(input: string | string[], options?: import('./interface').EmbeddingOptions): Promise<ProviderResponse<EmbeddingResponse>> {
    return { success: false, error: 'xAI embeddings not available', provider: this.name, model: options?.model || 'unknown' };
  }

  async healthCheck(): Promise<boolean> { return !!this.apiKey; }
  async getModels(): Promise<ModelInfo[]> { return [...this.staticModels]; }
}

// ============================================================================
// Cohere Provider
// ============================================================================

export class CohereProvider extends BaseProvider {
  readonly name = 'cohere';
  readonly displayName = 'Cohere';
  
  private client: ReturnType<typeof createCohere>;
  
  private staticModels: ModelInfo[] = [
    {
      id: 'command-r-plus',
      name: 'Command R+',
      provider: 'cohere',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 2.5, outputPerMillion: 10 },
    },
    {
      id: 'command-r',
      name: 'Command R',
      provider: 'cohere',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 0.5, outputPerMillion: 1.5 },
    },
  ];

  constructor(config: { apiKey?: string }) {
    super(config);
    this.client = createCohere({ apiKey: config.apiKey });
  }

  async generate(messages: Message[], options?: import('./interface').GenerateOptions): Promise<ProviderResponse<string>> {
    const model = options?.model || 'command-r';
    const startTime = Date.now();

    try {
      const result = await generateText({
        model: this.client(model),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
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

  async *stream(messages: Message[], options?: import('./interface').GenerateOptions): AsyncGenerator<StreamChunk> {
    const model = options?.model || 'command-r';
    const result = streamText({
      model: this.client(model),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });

    for await (const chunk of result.textStream) {
      yield { content: chunk, done: false, provider: this.name, model };
    }
    yield { content: '', done: true, provider: this.name, model };
  }

  async embeddings(input: string | string[], options?: import('./interface').EmbeddingOptions): Promise<ProviderResponse<EmbeddingResponse>> {
    return { success: false, error: 'Cohere embeddings not implemented', provider: this.name, model: options?.model || 'unknown' };
  }

  async healthCheck(): Promise<boolean> { return !!this.apiKey; }
  async getModels(): Promise<ModelInfo[]> { return [...this.staticModels]; }
}

// ============================================================================
// Ollama Provider (Local)
// ============================================================================

export class OllamaProvider extends BaseProvider {
  readonly name = 'ollama';
  readonly displayName = 'Ollama (Local)';
  
  private client: ReturnType<typeof createOpenAIClient>;
  
  private defaultModels: ModelInfo[] = [
    {
      id: 'llama3.2',
      name: 'Llama 3.2',
      provider: 'ollama',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 0, outputPerMillion: 0 },
    },
    {
      id: 'llama3.1:70b',
      name: 'Llama 3.1 70B',
      provider: 'ollama',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 0, outputPerMillion: 0 },
    },
    {
      id: 'qwen2.5:72b',
      name: 'Qwen 2.5 72B',
      provider: 'ollama',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 0, outputPerMillion: 0 },
    },
    {
      id: 'deepseek-r1',
      name: 'DeepSeek R1',
      provider: 'ollama',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctionCalling: false,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 0, outputPerMillion: 0 },
    },
  ];

  constructor(config: { apiBase?: string }) {
    super(config);
    this.client = createOpenAIClient({
      baseURL: `${config.apiBase || 'http://127.0.0.1:11434'}/v1`,
      apiKey: 'ollama', // Ollama doesn't need an API key
    });
  }

  isAvailable(): boolean {
    return true; // Ollama is always potentially available locally
  }

  async generate(messages: Message[], options?: import('./interface').GenerateOptions): Promise<ProviderResponse<string>> {
    const model = options?.model || 'llama3.2';
    const startTime = Date.now();

    try {
      const result = await generateText({
        model: this.client(model),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
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

  async *stream(messages: Message[], options?: import('./interface').GenerateOptions): AsyncGenerator<StreamChunk> {
    const model = options?.model || 'llama3.2';
    const result = streamText({
      model: this.client(model),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });

    for await (const chunk of result.textStream) {
      yield { content: chunk, done: false, provider: this.name, model };
    }
    yield { content: '', done: true, provider: this.name, model };
  }

  async embeddings(input: string | string[], options?: import('./interface').EmbeddingOptions): Promise<ProviderResponse<EmbeddingResponse>> {
    return { success: false, error: 'Ollama embeddings not implemented', provider: this.name, model: options?.model || 'unknown' };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase || 'http://127.0.0.1:11434'}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${this.apiBase || 'http://127.0.0.1:11434'}/api/tags`);
      if (response.ok) {
        const data = await response.json() as { models: Array<{ name: string }> };
        return data.models.map((m) => ({
          id: m.name,
          name: m.name,
          provider: 'ollama',
          contextWindow: 128000,
          maxOutputTokens: 4096,
          supportsStreaming: true,
          supportsFunctionCalling: true,
          supportsVision: false,
          supportsJson: true,
          pricing: { inputPerMillion: 0, outputPerMillion: 0 },
        }));
      }
    } catch {
      // Return defaults if can't fetch
    }
    return [...this.defaultModels];
  }
}

// ============================================================================
// LMStudio Provider (Local)
// ============================================================================

export class LMStudioProvider extends BaseProvider {
  readonly name = 'lmstudio';
  readonly displayName = 'LM Studio (Local)';
  
  private client: ReturnType<typeof createOpenAIClient>;

  constructor(config: { apiBase?: string }) {
    super(config);
    this.client = createOpenAIClient({
      baseURL: `${config.apiBase || 'http://127.0.0.1:1234'}/v1`,
      apiKey: 'lmstudio',
    });
  }

  isAvailable(): boolean {
    return true;
  }

  async generate(messages: Message[], options?: import('./interface').GenerateOptions): Promise<ProviderResponse<string>> {
    const model = options?.model || 'local-model';
    const startTime = Date.now();

    try {
      const result = await generateText({
        model: this.client(model),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
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

  async *stream(messages: Message[], options?: import('./interface').GenerateOptions): AsyncGenerator<StreamChunk> {
    const model = options?.model || 'local-model';
    const result = streamText({
      model: this.client(model),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });

    for await (const chunk of result.textStream) {
      yield { content: chunk, done: false, provider: this.name, model };
    }
    yield { content: '', done: true, provider: this.name, model };
  }

  async embeddings(input: string | string[], options?: import('./interface').EmbeddingOptions): Promise<ProviderResponse<EmbeddingResponse>> {
    return { success: false, error: 'LMStudio embeddings not implemented', provider: this.name, model: options?.model || 'unknown' };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase || 'http://127.0.0.1:1234'}/v1/models`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    return [{
      id: 'local-model',
      name: 'Local Model',
      provider: 'lmstudio',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 0, outputPerMillion: 0 },
    }];
  }
}

// ============================================================================
// OpenRouter Provider
// ============================================================================

export class OpenRouterProvider extends BaseProvider {
  readonly name = 'openrouter';
  readonly displayName = 'OpenRouter';
  
  private client: ReturnType<typeof createOpenAIClient>;
  
  private staticModels: ModelInfo[] = [
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet (via OpenRouter)',
      provider: 'openrouter',
      contextWindow: 200000,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsJson: true,
      pricing: { inputPerMillion: 3, outputPerMillion: 15 },
    },
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o (via OpenRouter)',
      provider: 'openrouter',
      contextWindow: 128000,
      maxOutputTokens: 16384,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsJson: true,
      pricing: { inputPerMillion: 2.5, outputPerMillion: 10 },
    },
    {
      id: 'deepseek/deepseek-chat',
      name: 'DeepSeek Chat (via OpenRouter)',
      provider: 'openrouter',
      contextWindow: 64000,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsFunctionCalling: true,
      supportsVision: false,
      supportsJson: true,
      pricing: { inputPerMillion: 0.14, outputPerMillion: 0.28 },
    },
  ];

  constructor(config: { apiKey?: string }) {
    super(config);
    this.client = createOpenAIClient({
      apiKey: config.apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }

  async generate(messages: Message[], options?: import('./interface').GenerateOptions): Promise<ProviderResponse<string>> {
    const model = options?.model || 'openai/gpt-4o';
    const startTime = Date.now();

    try {
      const result = await generateText({
        model: this.client(model),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
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

  async *stream(messages: Message[], options?: import('./interface').GenerateOptions): AsyncGenerator<StreamChunk> {
    const model = options?.model || 'openai/gpt-4o';
    const result = streamText({
      model: this.client(model),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });

    for await (const chunk of result.textStream) {
      yield { content: chunk, done: false, provider: this.name, model };
    }
    yield { content: '', done: true, provider: this.name, model };
  }

  async embeddings(input: string | string[], options?: import('./interface').EmbeddingOptions): Promise<ProviderResponse<EmbeddingResponse>> {
    return { success: false, error: 'OpenRouter embeddings not available', provider: this.name, model: options?.model || 'unknown' };
  }

  async healthCheck(): Promise<boolean> { return !!this.apiKey; }
  async getModels(): Promise<ModelInfo[]> { return [...this.staticModels]; }
}