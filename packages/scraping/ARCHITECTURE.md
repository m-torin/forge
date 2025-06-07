# Scraping Package Architecture

## Overview

The `@repo/scraping` package provides a modern, multi-provider web scraping system that supports
various scraping strategies from lightweight HTML parsing to full browser automation and managed
scraping services.

## Core Design Principles

1. **Provider Agnostic**: Switch between scraping strategies based on needs
2. **Performance First**: Use the lightest tool that gets the job done
3. **Reliability**: Automatic retries, failover, and error recovery
4. **Developer Experience**: Clean APIs, good defaults, helpful errors
5. **Extensible**: Easy to add new providers and capabilities

## Architecture Layers

```
┌────────────────────────────────────────────┐
│          Application Layer                  │
│    (Unified scraping API for all needs)    │
├────────────────────────────────────────────┤
│         Scraping Manager Layer              │
│    (Routes to appropriate provider)         │
├─────────┬──────────┬───────────┬───────────┤
│ Browser │   HTML   │  Managed  │  Custom   │
│Providers│ Parsers  │ Services  │ Providers │
│         │          │           │           │
│Puppeteer│ Cheerio  │ScrapingBee│    AI     │
│Playwright│  JSDOM  │BrightData │ Scrapers  │
│  Hero   │          │   Apify   │           │
└─────────┴──────────┴───────────┴───────────┘
```

## Provider Categories

### 1. Browser Automation Providers

For JavaScript-heavy sites, complex interactions, screenshots

**Capabilities:**

- Full JavaScript execution
- User interactions (click, type, scroll)
- Screenshot and PDF generation
- Cookie and session management
- Network request interception

**When to use:**

- Single Page Applications (SPAs)
- Sites requiring login
- Dynamic content loading
- Visual verification needed

### 2. HTML Parsing Providers

For static content, high performance, simple extraction

**Capabilities:**

- Fast HTML parsing
- CSS/XPath selectors
- Basic data extraction
- Low resource usage

**When to use:**

- Static HTML sites
- RSS/XML feeds
- High-volume scraping
- Server-side rendering only

### 3. Managed Service Providers

For scale, reliability, proxy management

**Capabilities:**

- Built-in proxy rotation
- CAPTCHA solving
- Geographic distribution
- No infrastructure needed

**When to use:**

- Large-scale scraping
- Sites with anti-bot protection
- Need for different geolocations
- Limited local resources

## Usage Patterns

### 1. Automatic Provider Selection

```typescript
const scraper = createServerScraping({
  providers: [
    { name: 'cheerio', type: 'html' },
    { name: 'playwright', type: 'browser' },
    { name: 'scrapingbee', type: 'managed' },
  ],
  routing: {
    // Use Cheerio for static sites
    static: 'cheerio',
    // Use Playwright for SPAs
    dynamic: 'playwright',
    // Use managed service for protected sites
    protected: 'scrapingbee',
    // Default fallback
    default: 'playwright',
  },
});

// Scraper automatically selects best provider
const data = await scraper.scrape('https://example.com', {
  hint: 'static', // Optional hint for provider selection
});
```

### 2. Explicit Provider Usage

```typescript
// Force specific provider
const result = await scraper.scrape('https://example.com', {
  provider: 'puppeteer',
  waitForSelector: '.loaded',
  screenshot: true,
});
```

### 3. Concurrent Scraping

```typescript
// Scrape multiple URLs with optimal provider mix
const results = scraper.scrapeMultiple(urls, {
  concurrent: 10,
  providers: ['cheerio', 'playwright'], // Use both
  distribution: {
    cheerio: 0.7, // 70% with Cheerio
    playwright: 0.3, // 30% with Playwright
  },
});

for await (const result of results) {
  console.log(result.url, result.data);
}
```

### 4. Advanced Extraction

```typescript
const extracted = await scraper.extract('https://e-commerce.com', {
  schema: {
    products: {
      selector: '.product-card',
      multiple: true,
      fields: {
        name: { selector: 'h3', transform: 'trim' },
        price: {
          selector: '.price',
          transform: (text) => parseFloat(text.replace('$', '')),
        },
        image: { selector: 'img', attribute: 'src' },
        inStock: {
          selector: '.availability',
          transform: (text) => text.includes('In Stock'),
        },
      },
    },
    pagination: {
      next: 'a.next-page',
      limit: 5,
    },
  },
});
```

