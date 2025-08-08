# @repo/scraping

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `./client`, `./server`, `./client/next`, `./server/next`
  - **Utilities**: `./parsers`, `./extractors`, `./types`

- _AI Hints:_

  ```typescript
  // Primary: Multi-provider web scraping - browser automation + HTML parsing
  import {
    createServerScraping,
    quickScrape
  } from "@repo/scraping/server/next";
  // Client: import { useScrape } from "@repo/scraping/client/next"
  // ❌ NEVER: Scrape without rate limiting or ignore robots.txt
  ```

- _Key Features:_
  - **Browser Automation**: Full JavaScript execution with Playwright and
    Puppeteer for SPAs and dynamic content
  - **HTML Parsing**: Fast, lightweight extraction with Cheerio and Node.js
    fetch for static content
  - **Multiple Provider Support**: Automatic provider selection based on content
    type and complexity
  - **Data Extraction**: Structured data extraction with selectors, attributes,
    and multiple element support
  - **Error Handling**: Built-in ScrapingError types with provider health checks
    and graceful fallbacks
  - **Next.js Integration**: Server actions, API routes, and React hooks for
    seamless integration

- _Available Providers:_
  - **Browser**: `playwright` (headless Chrome), `puppeteer` (Chrome
    automation), `hero` (experimental)
  - **HTML Parsing**: `cheerio` (jQuery-like), `node-fetch` (simple fetching),
    `console` (debug)

- _Quick Examples:_

  ```typescript
  // Simple one-liner extraction
  import { quickScrape } from "@repo/scraping/server/next";
  const data = await quickScrape("https://example.com", {
    title: "h1",
    description: "meta[name='description']"
  });

  // Advanced multi-provider scraping
  import { createServerScraping } from "@repo/scraping/server/next";
  const scraper = await createServerScraping({
    providers: { cheerio: {}, playwright: { headless: true } }
  });

  const result = await scraper.scrape("https://spa-app.com", {
    waitForSelector: ".content",
    extract: {
      title: "h1",
      images: { selector: "img", attribute: "src", multiple: true }
    }
  });
  ```

- _Client Hooks:_

  ```typescript
  // React hook for client-side scraping (requires API routes)
  import { useScrape } from "@repo/scraping/client/next";
  const { scrape, loading, data, error } = useScrape();
  await scrape("https://example.com", { extract: { title: "h1" } });
  ```

- _Documentation:_ **[Scraping Package](../../apps/docs/packages/scraping.mdx)**
