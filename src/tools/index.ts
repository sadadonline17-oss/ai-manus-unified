/**
 * Unified AI Manus - Tool System
 * Main entry point for all tools
 */

// Export types and interfaces
export * from './interface';
export * from './registry';

// Export individual tools
export { ShellTool, ShellViewTool, ShellWaitTool, ShellKillTool } from './shell';
export { FileReadTool, FileWriteTool, FileStrReplaceTool, FileFindTool, FileSearchTool } from './file';
export {
  BrowserNavigateTool,
  BrowserViewTool,
  BrowserClickTool,
  BrowserInputTool,
  BrowserScrollTool,
  BrowserScreenshotTool,
} from './browser';
export { WebSearchTool, WebFetchTool } from './search';

// Import for registration
import { toolRegistry } from './registry';
import { ShellTool, ShellViewTool, ShellWaitTool, ShellKillTool } from './shell';
import { FileReadTool, FileWriteTool, FileStrReplaceTool, FileFindTool, FileSearchTool } from './file';
import {
  BrowserNavigateTool,
  BrowserViewTool,
  BrowserClickTool,
  BrowserInputTool,
  BrowserScrollTool,
  BrowserScreenshotTool,
} from './browser';
import { WebSearchTool, WebFetchTool } from './search';

/**
 * Initialize all tools
 */
export function initializeTools(): void {
  // Shell tools
  toolRegistry.register(new ShellTool());
  toolRegistry.register(new ShellViewTool());
  toolRegistry.register(new ShellWaitTool());
  toolRegistry.register(new ShellKillTool());

  // File tools
  toolRegistry.register(new FileReadTool());
  toolRegistry.register(new FileWriteTool());
  toolRegistry.register(new FileStrReplaceTool());
  toolRegistry.register(new FileFindTool());
  toolRegistry.register(new FileSearchTool());

  // Browser tools
  toolRegistry.register(new BrowserNavigateTool());
  toolRegistry.register(new BrowserViewTool());
  toolRegistry.register(new BrowserClickTool());
  toolRegistry.register(new BrowserInputTool());
  toolRegistry.register(new BrowserScrollTool());
  toolRegistry.register(new BrowserScreenshotTool());

  // Search tools
  toolRegistry.register(new WebSearchTool());
  toolRegistry.register(new WebFetchTool());

  console.log(`✅ Initialized ${toolRegistry.getStats().totalTools} tools`);
}

// Auto-initialize on import
initializeTools();

// Export the registry as default
export default toolRegistry;