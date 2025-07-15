# AI Package Integration Testing

This document explains how to use the integration testing system for testing
Perplexity sources and other AI package features with real API keys.

## 🚀 Quick Start

### Run Mock Tests (Default)

```bash
# Run integration tests with mocks (no API keys needed)
pnpm test:integration:mock
```

### Run Real API Tests

```bash
# Set environment variables and run with real APIs
INTEGRATION_TEST=true PERPLEXITY_API_KEY=your-key pnpm test:integration
```

## 📋 Environment Setup

### 1. Create Environment File

```bash
# Copy the example file
cp .env.integration.example .env.local

# Edit with your real API keys
vim .env.local
```

### 2. Required Environment Variables

```env
# Required for Perplexity integration tests
PERPLEXITY_API_KEY=pplx-your-actual-perplexity-key

# Test mode flag
INTEGRATION_TEST=true
```

## 🧪 Test Modes

### Mock Mode (Default)

- **Environment**: `INTEGRATION_TEST=false` or unset
- **API Calls**: Mocked responses
- **Speed**: Fast (~200ms)
- **Cost**: Free
- **Use Case**: Development, CI/CD

```bash
pnpm test:integration:mock
```

### Integration Mode

- **Environment**: `INTEGRATION_TEST=true`
- **API Calls**: Real API requests
- **Speed**: Slower (~30s timeout)
- **Cost**: Uses API quota
- **Use Case**: End-to-end validation

```bash
INTEGRATION_TEST=true PERPLEXITY_API_KEY=your-key pnpm test:integration
```

## 📊 Test Coverage

### Perplexity Sources Tests

Located in `__tests__/integration/perplexity-sources.test.ts`

**Mock Mode Tests:**

- ✅ Source part type validation (`source` not `sources`)
- ✅ Source aggregation logic
- ✅ Mixed content handling (text + sources)
- ✅ Source structure validation
- ✅ UI message stream processing

**Integration Mode Tests:**

- ✅ Real Perplexity API responses
- ✅ Actual source extraction from search models
- ✅ Response structure analysis
- ✅ Model compatibility testing
- ✅ Error handling with real APIs

## 🔧 Test Structure

### Key Features Tested

1. **AI SDK v5 Integration**

   ```typescript
   const result = await streamText({
     model: perplexityModel,
     prompt: "search query"
   });

   const uiMessageStream = result.toUIMessageStream({
     sendSources: true // Enable sources
   });
   ```

2. **Source Part Extraction**

   ```typescript
   // Filter source parts (as done in message.tsx)
   const sourceParts = chunks.filter(
     (chunk) => chunk.type === "message-part" && chunk.part?.type === "source"
   );
   ```

3. **Source Aggregation**
   ```typescript
   // Aggregate sources for display
   const sources = messageParts
     .filter((part) => part.type === "source")
     .map((part) => part as any);
   ```

### Mock Response Structure

```typescript
{
  type: 'message-part',
  part: {
    type: 'source',
    url: 'https://example.com/article',
    title: 'Article Title',
    description: 'Article description',
    snippet: 'Relevant snippet...',
    favicon: 'https://example.com/favicon.ico',
  }
}
```

## 🎯 Usage Examples

### Basic Integration Test

```bash
# Run with your Perplexity API key
INTEGRATION_TEST=true PERPLEXITY_API_KEY=pplx-xxxxx pnpm test:integration
```

### Development Workflow

```bash
# 1. Develop with fast mocks
pnpm test:integration:mock

# 2. Validate with real API before deployment
INTEGRATION_TEST=true PERPLEXITY_API_KEY=pplx-xxxxx pnpm test:integration

# 3. Run in CI with mocks
pnpm test:integration:mock
```

### Debug Mode

```bash
# Run with verbose output
INTEGRATION_TEST=true PERPLEXITY_API_KEY=pplx-xxxxx pnpm test:integration --reporter=verbose
```

## 📈 Test Results

### Mock Mode Output

```
🤖 Unit test using mocks
🤖 Mock returned 2 source parts
🤖 Mock test aggregated 2 sources
🤖 Mock: 2 text parts, 2 source parts
✓ 3/3 tests passed in ~200ms
```

### Integration Mode Output

```
🔗 Integration test using real Perplexity API
🔍 Found 3 source parts in integration test
📄 Source 1: https://example.com/renewable-energy...
📊 Integration test aggregated 3 sources
📝 Integration: 4 text parts, 3 source parts
📊 Real API Response Analysis:
- Total chunks: 12
- Source chunks: 3
✓ 4/4 tests passed in ~25s
```

## ⚠️ Important Notes

### Cost Considerations

- Integration tests make real API calls
- Each test uses ~100-500 tokens
- Full test suite: ~1000-2000 tokens
- Estimated cost: $0.01-0.05 per run

### Rate Limits

- Perplexity: 10 requests/minute (free tier)
- Tests include delays between requests
- Use mock mode for rapid development

### Security

- Never commit real API keys
- Use `.env.local` (gitignored)
- Rotate keys if accidentally exposed

## 🚨 Troubleshooting

### Common Issues

**Import Errors**

```
Solution: Use vitest.integration.config.ts (no setup files)
```

**API Key Missing**

```
Error: PERPLEXITY_API_KEY is required for integration tests
Solution: Set environment variable or use mock mode
```

**Rate Limited**

```
Solution: Wait a minute or use mock mode for development
```

**No Sources Returned**

```
Possible: Query doesn't trigger search, model limitation
Solution: Try different queries or check model capabilities
```

## 📚 Related Files

- `__tests__/integration/perplexity-sources.test.ts` - Main test file
- `vitest.integration.config.ts` - Custom config for integration tests
- `.env.integration.example` - Environment template
- `apps/ai-chatbot/src/components/message.tsx` - Source display implementation
- `apps/ai-chatbot/src/components/sources.tsx` - Sources UI component

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run AI Integration Tests (Mock Mode)
  run: pnpm --filter @repo/ai test:integration:mock

# Optional: Real API tests (with secrets)
- name: Run AI Integration Tests (Real APIs)
  env:
    PERPLEXITY_API_KEY: ${{ secrets.PERPLEXITY_API_KEY }}
    INTEGRATION_TEST: true
  run: pnpm --filter @repo/ai test:integration
  if:
    github.event_name == 'pull_request' &&
    contains(github.event.pull_request.labels.*.name, 'test-integration')
```
