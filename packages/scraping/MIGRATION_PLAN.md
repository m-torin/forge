# Scraping Package Migration Plan

## Overview

This document outlines the plan to migrate the existing `@repo/scraping` package to the new
`@repo/scraping-new` package using the modern multi-provider architecture pattern.

## Goals

1. **Modernize Architecture**: Adopt the provider-based pattern from analytics-new/ai-new
2. **Maintain Compatibility**: Support all existing engines (Puppeteer, Playwright, Hero)
3. **Enhanced Features**: Add support for managed scraping services
4. **Better Separation**: Clear client/server boundaries
5. **Improved DX**: Reduce boilerplate, better types, clearer errors

## Architecture Overview

```
packages/scraping-new/
├── src/
│   ├── client/                    # Browser-based scraping (future)
│   │   ├── index.ts
│   │   └── providers/
│   │       └── browser-extension.ts
│   ├── server/                    # Node.js scraping
│   │   ├── index.ts
│   │   ├── manager.ts            # ScrapingManager class
│   │   └── providers/
│   │       ├── browser/          # Browser automation providers
│   │       │   ├── puppeteer.ts
│   │       │   ├── playwright.ts
│   │       │   └── hero.ts
│   │       ├── html/             # HTML parsing providers
│   │       │   ├── cheerio.ts
│   │       │   └── jsdom.ts
│   │       └── managed/          # Managed service providers
│   │           ├── scrapingbee.ts
│   │           ├── brightdata.ts
│   │           └── apify.ts
│   ├── shared/
│   │   ├── types/
│   │   │   ├── provider.ts       # Provider interfaces
│   │   │   ├── config.ts         # Configuration types
│   │   │   └── results.ts        # Result types
│   │   ├── utils/
│   │   │   ├── selectors.ts      # Selector utilities
│   │   │   ├── extraction.ts     # Data extraction
│   │   │   └── validation.ts     # Input validation
│   │   └── errors.ts             # Error classes
│   └── next/
│       ├── hooks.tsx             # React hooks
│       └── server.ts             # Next.js utilities
├── package.json
└── tsconfig.json
```

## Provider System Design

### Provider Interface

```typescript
interface ScrapingProvider {
  readonly name: string;
  readonly type: 'browser' | 'html' | 'managed' | 'custom';
  readonly capabilities: Set<ScrapingCapability>;

  // Core methods
  scrape(url: string, options?: ScrapeOptions): Promise<ScrapeResult>;
  extract(html: string, selectors: SelectorMap): Promise<ExtractedData>;

  // Optional capabilities
  screenshot?(url: string, options?: ScreenshotOptions): Promise<Buffer>;
  pdf?(url: string, options?: PDFOptions): Promise<Buffer>;
  interact?(url: string, actions: Action[]): Promise<InteractionResult>;
  scrapeMultiple?(
    urls: string[],
    options?: MultiScrapeOptions
  ): AsyncIterableIterator<ScrapeResult>;

  // Lifecycle
  initialize?(): Promise<void>;
  dispose?(): Promise<void>;
  healthCheck?(): Promise<boolean>;
}

type ScrapingCapability =
  | 'scrape'
  | 'extract'
  | 'screenshot'
  | 'pdf'
  | 'interact'
  | 'javascript'
  | 'proxy'
  | 'cookies'
  | 'concurrent';
```

## Migration Steps

### Phase 1: Core Infrastructure (Week 1)

1. **Set up directory structure**
2. **Define provider interfaces** in `shared/types/`
3. **Create ScrapingManager** with provider registry
4. **Implement base provider** class
5. **Set up error handling** and utilities

### Phase 2: Browser Providers (Week 2)

1. **Migrate Puppeteer provider**

   - Core scraping functionality
   - Screenshot and PDF support
   - Resource blocking

2. **Migrate Playwright provider**

   - Enhanced utilities
   - Multi-browser support
   - Advanced interactions

3. **Migrate Hero provider**
   - AI-powered extraction
   - CAPTCHA handling

### Phase 3: Additional Providers (Week 3)

