/**
 * Unified AI Manus - Tool Registry
 * Dynamic tool registration and management
 */

import type { ITool } from './interface';
import type { ToolSchema, ToolResult, ToolCategory, ToolExecutionContext } from '../types';

/**
 * Tool Registry
 * Manages all registered tools
 */
class ToolRegistry {
  private tools: Map<string, ITool> = new Map();
  private categories: Map<ToolCategory, Set<string>> = new Map();

  /**
   * Register a tool
   */
  register(tool: ITool): void {
    if (this.tools.has(tool.name)) {
      console.warn(`Tool "${tool.name}" already registered, replacing...`);
    }
    
    this.tools.set(tool.name, tool);
    
    // Track by category
    if (!this.categories.has(tool.category)) {
      this.categories.set(tool.category, new Set());
    }
    this.categories.get(tool.category)!.add(tool.name);
    
    console.log(`✅ Registered tool: ${tool.name} (${tool.category})`);
  }

  /**
   * Unregister a tool
   */
  unregister(name: string): boolean {
    const tool = this.tools.get(name);
    if (!tool) return false;
    
    this.tools.delete(name);
    this.categories.get(tool.category)?.delete(name);
    return true;
  }

  /**
   * Get a tool by name
   */
  get(name: string): ITool | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if a tool is registered
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get all registered tools
   */
  getAll(): ITool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get all tool names
   */
  getNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Get tools by category
   */
  getByCategory(category: ToolCategory): ITool[] {
    const names = this.categories.get(category);
    if (!names) return [];
    return Array.from(names)
      .map((name) => this.tools.get(name))
      .filter((t): t is ITool => t !== undefined);
  }

  /**
   * Get all tool schemas for LLM function calling
   */
  getSchemas(): ToolSchema[] {
    return this.getAll().map((tool) => tool.getSchema());
  }

  /**
   * Get schemas for specific tools
   */
  getSchemasForTools(toolNames: string[]): ToolSchema[] {
    return toolNames
      .map((name) => this.tools.get(name))
      .filter((t): t is ITool => t !== undefined)
      .map((tool) => tool.getSchema());
  }

  /**
   * Execute a tool by name
   */
  async execute(
    name: string,
    input: Record<string, unknown>,
    context?: ToolExecutionContext
  ): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        message: `Tool "${name}" not found`,
        error: 'TOOL_NOT_FOUND',
      };
    }

    // Validate input
    if (!tool.validate(input)) {
      return {
        success: false,
        message: `Invalid input for tool "${name}"`,
        error: 'INVALID_INPUT',
      };
    }

    // Execute with timeout
    const timeout = tool.getTimeout();
    try {
      const result = await Promise.race([
        tool.execute(input, context),
        new Promise<ToolResult>((_, reject) =>
          setTimeout(() => reject(new Error('Tool execution timeout')), timeout)
        ),
      ]);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Tool execution failed: ${errorMessage}`,
        error: errorMessage,
      };
    }
  }

  /**
   * Execute multiple tools in parallel
   */
  async executeParallel(
    executions: Array<{ name: string; input: Record<string, unknown> }>,
    context?: ToolExecutionContext
  ): Promise<Map<string, ToolResult>> {
    const results = new Map<string, ToolResult>();
    
    await Promise.all(
      executions.map(async ({ name, input }) => {
        const result = await this.execute(name, input, context);
        results.set(name, result);
      })
    );
    
    return results;
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalTools: number;
    categories: Record<ToolCategory, number>;
  } {
    const categoryStats: Record<ToolCategory, number> = {} as Record<ToolCategory, number>;
    
    for (const [category, tools] of this.categories) {
      categoryStats[category] = tools.size;
    }
    
    return {
      totalTools: this.tools.size,
      categories: categoryStats,
    };
  }

  /**
   * Clear all registered tools
   */
  clear(): void {
    this.tools.clear();
    this.categories.clear();
  }
}

// Export singleton instance
export const toolRegistry = new ToolRegistry();

// Re-export types
export type { ITool };