/**
 * Unified AI Manus - Main Entry Point
 * Single server entry point for the AI Agent Enterprise Platform
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// Import all modules
import './providers';
import './tools';
import { providerRegistry } from './providers';
import { toolRegistry } from './tools';
import { orchestrator } from './orchestrator';
import { BaseAgent, AgentFactory } from './agent';
import { configManager } from './config';
import type { Message, AgentConfig, ChatRequest } from './types';

// ============================================================================
// Application Setup
// ============================================================================

const app = new Hono();
const PORT = configManager.port;
const HOST = configManager.host;

// Middleware
app.use('*', cors());
app.use('*', logger());
app.use('*', prettyJSON());

// ============================================================================
// Health & Status Routes
// ============================================================================

app.get('/', (c) => {
  return c.json({
    name: 'AI Manus Unified',
    version: '1.0.0',
    description: 'Unified AI Agent Enterprise Platform',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/stats', (c) => {
  return c.json({
    providers: providerRegistry.getStats(),
    tools: toolRegistry.getStats(),
    orchestrator: orchestrator.getStats(),
  });
});

// ============================================================================
// Provider Routes
// ============================================================================

app.get('/providers', (c) => {
  const providers = providerRegistry.getAll().map((p) => ({
    name: p.name,
    displayName: p.displayName,
    available: p.isAvailable(),
  }));
  return c.json({ providers });
});

app.get('/providers/:name', async (c) => {
  const name = c.req.param('name');
  const provider = providerRegistry.get(name);
  
  if (!provider) {
    return c.json({ error: 'Provider not found' }, 404);
  }
  
  const models = await provider.getModels();
  
  return c.json({
    name: provider.name,
    displayName: provider.displayName,
    available: provider.isAvailable(),
    models,
  });
});

app.get('/providers/:name/health', async (c) => {
  const name = c.req.param('name');
  const provider = providerRegistry.get(name);
  
  if (!provider) {
    return c.json({ error: 'Provider not found' }, 404);
  }
  
  const healthy = await provider.healthCheck();
  
  return c.json({
    provider: name,
    healthy,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// Model Routes
// ============================================================================

app.get('/models', async (c) => {
  const models = await providerRegistry.getAllModels();
  return c.json({ models, count: models.length });
});

// ============================================================================
// Tool Routes
// ============================================================================

app.get('/tools', (c) => {
  const tools = toolRegistry.getAll().map((t) => ({
    name: t.name,
    description: t.description,
    category: t.category,
  }));
  return c.json({ tools, count: tools.length });
});

app.get('/tools/:name', (c) => {
  const name = c.req.param('name');
  const tool = toolRegistry.get(name);
  
  if (!tool) {
    return c.json({ error: 'Tool not found' }, 404);
  }
  
  return c.json({
    name: tool.name,
    description: tool.description,
    category: tool.category,
    schema: tool.getSchema(),
  });
});

app.post('/tools/:name/execute', async (c) => {
  const name = c.req.param('name');
  const input = await c.req.json();
  
  const result = await toolRegistry.execute(name, input);
  
  return c.json(result);
});

// ============================================================================
// Chat Routes
// ============================================================================

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant', 'tool']),
    content: z.string(),
  })),
  model: z.string().optional(),
  provider: z.string().optional(),
  stream: z.boolean().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
});

app.post('/chat', zValidator('json', chatSchema), async (c) => {
  const request = c.req.valid('json') as ChatRequest;
  
  try {
    const response = await orchestrator.generate(
      request.messages as Message[],
      {
        model: request.model,
        provider: request.provider,
        temperature: request.temperature,
        maxTokens: request.maxTokens,
      }
    );
    
    return c.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ error: errorMessage }, 500);
  }
});

app.post('/chat/stream', zValidator('json', chatSchema), async (c) => {
  const request = c.req.valid('json') as ChatRequest;
  
  // Set up SSE headers
  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of orchestrator.stream(
          request.messages as Message[],
          {
            model: request.model,
            provider: request.provider,
            temperature: request.temperature,
            maxTokens: request.maxTokens,
          }
        )) {
          const data = JSON.stringify(chunk);
          controller.enqueue(`data: ${data}\n\n`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        controller.enqueue(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      } finally {
        controller.close();
      }
    },
  });
  
  return new Response(stream);
});

// ============================================================================
// Agent Routes
// ============================================================================

const createAgentSchema = z.object({
  name: z.string(),
  systemPrompt: z.string(),
  model: z.string().optional(),
  provider: z.string().optional(),
  tools: z.array(z.string()).optional(),
  maxIterations: z.number().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
});

app.post('/agents', zValidator('json', createAgentSchema), async (c) => {
  const request = c.req.valid('json');
  
  const config: AgentConfig = {
    id: crypto.randomUUID(),
    name: request.name,
    systemPrompt: request.systemPrompt,
    model: request.model || 'gpt-4o',
    provider: request.provider || 'openai',
    tools: request.tools,
    maxIterations: request.maxIterations,
    temperature: request.temperature,
    maxTokens: request.maxTokens,
  };
  
  const agent = AgentFactory.create(config);
  
  return c.json({
    id: agent.id,
    name: agent.name,
    status: agent.status,
  }, 201);
});

app.get('/agents', (c) => {
  const agents = AgentFactory.getAll().map((a) => ({
    id: a.id,
    name: a.name,
    status: a.status,
  }));
  return c.json({ agents });
});

app.get('/agents/:id', (c) => {
  const id = c.req.param('id');
  const agent = AgentFactory.get(id);
  
  if (!agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }
  
  return c.json(agent.getState());
});

const executeAgentSchema = z.object({
  request: z.string(),
});

app.post('/agents/:id/execute', zValidator('json', executeAgentSchema), async (c) => {
  const id = c.req.param('id');
  const { request } = c.req.valid('json');
  
  const agent = AgentFactory.get(id);
  
  if (!agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }
  
  // Set up SSE headers
  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of agent.execute(request)) {
          const data = JSON.stringify(event);
          controller.enqueue(`data: ${data}\n\n`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        controller.enqueue(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      } finally {
        controller.close();
      }
    },
  });
  
  return new Response(stream);
});

app.delete('/agents/:id', (c) => {
  const id = c.req.param('id');
  const deleted = AgentFactory.delete(id);
  
  if (!deleted) {
    return c.json({ error: 'Agent not found' }, 404);
  }
  
  return c.json({ success: true });
});

// ============================================================================
// Orchestrator Routes
// ============================================================================

app.get('/orchestrator/health', (c) => {
  const healthStatus = orchestrator.getHealthStatus();
  const healthArray = Array.from(healthStatus.values());
  return c.json({ providers: healthArray });
});

// ============================================================================
// Error Handling
// ============================================================================

app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: err.message }, 500);
});

// ============================================================================
// Server Startup
// ============================================================================

function startServer() {
  console.log('🚀 Starting AI Manus Unified Server...');
  console.log(`   Environment: ${configManager.nodeEnv}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Host: ${HOST}`);
  
  // Validate production config
  configManager.validateProduction();
  
  // Start orchestrator
  orchestrator.start();
  
  // Start server
  console.log(`\n✅ Server ready at http://${HOST}:${PORT}`);
  console.log(`   API Documentation: http://${HOST}:${PORT}/health`);
  console.log(`   Providers: http://${HOST}:${PORT}/providers`);
  console.log(`   Tools: http://${HOST}:${PORT}/tools`);
  console.log(`   Models: http://${HOST}:${PORT}/models\n`);
  
  return Bun.serve({
    port: PORT,
    hostname: HOST,
    fetch: app.fetch,
  });
}

// Export app for testing
export { app };

// Start server if this is the main module
startServer();

export default app;