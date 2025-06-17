import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';
import type {
  ScrapeRequest,
  ScrapeResult,
  CrawlRequest,
  CrawlResult,
  SearchRequest,
  SearchResult,
  MapRequest,
  MapResult,
  CrawlJob,
  HealthResponse,
} from './types.js';

export const FirecrawlClientConfigSchema = z.object({
  apiUrl: z.string().url().default('http://localhost:3002'),
  apiKey: z.string().optional(),
  timeout: z.number().default(30000),
  retries: z.number().default(3),
  headers: z.record(z.string()).optional(),
});

export type FirecrawlClientConfig = z.infer<typeof FirecrawlClientConfigSchema>;

export class FirecrawlClient {
  private axios: AxiosInstance;
  private config: FirecrawlClientConfig;

  constructor(config: Partial<FirecrawlClientConfig> = {}) {
    this.config = FirecrawlClientConfigSchema.parse(config);

    this.axios = axios.create({
      baseURL: this.config.apiUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
        ...this.config.headers,
      },
    });

    // Add retry logic
    this.setupRetryInterceptor();
  }

  async scrape(request: ScrapeRequest): Promise<ScrapeResult> {
    try {
      const response = await this.axios.post('/v1/scrape', request);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'scrape');
    }
  }

  async crawl(request: CrawlRequest): Promise<{ jobId: string }> {
    try {
      const response = await this.axios.post('/v1/crawl', request);
      return { jobId: response.data.jobId });
    } catch (error) {
      throw this.handleApiError(error, 'crawl');
    }
  }

  async getCrawlStatus(jobId: string): Promise<CrawlJob> {
    try {
      const response = await this.axios.get(`/v1/crawl/${jobId}`);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'getCrawlStatus');
    }
  }

  async waitForCrawlCompletion(
    jobId: string,
    options: {
      pollInterval?: number;
      timeout?: number;
      onProgress?: (status: CrawlJob) => void,
    } = {},
  ): Promise<CrawlResult> {
    const {
      pollInterval = 5000,
      timeout = 300000, // 5 minutes
      onProgress,
    } = options;

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const status = await this.getCrawlStatus(jobId);

      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'completed') {
        return {
          success: true,
          jobId,
          status: status.status,
          total: status.total || 0,
          completed: status.current || 0,
          creditsUsed: status.creditsUsed || 0,
          expiresAt: status.expiresAt,
          data: status.data || [],
        };
      }

      if (status.status === 'failed' || status.status === 'cancelled') {
        return {
          success: false,
          jobId,
          status: status.status,
          total: status.total || 0,
          completed: status.current || 0,
          creditsUsed: status.creditsUsed || 0,
          data: status.data || [],
          error: `Crawl ${status.status}`,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Crawl timeout after ${timeout}ms`);
  }

  async cancelCrawl(jobId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.axios.delete(`/v1/crawl/${jobId}`);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'cancelCrawl');
    }
  }

  async search(request: SearchRequest): Promise<SearchResult> {
    try {
      const response = await this.axios.post('/v1/search', request);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'search');
    }
  }

  async map(request: MapRequest): Promise<MapResult> {
    try {
      const response = await this.axios.post('/v1/map', request);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'map');
    }
  }

  async batchScrape(
    urls: string[],
    commonConfig?: Partial<ScrapeRequest>,
  ): Promise<ScrapeResult[]> {
    const requests = urls.map((url) => ({
      url,
      ...commonConfig,
    }));

    try {
      const response = await this.axios.post('/v1/batch/scrape', { urls: requests });
      return response.data.results || [];
    } catch (error) {
      throw this.handleApiError(error, 'batchScrape');
    }
  }

  async health(): Promise<HealthResponse> {
    try {
      const response = await this.axios.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'health');
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.health();
      return health.status === 'healthy';
    } catch {
      return false;
    }
  }

  // Utility methods
  async extractFromUrl(url: string, schema?: Record<string, any>): Promise<any> {
    const request: ScrapeRequest = {
      url,
      extractConfig: {
        onlyMainContent: true,
        includeHtml: false,
        extractorOptions: {
          mode: 'structured',
          schema,
        },
      },
    };

    const result = await this.scrape(request);
    return result.content?.structured || result.content;
  }

  async extractMarkdown(url: string): Promise<string> {
    const request: ScrapeRequest = {
      url,
      extractConfig: {
        onlyMainContent: true,
        extractorOptions: {
          mode: 'markdown',
        },
      },
    };

    const result = await this.scrape(request);
    return result.content?.markdown || '';
  }

  async extractText(url: string): Promise<string> {
    const result = await this.scrape({ url });
    return result.content?.text || '';
  }

  async crawlSite(
    url: string,
    options: {
      maxDepth?: number;
      limit?: number;
      includePaths?: string[];
      excludePaths?: string[];
      onProgress?: (status: CrawlJob) => void,
    } = {},
  ): Promise<CrawlResult> {
    const { onProgress, ...crawlOptions } = options;

    const crawlRequest: CrawlRequest = {
      url,
      crawlConfig: crawlOptions,
      extractConfig: {
        onlyMainContent: true,
        extractorOptions: {
          mode: 'markdown',
        },
      },
    };

    const { jobId } = await this.crawl(crawlRequest);
    return this.waitForCrawlCompletion(jobId, { onProgress });
  }

  private setupRetryInterceptor(): void {
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;

        if (!config || config._retryCount >= this.config.retries) {
          throw error;
        }

        config._retryCount = (config._retryCount || 0) + 1;

        const shouldRetry =
          error.code === 'ECONNABORTED' || // Timeout
          error.code === 'ECONNRESET' || // Connection reset
          (error.response?.status >= 500 && error.response?.status < 600); // Server errors

        if (shouldRetry) {
          const delay = Math.pow(2, config._retryCount) * 1000; // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.axios(config);
        }

        throw error;
      },
    );
  }

  private handleApiError(error: any, operation: string): Error {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || error.message;

      switch (status) {
        case 401:
          return new Error(`Authentication failed for ${operation}: ${message}`);
        case 403:
          return new Error(`Access forbidden for ${operation}: ${message}`);
        case 404:
          return new Error(`Resource not found for ${operation}: ${message}`);
        case 429:
          return new Error(`Rate limit exceeded for ${operation}: ${message}`);
        case 500:
          return new Error(`Server error for ${operation}: ${message}`);
        default:
          return new Error(`API error for ${operation} (${status}): ${message}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      return new Error(`Timeout error for ${operation}`);
    } else if (error.code === 'ECONNREFUSED') {
      return new Error(`Connection refused for ${operation}. Is Firecrawl running?`);
    } else {
      return new Error(`Network error for ${operation}: ${error.message}`);
    }
  }

  updateConfig(config: Partial<FirecrawlClientConfig>): void {
    this.config = FirecrawlClientConfigSchema.parse({ ...this.config, ...config });

    // Update axios instance
    this.axios.defaults.baseURL = this.config.apiUrl;
    this.axios.defaults.timeout = this.config.timeout;

    if (this.config.apiKey) {
      this.axios.defaults.headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    if (this.config.headers) {
      Object.assign(this.axios.defaults.headers, this.config.headers);
    }
  }
}

export function createFirecrawlClient(config?: Partial<FirecrawlClientConfig>): FirecrawlClient {
  return new FirecrawlClient(config);
}
