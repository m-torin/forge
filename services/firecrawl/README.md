# Firecrawl Local Deployment Service

A service wrapper for running the open source Firecrawl stack locally using Docker Compose. This
provides a complete web scraping and crawling solution with AI-powered content extraction.

## Features

- 🐳 **Local Docker Deployment**: Run the full Firecrawl stack locally
- 🕷️ **Web Crawling**: Intelligent website crawling with depth control
- 📄 **Content Extraction**: AI-powered content extraction to markdown, text, or structured data
- 🔍 **Web Search**: Search the web and extract results
- 🗺️ **Site Mapping**: Generate sitemaps and discover all pages on a website
- 📊 **Batch Processing**: Process multiple URLs in parallel
- 🏥 **Health Monitoring**: Built-in health checks and auto-recovery
- 🛠️ **CLI Management**: Full command-line interface for service management

## Quick Start

### 1. Setup

```bash
# Setup and build Firecrawl services
pnpm --filter @repo/firecrawl setup

# Start the services
pnpm --filter @repo/firecrawl start
```

### 2. Basic Usage

```typescript
import { createFirecrawlServer } from '@repo/firecrawl';

// Create server instance (auto-starts services)
const firecrawl = createFirecrawlServer();
await firecrawl.initialize();

// Scrape a single page
const result = await firecrawl.scrape('https://example.com');
console.log(result.content.markdown);

// Crawl an entire website
const crawlResult = await firecrawl.crawl('https://docs.example.com', {
  maxDepth: 3,
  limit: 100,
});
```

## Installation

The service automatically clones and manages the open source Firecrawl repository. No external API
keys required for basic functionality.

```bash
pnpm install @repo/firecrawl
```

## CLI Commands

### Service Management

```bash
# Setup environment and build services
firecrawl setup

# Start all services
firecrawl start

# Stop all services
firecrawl stop

# Restart services
firecrawl restart

# Check service status
firecrawl status

# Watch status updates
firecrawl status --watch

# View logs
firecrawl logs

# Follow live logs
firecrawl logs --follow

# Check API health
firecrawl health
```

### Content Operations

```bash
# Scrape a single URL
firecrawl scrape https://example.com --markdown --output content.md

# Crawl a website
firecrawl crawl https://docs.example.com --max-depth 3 --limit 50 --output results.json

# Take screenshots while scraping
firecrawl scrape https://example.com --screenshot
```

### Cleanup

```bash
# Clean up all Docker resources
firecrawl cleanup
```

## API Usage

### Server Instance

```typescript
import { createFirecrawlServer } from '@repo/firecrawl';

const server = createFirecrawlServer({
  docker: {
    ports: { api: 3002 },
  },
  autoStart: true,
  healthCheckInterval: 30000,
});

await server.initialize();
```

### Content Extraction

```typescript
// Extract as markdown
const markdown = await server.extractMarkdown('https://blog.example.com/post');

// Extract as plain text
const text = await server.extractText('https://news.example.com/article');

// Structured extraction with schema
const data = await server.scrape('https://ecommerce.example.com/product', {
  extractConfig: {
    extractorOptions: {
      mode: 'structured',
      schema: {
        title: 'string',
        price: 'number',
        description: 'string',
        images: 'array',
      },
    },
  },
});
```

### Website Crawling

```typescript
// Crawl with progress tracking
const result = await server.crawl('https://docs.example.com', {
  maxDepth: 3,
  limit: 100,
  includePaths: ['/docs/', '/api/'],
  excludePaths: ['/admin/', '/private/'],
  onProgress: (status) => {
    console.log(`Progress: ${status.current}/${status.total} pages`);
  },
});

console.log(`Crawled ${result.completed} pages`);
result.data.forEach((page) => {
  console.log(`${page.url}: ${page.content?.title}`);
});
```

### Batch Processing

```typescript
// Process multiple URLs
const urls = [
  'https://example.com/page1',
  'https://example.com/page2',
  'https://example.com/page3',
];

const results = await server.batchScrape(urls, {
  extractConfig: { onlyMainContent: true },
});

results.forEach((result) => {
  if (result.success) {
    console.log(`${result.url}: ${result.content?.title}`);
  }
});
```

### Search & Discovery

