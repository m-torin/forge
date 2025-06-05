# Migration Structure for packages/scraping-new

## **Migration Gap Analysis: packages/scraping → packages/scraping-new**

Based on analysis, here are the specific code components from the old package that were **NOT fully
migrated** to the new package:

### **1. Missing Provider Implementations**

**Not Migrated:**

- **`PuppeteerScraper` class** - Complete Puppeteer implementation with full configuration
- **`HeroScraper` class** - AI-powered Hero browser automation implementation
- **Factory functions**: `createPuppeteerScraper()`, `createHeroScraper()`, `scrapePuppeteer()`,
  `scrapeHero()`

**Status in New Package:**

- Only **`PlaywrightProvider`** exists in server providers
- **Puppeteer and Hero providers are completely missing**
- New package only mentions them in README but no actual implementation

### **2. Missing Core Types and Interfaces**

**Not Migrated:**

- **`ScrapingEngine`** type (`'puppeteer' | 'playwright' | 'hero'`)
- **`ScrapingEngineConfig`** interface with specific browser launch options
- **`ScrapingSession`** interface for session management
- **`BrowserManager`** interface (replaced with `ScrapingProvider` but different API)

**Different/Modified:**

- Old `ScrapingOptions` → New `ScrapeOptions` (similar but different structure)
- Old `ScrapingResult` → New `ScrapeResult` (different metadata structure)

### **3. Missing Advanced Browser Features**

**Not Migrated from Enhanced Playwright:**

- **`scrapeWithPagination()`** - While mentioned in README, implementation differs significantly
- **`scrapeMultiple()`** - Basic version exists but missing progress callbacks and sophisticated
  batching
- **`quickScrape()`** - Simplified version exists but different interface

**Missing Methods:**

- `waitForNavigation()` with URL patterns
- `fillForm()` for form automation
- `blockResources()` for performance optimization
- `withAutoClose()` pattern for resource management

### **4. Missing Utility Functions**

**Not Migrated:**

- **`extractFromHtml()`** - Old version was a placeholder but new version doesn't have exact
  equivalent
- **`isScrapableUrl()`** - Utility to check if URL is scrapable based on extension
- Browser launch argument configurations

**Partially Migrated:**

- `detectCaptcha()`, `getRandomUserAgent()`, `humanDelay()`, `retryWithBackoff()` exist but may have
  different implementations

### **5. Missing Tests**

**Completely Missing:**

- **All test files** - Old package had `src/index.test.ts`, new package has no tests
- No migration of test patterns or test utilities

### **6. Missing Error Handling**

**Different Error System:**

- Old: `ScrapingError` class with `ScrapingErrorCodes` constants
- New: `ScrapingError` exists but different error code system
- Missing specific error codes: `BLOCKED_BY_ROBOTS`, `CAPTCHA_DETECTED`, `RATE_LIMITED`

### **7. Missing Export Structure**

**Not Migrated:**

- **Specific provider exports** like `/puppeteer`, `/playwright`, `/playwright/enhanced`
- **Direct provider access** - old package allowed `import {} from '@repo/scraping/puppeteer'`

### **8. Missing Configuration Patterns**

**Not Migrated:**

- **Simple factory pattern**: `createScraper(engine, config)`
- **Direct scraping functions**: `scrapePuppeteer(options, config)`
- **Engine-specific configurations** (args, executablePath, browser-specific options)

### **9. Missing AI Integration**

**Not Migrated from Hero:**

- **`extractWithAI(prompt)`** method for AI-powered data extraction
- Hero-specific configuration and AI capabilities

### **10. Migration Documentation Gaps**

**Missing:**

- **Comprehensive migration guide** showing exact code transformations
- **Feature parity matrix** showing what works differently
- **Breaking changes documentation**

---

## **Correct File Structure for packages/scraping-new**

### (Following the established analytics pattern)

