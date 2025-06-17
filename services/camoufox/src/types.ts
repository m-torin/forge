import { z } from 'zod';

export const CamoufoxConfigSchema = z.object({
  headless: z.boolean().default(true),
  stealth: z.boolean().default(true),
  proxy: z.string().optional(),
  userAgent: z.string().optional(),
  viewport: z
    .object({
      width: z.number().default(1920),
      height: z.number().default(1080),
    })
    .default({ width: 1920, height: 1080 }),
  timeout: z.number().positive().default(30000),
  maxRetries: z.number().int().min(0).max(10).default(3),
  locale: z.string().default('en-US'),
  timezone: z.string().default('America/New_York'),
  geolocation: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  cookies: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
        domain: z.string(),
        path: z.string().default('/'),
        httpOnly: z.boolean().default(false),
        secure: z.boolean().default(false),
      }),
    )
    .default([]),
  headers: z.record(z.string()).default({}),
});

export type CamoufoxConfig = z.infer<typeof CamoufoxConfigSchema>;

export const BrowserEngineSchema = z.enum(['chromium', 'firefox', 'webkit']).default('chromium');
export type BrowserEngine = z.infer<typeof BrowserEngineSchema>;

export const StealthFeaturesSchema = z.object({
  webdriver: z.boolean().default(true),
  navigator: z.boolean().default(true),
  userAgent: z.boolean().default(true),
  languages: z.boolean().default(true),
  webgl: z.boolean().default(true),
  canvas: z.boolean().default(true),
  permissions: z.boolean().default(true),
  plugins: z.boolean().default(true),
  media: z.boolean().default(true),
  iframe: z.boolean().default(true),
  hairline: z.boolean().default(true),
});

export type StealthFeatures = z.infer<typeof StealthFeaturesSchema>;

export const ScrapingRequestSchema = z.object({
  url: z.string().url(),
  waitFor: z
    .union([
      z.string(), // CSS selector
      z.number(), // timeout in ms
      z.object({
        selector: z.string().optional(),
        timeout: z.number().optional(),
        networkIdle: z.boolean().optional(),
      }),
    ])
    .optional(),
  actions: z
    .array(
      z.object({
        type: z.enum(['click', 'type', 'select', 'hover', 'scroll', 'wait', 'screenshot']),
        selector: z.string().optional(),
        value: z.string().optional(),
        timeout: z.number().optional(),
      }),
    )
    .default([]),
  extract: z
    .object({
      selectors: z.record(z.string()).optional(),
      attributes: z.record(z.string()).optional(),
      text: z.array(z.string()).optional(),
      links: z.boolean().default(false),
      images: z.boolean().default(false),
    })
    .optional(),
  screenshot: z.boolean().default(false),
  pdf: z.boolean().default(false),
  source: z.boolean().default(false),
});

export type ScrapingRequest = z.infer<typeof ScrapingRequestSchema>;

export const ScrapingResultSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  url: z.string(),
  success: z.boolean(),
  data: z.record(z.unknown()).optional(),
  screenshot: z.string().optional(), // base64 encoded
  pdf: z.string().optional(), // base64 encoded
  source: z.string().optional(),
  metadata: z.object({
    title: z.string().optional(),
    loadTime: z.number(),
    statusCode: z.number().optional(),
    userAgent: z.string(),
    finalUrl: z.string(),
  }),
  errors: z.array(z.string()).default([]),
});

export type ScrapingResult = z.infer<typeof ScrapingResultSchema>;

export const BrowserLaunchOptionsSchema = z.object({
  engine: BrowserEngineSchema,
  config: CamoufoxConfigSchema,
  stealth: StealthFeaturesSchema.optional(),
  executablePath: z.string().optional(),
  args: z.array(z.string()).default([]),
  devtools: z.boolean().default(false),
});

export type BrowserLaunchOptions = z.infer<typeof BrowserLaunchOptionsSchema>;

export const PageTestSchema = z.object({
  url: z.string().url(),
  tests: z.array(
    z.object({
      name: z.string(),
      type: z.enum([
        'element-exists',
        'element-visible',
        'text-contains',
        'attribute-equals',
        'form-submit',
        'navigation',
        'performance',
        'accessibility',
      ]),
      selector: z.string().optional(),
      expected: z.string().optional(),
      timeout: z.number().default(5000),
    }),
  ),
  beforeEach: z
    .array(
      z.object({
        type: z.enum(['click', 'type', 'wait', 'navigate']),
        selector: z.string().optional(),
        value: z.string().optional(),
      }),
    )
    .default([]),
});

export type PageTest = z.infer<typeof PageTestSchema>;

export const TestResultSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  url: z.string(),
  results: z.array(
    z.object({
      name: z.string(),
      passed: z.boolean(),
      duration: z.number(),
      error: z.string().optional(),
    }),
  ),
  summary: z.object({
    total: z.number(),
    passed: z.number(),
    failed: z.number(),
    duration: z.number(),
  }),
  screenshot: z.string().optional(),
});

export type TestResult = z.infer<typeof TestResultSchema>;

export interface CamoufoxError extends Error {
  code?: string;
  url?: string;
  screenshot?: string,
}

export interface CamoufoxClient {
  launch(options?: BrowserLaunchOptions): Promise<CamoufoxBrowser>;
  scrape(request: ScrapingRequest, options?: BrowserLaunchOptions): Promise<ScrapingResult>;
  test(pageTest: PageTest, options?: BrowserLaunchOptions): Promise<TestResult>;
  close(): Promise<void>,
}

export interface CamoufoxBrowser {
  newPage(): Promise<CamoufoxPage>;
  close(): Promise<void>;
  isConnected(): boolean,
}

export interface CamoufoxPage {
  goto(url: string, options?: { waitUntil?: string; timeout?: number }): Promise<void>;
  waitForSelector(selector: string, options?: { timeout?: number }): Promise<void>;
  click(selector: string, options?: { timeout?: number }): Promise<void>;
  type(selector: string, text: string, options?: { delay?: number }): Promise<void>;
  select(selector: string, value: string): Promise<void>;
  screenshot(options?: { fullPage?: boolean; quality?: number }): Promise<Buffer>;
  pdf(options?: { format?: string; margin?: object }): Promise<Buffer>;
  content(): Promise<string>;
  evaluate<T>(fn: string | ((...args: any[]) => T), ...args: any[]): Promise<T>;
  extractData(selectors: Record<string, string>): Promise<Record<string, string>>;
  close(): Promise<void>,
}
