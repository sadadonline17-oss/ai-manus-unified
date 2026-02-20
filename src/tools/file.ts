/**
 * Unified AI Manus - File Tool
 * File operations in sandbox environment
 */

import { BaseTool } from './interface';
import type { ToolResult, ToolExecutionContext } from '../types';
import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * File Read Tool
 */
export class FileReadTool extends BaseTool {
  readonly name = 'file_read';
  readonly description = 'Read file content from the filesystem';
  readonly category = 'file' as const;

  constructor() {
    super();
    
    this.schema = BaseTool.createSchema(
      'file_read',
      'Read file content. Use for checking file contents, analyzing logs, or reading configuration files.',
      {
        file: {
          type: 'string',
          description: 'Absolute path of the file to read',
        },
        start_line: {
          type: 'integer',
          description: '(Optional) Starting line to read from, 0-based',
        },
        end_line: {
          type: 'integer',
          description: '(Optional) Ending line number (exclusive)',
        },
        sudo: {
          type: 'boolean',
          description: '(Optional) Whether to use sudo privileges',
        },
      },
      ['file']
    );
  }

  async execute(input: Record<string, unknown>): Promise<ToolResult> {
    const { file, start_line, end_line } = input as {
      file: string;
      start_line?: number;
      end_line?: number;
    };

    try {
      let content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n');

      if (start_line !== undefined || end_line !== undefined) {
        const start = start_line ?? 0;
        const end = end_line ?? lines.length;
        content = lines.slice(start, end).join('\n');
      }

      return this.success(`File content:\n${content}`, {
        path: file,
        content,
        lines: lines.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return this.error(`Failed to read file: ${errorMessage}`, errorMessage);
    }
  }
}

/**
 * File Write Tool
 */
export class FileWriteTool extends BaseTool {
  readonly name = 'file_write';
  readonly description = 'Write content to a file';
  readonly category = 'file' as const;

  constructor() {
    super();
    
    this.schema = BaseTool.createSchema(
      'file_write',
      'Overwrite or append content to a file. Use for creating new files, appending content, or modifying existing files.',
      {
        file: {
          type: 'string',
          description: 'Absolute path of the file to write to',
        },
        content: {
          type: 'string',
          description: 'Text content to write',
        },
        append: {
          type: 'boolean',
          description: '(Optional) Whether to use append mode',
        },
        leading_newline: {
          type: 'boolean',
          description: '(Optional) Whether to add a leading newline',
        },
        trailing_newline: {
          type: 'boolean',
          description: '(Optional) Whether to add a trailing newline',
        },
      },
      ['file', 'content']
    );
  }

  async execute(input: Record<string, unknown>): Promise<ToolResult> {
    const { file, content, append, leading_newline, trailing_newline } = input as {
      file: string;
      content: string;
      append?: boolean;
      leading_newline?: boolean;
      trailing_newline?: boolean;
    };

    try {
      // Ensure directory exists
      const dir = path.dirname(file);
      await fs.mkdir(dir, { recursive: true });

      let finalContent = content;
      if (leading_newline) finalContent = '\n' + finalContent;
      if (trailing_newline) finalContent = finalContent + '\n';

      if (append) {
        await fs.appendFile(file, finalContent, 'utf-8');
      } else {
        await fs.writeFile(file, finalContent, 'utf-8');
      }

      return this.success(`Successfully wrote to ${file}`, {
        path: file,
        bytesWritten: finalContent.length,
        mode: append ? 'append' : 'write',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return this.error(`Failed to write file: ${errorMessage}`, errorMessage);
    }
  }
}

/**
 * File String Replace Tool
 */
export class FileStrReplaceTool extends BaseTool {
  readonly name = 'file_str_replace';
  readonly description = 'Replace specified string in a file';
  readonly category = 'file' as const;

  constructor() {
    super();
    
    this.schema = BaseTool.createSchema(
      'file_str_replace',
      'Replace specified string in a file. Use for updating specific content in files or fixing errors in code.',
      {
        file: {
          type: 'string',
          description: 'Absolute path of the file to perform replacement on',
        },
        old_str: {
          type: 'string',
          description: 'Original string to be replaced',
        },
        new_str: {
          type: 'string',
          description: 'New string to replace with',
        },
      },
      ['file', 'old_str', 'new_str']
    );
  }

  async execute(input: Record<string, unknown>): Promise<ToolResult> {
    const { file, old_str, new_str } = input as {
      file: string;
      old_str: string;
      new_str: string;
    };

    try {
      let content = await fs.readFile(file, 'utf-8');
      
      if (!content.includes(old_str)) {
        return this.error('Original string not found in file', 'STRING_NOT_FOUND');
      }

      const newContent = content.replace(old_str, new_str);
      await fs.writeFile(file, newContent, 'utf-8');

      return this.success(`Successfully replaced string in ${file}`, {
        path: file,
        oldLength: old_str.length,
        newLength: new_str.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return this.error(`Failed to replace string: ${errorMessage}`, errorMessage);
    }
  }
}

/**
 * File Find Tool
 */
export class FileFindTool extends BaseTool {
  readonly name = 'file_find';
  readonly description = 'Find files by name pattern in specified directory';
  readonly category = 'file' as const;

  constructor() {
    super();
    
    this.schema = BaseTool.createSchema(
      'file_find_by_name',
      'Find files by name pattern in specified directory. Use for locating files with specific naming patterns.',
      {
        path: {
          type: 'string',
          description: 'Absolute path of directory to search',
        },
        glob: {
          type: 'string',
          description: 'Filename pattern using glob syntax wildcards',
        },
      },
      ['path', 'glob']
    );
  }

  async execute(input: Record<string, unknown>): Promise<ToolResult> {
    const { path: searchPath, glob } = input as {
      path: string;
      glob: string;
    };

    try {
      const { glob: globFunc } = await import('glob');
      const files = await globFunc(glob, {
        cwd: searchPath,
        absolute: true,
        nodir: true,
      });

      return this.success(`Found ${files.length} files`, {
        pattern: glob,
        path: searchPath,
        files,
        count: files.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return this.error(`Failed to find files: ${errorMessage}`, errorMessage);
    }
  }
}

/**
 * File Search in Content Tool
 */
export class FileSearchTool extends BaseTool {
  readonly name = 'file_search';
  readonly description = 'Search for matching text within file content';
  readonly category = 'file' as const;

  constructor() {
    super();
    
    this.schema = BaseTool.createSchema(
      'file_find_in_content',
      'Search for matching text within file content. Use for finding specific content or patterns in files.',
      {
        file: {
          type: 'string',
          description: 'Absolute path of the file to search within',
        },
        regex: {
          type: 'string',
          description: 'Regular expression pattern to match',
        },
      },
      ['file', 'regex']
    );
  }

  async execute(input: Record<string, unknown>): Promise<ToolResult> {
    const { file, regex } = input as {
      file: string;
      regex: string;
    };

    try {
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n');
      const pattern = new RegExp(regex, 'g');
      const matches: Array<{ line: number; content: string; match: string }> = [];

      lines.forEach((line, index) => {
        const match = line.match(pattern);
        if (match) {
          matches.push({
            line: index + 1,
            content: line.trim(),
            match: match[0],
          });
        }
      });

      return this.success(`Found ${matches.length} matches`, {
        file,
        pattern: regex,
        matches,
        count: matches.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return this.error(`Failed to search file: ${errorMessage}`, errorMessage);
    }
  }
}