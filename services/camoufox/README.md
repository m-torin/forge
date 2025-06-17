# Camoufox Browser Automation Service

A stealth browser automation service for web scraping, testing, and code fetching with
anti-detection capabilities.

## Features

- 🦊 **Stealth Browsing**: Anti-detection techniques to bypass bot detection
- 🌐 **Multi-Browser**: Support for Chromium, Firefox, and WebKit
- 📱 **Mobile Emulation**: Device simulation and responsive testing
- 🔍 **Smart Extraction**: Intelligent data extraction with CSS selectors
- 📸 **Screenshots & PDFs**: Capture page content in multiple formats
- 🧪 **Automated Testing**: End-to-end testing capabilities
- 💻 **Code Fetching**: Extract code snippets from documentation sites

## Installation

```bash
pnpm install @repo/camoufox
```

## Quick Start

### Basic Web Scraping

```typescript
import { createCamoufoxServer } from '@repo/camoufox';

const camoufox = createCamoufoxServer({
  headless: true,
  stealth: true,
});

// Scrape a webpage
const result = await camoufox.scrapeUrl({
  url: 'https://example.com',
  extract: {
    selectors: {
      title: 'h1',
      description: 'meta[name="description"]',
      links: 'a[href]',
    },
    links: true,
    images: true,
  },
  screenshot: true,
});

console.log('Extracted data:', result.data);
console.log('Page title:', result.metadata.title);
```

### Code Fetching from Documentation

```typescript
// Fetch code examples from GitHub or documentation sites
const codeResult = await camoufox.fetchCode(
  'https://github.com/microsoft/TypeScript/blob/main/src/compiler/parser.ts',
  'pre code, .highlight code'
);

console.log('Language:', codeResult.language); // 'typescript'
console.log('Code length:', codeResult.code.length);
console.log('Success:', codeResult.success);
```

### Advanced Scraping with Actions

```typescript
const result = await camoufox.scrapeUrl({
  url: 'https://website-with-dynamic-content.com',
  waitFor: {
    selector: '.dynamic-content',
    timeout: 10000,
    networkIdle: true,
  },
  actions: [
    { type: 'click', selector: '.load-more-button' },
    { type: 'wait', timeout: 2000 },
    { type: 'scroll' },
    { type: 'screenshot' },
  ],
  extract: {
    selectors: {
      articles: '.article-title',
      dates: '.article-date',
    },
  },
});
```

## CLI Usage

```bash
# Launch browser for manual testing
pnpm --filter @repo/camoufox launch --engine chromium --headless false

# Scrape a single URL
pnpm --filter @repo/camoufox scrape https://example.com --extract-links --screenshot

# Test a page with assertions
pnpm --filter @repo/camoufox test https://example.com --assert-exists "h1" --assert-visible ".navbar"
```

## Code Fetching Examples

### Fetch TypeScript Code from GitHub

```typescript
import { createCamoufoxServer } from '@repo/camoufox';

const camoufox = createCamoufoxServer();

// Fetch TypeScript interface from GitHub
const result = await camoufox.fetchCode(
  'https://raw.githubusercontent.com/microsoft/TypeScript/main/src/compiler/types.ts'
);

if (result.success) {
  console.log(`Fetched ${result.code.length} characters of ${result.language} code`);

  // Save to file
  await fs.writeFile('./fetched-code.ts', result.code);
}
```

### Scrape Multiple Documentation Pages

```typescript
const urls = [
  'https://docs.react.dev/learn/typescript',
  'https://www.typescriptlang.org/docs/handbook/basic-types.html',
  'https://nodejs.org/api/fs.html',
];

const results = await camoufox.scrapeMultipleUrls(urls, {
  extract: {
    selectors: {
      code: 'pre code, .language-typescript, .language-javascript',
      title: 'h1, .page-title',
    },
  },
  waitFor: 'main, .content',
});

for (const result of results) {
  if (result.success && result.data) {
    console.log(`${result.url}: Found ${result.data.code?.length || 0} chars of code`);
  }
}
```

### Extract Code from Interactive Tutorials

```typescript
// Scrape code from interactive coding tutorials
const tutorialResult = await camoufox.scrapeUrl({
  url: 'https://www.typescriptlang.org/play',
  actions: [
    { type: 'wait', selector: '.monaco-editor' },
    { type: 'click', selector: '.example-button' }, // Load an example
    { type: 'wait', timeout: 2000 },
  ],
  extract: {
    selectors: {
      editorCode: '.monaco-editor .view-lines',
      output: '.playground-output',
    },
  },
});
```

## Configuration

### Stealth Features

