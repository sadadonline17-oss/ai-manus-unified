/**
 * Unified AI Manus - Search Tool
 * Web search capabilities using various search engines
 */

import { BaseTool } from './interface';
import type { ToolResult, ToolExecutionContext } from '../types';
import { configManager } from '../config';

/**
 * Web Search Tool
 */
export class WebSearchTool extends BaseTool {
  readonly name = 'web_search';
  readonly description = 'Search the web for information';
  readonly category = 'search' as const;

  constructor() {
    super();
    
    this.schema = BaseTool.createSchema(
      'web_search',
      'Search the web for information using configured search provider. Use for finding current information, researching topics, or looking up documentation.',
      {
        query: {
          type: 'string',
          description: 'Search query string',
        },
        num_results: {
          type: 'integer',
          description: '(Optional) Number of results to return (default: 10)',
        },
      },
      ['query']
    );
  }

  async execute(input: Record<string, unknown>): Promise<ToolResult> {
    const { query, num_results } = input as {
      query: string;
      num_results?: number;
    };

    const count = num_results || 10;
    const searchConfig = configManager.search;

    try {
      // Use appropriate search provider
      switch (searchConfig.provider) {
        case 'google':
          return await this.googleSearch(query, count, searchConfig);
        case 'bing':
          return await this.bingSearch(query, count, searchConfig);
        case 'baidu':
          return await this.baiduSearch(query, count);
        default:
          return this.error(`Unknown search provider: ${searchConfig.provider}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return this.error(`Search failed: ${errorMessage}`, errorMessage);
    }
  }

  private async googleSearch(
    query: string,
    count: number,
    config: { apiKey?: string; engineId?: string }
  ): Promise<ToolResult> {
    if (!config.apiKey || !config.engineId) {
      return this.error('Google Search API key or Engine ID not configured');
    }

    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', config.apiKey);
    url.searchParams.set('cx', config.engineId);
    url.searchParams.set('q', query);
    url.searchParams.set('num', String(count));

    const response = await fetch(url.toString());
    const data = await response.json() as { items?: Array<{ title: string; link: string; snippet: string }> };

    const results = (data.items || []).map((item) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
    }));

    return this.success(`Found ${results.length} results`, {
      query,
      provider: 'google',
      results,
    });
  }

  private async bingSearch(
    query: string,
    count: number,
    config: { apiKey?: string }
  ): Promise<ToolResult> {
    if (!config.apiKey) {
      return this.error('Bing Search API key not configured');
    }

    const url = new URL('https://api.bing.microsoft.com/v7.0/search');
    url.searchParams.set('q', query);
    url.searchParams.set('count', String(count));

    const response = await fetch(url.toString(), {
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
      },
    });
    const data = await response.json() as { webPages?: { value: Array<{ name: string; url: string; snippet: string }> } };

    const results = (data.webPages?.value || []).map((item) => ({
      title: item.name,
      url: item.url,
      snippet: item.snippet,
    }));

    return this.success(`Found ${results.length} results`, {
      query,
      provider: 'bing',
      results,
    });
  }

  private async bingSearch(
    query: string,
    count: number,
    config: { apiKey?: string }
  ): Promise<ToolResult> {
    if (!config.apiKey) {
      return this.error('Bing Search API key not configured');
    }

    const url = new URL('https://api.bing.microsoft.com/v7.0/search');
    url.searchParams.set('q', query);
    url.searchParams.set('count', String(count));

    const response = await fetch(url.toString(), {
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
      },
    });
    const data = await response.json() as { webPages?: { value: Array<{ name: string; url: string; snippet: string }> } };

    const results = (data.webPages?.value || []).map((item) => ({
      title: item.name,
      url: item.url,
      snippet: item.snippet,
    }));

    return this.success(`Found ${results.length} results`, {
      query,
      provider: 'bing',
      results,
    });
  }

  private async baiduSearch(query: string, count: number): Promise<ToolResult> {
    // Baidu doesn't have a public API, return mock response
    return this.success('Baidu search requires custom implementation', {
      query,
      provider: 'baidu',
      results: [],
      note: 'Baidu search API requires custom integration',
    });
  }
}

/**
 * Web Fetch Tool
 */
export class WebFetchTool extends BaseTool {
  readonly name = 'web_fetch';
  readonly description = 'Fetch content from a URL';
  readonly category = 'search' as const;

  constructor() {
    super();
    
    this.schema = BaseTool.createSchema(
      'web_fetch',
      'Fetch and extract content from a web page. Use for reading articles, documentation, or any web content.',
      {
        url: {
          type: 'string',
          description: 'URL to fetch content from',
        },
        selector: {
          type: 'string',
          description: '(Optional) CSS selector to extract specific content',
        },
      },
      ['url']
    );
  }

  async execute(input: Record<string, unknown>): Promise<ToolResult> {
    const { url, selector } = input as {
      url: string;
      selector?: string;
    };

    try {
      const response = await fetch(url);
      const html = await response.text();

      // Simple text extraction (in production, use cheerio or similar)
      const textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 10000); // Limit content size

      return this.success(`Fetched content from ${url}`, {
        url,
        content: textContent,
        length: textContent.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return this.error(`Failed to fetch URL: ${errorMessage}`, errorMessage);
    }
  }
}