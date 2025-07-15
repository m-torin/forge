# Integration Tests

This directory contains real-world integration tests that use actual API keys
and external services.

## ⚠️ Important Notes

- These tests require real API keys to be set in your environment
- They make actual network requests to external services
- They should NOT be run in CI/CD unless specifically configured
- Test results may vary based on external service responses
- These tests may incur costs from API providers

## Running Integration Tests

```bash
# Set required environment variables
export PERPLEXITY_API_KEY="your-actual-perplexity-key"
export OPENAI_API_KEY="your-actual-openai-key"
export ANTHROPIC_API_KEY="your-actual-anthropic-key"

# Run integration tests
pnpm test:integration
```

## Test Categories

### 1. Perplexity Sources (`perplexity-sources.integration.test.ts`)

- Tests real Perplexity API responses
- Validates source extraction and display
- Confirms AI SDK v5 integration

### 2. Provider Integration (`provider-integration.integration.test.ts`)

- Tests all AI provider integrations
- Validates model loading and responses
- Confirms registry functionality

### 3. MCP Integration (`mcp-integration.integration.test.ts`)

- Tests Model Context Protocol tools
- Validates real tool execution
- Confirms enhanced features

## Environment Setup

Create a `.env.local` file with real API keys for testing:

```env
# Required for integration tests
PERPLEXITY_API_KEY=pplx-xxxxx
OPENAI_API_KEY=sk-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Optional for extended testing
GOOGLE_AI_API_KEY=xxxxx
XAI_API_KEY=xxxxx
```

## Test Data

Integration tests use real queries and expect real responses. Test data is
designed to be:

- Stable over time
- Not dependent on breaking news
- Representative of typical use cases
