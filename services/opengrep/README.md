# OpenGrep Service

A TypeScript service for integrating OpenGrep (Semgrep) code analysis into the repository.

## Features

- 🔍 **Code Search**: Search for patterns across the codebase
- 🛡️ **Security Scanning**: Detect security vulnerabilities and issues
- 📋 **Custom Rules**: Define and run custom analysis rules
- 🏗️ **Repository Scanner**: Scan entire repositories with predefined rule sets
- ⚡ **Quick Scan**: Fast security and quality checks
- 💾 **Export Results**: Save scan results to JSON files

## Installation

```bash
# Install Semgrep (required)
pip install semgrep

# Or via Homebrew on macOS
brew install semgrep
```

## Usage

### CLI Commands

```bash
# Full repository scan
pnpm --filter @repo/opengrep scan --verbose

# Quick security scan
pnpm --filter @repo/opengrep quick-scan

# Search for specific patterns
pnpm --filter @repo/opengrep search "console.log" "TODO" --language javascript

# Scan with specific rule sets
pnpm --filter @repo/opengrep scan --rules security,typescript --output results.json
```

### Programmatic Usage

```typescript
import { createRepoScanner } from '@repo/opengrep';

const scanner = createRepoScanner();

// Scan repository
const scanResult = await scanner.scanRepository({
  rootPath: process.cwd(),
  ruleSets: ['security', 'javascript', 'typescript'],
  verbose: true,
});

// Search for patterns
const searchResults = await scanner.searchInRepository(['console.log', 'TODO', 'password.*=.*"']);
```

## Configuration

Set environment variables:

```bash
# Optional: Semgrep API key for registry access
export OPENGREP_API_KEY="your-api-key"

# Optional: Custom Semgrep installation path
export SEMGREP_PATH="/custom/path/to/semgrep"

# Optional: API settings
export OPENGREP_BASE_URL="https://semgrep.dev/api"
export OPENGREP_TIMEOUT="30000"
```

## Rule Sets

Available rule sets:

- **security**: Security vulnerabilities and anti-patterns
- **javascript**: JavaScript-specific issues
- **typescript**: TypeScript-specific issues
- **python**: Python-specific issues
- **general**: General code quality and performance

## Scan Configuration

The scanner automatically:

- Excludes `node_modules`, `.git`, `dist`, `build` directories
- Includes `apps/**`, `packages/**`, `services/**`
- Skips test files (`*.test.ts`, `*.spec.js`, etc.)
- Sets appropriate timeouts for large repositories

## API Reference

### Types

```typescript
interface SearchQuery {
  pattern: string;
  language?: string;
  paths?: string[];
  excludePaths?: string[];
  maxResults?: number;
  caseSensitive?: boolean;
}

interface Rule {
  id: string;
  message: string;
  pattern: string;
  language: string;
  severity: 'error' | 'warning' | 'info';
  metadata?: Record<string, unknown>;
}
```

### Classes

- `RepoScanner`: Main class for repository scanning
- `OpenGrepHttpClient`: HTTP client for Semgrep API
- `OpenGrepLocalClient`: Local Semgrep CLI wrapper

## Examples

### Security Scan

```typescript
import { createRepoScanner } from '@repo/opengrep';

const scanner = createRepoScanner();
const result = await scanner.scanRepository({
  ruleSets: ['security'],
  customRules: [
    {
      id: 'hardcoded-secret',
      message: 'Hardcoded secret detected',
      pattern: 'const secret = "..."',
      language: 'javascript',
      severity: 'error',
    },
  ],
});

console.log(`Found ${result.summary.errorCount} security issues`);
```

### Pattern Search

```typescript
const patterns = ['console.log(...)', 'eval(...)', 'innerHTML = ...'];

const results = await scanner.searchInRepository(patterns, {
  language: 'javascript',
  maxResults: 50,
});
```

## Integration

Add to workspace package:

```json
{
  "dependencies": {
    "@repo/opengrep": "workspace:*"
  }
}
```

## Development

```bash
# Run tests
pnpm test

# Type check
pnpm typecheck

# Test scan on current directory
pnpm quick-scan
```
