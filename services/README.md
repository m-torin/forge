# Services Directory

This directory contains specialized services for the monorepo that provide advanced functionality
for code analysis, browser automation, and AI-powered operations.

## Available Services

### 🔍 [OpenGrep](./opengrep/README.md)

**Security & Code Analysis**

- Static code analysis across multiple languages
- Security vulnerability detection
- Pattern matching and code search
- Repository-wide scanning with Semgrep integration

### 🤖 [TryComp](./trycomp/README.md)

**AI-Powered Code Comparison**

- Intelligent code comparison and analysis
- AI-driven recommendations
- Performance and security insights
- Support for GPT-4 and Claude models

### 🦊 [Camoufox](./camoufox/README.md)

**Stealth Browser Automation**

- Web scraping with anti-detection
- Automated testing and data extraction
- Code fetching from online sources
- Multi-browser support (Chromium, Firefox, WebKit)

## Quick Start

```bash
# Install all service dependencies
pnpm install

# OpenGrep - Scan repository for security issues
pnpm --filter @repo/opengrep deep-analysis

# TryComp - Compare two code files
pnpm --filter @repo/trycomp compare file1.ts file2.ts

# Camoufox - Scrape a website
pnpm --filter @repo/camoufox scrape https://example.com
```

## Integration Examples

### Security Analysis Pipeline

```typescript
import { createRepoScanner } from '@repo/opengrep';
import { createTryCompClient } from '@repo/trycomp';
import { createCamoufoxServer } from '@repo/camoufox';

// 1. Scan for security issues
const scanner = createRepoScanner();
const securityResults = await scanner.scanRepository({
  ruleSets: ['security', 'typescript'],
});

// 2. Compare code versions for security impact
const trycomp = createTryCompClient();
const comparison = await trycomp.compare({
  codeA: { content: oldCode },
  codeB: { content: newCode },
  comparisonType: 'security',
});

// 3. Fetch latest security best practices
const camoufox = createCamoufoxServer();
const bestPractices = await camoufox.fetchCode('https://owasp.org/examples/secure-coding');
```

## Architecture

Each service follows a consistent pattern:

```
services/[service-name]/
├── src/
│   ├── types.ts       # Zod schemas and TypeScript types
│   ├── client.ts      # Core client implementation
│   ├── server.ts      # Server-side utilities
│   └── index.ts       # Public API exports
├── scripts/
│   └── [service]-cli.ts  # Command-line interface
├── __tests__/         # Test files
├── package.json       # Service dependencies
└── README.md          # Service documentation
```

## Development

### Adding a New Service

1. Create service directory: `services/new-service/`
2. Copy structure from existing service
3. Update `pnpm-workspace.yaml` to include the new service
4. Implement core functionality in `src/`
5. Add CLI interface in `scripts/`
6. Write comprehensive tests
7. Document usage in README

### Testing Services

```bash
# Test individual service
pnpm --filter @repo/[service-name] test

# Test all services
pnpm test --filter "./services/*"

# Type check all services
pnpm typecheck --filter "./services/*"
```

## Best Practices

- **Type Safety**: All services use Zod for runtime validation
- **Error Handling**: Consistent error interfaces across services
- **CLI Interface**: Each service provides command-line tools
- **Modular Design**: Services can be used independently or together
- **Documentation**: Comprehensive READMEs with examples

## Environment Variables

Create `.env.local` files for service-specific configuration:

```bash
# OpenGrep
SEMGREP_PATH=/custom/path/to/semgrep

# TryComp
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Camoufox
PROXY_URL=http://proxy:port
```