1. **HTML Parsing Providers**

   - Cheerio for lightweight parsing
   - JSDOM for DOM manipulation

2. **Managed Service Providers**
   - ScrapingBee integration
   - Bright Data integration
   - Apify integration

### Phase 4: Enhanced Features (Week 4)

1. **Concurrent Scraping**

   - Queue management
   - Rate limiting
   - Resource pooling

2. **Advanced Extraction**

   - Schema validation
   - AI-powered extraction
   - Pattern matching

3. **Monitoring & Reliability**
   - Health checks
   - Automatic failover
   - Usage tracking

### Phase 5: Next.js Integration (Week 5)

1. **React Hooks**

   - `useScraper` hook
   - `useExtraction` hook
   - Real-time scraping status

2. **Server Components**
   - Edge-compatible providers
   - Caching strategies
   - Rate limiting

## Provider-Specific Features

### Browser Automation Providers

**Shared Features:**

- Page navigation
- Element selection
- JavaScript execution
- Network interception
- Cookie management

**Provider-Specific:**

- **Puppeteer**: Chrome DevTools Protocol access
- **Playwright**: Multi-browser, mobile emulation
- **Hero**: AI extraction, anti-detection

### HTML Parsing Providers

**Use Cases:**

- Static HTML parsing
- No JavaScript needed
- Lightweight operations
- High performance

### Managed Service Providers

**Benefits:**

- No infrastructure management
- Built-in proxy rotation
- CAPTCHA solving
- Geographic distribution

## Usage Examples

### Basic Scraping

```typescript
const scraper = await createServerScraping({
  providers: [
    { name: 'playwright', type: 'browser', config: { headless: true } },
    { name: 'cheerio', type: 'html', config: {} },
  ],
  defaultProvider: 'playwright',
});

// Automatic provider selection based on needs
const result = await scraper.scrape('https://example.com', {
  waitForSelector: '.content',
  extract: {
    title: 'h1',
    price: '.price',
    description: { selector: '.desc', attribute: 'text' },
  },
});
```

### Advanced Usage

```typescript
// Use specific provider for JavaScript-heavy sites
const dynamicResult = await scraper.scrape('https://spa-app.com', {
  provider: 'playwright',
  waitForSelector: '[data-loaded="true"]',
  executeScript: () => window.__INITIAL_DATA__,
});

// Use HTML parser for static content
const staticResult = await scraper.scrape('https://blog.com', {
  provider: 'cheerio',
  extract: {
    articles: {
      selector: 'article',
      multiple: true,
      fields: {
        title: 'h2',
        date: 'time',
        content: '.content',
      },
    },
  },
});

// Use managed service for scale
const results = scraper.scrapeMultiple(urls, {
  provider: 'scrapingbee',
  concurrent: 10,
  retries: 3,
});
```

## Benefits Over Current Implementation

1. **Provider Flexibility**: Easy to switch between scraping strategies
2. **Better Abstraction**: Cleaner separation of concerns
3. **Enhanced Reliability**: Automatic failover between providers
4. **Cost Optimization**: Choose the right tool for each job
5. **Future Proof**: Easy to add new providers
6. **Better Testing**: Mock providers for testing

## Breaking Changes

1. **Import Paths**: Change from `@repo/scraping` to `@repo/scraping-new/server`
2. **Configuration**: New provider-based configuration
3. **API Changes**: Some method signatures updated for consistency
4. **Engine Selection**: Now done via provider configuration

## Migration Guide

```typescript
// Old
import { createScraper } from '@repo/scraping';
const scraper = createScraper('playwright', { headless: true });

// New
import { createServerScraping } from '@repo/scraping-new/server';
const scraper = await createServerScraping({
  providers: [{ name: 'playwright', type: 'browser', config: { headless: true } }],
});
```

## Timeline

- **Week 1**: Core infrastructure
- **Week 2**: Browser provider migration
- **Week 3**: Additional providers
- **Week 4**: Enhanced features
- **Week 5**: Next.js integration and testing

Total estimated time: 5 weeks for full migration with backward compatibility.
