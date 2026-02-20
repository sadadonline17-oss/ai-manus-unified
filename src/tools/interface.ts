/**
 * Unified AI Manus - Tool Interface
 * Standard interface that all tools must implement
 */

import type { ToolResult, ToolSchema, ToolCategory, ToolExecutionContext } from '../types';

/**
 * Tool decorator metadata
 */
export interface ToolDecoratorOptions {
  name: string;
  description: string;
  parameters: Record<string, ToolParameterDefinition>;
  required?: string[];
  timeout?: number;
}

export interface ToolParameterDefinition {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  description?: string;
  enum?: string[];
  default?: unknown;
  items?: ToolParameterDefinition;
  properties?: Record<string, ToolParameterDefinition>;
}

/**
 * Base Tool Interface
 * All tools must implement these methods
 */
export interface ITool {
  readonly name: string;
  readonly description: string;
  readonly category: ToolCategory;
  
  /**
   * Get the tool schema for LLM function calling
   */
  getSchema(): ToolSchema;
  
  /**
   * Validate input parameters
   */
  validate(input: Record<string, unknown>): boolean;
  
  /**
   * Execute the tool
   */
  execute(
    input: Record<string, unknown>,
    context?: ToolExecutionContext
  ): Promise<ToolResult>;
  
  /**
   * Get timeout for this tool
   */
  getTimeout(): number;
}

/**
 * Abstract Base Tool
 * Provides common functionality for all tools
 */
export abstract class BaseTool implements ITool {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly category: ToolCategory;
  
  protected timeout: number = 30000; // Default 30 seconds
  protected schema?: ToolSchema;
  
  /**
   * Tool decorator helper - creates schema from method metadata
   */
  protected static createSchema(
    name: string,
    description: string,
    parameters: Record<string, ToolParameterDefinition>,
    required: string[] = []
  ): ToolSchema {
    return {
      type: 'function',
      function: {
        name,
        description,
        parameters: {
          type: 'object',
          properties: parameters,
          required,
        },
      },
    };
  }
  
  getSchema(): ToolSchema {
    if (!this.schema) {
      throw new Error(`Tool schema not defined for ${this.name}`);
    }
    return this.schema;
  }
  
  validate(input: Record<string, unknown>): boolean {
    // Basic validation - override for more specific validation
    const schema = this.getSchema();
    const required = schema.function.parameters.required || [];
    
    for (const param of required) {
      if (!(param in input) || input[param] === undefined) {
        return false;
      }
    }
    
    return true;
  }
  
  abstract execute(
    input: Record<string, unknown>,
    context?: ToolExecutionContext
  ): Promise<ToolResult>;
  
  getTimeout(): number {
    return this.timeout;
  }
  
  /**
   * Create a success result
   */
  protected success(message: string, data?: unknown): ToolResult {
    return {
      success: true,
      message,
      data,
    };
  }
  
  /**
   * Create an error result
   */
  protected error(message: string, error?: string): ToolResult {
    return {
      success: false,
      message,
      error,
    };
  }
}

/**
 * Tool decorator for defining tool methods
 */
export function tool(options: ToolDecoratorOptions) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    // Store metadata on the method
    (originalMethod as ToolMethod)._toolOptions = options;
    
    return descriptor;
  };
}

/**
 * Interface for methods decorated with @tool
 */
export interface ToolMethod {
  (...args: unknown[]): Promise<ToolResult>;
  _toolOptions?: ToolDecoratorOptions;
}

/**
 * Helper to create a tool from a decorated method
 */
export function createToolFromMethod(
  method: ToolMethod,
  category: ToolCategory,
  timeout?: number
): ITool {
  const options = method._toolOptions;
  if (!options) {
    throw new Error('Method is not decorated with @tool');
  }
  
  return {
    name: options.name,
    description: options.description,
    category,
    getSchema: () => BaseTool.createSchema(
      options.name,
      options.description,
      options.parameters,
      options.required
    ),
    validate: (input) => {
      const required = options.required || [];
      return required.every((r) => input[r] !== undefined);
    },
    execute: async (input, context) => {
      return method(input, context);
    },
    getTimeout: () => timeout ?? options.timeout ?? 30000,
  };
}