```typescript
const camoufox = createCamoufoxServer({
  headless: true,
  stealth: true, // Enable all stealth features
  userAgent: 'custom-user-agent',
  viewport: { width: 1920, height: 1080 },
  locale: 'en-US',
  timezone: 'America/New_York',
});

// Or configure specific stealth features
const browser = await camoufox.client.launch({
  engine: 'chromium',
  config: { stealth: true },
  stealth: {
    webdriver: true, // Hide webdriver traces
    navigator: true, // Fake navigator properties
    userAgent: true, // Rotate user agents
    canvas: true, // Add canvas noise
    webgl: true, // Fake WebGL fingerprint
    permissions: true, // Handle permission prompts
  },
});
```

### Proxy Support

```typescript
const camoufox = createCamoufoxServer({
  proxy: 'http://proxy-server:port',
  headers: {
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
  },
});
```

### Mobile Emulation

```typescript
const result = await camoufox.scrapeUrl(
  {
    url: 'https://mobile-site.com',
  },
  {
    engine: 'chromium',
    config: {
      viewport: { width: 375, height: 667 }, // iPhone dimensions
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)...',
    },
  }
);
```

## Testing Web Applications

```typescript
const testResult = await camoufox.testPage({
  url: 'https://your-app.com/login',
  beforeEach: [
    { type: 'navigate', value: 'https://your-app.com/login' },
    { type: 'wait', value: 'form[data-testid="login-form"]' },
  ],
  tests: [
    {
      name: 'Login form exists',
      type: 'element-exists',
      selector: 'input[name="email"]',
    },
    {
      name: 'Submit button is visible',
      type: 'element-visible',
      selector: 'button[type="submit"]',
    },
    {
      name: 'Page has correct title',
      type: 'text-contains',
      selector: 'title',
      expected: 'Login',
    },
  ],
});

console.log(`Tests: ${testResult.summary.passed}/${testResult.summary.total} passed`);
```

## Performance & Best Practices

### Respectful Scraping

```typescript
// Add delays between requests
await new Promise((resolve) => setTimeout(resolve, 1000));

// Use appropriate user agents
const userAgent = 'MyBot/1.0 (+https://mywebsite.com/bot-info)';

// Respect robots.txt
// Check site's robots.txt before scraping
```

### Memory Management

```typescript
// Always close resources
try {
  const browser = await camoufox.client.launch();
  const page = await browser.newPage();

  // Do work...
} finally {
  await page?.close();
  await browser?.close();
}
```

### Error Handling

```typescript
try {
  const result = await camoufox.scrapeUrl({ url: 'https://example.com' });

  if (!result.success) {
    console.error('Scraping failed:', result.errors);
  }
} catch (error) {
  if (error.code === 'CAMOUFOX_ERROR') {
    console.error('Browser error:', error.message);
    if (error.screenshot) {
      // Save error screenshot for debugging
      await fs.writeFile('./error-screenshot.png', error.screenshot, 'base64');
    }
  }
}
```

## Environment Variables

```bash
# Optional proxy configuration
CAMOUFOX_PROXY_URL=http://proxy:port

# Browser executable paths (if custom)
CHROMIUM_PATH=/path/to/chromium
FIREFOX_PATH=/path/to/firefox

# Default timeouts
CAMOUFOX_TIMEOUT=30000
CAMOUFOX_RETRY_COUNT=3
```

## API Reference

### Core Methods

- `scrapeUrl(request, options)` - Scrape a single URL
- `scrapeMultipleUrls(urls, baseRequest, options)` - Scrape multiple URLs
- `fetchCode(url, selector?)` - Extract code from a webpage
- `testPage(pageTest, options)` - Run automated tests
- `health()` - Check service health

### Configuration Options

- `headless: boolean` - Run browser in headless mode
- `stealth: boolean` - Enable anti-detection features
- `proxy: string` - Proxy server URL
- `userAgent: string` - Custom user agent
- `viewport: {width, height}` - Browser viewport size
- `timeout: number` - Request timeout in milliseconds
- `locale: string` - Browser locale
- `timezone: string` - Browser timezone

## Troubleshooting

### Common Issues

1. **Browser not launching**

   ```bash
   # Install browser dependencies
   npx playwright install-deps chromium
   ```

2. **Detection by anti-bot systems**

   ```typescript
   // Enable more stealth features
   const config = {
     stealth: true,
     headless: true,
     userAgent: 'real-browser-user-agent',
   };
   ```

3. **Slow performance**
   ```typescript
   // Disable images and CSS for faster scraping
   const browser = await camoufox.client.launch({
     config: {
       args: ['--disable-images', '--disable-css'],
     },
   });
   ```

## Examples Repository

See the `/services/camoufox/examples/` directory for more comprehensive examples:

- E-commerce product scraping
- Social media data extraction
- Documentation code fetching
- Automated form testing
