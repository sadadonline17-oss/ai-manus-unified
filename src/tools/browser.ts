/**
 * Unified AI Manus - Browser Tool
 * Browser automation capabilities
 */

import { BaseTool } from './interface';
import type { ToolResult, ToolExecutionContext } from '../types';

/**
 * Browser Navigate Tool
 */
export class BrowserNavigateTool extends BaseTool {
  readonly name = 'browser_navigate';
  readonly description = 'Navigate browser to specified URL';
  readonly category = 'browser' as const;

  constructor(private browser?: { navigate: (url: string) => Promise<ToolResult> }) {
    super();
    
    this.schema = BaseTool.createSchema(
      'browser_navigate',
      'Navigate browser to specified URL. Use when accessing new pages is needed.',
      {
        url: {
          type: 'string',
          description: 'Complete URL to visit. Must include protocol prefix.',
        },
      },
      ['url']
    );
  }

  async execute(input: Record<string, unknown>): Promise<ToolResult> {
    const { url } = input as { url: string };

    if (this.browser) {
      return this.browser.navigate(url);
    }

    // Mock response for development
    return this.success(`Navigated to ${url}`, { url, title: 'Page Title' });
  }
}

/**
 * Browser View Tool
 */
export class BrowserViewTool extends BaseTool {
  readonly name = 'browser_view';
  readonly description = 'View content of the current browser page';
  readonly category = 'browser' as const;

  constructor(private browser?: { viewPage: () => Promise<ToolResult> }) {
    super();
    
    this.schema = BaseTool.createSchema(
      'browser_view',
      'View content of the current browser page. Use for checking the latest state of previously opened pages.',
      {},
      []
    );
  }

  async execute(): Promise<ToolResult> {
    if (this.browser) {
      return this.browser.viewPage();
    }

    return this.success('Current page content', {
      url: 'https://example.com',
      title: 'Example Page',
      content: 'Page content here...',
    });
  }
}

/**
 * Browser Click Tool
 */
export class BrowserClickTool extends BaseTool {
  readonly name = 'browser_click';
  readonly description = 'Click on elements in the current browser page';
  readonly category = 'browser' as const;

  constructor(private browser?: { click: (index?: number, x?: number, y?: number) => Promise<ToolResult> }) {
    super();
    
    this.schema = BaseTool.createSchema(
      'browser_click',
      'Click on elements in the current browser page. Use when clicking page elements is needed.',
      {
        index: {
          type: 'integer',
          description: '(Optional) Index number of the element to click',
        },
        coordinate_x: {
          type: 'number',
          description: '(Optional) X coordinate of click position',
        },
        coordinate_y: {
          type: 'number',
          description: '(Optional) Y coordinate of click position',
        },
      },
      []
    );
  }

  async execute(input: Record<string, unknown>): Promise<ToolResult> {
    const { index, coordinate_x, coordinate_y } = input as {
      index?: number;
      coordinate_x?: number;
      coordinate_y?: number;
    };

    if (this.browser) {
      return this.browser.click(index, coordinate_x, coordinate_y);
    }

    return this.success('Clicked on element', { index, x: coordinate_x, y: coordinate_y });
  }
}

/**
 * Browser Input Tool
 */
export class BrowserInputTool extends BaseTool {
  readonly name = 'browser_input';
  readonly description = 'Input text into editable elements on the current browser page';
  readonly category = 'browser' as const;

  constructor(private browser?: { input: (text: string, pressEnter: boolean, index?: number, x?: number, y?: number) => Promise<ToolResult> }) {
    super();
    
    this.schema = BaseTool.createSchema(
      'browser_input',
      'Overwrite text in editable elements on the current browser page. Use when filling content in input fields.',
      {
        text: {
          type: 'string',
          description: 'Complete text content to overwrite',
        },
        press_enter: {
          type: 'boolean',
          description: 'Whether to press Enter key after input',
        },
        index: {
          type: 'integer',
          description: '(Optional) Index number of the element to overwrite text',
        },
        coordinate_x: {
          type: 'number',
          description: '(Optional) X coordinate of the element to overwrite text',
        },
        coordinate_y: {
          type: 'number',
          description: '(Optional) Y coordinate of the element to overwrite text',
        },
      },
      ['text', 'press_enter']
    );
  }

  async execute(input: Record<string, unknown>): Promise<ToolResult> {
    const { text, press_enter, index, coordinate_x, coordinate_y } = input as {
      text: string;
      press_enter: boolean;
      index?: number;
      coordinate_x?: number;
      coordinate_y?: number;
    };

    if (this.browser) {
      return this.browser.input(text, press_enter, index, coordinate_x, coordinate_y);
    }

    return this.success(`Input text: "${text}"`, { text, pressEnter: press_enter });
  }
}

/**
 * Browser Scroll Tool
 */
export class BrowserScrollTool extends BaseTool {
  readonly name = 'browser_scroll';
  readonly description = 'Scroll the current browser page';
  readonly category = 'browser' as const;

  constructor(private browser?: { scrollUp: (toTop?: boolean) => Promise<ToolResult>; scrollDown: (toBottom?: boolean) => Promise<ToolResult> }) {
    super();
    
    this.schema = BaseTool.createSchema(
      'browser_scroll',
      'Scroll the current browser page up or down.',
      {
        direction: {
          type: 'string',
          description: 'Direction to scroll: "up" or "down"',
          enum: ['up', 'down'],
        },
        to_edge: {
          type: 'boolean',
          description: '(Optional) Whether to scroll to the edge (top/bottom)',
        },
      },
      ['direction']
    );
  }

  async execute(input: Record<string, unknown>): Promise<ToolResult> {
    const { direction, to_edge } = input as {
      direction: 'up' | 'down';
      to_edge?: boolean;
    };

    if (this.browser) {
      if (direction === 'up') {
        return this.browser.scrollUp(to_edge);
      } else {
        return this.browser.scrollDown(to_edge);
      }
    }

    return this.success(`Scrolled ${direction}`, { direction, toEdge: to_edge });
  }
}

/**
 * Browser Screenshot Tool
 */
export class BrowserScreenshotTool extends BaseTool {
  readonly name = 'browser_screenshot';
  readonly description = 'Take a screenshot of the current browser page';
  readonly category = 'browser' as const;

  constructor(private browser?: { screenshot: () => Promise<Buffer> }) {
    super();
    
    this.schema = BaseTool.createSchema(
      'browser_screenshot',
      'Take a screenshot of the current browser page. Use for visual debugging or documentation.',
      {},
      []
    );
  }

  async execute(): Promise<ToolResult> {
    if (this.browser) {
      const buffer = await this.browser.screenshot();
      return this.success('Screenshot captured', {
        size: buffer.length,
        base64: buffer.toString('base64').substring(0, 100) + '...',
      });
    }

    return this.success('Screenshot captured (mock)', { size: 0 });
  }
}