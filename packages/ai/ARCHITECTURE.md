# AI-New Package Architecture

## Overview

The `@repo/ai` package implements a modern AI integration system built on top of **Vercel AI SDK
as the primary framework**, with support for custom providers when needed. It follows the
established pattern from `@repo/analytics-new` while leveraging the power and maintenance benefits
of Vercel's AI SDK.

## Key Design Principles

1. **AI SDK First**: Leverage Vercel AI SDK as the primary framework
2. **Extensible**: Add custom providers for features beyond AI SDK
3. **Type Safe**: Full TypeScript support extending AI SDK types
4. **Streaming Native**: Use AI SDK's built-in streaming capabilities
5. **Unified Interface**: Single API for both AI SDK and custom features
6. **Modern Stack**: Latest Vercel AI SDK with ES2024+ patterns

## Architecture Layers

### Layer 1: Vercel AI SDK (Primary)

All standard AI operations go through Vercel AI SDK:

1. **OpenAI** (via `@ai-sdk/openai`)

   - Models: GPT-4o, GPT-4, GPT-3.5
   - Features: Chat, completion, embeddings, tools, vision

2. **Anthropic** (via `@ai-sdk/anthropic`)

   - Models: Claude 3.5 Sonnet, Claude 3 Opus/Haiku
   - Features: Chat, completion, tools, vision

3. **Google** (via `@ai-sdk/google`)

   - Models: Gemini Pro, Gemini Pro Vision
   - Features: Chat, completion, multimodal

4. **And more** via AI SDK providers

### Layer 2: Custom Providers (Secondary)

For features not available in AI SDK:

```typescript
interface CustomProvider {
  // Only non-AI SDK features
  moderate?(content: string): Promise<ModerationResult>;
  classify?(text: string, categories: string[]): Promise<ClassificationResult>;
  analyzeProduct?(data: any): Promise<ProductAnalysis>;

  // Business-specific logic
  generateReport?(data: any): Promise<Report>;
}
```

## Usage Examples

### Client-Side Usage

```typescript
import { createClientAI } from '@repo/ai/client';

const ai = await createClientAI({
  // AI SDK providers configuration
  providers: {
    openai: { apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY },
    anthropic: { apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_KEY },
  },
  defaultProvider: 'openai',
});

// Uses Vercel AI SDK internally
const result = await ai.generateText('Explain quantum computing');

// Streaming with AI SDK
const stream = await ai.streamText('Write a story');
for await (const chunk of stream.textStream) {
  console.log(chunk);
}

// Use AI SDK tools
const response = await ai.generateText({
  prompt: 'What is 25 * 4?',
  tools: {
    calculator: calculatorTool,
  },
});
```

### Server-Side Usage

```typescript
import { createServerAI } from '@repo/ai/server';
import { z } from 'zod';

const ai = await createServerAI({
  providers: {
    openai: { apiKey: process.env.OPENAI_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY },
    google: { apiKey: process.env.GOOGLE_API_KEY },
  },
  // Custom providers for extended features
  customProviders: {
    'anthropic-moderate': new AnthropicModerationProvider(),
  },
});

// Using Vercel AI SDK features
const { embedding } = await ai.embed({
  model: openai.embedding('text-embedding-3-small'),
  value: 'Hello world',
});

// Structured output with AI SDK
const { object } = await ai.generateObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
  }),
  prompt: 'Analyze this article...',
});

// Custom provider for moderation (not in AI SDK)
const moderation = await ai.moderate('user input');
```

### Next.js Integration

```typescript
// Client Component - Enhanced AI SDK hooks
'use client';
import { useChat } from '@repo/ai/client/next';

export function ChatComponent() {
  const {
    messages,
    input,
    handleSubmit,
    isLoading,
    // Enhanced features beyond AI SDK
    moderate,
    usage
  } = useChat({
    api: '/api/chat',
    // Additional options
    onResponse: (response) => {
      // Track token usage, costs, etc.
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* Chat UI */}
    </form>
  );
}

// API Route - Using AI SDK's streamText
import { streamText } from '@repo/ai/server/next';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Direct AI SDK usage with our configuration
  const result = await streamText({
    model: anthropic('claude-3-5-sonnet'),
    messages,
  });

  return result.toDataStreamResponse();
}
```

## Advanced Features

### 1. Fallback Chains

```typescript
const result = await ai.completeWithFallback('prompt', {
  providers: ['anthropic', 'openai', 'console'],
  stopOnSuccess: true,
});
```

### 2. Parallel Processing

```typescript
const results = await ai.completeParallel('prompt', {
  providers: ['openai', 'anthropic'],
  combineStrategy: 'best', // or 'merge', 'vote'
});
```

### 3. Tool Integration

```typescript
const aiWithTools = ai.withTools({
  calculator: calculatorTool,
  search: searchTool,
  datetime: datetimeTool,
});

const result = await aiWithTools.complete('What is 25 * 4 and what time is it?');
```

### 4. Streaming Transformations

```typescript
const stream = ai
  .stream('Generate JSON data')
  .pipeThrough(new JsonParseStream())
  .pipeThrough(new ValidationStream(schema));

for await (const validData of stream) {
  console.log(validData);
}
```

## Configuration

### Environment Variables

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Provider Selection
AI_DEFAULT_PROVIDER=openai
AI_FALLBACK_PROVIDERS=anthropic,console
```

### Provider Configuration

```typescript
const config: AIConfig = {
  providers: {
    openai: {
      apiKey: env.OPENAI_API_KEY,
      defaultModel: 'gpt-4-turbo',
      maxRetries: 3,
      timeout: 30000,
    },
    anthropic: {
      apiKey: env.ANTHROPIC_API_KEY,
      defaultModel: 'claude-3-5-sonnet',
      maxTokens: 4096,
    },
  },
  defaultProvider: 'openai',
  fallbackChain: ['openai', 'anthropic'],
  middleware: [rateLimiter, logger, metrics],
};
```

## Benefits Over Current Implementation

1. **Leverage AI SDK**: Get all Vercel AI SDK features and updates automatically
2. **Reduced Maintenance**: ~60% less code to maintain by using AI SDK
3. **Better Performance**: AI SDK's optimized streaming and caching
4. **Type Safety**: Extend AI SDK's excellent TypeScript support
5. **Future Proof**: New AI SDK features and providers automatically available
6. **Custom Extensions**: Add business-specific features when needed
7. **Unified Interface**: Single API for both AI SDK and custom features

## Migration Path

1. Install new package: `pnpm add @repo/ai`
2. Update imports to use environment-specific paths
3. Update configuration to new format
4. Gradually migrate features using compatibility layer
5. Remove old package once migration complete

The new architecture provides a solid foundation for AI integration that can grow with the
application's needs while maintaining clean, maintainable code.