```typescript
// Search the web
const searchResults = await server.search('TypeScript tutorials', {
  pageOptions: { fetchPageContent: true },
  searchOptions: { limit: 10 },
});

// Map a website
const siteMap = await server.map('https://example.com', {
  includeSubdomains: false,
  limit: 1000,
});

console.log(`Found ${siteMap.links.length} pages`);
```

## Configuration

### Environment Variables

Create a `.env` file in the Firecrawl repository:

```bash
# Optional AI API keys for enhanced extraction
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Search API keys (optional)
SERPER_API_KEY=your_serper_key
SEARCHAPI_API_KEY=your_searchapi_key

# Monitoring (optional)
POSTHOG_API_KEY=your_posthog_key

# Proxy settings (optional)
PROXY_SERVER=http://proxy:port
PROXY_USERNAME=username
PROXY_PASSWORD=password
```

### Docker Configuration

```typescript
const server = createFirecrawlServer({
  docker: {
    ports: {
      api: 3002, // API port
      redis: 6379, // Redis port
      playwright: 3000, // Playwright service port
    },
    services: ['api', 'worker', 'redis', 'playwright-service'],
  },
});
```

### Client Configuration

```typescript
const server = createFirecrawlServer({
  client: {
    apiUrl: 'http://localhost:3002',
    timeout: 60000,
    retries: 3,
  },
});
```

## Advanced Features

### Health Monitoring

```typescript
// Check if services are healthy
const isHealthy = await server.isHealthy();

// Get detailed status
const status = await server.getStatus();
status.forEach((service) => {
  console.log(`${service.name}: ${service.status}`);
});

// Auto-restart on failure
const server = createFirecrawlServer({
  autoStart: true,
  healthCheckInterval: 30000, // Check every 30 seconds
});
```

### Custom Extraction

```typescript
// Use custom extraction schema
const productData = await server.scrape('https://shop.example.com/product/123', {
  extractConfig: {
    extractorOptions: {
      mode: 'structured',
      schema: {
        name: 'string',
        price: 'number',
        availability: 'string',
        reviews: {
          type: 'array',
          items: {
            rating: 'number',
            comment: 'string',
            author: 'string',
          },
        },
      },
    },
  },
});
```

### Error Handling

```typescript
try {
  const result = await server.scrape('https://example.com');

  if (!result.success) {
    console.error('Scraping failed:', result.error);
  }
} catch (error) {
  if (error.message.includes('Connection refused')) {
    // Services might be down, try restarting
    await server.restart();
  }
}
```

## Troubleshooting

### Common Issues

1. **Services won't start**

   ```bash
   # Check Docker is running
   docker --version

   # Check ports aren't in use
   lsof -i :3002

   # Rebuild services
   firecrawl setup --build
   ```

2. **Memory issues**

   ```bash
   # Increase Docker memory limits
   # In Docker Desktop: Settings > Resources > Memory

   # Or limit crawl scope
   firecrawl crawl https://example.com --limit 10 --max-depth 1
   ```

3. **Slow performance**
   ```typescript
   // Disable images for faster scraping
   const result = await server.scrape('https://example.com', {
     extractConfig: {
       excludeTags: ['img', 'video', 'audio'],
     },
   });
   ```

### Getting Help

```bash
# View service logs
firecrawl logs --follow

# Check specific service
firecrawl logs --service api

# Health check
firecrawl health

# Service status
firecrawl status
```

## Architecture

The service consists of several Docker containers:

- **API**: Main Firecrawl API server
- **Worker**: Background job processing
- **Redis**: Job queue and caching
- **Playwright**: Browser automation service

All containers are managed automatically and communicate through a Docker network.

## Performance

- **Concurrent processing**: Multiple URLs processed in parallel
- **Intelligent queuing**: Redis-based job queue prevents overload
- **Resource limits**: Docker containers with memory/CPU limits
- **Browser pooling**: Reuse browser instances for efficiency

## Security

- **Local deployment**: No data sent to external services
- **Network isolation**: Services run in isolated Docker network
- **Resource limits**: Prevents resource exhaustion
- **Clean shutdown**: Graceful cleanup of all resources

## Contributing

This service wraps the open source Firecrawl project. For Firecrawl core issues, see:
https://github.com/mendableai/firecrawl

For service wrapper issues, create an issue in this repository.
