# AI-New Package - Final Architecture

## Overview

The `@repo/ai-new` package provides a **framework-agnostic** AI integration system that supports
multiple implementation paths:

- **Vercel AI SDK** for ~90% of standard use cases
- **Direct provider SDKs** for provider-specific features
- **Custom implementations** for specialized needs

## Core Philosophy

> "Use the right tool for the job, but keep the interface consistent"

We recognize that while Vercel AI SDK is excellent for most use cases, sometimes you need direct
access to provider-specific features (like Anthropic's advanced moderation or OpenAI's latest beta
features).

## Architecture Layers

```
┌────────────────────────────────────────────┐
│          Application Layer                  │
│    (Consistent API regardless of impl)      │
├────────────────────────────────────────────┤
│           AI Manager Layer                  │
│    (Routes to appropriate provider)         │
├──────────────┬─────────────┬───────────────┤
│  Vercel AI   │   Direct    │    Custom     │
│  SDK Path    │ Provider    │   Provider    │
│   (~90%)     │   Path      │    Path       │
│              │  (~10%)     │   (rare)      │
└──────────────┴─────────────┴───────────────┘
```

## Usage Examples

### 1. Standard Configuration

```typescript
import { createAI } from '@repo/ai-new';

const ai = createAI({
  providers: [
    // OpenAI via Vercel AI SDK (recommended for most cases)
    {
      name: 'openai',
      type: 'ai-sdk',
      config: { apiKey: process.env.OPENAI_KEY },
    },
    // Anthropic direct SDK (for advanced features)
    {
      name: 'anthropic',
      type: 'direct',
      config: { apiKey: process.env.ANTHROPIC_KEY },
    },
    // Google via AI SDK
    {
      name: 'google',
      type: 'ai-sdk',
      config: { apiKey: process.env.GOOGLE_KEY },
    },
  ],
  defaultProvider: 'openai',
});
```

### 2. Using Different Paths

```typescript
// Standard completion - uses AI SDK
const response = await ai.complete({
  prompt: 'Explain quantum computing',
  provider: 'openai', // AI SDK implementation
});

// Anthropic with special features - uses direct SDK
const analysis = await ai.complete({
  prompt: 'Analyze this content',
  provider: 'anthropic', // Direct implementation
  // Can access Anthropic-specific options
  anthropicOptions: {
    moderation: true,
    sentiment: true,
  },
});

// Provider-specific features
if (ai.hasFeature('anthropic', 'moderate')) {
  const moderation = await ai.providers.anthropic.moderate(content);
}
```

### 3. Streaming (Works with Both Paths)

```typescript
// AI SDK streaming
const stream1 = await ai.stream({
  prompt: 'Write a story',
  provider: 'openai',
});

// Direct SDK streaming
const stream2 = await ai.stream({
  prompt: 'Write a poem',
  provider: 'anthropic',
});

// Same interface for consumption
for await (const chunk of stream1) {
  console.log(chunk.text);
}
```

### 4. Smart Routing

```typescript
const ai = createAI({
  providers: [...],
  // Automatic routing based on capabilities
  routing: {
    'moderate': 'anthropic-direct',
    'image-generation': 'openai-direct',
    'default': 'openai-ai-sdk'
  }
});

// Automatically routes to anthropic-direct
const moderation = await ai.moderate("content to check");

// Uses default (openai-ai-sdk)
const text = await ai.complete({ prompt: "Hello" });
```

## Provider Implementation Pattern

```typescript
// Base interface that all providers implement
interface AIProvider {
  readonly name: string;
  readonly type: 'ai-sdk' | 'direct' | 'custom';
  readonly capabilities: Set<Capability>;

  // Standard methods
  complete(options: CompletionOptions): Promise<CompletionResponse>;
  stream(options: StreamOptions): AsyncIterableIterator<StreamChunk>;
  embed(options: EmbedOptions): Promise<EmbeddingResponse>;

  // Optional methods
  generateObject?<T>(options: ObjectOptions<T>): Promise<T>;
  moderate?(content: string): Promise<ModerationResult>;
  classify?(text: string, labels: string[]): Promise<Classification>;

  // Provider-specific extensions
  extensions?: Record<string, Function>;
}

// Example: Anthropic with both implementations
export class AnthropicAISDKProvider implements AIProvider {
  type = 'ai-sdk' as const;
  capabilities = new Set(['complete', 'stream', 'tools']);

  async complete(options) {
    // Uses Vercel AI SDK
    return generateText({
      model: anthropic(options.model),
      ...options,
    });
  }
}

export class AnthropicDirectProvider implements AIProvider {
  type = 'direct' as const;
  capabilities = new Set(['complete', 'stream', 'tools', 'moderate', 'classify']);

  async complete(options) {
    // Direct Anthropic SDK call
    return this.client.messages.create(options);
  }

  async moderate(content) {
    // Anthropic-specific feature
    return this.client.moderate(content);
  }
}
```

## Benefits of This Approach

1. **Framework Agnostic**: Not locked into any specific AI framework
2. **Best Tool for Job**: Use AI SDK for convenience, direct for features
3. **Consistent Interface**: Same API regardless of implementation
4. **Gradual Migration**: Can switch implementations without changing app code
5. **Provider Innovation**: Access new provider features immediately
6. **Performance**: Choose optimal path for each use case

## When to Use Which Path

### Use Vercel AI SDK When:

- You need standard completions, chat, or embeddings
- You want automatic retries and error handling
- You're building standard AI features
- You want the simplest implementation

### Use Direct Provider SDK When:

- You need provider-specific features (Anthropic moderation, OpenAI beta features)
- You want maximum control over API calls
- You need to optimize for specific use cases
- You're using features not yet in AI SDK

### Use Custom Providers When:

- You have proprietary AI systems
- You need to integrate with specialized APIs
- You're building domain-specific solutions

## Migration Impact

```typescript
// Old code (tightly coupled to one approach)
import { openai } from '@ai-sdk/openai';
const result = await generateText({ model: openai('gpt-4'), prompt });

// New code (flexible and extensible)
import { createAI } from '@repo/ai-new';
const ai = createAI(config);
const result = await ai.complete({ prompt, provider: 'openai' });

// Can easily switch implementations
const result2 = await ai.complete({ prompt, provider: 'anthropic-direct' });
```

This architecture provides maximum flexibility while maintaining a clean, consistent interface for
the 90% of use cases that work well with Vercel AI SDK.
