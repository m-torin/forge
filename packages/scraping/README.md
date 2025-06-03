# @repo/scraping

A powerful web scraping package with support for multiple browser engines (Puppeteer, Playwright,
Hero) and enhanced utilities to reduce boilerplate.

## Installation

```bash
pnpm add @repo/scraping

# Install the browser engine you want to use:
pnpm add playwright  # For Playwright
pnpm add puppeteer   # For Puppeteer
```

## Features

- 🎭 **Multiple Browser Engines**: Support for Puppeteer, Playwright, and Hero
- 🚀 **Enhanced Utilities**: High-level functions to reduce boilerplate
- 🔄 **Automatic Retries**: Built-in retry logic with exponential backoff
- 🎯 **Smart Extraction**: Declarative selector-based data extraction
- 🤖 **Human-like Behavior**: Random delays and user agents
- 📸 **Screenshots**: Capture full page or specific elements
- 🔍 **CAPTCHA Detection**: Automatic detection of CAPTCHA challenges
- ⚡ **Resource Blocking**: Block images, styles, etc. for faster scraping

## Quick Start

### Using Enhanced Playwright (Recommended for Less Boilerplate)

```typescript
import { quickScrape, scrapeMultiple, scrapeWithPagination } from '@repo/scraping/playwright';

// Quick scrape with selectors
const { data, title, screenshot } = await quickScrape(
  'https://example.com',
  {
    title: { selector: 'h1' },
    price: { selector: '.price', transform: (text) => parseFloat(text.replace('$', '')) },
    description: { selector: '.description' },
    images: { selector: 'img', attribute: 'src', multiple: true },
  },
  {
    waitForSelector: 'h1',
    blockResources: ['image', 'stylesheet'],
    screenshot: true,
  }
);

// Scrape multiple URLs
const results = await scrapeMultiple(
  ['https://example.com/page1', 'https://example.com/page2'],
  {
    title: { selector: 'h1' },
    content: { selector: '.content' },
  },
  {
    concurrent: 3,
    onProgress: (url, index, total) => {
      console.log(`Scraping ${index}/${total}: ${url}`);
    },
  }
);

// Scrape with pagination
const pages = await scrapeWithPagination(
  'https://example.com/products',
  {
    products: { selector: '.product', multiple: true },
    nextPageSelector: 'a.next-page',
  },
  {
    maxPages: 5,
    delay: 1000, // Wait 1s between pages
  }
);
```

### Using Enhanced Playwright Class

```typescript
import { EnhancedPlaywrightScraper } from '@repo/scraping/playwright';

const scraper = new EnhancedPlaywrightScraper({
  headless: true,
  defaultTimeout: 30000,
});

// Use with auto-close
await scraper.withAutoClose(async (s) => {
  // Navigate
  await s.goto('https://example.com');

  // Wait for element
  await s.waitFor('.products-loaded');

  // Extract data
  const data = await s.extract({
    products: {
      selector: '.product-card',
      multiple: true,
    },
    totalCount: {
      selector: '.total-count',
      transform: (text) => parseInt(text),
    },
  });

  // Get all links
  const links = await s.getLinks('a.product-link');

  // Take screenshot
  const screenshot = await s.screenshot({ fullPage: true });

  return { data, links, screenshot };
});
```

### Form Interaction

```typescript
const scraper = new EnhancedPlaywrightScraper();

await scraper.withAutoClose(async (s) => {
  await s.goto('https://example.com/search');

  // Fill form fields with human-like delays
  await s.fillForm({
    '#search-input': 'laptops',
    '#min-price': '500',
    '#max-price': '2000',
  });

  // Click search button
  await s.click('#search-button');

  // Wait for results
  await s.waitForNavigation();
  await s.waitFor('.search-results');

  // Extract results
  return s.extract({
    results: { selector: '.result-item', multiple: true },
  });
});
```

### Traditional API (Still Available)