```
packages/scraping-new/
├── package.json                          # ✅ Exists - needs export structure update
├── tsconfig.json                         # ✅ Exists
├── vitest.config.ts                      # ✅ Exists
├── eslint.config.ts                      # ✅ Exists
├── README.md                             # ✅ Exists
├── MIGRATION.md                          # ❌ Missing
├── ARCHITECTURE.md                       # ❌ Missing
├── PROVIDER_SYSTEM.md                    # ❌ Missing - following analytics pattern
├── USAGE.md                              # ❌ Missing - following analytics pattern
│
├── __tests__/                           # ❌ Missing - top-level integration tests
│   └── basic.test.ts                    # Basic functionality tests
│
├── src/
│   ├── index.ts                         # ❌ Missing - shared types/utils only (like analytics)
│   ├── client.ts                        # ✅ Exists - needs content restructure
│   ├── server.ts                        # ✅ Exists - needs content restructure
│   ├── client-next.ts                   # ✅ Exists - needs content restructure
│   ├── server-next.ts                   # ✅ Exists - needs content restructure
│   │
│   ├── __tests__/                      # ❌ Missing - internal tests
│   │   ├── scraping-provider-integration.test.ts
│   │   ├── provider-selection.test.ts
│   │   └── test-utils/
│   │       ├── shared-test-utilities.ts
│   │       └── provider-test-patterns.ts
│   │
│   ├── client/                         # ✅ Directory exists - needs restructure
│   │   ├── index.ts                    # Main client exports
│   │   ├── manager.ts                  # Client scraping manager
│   │   └── providers/                  # ❌ Missing providers
│   │       ├── fetch-provider.ts       # ✅ Exists
│   │       ├── console-provider.ts     # ❌ Missing
│   │       └── index.ts               # ❌ Missing
│   │
│   ├── server/                         # ✅ Directory exists - needs restructure
│   │   ├── index.ts                    # Main server exports
│   │   ├── manager.ts                  # Server scraping manager
│   │   └── providers/                  # ✅ Directory exists - missing providers
│   │       ├── index.ts               # ❌ Missing
│   │       ├── playwright-provider.ts  # ✅ Exists - good
│   │       ├── node-fetch-provider.ts  # ✅ Exists - good
│   │       ├── puppeteer-provider.ts   # ❌ Missing - CRITICAL
│   │       ├── hero-provider.ts        # ❌ Missing - CRITICAL
│   │       ├── cheerio-provider.ts     # ❌ Missing - CRITICAL
│   │       ├── jsdom-provider.ts       # ❌ Missing
│   │       ├── scrapingbee-provider.ts # ❌ Missing
│   │       ├── brightdata-provider.ts  # ❌ Missing
│   │       └── apify-provider.ts       # ❌ Missing
│   │
│   ├── next/                           # ✅ Directory exists - good structure
│   │   ├── index.ts                    # ✅ Exists
│   │   ├── server.ts                   # ✅ Exists
│   │   ├── hooks.tsx                   # ✅ Exists
│   │   ├── client.ts                   # ❌ Missing
│   │   ├── middleware.ts               # ❌ Missing
│   │   ├── components.tsx              # ❌ Missing
│   │   └── types.d.ts                  # ❌ Missing
│   │
│   ├── examples/                       # ❌ Missing - following analytics pattern
│   │   ├── scraping-patterns.ts        # Basic usage examples
│   │   └── nextjs-scraping-patterns.tsx # Next.js examples
│   │
│   └── shared/                         # ✅ Directory exists - good foundation
│       ├── index.ts                    # ✅ Exists - expand following analytics pattern
│       │
│       ├── types/                      # ✅ Directory exists - good foundation
│       │   ├── index.ts               # ✅ Exists - expand
│       │   ├── provider.ts            # ✅ Exists - good
│       │   ├── config.ts              # ✅ Exists - good
│       │   ├── scraping-types.ts      # ✅ Exists - good
│       │   ├── browser-types.ts       # ❌ Missing
│       │   ├── html-types.ts          # ❌ Missing
│       │   ├── managed-types.ts       # ❌ Missing
│       │   └── legacy-types.ts        # ❌ Missing - for migration compatibility
│       │
│       ├── errors/                     # ❌ Missing directory
│       │   ├── index.ts               # Re-export all errors
│       │   ├── scraping-error.ts      # Enhanced error class
│       │   ├── error-codes.ts         # All error constants
│       │   └── error-handlers.ts      # Error recovery
│       │
│       ├── utils/                      # ✅ Directory exists - expand significantly
│       │   ├── index.ts               # ✅ Exists - expand
│       │   ├── validation.ts          # ✅ Exists - good
│       │   ├── helpers.ts             # ✅ Exists - expand
│       │   ├── extraction.ts          # ✅ Exists - expand
│       │   ├── scraping-manager.ts    # ✅ Exists - expand
│       │   ├── config.ts              # ❌ Missing - configuration utilities
│       │   ├── provider-factory.ts    # ❌ Missing - provider instantiation
│       │   ├── legacy-adapter.ts      # ❌ Missing - old API compatibility
│       │   └── performance.ts         # ❌ Missing - performance optimization
│       │
│       ├── patterns/                   # ❌ Missing - critical for migration
│       │   ├── index.ts               # Export all patterns
│       │   ├── multi-scraping.ts      # scrapeMultiple() with full features
│       │   ├── pagination.ts          # scrapeWithPagination() complete
│       │   ├── quick-scrape.ts        # quickScrape() one-liner
│       │   ├── enhanced-browser.ts    # Enhanced browser automation
│       │   ├── session-scraping.ts    # Session management
│       │   └── ai-extraction.ts       # AI-powered extraction
│       │
│       ├── factories/                  # ❌ Missing - for legacy compatibility
│       │   ├── index.ts               # Export all factories
│       │   ├── scraper-factory.ts     # createScraper() equivalent
│       │   ├── legacy-factory.ts      # Old API bridges
│       │   └── provider-registry.ts   # Dynamic provider management
│       │
│       └── providers/                  # ✅ Directory exists - expand
│           ├── index.ts               # ❌ Missing - export all shared providers
│           ├── console-provider.ts    # ✅ Exists - good
│           ├── base-provider.ts       # ❌ Missing - abstract base
│           ├── browser-provider.ts    # ❌ Missing - browser base class
│           ├── html-provider.ts       # ❌ Missing - HTML parser base
│           └── managed-provider.ts    # ❌ Missing - managed service base
```

