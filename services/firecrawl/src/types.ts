import { z } from 'zod';

// Firecrawl API Types
export const FirecrawlConfigSchema = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional().default('https://api.firecrawl.dev'),
  timeout: z.number().optional().default(30000),
  retries: z.number().optional().default(3),
});

export const CrawlConfigSchema = z.object({
  includePaths: z.array(z.string()).optional(),
  excludePaths: z.array(z.string()).optional(),
  maxDepth: z.number().optional().default(2),
  limit: z.number().optional().default(100),
  allowBackwardLinks: z.boolean().optional().default(false),
  allowExternalLinks: z.boolean().optional().default(false),
  ignoreSitemap: z.boolean().optional().default(false),
});

export const ExtractConfigSchema = z.object({
  onlyMainContent: z.boolean().optional().default(true),
  includeHtml: z.boolean().optional().default(false),
  includeTags: z.array(z.string()).optional(),
  excludeTags: z.array(z.string()).optional(),
  onlyIncludeTags: z.array(z.string()).optional(),
  extractorOptions: z
    .object({
      mode: z.enum(['markdown', 'html', 'structured']).optional().default('markdown'),
      schema: z.record(z.any()).optional(),
    })
    .optional(),
});

export const ScrapeRequestSchema = z.object({
  url: z.string().url(),
  extractConfig: ExtractConfigSchema.optional(),
  headers: z.record(z.string()).optional(),
  includeScreenshot: z.boolean().optional().default(false),
  includePdf: z.boolean().optional().default(false),
  waitFor: z.number().optional(),
  timeout: z.number().optional(),
});

export const CrawlRequestSchema = z.object({
  url: z.string().url(),
  crawlConfig: CrawlConfigSchema.optional(),
  extractConfig: ExtractConfigSchema.optional(),
  headers: z.record(z.string()).optional(),
  webhook: z.string().url().optional(),
  jobId: z.string().optional(),
});

export const ExtractedContentSchema = z.object({
  markdown: z.string().optional(),
  html: z.string().optional(),
  rawHtml: z.string().optional(),
  text: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  author: z.string().optional(),
  publishedDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  links: z
    .array(
      z.object({
        url: z.string(),
        text: z.string().optional(),
        title: z.string().optional(),
      }),
    )
    .optional(),
  structured: z.record(z.any()).optional(),
});

export const ScrapeResultSchema = z.object({
  success: z.boolean(),
  url: z.string(),
  content: ExtractedContentSchema.optional(),
  metadata: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      author: z.string().optional(),
      publishedTime: z.string().optional(),
      modifiedTime: z.string().optional(),
      statusCode: z.number().optional(),
      error: z.string().optional(),
      warning: z.string().optional(),
      ogTitle: z.string().optional(),
      ogDescription: z.string().optional(),
      ogImage: z.string().optional(),
      ogUrl: z.string().optional(),
      sourceURL: z.string().optional(),
    })
    .optional(),
  screenshot: z.string().optional(),
  pdf: z.string().optional(),
  timing: z
    .object({
      total: z.number(),
      fetch: z.number(),
      extract: z.number(),
    })
    .optional(),
  error: z.string().optional(),
});

export const CrawlJobSchema = z.object({
  id: z.string(),
  url: z.string(),
  status: z.enum(['active', 'paused', 'completed', 'failed', 'cancelled']),
  current: z.number().optional(),
  current_url: z.string().optional(),
  current_step: z.string().optional(),
  total: z.number().optional(),
  creditsUsed: z.number().optional(),
  expiresAt: z.string().optional(),
  next: z.string().optional(),
  data: z.array(ScrapeResultSchema).optional(),
  partial_data: z.array(ScrapeResultSchema).optional(),
});

export const CrawlResultSchema = z.object({
  success: z.boolean(),
  jobId: z.string(),
  status: z.enum(['active', 'paused', 'completed', 'failed', 'cancelled']),
  total: z.number(),
  completed: z.number(),
  creditsUsed: z.number(),
  expiresAt: z.string().optional(),
  data: z.array(ScrapeResultSchema),
  error: z.string().optional(),
});

export const SearchRequestSchema = z.object({
  query: z.string(),
  pageOptions: z
    .object({
      onlyMainContent: z.boolean().optional().default(true),
      includeHtml: z.boolean().optional().default(false),
      fetchPageContent: z.boolean().optional().default(true),
    })
    .optional(),
  searchOptions: z
    .object({
      limit: z.number().optional().default(10),
    })
    .optional(),
});

export const SearchResultSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      url: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      content: ExtractedContentSchema.optional(),
    }),
  ),
  error: z.string().optional(),
});

export const MapRequestSchema = z.object({
  url: z.string().url(),
  search: z.string().optional(),
  ignoreSitemap: z.boolean().optional().default(false),
  includeSubdomains: z.boolean().optional().default(false),
  limit: z.number().optional().default(5000),
});

export const MapResultSchema = z.object({
  success: z.boolean(),
  links: z.array(z.string()),
  total: z.number(),
  error: z.string().optional(),
});

// Service Health
export const HealthResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.string(),
  version: z.string(),
  uptime: z.number(),
  services: z.object({
    firecrawl: z.object({
      status: z.enum(['connected', 'disconnected', 'error']),
      apiKey: z.boolean(),
      endpoint: z.string(),
    }),
    extraction: z.object({
      status: z.enum(['ready', 'degraded', 'error']),
      engines: z.array(z.string()),
    }),
  }),
});

// Content Analysis
export const ContentAnalysisSchema = z.object({
  wordCount: z.number(),
  readingTime: z.number(),
  language: z.string().optional(),
  topics: z.array(z.string()).optional(),
  sentiment: z
    .object({
      score: z.number(),
      label: z.enum(['positive', 'negative', 'neutral']),
    })
    .optional(),
  headings: z
    .array(
      z.object({
        level: z.number(),
        text: z.string(),
      }),
    )
    .optional(),
  codeBlocks: z
    .array(
      z.object({
        language: z.string().optional(),
        code: z.string(),
        lineCount: z.number(),
      }),
    )
    .optional(),
});

// Export Types
export type FirecrawlConfig = z.infer<typeof FirecrawlConfigSchema>;
export type CrawlConfig = z.infer<typeof CrawlConfigSchema>;
export type ExtractConfig = z.infer<typeof ExtractConfigSchema>;
export type ScrapeRequest = z.infer<typeof ScrapeRequestSchema>;
export type CrawlRequest = z.infer<typeof CrawlRequestSchema>;
export type ExtractedContent = z.infer<typeof ExtractedContentSchema>;
export type ScrapeResult = z.infer<typeof ScrapeResultSchema>;
export type CrawlJob = z.infer<typeof CrawlJobSchema>;
export type CrawlResult = z.infer<typeof CrawlResultSchema>;
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type MapRequest = z.infer<typeof MapRequestSchema>;
export type MapResult = z.infer<typeof MapResultSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type ContentAnalysis = z.infer<typeof ContentAnalysisSchema>;

// Error Types
export class FirecrawlError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any,
  ) {
    super(message);
    this.name = 'FirecrawlError';
  }
}

export class ExtractorError extends Error {
  constructor(
    message: string,
    public url: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'ExtractorError';
  }
}

export class CrawlerError extends Error {
  constructor(
    message: string,
    public jobId?: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'CrawlerError';
  }
}
