# @repo/scraping-new

A modern, multi-provider web scraping system that supports various scraping strategies from
lightweight HTML parsing to full browser automation and managed scraping services.

## Features

- 🎭 **Multiple Provider Types**: Browser automation, HTML parsing, and managed services
- 🔄 **Provider Agnostic**: Switch between scraping strategies based on needs
- ⚡ **Performance First**: Use the lightest tool that gets the job done
- 🛡️ **Built-in Reliability**: Automatic retries, failover, and error recovery
- 🔧 **Extensible**: Easy to add new providers and capabilities
- 📊 **Monitoring**: Built-in metrics and health checks
- 🎯 **Smart Routing**: Automatic provider selection based on URL patterns

## Installation

```bash
pnpm add @repo/scraping-new

# Install the providers you need:
pnpm add playwright  # For Playwright provider
pnpm add puppeteer   # For Puppeteer provider
pnpm add cheerio     # For Cheerio HTML parser
```

## Quick Start

### Basic Usage

```typescript
import { createServerScraping } from '@repo/scraping-new/server';

const scraper = await createServerScraping({
  providers: [
    { name: 'playwright', type: 'browser' },
    { name: 'cheerio', type: 'html' },
  ],
  routing: {
    static: 'cheerio', // Use Cheerio for static sites
    dynamic: 'playwright', // Use Playwright for SPAs
    default: 'playwright', // Default fallback
  },
});

// Scrape a page
const result = await scraper.scrape('https://example.com', {
  waitForSelector: '.content',
  extract: {
    title: 'h1',
    price: { selector: '.price', transform: (text) => parseFloat(text.replace('$', '')) },
    images: { selector: 'img', attribute: 'src', multiple: true },
  },
});

console.log(result.data);
// { title: 'Product Name', price: 29.99, images: ['img1.jpg', 'img2.jpg'] }
```

### Advanced Usage

```typescript
// Import everything from the unified server module
import {
  createServerScraping,
  quickScrape,
  scrapeMultiple,
  scrapeWithPagination,
  EnhancedScraper,
} from '@repo/scraping-new/server';

// Scrape with specific provider
const result = await scraper.scrape('https://spa-app.com', {
  provider: 'playwright',
  waitUntil: 'networkidle',
  blockResources: ['image', 'stylesheet', 'font'],
  screenshot: true,
  executeScript: () => window.__INITIAL_DATA__,
});

// Quick one-liner scraping
const data = await quickScrape('https://example.com', {
  title: 'h1',
  price: '.price',
});

// Scrape multiple URLs concurrently
const results = await scrapeMultiple(
  ['https://example.com/page1', 'https://example.com/page2'],
  {
    title: 'h1',
    content: '.article-content',
  },
  {
    concurrent: 5,
    onProgress: (url, index, total) => {
      console.log(`Progress: ${index}/${total}`);
    },
  }
);

// Pagination scraping
const allPages = await scrapeWithPagination('https://example.com/products', {
  selectors: {
    products: { selector: '.product', multiple: true },
  },
  nextPageSelector: '.next-page',
  maxPages: 5,
});

// Enhanced scraper class for complex scenarios
const enhancedScraper = new EnhancedScraper();
await enhancedScraper.withAutoClose(async (scraper) => {
  return scraper.scrape('https://example.com');
});
```

## Provider Types

### 1. Browser Automation (Puppeteer, Playwright, Hero)

- Full JavaScript execution
- Screenshots and PDFs
- Complex interactions
- Best for: SPAs, dynamic content, authenticated sessions

### 2. HTML Parsers (Cheerio, JSDOM)

- Fast and lightweight
- No JavaScript execution
- Simple data extraction
- Best for: Static sites, high-volume scraping

### 3. Managed Services (ScrapingBee, Bright Data, Apify)

- Built-in proxy rotation
- CAPTCHA solving
- No infrastructure needed
- Best for: Scale, anti-bot protection

## Architecture

The package follows a provider-based architecture similar to our analytics and AI packages:

```
┌─────────────────────────────────────────────┐
│          ScrapingManager                    │
│    (Routes to appropriate provider)         │
├─────────┬──────────┬───────────┬───────────┤
│ Browser │   HTML   │  Managed  │  Custom   │
│Providers│ Parsers  │ Services  │ Providers │
└─────────┴──────────┴───────────┴───────────┘
```

## Configuration

```typescript
const scraper = await createServerScraping({
  providers: [
    {
      name: 'playwright',
      type: 'browser',
      config: {
        headless: true,
        browsers: ['chromium', 'firefox'],
      },
    },
    {
      name: 'scrapingbee',
      type: 'managed',
      config: {
        apiKey: process.env.SCRAPINGBEE_KEY,
        premium: true,
      },
    },
  ],

  defaults: {
    timeout: 30000,
    retries: 3,
    userAgent: 'MyBot/1.0',
  },

  middleware: [rateLimiter({ requests: 10, window: '1m' }), cacher({ ttl: '1h' })],
});
```

## Migration from @repo/scraping

The new package maintains compatibility while adding more features:

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

## Next.js Integration

```typescript
// app/api/scrape/route.ts
import { createServerScraping } from '@repo/scraping-new/server/next';

export async function POST(request: Request) {
  const { url } = await request.json();

  const scraper = await createServerScraping();
  const result = await scraper.scrape(url);

  return Response.json(result);
}
```