## **Critical Package.json Export Structure Update**

Following the analytics pattern exactly:

```json
{
  "name": "@repo/scraping-new",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./client": {
      "types": "./src/client/index.ts",
      "default": "./src/client/index.ts"
    },
    "./server": {
      "types": "./src/server/index.ts",
      "default": "./src/server/index.ts"
    },
    "./client/next": {
      "types": "./src/client-next.ts",
      "default": "./src/client-next.ts"
    },
    "./server/next": {
      "types": "./src/server-next.ts",
      "default": "./src/server-next.ts"
    }
  }
}
```

## **Main Export Structure** (following analytics exactly)

### **src/index.ts** - Shared types/utils only

```typescript
/**
 * Shared exports for both client and server environments
 * Contains types, utilities, and patterns that work universally
 */

// Export all types (like analytics does)
export type * from './shared/types';

// Export shared utilities
export * from './shared/utils';
export * from './shared/patterns';
export * from './shared/factories';

// Export console provider (works in both environments)
export { ConsoleProvider } from './shared/providers/console-provider';
```

### **src/client.ts** - Full client API

```typescript
/**
 * Client-side scraping exports
 * Complete scraping solution for browser/client environments
 */

import { FetchProvider } from './client/providers/fetch-provider';
import { ConsoleProvider } from './shared/providers/console-provider';
import { createScrapingManager } from './shared/utils/scraping-manager';

// Client-specific provider registry
const CLIENT_PROVIDERS: ProviderRegistry = {
  fetch: (config) => new FetchProvider(config),
  console: (config) => new ConsoleProvider(config),
};

// CORE SCRAPING FUNCTIONS
export async function createClientScraping(config: ScrapingConfig): Promise<ScrapingManager> {
  const manager = createScrapingManager(config, CLIENT_PROVIDERS);
  await manager.initialize();
  return manager;
}

// Export all patterns, utilities, types (like analytics does)
export * from './shared/patterns';
export * from './shared/utils';
export type * from './shared/types';
```