## Error Handling

```typescript
try {
  const result = await scraper.scrape(url);
} catch (error) {
  if (error.code === 'CAPTCHA_DETECTED') {
    // Retry with managed service
    const result = await scraper.scrape(url, {
      provider: 'scrapingbee',
    });
  } else if (error.code === 'TIMEOUT') {
    // Retry with longer timeout
    const result = await scraper.scrape(url, {
      timeout: 60000,
    });
  }
}
```

## Configuration

### Global Configuration

```typescript
const scraper = createServerScraping({
  providers: [...],

  // Global defaults
  defaults: {
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    userAgent: 'MyBot/1.0'
  },

  // Middleware
  middleware: [
    rateLimiter({ requests: 10, window: '1m' }),
    cacher({ ttl: '1h' }),
    logger({ level: 'info' })
  ],

  // Resource management
  resources: {
    maxConcurrent: 5,
    maxMemory: '1GB',
    recycleAfter: 100 // Recycle browser after 100 pages
  }
});
```

### Provider-Specific Configuration

```typescript
{
  providers: [
    {
      name: 'playwright',
      type: 'browser',
      config: {
        headless: true,
        browsers: ['chromium', 'firefox'],
        device: 'iPhone 12',
        locale: 'en-US',
        timezone: 'America/New_York',
      },
    },
    {
      name: 'scrapingbee',
      type: 'managed',
      config: {
        apiKey: process.env.SCRAPINGBEE_KEY,
        premium: true,
        country: 'US',
        renderJs: true,
      },
    },
  ];
}
```

## Performance Optimization

### 1. Resource Blocking

```typescript
await scraper.scrape(url, {
  blockResources: ['image', 'font', 'stylesheet'],
  // Only load what's needed
});
```

### 2. Parallel Processing

```typescript
const scraper = createServerScraping({
  providers: [
    { name: 'cheerio', type: 'html', instances: 10 },
    { name: 'playwright', type: 'browser', instances: 3 },
  ],
});
```

### 3. Caching

```typescript
const cachedScraper = scraper.withCache({
  store: 'redis',
  ttl: '1h',
  key: (url, options) => `scrape:${url}:${hash(options)}`,
});
```

## Monitoring & Observability

```typescript
scraper.on('scrape:start', ({ url, provider }) => {
  console.log(`Starting scrape of ${url} with ${provider}`);
});

scraper.on('scrape:complete', ({ url, duration, provider }) => {
  metrics.record('scrape.duration', duration, { provider });
});

scraper.on('error', ({ error, url, provider }) => {
  logger.error('Scrape failed', { error, url, provider });
});

// Health monitoring
const health = await scraper.healthCheck();
console.log(health);
// {
//   providers: {
//     playwright: { healthy: true, latency: 234 },
//     cheerio: { healthy: true, latency: 12 },
//     scrapingbee: { healthy: true, remaining: 9876 }
//   }
// }
```

## Security Considerations

1. **Proxy Rotation**: Built-in support for proxy pools
2. **Rate Limiting**: Configurable per-provider limits
3. **Fingerprint Randomization**: User agents, viewports, etc.
4. **Cookie Isolation**: Separate cookie jars per session
5. **Sandbox Execution**: Browser code runs in sandbox

## Next.js Integration

```typescript
// app/api/scrape/route.ts
import { createServerScraping } from '@repo/scraping/server/next';

export async function POST(request: Request) {
  const { url } = await request.json();

  const scraper = await createServerScraping();
  const result = await scraper.scrape(url);

  return Response.json(result);
}

// components/scraper.tsx
('use client');
import { useScraper } from '@repo/scraping/client/next';

export function ScraperComponent() {
  const { scrape, isLoading, data, error } = useScraper();

  // Component implementation
}
```

This architecture provides maximum flexibility for web scraping needs while maintaining clean,
predictable APIs and excellent performance characteristics.
