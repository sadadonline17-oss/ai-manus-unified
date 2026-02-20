/**
 * Unified AI Manus - Provider System
 * Main entry point for all AI providers
 */

// Export types and interfaces
export * from './interface';
export * from './registry';

// Export individual providers
export { OpenAIProvider } from './openai';
export { AnthropicProvider } from './anthropic';
export {
  GoogleProvider,
  DeepSeekProvider,
  GroqProvider,
  MistralProvider,
  XAIProvider,
  CohereProvider,
  OllamaProvider,
  LMStudioProvider,
  OpenRouterProvider,
} from './additional';

// Import for registration
import { providerRegistry } from './registry';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import {
  GoogleProvider,
  DeepSeekProvider,
  GroqProvider,
  MistralProvider,
  XAIProvider,
  CohereProvider,
  OllamaProvider,
  LMStudioProvider,
  OpenRouterProvider,
} from './additional';
import { configManager } from '../config';

/**
 * Initialize all providers from configuration
 */
export function initializeProviders(): void {
  const apiKeys = configManager.apiKeys;

  // OpenAI
  if (apiKeys.openai) {
    providerRegistry.register(
      new OpenAIProvider({
        apiKey: apiKeys.openai,
        apiBase: process.env.OPENAI_API_BASE,
      })
    );
  }

  // Anthropic
  if (apiKeys.anthropic) {
    providerRegistry.register(new AnthropicProvider({ apiKey: apiKeys.anthropic }));
  }

  // Google
  if (apiKeys.google) {
    providerRegistry.register(new GoogleProvider({ apiKey: apiKeys.google }));
  }

  // DeepSeek
  if (apiKeys.deepseek) {
    providerRegistry.register(new DeepSeekProvider({ apiKey: apiKeys.deepseek }));
  }

  // Groq
  if (apiKeys.groq) {
    providerRegistry.register(new GroqProvider({ apiKey: apiKeys.groq }));
  }

  // Mistral
  if (apiKeys.mistral) {
    providerRegistry.register(new MistralProvider({ apiKey: apiKeys.mistral }));
  }

  // xAI
  if (apiKeys.xai) {
    providerRegistry.register(new XAIProvider({ apiKey: apiKeys.xai }));
  }

  // Cohere
  if (apiKeys.cohere) {
    providerRegistry.register(new CohereProvider({ apiKey: apiKeys.cohere }));
  }

  // OpenRouter
  if (apiKeys.openrouter) {
    providerRegistry.register(new OpenRouterProvider({ apiKey: apiKeys.openrouter }));
  }

  // Local providers (always register)
  providerRegistry.register(
    new OllamaProvider({ apiBase: apiKeys.ollama })
  );
  
  providerRegistry.register(
    new LMStudioProvider({ apiBase: apiKeys.lmstudio })
  );

  console.log(`✅ Initialized ${providerRegistry.getStats().totalProviders} AI providers`);
}

// Auto-initialize on import
initializeProviders();

// Export the registry as default
export default providerRegistry;