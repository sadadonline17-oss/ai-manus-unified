/**
 * Unified AI Manus - Base Agent
 * Core agent runtime with tool execution
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  AgentConfig,
  AgentState,
  AgentStatus,
  Message,
  ToolCall,
  ToolResult,
  AgentEvent,
  ToolSchema,
} from '../types';
import { providerRegistry } from '../providers';
import { toolRegistry } from '../tools';

/**
 * Base Agent
 * Provides core agent functionality with tool execution
 */
export class BaseAgent {
  protected config: AgentConfig;
  protected state: AgentState;
  protected memory: Message[] = [];

  constructor(config: AgentConfig) {
    this.config = config;
    this.state = {
      id: config.id,
      status: 'idle',
      memory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Get agent ID
   */
  get id(): string {
    return this.config.id;
  }

  /**
   * Get agent name
   */
  get name(): string {
    return this.config.name;
  }

  /**
   * Get current status
   */
  get status(): AgentStatus {
    return this.state.status;
  }

  /**
   * Get available tools
   */
  getTools(): ToolSchema[] {
    if (!this.config.tools || this.config.tools.length === 0) {
      return toolRegistry.getSchemas();
    }
    return toolRegistry.getSchemasForTools(this.config.tools);
  }

  /**
   * Execute a task
   */
  async *execute(
    request: string,
    onEvent?: (event: AgentEvent) => void
  ): AsyncGenerator<AgentEvent, void, unknown> {
    this.updateStatus('thinking');

    // Add user message to memory
    this.memory.push({
      role: 'user',
      content: request,
      timestamp: new Date(),
    });

    const maxIterations = this.config.maxIterations || 100;

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Get LLM response
      const response = await this.getLLMResponse();

      // Check if we have tool calls
      if (!response.toolCalls || response.toolCalls.length === 0) {
        // No tool calls, return final message
        const event: AgentEvent = {
          type: 'message',
          message: response.content,
          timestamp: new Date(),
        };
        onEvent?.(event);
        yield event;

        this.updateStatus('idle');
        
        // Yield done event
        const doneEvent: AgentEvent = {
          type: 'done',
          success: true,
          timestamp: new Date(),
        };
        onEvent?.(doneEvent);
        yield doneEvent;
        
        return;
      }

      // Process tool calls
      for (const toolCall of response.toolCalls) {
        const toolEvent = await this.executeToolCall(toolCall);
        onEvent?.(toolEvent);
        yield toolEvent;
      }
    }

    // Max iterations reached
    const errorEvent: AgentEvent = {
      type: 'error',
      error: 'Maximum iteration count reached',
      timestamp: new Date(),
    };
    onEvent?.(errorEvent);
    yield errorEvent;

    this.updateStatus('error');
  }

  /**
   * Get LLM response
   */
  protected async getLLMResponse(): Promise<Message> {
    const provider = providerRegistry.get(this.config.provider);
    
    if (!provider) {
      throw new Error(`Provider ${this.config.provider} not found`);
    }

    // Build messages with system prompt
    const messages: Message[] = [
      { role: 'system', content: this.config.systemPrompt },
      ...this.memory,
    ];

    const response = await provider.generate(messages, {
      model: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      tools: this.getTools(),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'LLM response failed');
    }

    // Parse response for tool calls
    const content = response.data;
    const toolCalls = this.parseToolCalls(content);

    const message: Message = {
      role: 'assistant',
      content,
      toolCalls,
      timestamp: new Date(),
    };

    // Add to memory
    this.memory.push(message);

    return message;
  }

  /**
   * Parse tool calls from response
   */
  protected parseToolCalls(content: string): ToolCall[] {
    // Simple parsing - in production would use proper function calling
    const toolCalls: ToolCall[] = [];
    
    // Look for JSON tool call patterns
    const toolCallRegex = /<tool_call\s+name="([^"]+)">([\s\S]*?)<\/tool_call>/g;
    let match;
    
    while ((match = toolCallRegex.exec(content)) !== null) {
      const name = match[1];
      const args = match[2].trim();
      
      toolCalls.push({
        id: uuidv4(),
        function: {
          name,
          arguments: args,
        },
      });
    }

    return toolCalls;
  }

  /**
   * Execute a tool call
   */
  protected async executeToolCall(toolCall: ToolCall): Promise<AgentEvent> {
    const { id, function: { name, arguments: argsStr } } = toolCall;

    this.updateStatus('executing');

    // Parse arguments
    let args: Record<string, unknown>;
    try {
      args = JSON.parse(argsStr);
    } catch {
      args = {};
    }

    // Emit calling event
    const callingEvent: AgentEvent = {
      type: 'tool_call',
      toolCallId: id,
      toolName: name,
      functionName: name,
      functionArgs: args,
      status: 'calling',
      timestamp: new Date(),
    };

    // Execute tool
    const result = await toolRegistry.execute(name, args, {
      sessionId: this.id,
      agentId: this.id,
    });

    // Add tool result to memory
    this.memory.push({
      role: 'tool',
      content: result.message,
      toolCallId: id,
      functionName: name,
      timestamp: new Date(),
    });

    // Emit result event
    const resultEvent: AgentEvent = {
      type: 'tool_result',
      toolCallId: id,
      toolName: name,
      functionName: name,
      functionArgs: args,
      functionResult: result,
      status: result.success ? 'success' : 'error',
      timestamp: new Date(),
    };

    this.updateStatus('thinking');

    return resultEvent;
  }

  /**
   * Update agent status
   */
  protected updateStatus(status: AgentStatus): void {
    this.state.status = status;
    this.state.updatedAt = new Date();
  }

  /**
   * Add message to memory
   */
  addMessage(message: Message): void {
    this.memory.push({
      ...message,
      timestamp: message.timestamp || new Date(),
    });
    this.state.updatedAt = new Date();
  }

  /**
   * Clear memory
   */
  clearMemory(): void {
    this.memory = [];
    this.state.memory = [];
    this.state.updatedAt = new Date();
  }

  /**
   * Get memory
   */
  getMemory(): Message[] {
    return [...this.memory];
  }

  /**
   * Get state
   */
  getState(): AgentState {
    return {
      ...this.state,
      memory: this.memory,
    };
  }
}

/**
 * Agent Factory
 * Creates agents with proper configuration
 */
export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  /**
   * Create a new agent
   */
  static create(config: AgentConfig): BaseAgent {
    const agent = new BaseAgent(config);
    this.agents.set(config.id, agent);
    return agent;
  }

  /**
   * Get an existing agent
   */
  static get(id: string): BaseAgent | undefined {
    return this.agents.get(id);
  }

  /**
   * Delete an agent
   */
  static delete(id: string): boolean {
    return this.agents.delete(id);
  }

  /**
   * Get all agents
   */
  static getAll(): BaseAgent[] {
    return Array.from(this.agents.values());
  }
}

export default BaseAgent;