```typescript
import { createScraper } from '@repo/scraping';

// Create a scraper instance
const scraper = createScraper('playwright', {
  headless: true,
  maxConcurrency: 5,
});

// Launch browser
await scraper.launch();

// Scrape a page
const result = await scraper.scrape({
  url: 'https://example.com',
  waitForSelector: '.content',
  screenshot: true,
  blockedResourceTypes: ['image', 'stylesheet'],
});

// Extract data from HTML
const data = scraper.extract(result.html, {
  title: { selector: 'h1' },
  price: {
    selector: '.price',
    attribute: 'data-price',
    transform: (value) => parseFloat(value),
  },
  images: {
    selector: 'img',
    attribute: 'src',
    multiple: true,
  },
});

// Clean up
await scraper.close();
```

## Advanced Features

### Resource Blocking for Performance

```typescript
const scraper = new EnhancedPlaywrightScraper();

await scraper.withAutoClose(async (s) => {
  // Block resources before navigation
  await s.blockResources(['image', 'stylesheet', 'font', 'media']);

  await s.goto('https://example.com');
  // Page loads much faster without images and styles
});
```

### Custom JavaScript Execution

```typescript
await scraper.withAutoClose(async (s) => {
  await s.goto('https://example.com');

  // Execute custom JavaScript
  const pageData = await s.evaluate(() => {
    return {
      totalProducts: document.querySelectorAll('.product').length,
      hasMorePages: !!document.querySelector('.next-page'),
      customData: window.someGlobalVariable,
    };
  });
});
```

### Error Handling

```typescript
import { ScrapingError, ScrapingErrorCodes } from '@repo/scraping';

try {
  await quickScrape('https://example.com', selectors);
} catch (error) {
  if (error instanceof ScrapingError) {
    switch (error.code) {
      case ScrapingErrorCodes.CAPTCHA_DETECTED:
        console.log('CAPTCHA detected, need manual intervention');
        break;
      case ScrapingErrorCodes.ELEMENT_NOT_FOUND:
        console.log('Page structure changed:', error.message);
        break;
      default:
        console.log('Scraping failed:', error.message);
    }
  }
}
```

## Workflow Integration

The scraping package integrates seamlessly with the orchestration package for workflow-based
scraping:

```typescript
import { quickScrape } from '@repo/scraping/playwright';
import type { WorkflowContext } from '@upstash/workflow';

export async function scrapingWorkflow(context: WorkflowContext<{ urls: string[] }>) {
  const { urls } = context.requestPayload;

  // Scrape URLs in parallel batches
  const results = await context.run('scrape-products', async () => {
    return scrapeMultiple(
      urls,
      {
        title: { selector: 'h1' },
        price: { selector: '.price' },
        availability: { selector: '.availability' },
      },
      {
        concurrent: 3,
      }
    );
  });

  // Process results
  const available = results.filter((r) => r.data.availability?.includes('In Stock'));

  return {
    total: results.length,
    available: available.length,
    results,
  };
}
```

## Best Practices

1. **Use Enhanced Utilities**: The enhanced utilities handle common patterns and reduce boilerplate
2. **Block Unnecessary Resources**: Block images, styles, and fonts for faster scraping
3. **Add Delays**: Use human-like delays between actions to avoid detection
4. **Handle Errors**: Always wrap scraping in try-catch blocks
5. **Respect robots.txt**: Check and respect website scraping policies
6. **Use Headless Mode**: Run in headless mode for better performance
7. **Rotate User Agents**: The package automatically rotates user agents

## API Reference

### Enhanced Playwright API

#### `quickScrape(url, selectors, options)`

Quick scraping with automatic resource management.

#### `scrapeMultiple(urls, selectors, options)`

Scrape multiple URLs concurrently.

#### `scrapeWithPagination(startUrl, selectors, options)`

Automatically follow pagination links.

#### `EnhancedPlaywrightScraper`

Class with convenient methods for complex scraping scenarios.

### Traditional API

#### `createScraper(engine, config)`

Create a scraper instance with specified engine.

#### `scraper.launch()`

Launch the browser instance.

#### `scraper.scrape(options)`

Scrape a single page.

#### `scraper.extract(html, selectors)`

Extract data from HTML using selectors.

#### `scraper.close()`

Close the browser instance.