### **src/server.ts** - Full server API

```typescript
/**
 * Server-side scraping exports
 * Complete scraping solution for server/Node.js environments
 */

import { PlaywrightProvider } from './server/providers/playwright-provider';
import { PuppeteerProvider } from './server/providers/puppeteer-provider';
import { HeroProvider } from './server/providers/hero-provider';
import { CheerioProvider } from './server/providers/cheerio-provider';
import { NodeFetchProvider } from './server/providers/node-fetch-provider';
import { ConsoleProvider } from './shared/providers/console-provider';
import { createScrapingManager } from './shared/utils/scraping-manager';

// Server-specific provider registry
const SERVER_PROVIDERS: ProviderRegistry = {
  playwright: (config) => new PlaywrightProvider(config),
  puppeteer: (config) => new PuppeteerProvider(config),
  hero: (config) => new HeroProvider(config),
  cheerio: (config) => new CheerioProvider(config),
  'node-fetch': (config) => new NodeFetchProvider(config),
  console: (config) => new ConsoleProvider(config),
};

// CORE SCRAPING FUNCTIONS
export async function createServerScraping(config: ScrapingConfig): Promise<ScrapingManager> {
  const manager = createScrapingManager(config, SERVER_PROVIDERS);
  await manager.initialize();
  return manager;
}

// LEGACY COMPATIBILITY (critical for migration)
export function createScraper(
  engine: 'puppeteer' | 'playwright' | 'hero',
  config?: LegacyScrapingConfig
): Promise<LegacyBrowserManager> {
  // Bridge to new system while maintaining old interface
}

// Export all patterns, utilities, types
export * from './shared/patterns';
export * from './shared/utils';
export * from './shared/factories';
export type * from './shared/types';
```

## **Key Architectural Principles** (from analytics)

1. **Environment-Specific Provider Registries** - Client vs Server providers
2. **Comprehensive Re-exports** - Each entry point exports everything relevant
3. **Shared Foundation** - Common types/utils in `/shared`
4. **Legacy Compatibility** - Bridge functions for migration
5. **Pattern-Based API** - High-level patterns like `quickScrape()`, `scrapeMultiple()`
6. **Factory Functions** - Primary `createServerScraping()` / `createClientScraping()`
7. **Next.js Integration** - Dedicated Next.js optimizations
8. **Extensive Documentation** - Multiple .md files explaining usage

## **Migration Priority Order**

1. **High Priority** - Core missing providers:

   - `puppeteer-provider.ts`
   - `hero-provider.ts`
   - `cheerio-provider.ts`

2. **Medium Priority** - Pattern implementations:

   - Enhanced `scrapeMultiple()`
   - Complete `scrapeWithPagination()`
   - AI extraction patterns

3. **Low Priority** - Advanced features:
   - Managed service providers
   - Performance optimizations
   - Monitoring and observability

This structure ensures **complete feature parity** with the original package while following the
established monorepo patterns and providing a modern, extensible architecture.

## **Summary**

While the new package provides a more modern, provider-agnostic architecture, it's **missing
significant functionality** from the original package, particularly:

1. **Complete Puppeteer and Hero provider implementations**
2. **Advanced browser automation features**
3. **All tests and test infrastructure**
4. **Simplified factory patterns for quick usage**
5. **AI-powered extraction capabilities**
6. **Specific error handling patterns**

The migration appears to be **partially complete** - the new package reimplements core concepts but
doesn't provide full feature parity with the original implementation.
