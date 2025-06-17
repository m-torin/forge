import { z } from 'zod';

export const OpenGrepConfigSchema = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().url().default('https://semgrep.dev/api'),
  timeout: z.number().positive().default(30000),
  maxRetries: z.number().int().min(0).max(5).default(3),
});

export type OpenGrepConfig = z.infer<typeof OpenGrepConfigSchema>;

export const SearchQuerySchema = z.object({
  pattern: z.string().min(1),
  language: z.string().optional(),
  paths: z.array(z.string()).optional(),
  excludePaths: z.array(z.string()).optional(),
  maxResults: z.number().int().positive().max(1000).default(100),
  caseSensitive: z.boolean().default(false),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const SearchResultSchema = z.object({
  file: z.string(),
  line: z.number().int().positive(),
  column: z.number().int().positive(),
  match: z.string(),
  context: z
    .object({
      before: z.array(z.string()).optional(),
      after: z.array(z.string()).optional(),
    })
    .optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

export const SearchResponseSchema = z.object({
  results: z.array(SearchResultSchema),
  totalCount: z.number().int().min(0),
  hasMore: z.boolean(),
  searchTime: z.number().positive(),
  query: SearchQuerySchema,
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

export const RuleSchema = z.object({
  id: z.string(),
  message: z.string(),
  pattern: z.string(),
  language: z.string(),
  severity: z.enum(['error', 'warning', 'info']),
  metadata: z.record(z.unknown()).optional(),
});

export type Rule = z.infer<typeof RuleSchema>;

export const ScanResultSchema = z.object({
  file: z.string(),
  line: z.number().int().positive(),
  column: z.number().int().positive(),
  ruleId: z.string(),
  message: z.string(),
  severity: z.enum(['error', 'warning', 'info']),
  fix: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type ScanResult = z.infer<typeof ScanResultSchema>;

export const ScanResponseSchema = z.object({
  results: z.array(ScanResultSchema),
  errors: z.array(z.union([z.string(), z.record(z.unknown())])).optional(),
  warnings: z.array(z.union([z.string(), z.record(z.unknown())])).optional(),
  stats: z.object({
    filesScanned: z.number().int().min(0),
    rulesRun: z.number().int().min(0),
    scanTime: z.number().positive(),
  }),
});

export type ScanResponse = z.infer<typeof ScanResponseSchema>;

export interface OpenGrepError extends Error {
  code?: string;
  statusCode?: number;
  response?: unknown,
}

export interface OpenGrepClient {
  search(query: SearchQuery): Promise<SearchResponse>;
  scan(rules: Rule[], paths: string[]): Promise<ScanResponse>;
  getRules(filters?: { language?: string; severity?: string }): Promise<Rule[]>;
  validateRule(rule: Rule): Promise<boolean>,
}
