/**
 * Unified AI Manus - Shell Tool
 * Execute shell commands in sandbox environment
 */

import { BaseTool, tool } from './interface';
import type { ToolResult, ToolExecutionContext } from '../types';

/**
 * Shell Tool
 * Provides shell command execution capabilities
 */
export class ShellTool extends BaseTool {
  readonly name = 'shell';
  readonly description = 'Execute shell commands in a sandbox environment';
  readonly category = 'shell' as const;
  
  protected timeout = 60000; // 60 seconds for shell commands

  constructor(private sandbox?: { exec: (id: string, dir: string, cmd: string) => Promise<ToolResult> }) {
    super();
    
    this.schema = BaseTool.createSchema(
      'shell_exec',
      'Execute commands in a specified shell session. Use for running code, installing packages, or managing files.',
      {
        id: {
          type: 'string',
          description: 'Unique identifier of the target shell session',
        },
        exec_dir: {
          type: 'string',
          description: 'Working directory for command execution (must use absolute path)',
        },
        command: {
          type: 'string',
          description: 'Shell command to execute',
        },
      },
      ['id', 'exec_dir', 'command']
    );
  }

  async execute(
    input: Record<string, unknown>,
    context?: ToolExecutionContext
  ): Promise<ToolResult> {
    const { id, exec_dir, command } = input as {
      id: string;
      exec_dir: string;
      command: string;
    };

    // If sandbox is available, use it
    if (this.sandbox) {
      return this.sandbox.exec(id, exec_dir, command);
    }

    // Otherwise, execute locally (development mode)
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const { stdout, stderr } = await execAsync(command, {
        cwd: exec_dir,
        timeout: this.timeout,
      });

      return this.success(
        `Command executed successfully\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`,
        { stdout, stderr }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return this.error(`Command execution failed: ${errorMessage}`, errorMessage);
    }
  }
}

/**
 * Shell View Tool
 * View shell session content
 */
export class ShellViewTool extends BaseTool {
  readonly name = 'shell_view';
  readonly description = 'View the content of a specified shell session';
  readonly category = 'shell' as const;

  constructor() {
    super();
    
    this.schema = BaseTool.createSchema(
      'shell_view',
      'View the content of a specified shell session. Use for checking command execution results or monitoring output.',
      {
        id: {
          type: 'string',
          description: 'Unique identifier of the target shell session',
        },
      },
      ['id']
    );
  }

  async execute(input: Record<string, unknown>): Promise<ToolResult> {
    const { id } = input as { id: string };
    // This would connect to a persistent shell session
    return this.success(`Shell session ${id} content`, { sessionId: id });
  }
}

/**
 * Shell Wait Tool
 * Wait for running process in shell session
 */
export class ShellWaitTool extends BaseTool {
  readonly name = 'shell_wait';
  readonly description = 'Wait for the running process in a specified shell session';
  readonly category = 'shell' as const;

  constructor() {
    super();
    
    this.schema = BaseTool.createSchema(
      'shell_wait',
      'Wait for the running process in a specified shell session to return. Use after running commands that require longer runtime.',
      {
        id: {
          type: 'string',
          description: 'Unique identifier of the target shell session',
        },
        seconds: {
          type: 'integer',
          description: 'Wait duration in seconds',
        },
      },
      ['id']
    );
  }

  async execute(input: Record<string, unknown>): Promise<ToolResult> {
    const { id, seconds } = input as { id: string; seconds?: number };
    const waitTime = seconds || 30;
    
    await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
    
    return this.success(`Waited ${waitTime} seconds for session ${id}`);
  }
}

/**
 * Shell Kill Tool
 * Terminate running process in shell session
 */
export class ShellKillTool extends BaseTool {
  readonly name = 'shell_kill';
  readonly description = 'Terminate a running process in a specified shell session';
  readonly category = 'shell' as const;

  constructor() {
    super();
    
    this.schema = BaseTool.createSchema(
      'shell_kill_process',
      'Terminate a running process in a specified shell session. Use for stopping long-running processes or handling frozen commands.',
      {
        id: {
          type: 'string',
          description: 'Unique identifier of the target shell session',
        },
      },
      ['id']
    );
  }

  async execute(input: Record<string, unknown>): Promise<ToolResult> {
    const { id } = input as { id: string };
    // This would terminate a process in the sandbox
    return this.success(`Process terminated in session ${id}`);
  }
}