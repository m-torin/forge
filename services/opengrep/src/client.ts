import type {
  OpenGrepClient,
  OpenGrepConfig,
  OpenGrepError,
  SearchQuery,
  SearchResponse,
  Rule,
  ScanResponse,
} from './types.js';
import {
  OpenGrepConfigSchema,
  SearchQuerySchema,
  SearchResponseSchema,
  ScanResponseSchema,
} from './types.js';

export class OpenGrepHttpClient implements OpenGrepClient {
  private config: OpenGrepConfig;

  constructor(config: Partial<OpenGrepConfig> = {}) {
    this.config = OpenGrepConfigSchema.parse(config);
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': '@repo/opengrep-client',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const error: OpenGrepError = new Error(
          `OpenGrep API error: ${response.status} ${response.statusText}`,
        );
        error.statusCode = response.status;
        error.code = response.status.toString();

        try {
          error.response = await response.json();
        } catch {
          error.response = await response.text();
        }

        throw error;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeout);

      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError: OpenGrepError = new Error(
          `Request timeout after ${this.config.timeout}ms`,
        );
        timeoutError.code = 'TIMEOUT';
        throw timeoutError;
      }

      throw error;
    }
  }

  async search(query: SearchQuery): Promise<SearchResponse> {
    const validatedQuery = SearchQuerySchema.parse(query);

    const response = await this.makeRequest<unknown>('/v1/search', {
      method: 'POST',
      body: JSON.stringify(validatedQuery),
    });

    return SearchResponseSchema.parse(response);
  }

  async scan(rules: Rule[], paths: string[]): Promise<ScanResponse> {
    const response = await this.makeRequest<unknown>('/v1/scan', {
      method: 'POST',
      body: JSON.stringify({
        rules,
        paths,
        config: {
          timeout: this.config.timeout,
        },
      }),
    });

    return ScanResponseSchema.parse(response);
  }

  async getRules(filters?: { language?: string; severity?: string }): Promise<Rule[]> {
    const params = new URLSearchParams();
    if (filters?.language) params.set('language', filters.language);
    if (filters?.severity) params.set('severity', filters.severity);

    const queryString = params.toString();
    const endpoint = `/v1/rules${queryString ? `?${queryString}` : ''}`;

    const response = await this.makeRequest<{ rules: Rule[] }>(endpoint);
    return response.rules;
  }

  async validateRule(rule: Rule): Promise<boolean> {
    try {
      await this.makeRequest<{ valid: boolean }>('/v1/rules/validate', {
        method: 'POST',
        body: JSON.stringify(rule),
      });
      return true;
    } catch (error) {
      if (error instanceof Error && (error as OpenGrepError).statusCode === 400) {
        return false;
      }
      throw error;
    }
  }
}

export function createOpenGrepClient(config?: Partial<OpenGrepConfig>): OpenGrepClient {
  return new OpenGrepHttpClient(config);
}
