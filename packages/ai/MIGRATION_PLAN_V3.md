# AI Package Migration Plan V3 - Framework Agnostic

## Overview

This document outlines the final plan to migrate to a framework-agnostic AI package that supports
both Vercel AI SDK (90% of use cases) and direct provider implementations (10% special cases).

## Core Architecture Principle

```
┌─────────────────────────────────────────────────────────┐
│                   AI-New Package                         │
├─────────────────────────────────────────────────────────┤
│                   Unified AI Manager                     │
├─────────────┬───────────────────────────┬───────────────┤
│  Vercel AI  │                           │    Direct     │
│  SDK Path   │      Common Interface     │ Provider Path │
│   (90%)     │                           │    (10%)      │
├─────────────┼───────────────────────────┼───────────────┤
│   OpenAI    │                           │   Anthropic   │
│ (via AI SDK)│                           │   (Direct)    │
├─────────────┤                           ├───────────────┤
│  Anthropic  │                           │    OpenAI     │
│ (via AI SDK)│                           │   (Direct)    │
├─────────────┤                           ├───────────────┤
│   Google    │                           │    Custom     │
│ (via AI SDK)│                           │  Providers    │
└─────────────┴───────────────────────────┴───────────────┘
```

## Key Design Principles

1. **Framework Agnostic**: Not tied to any specific AI framework
2. **Provider Choice**: Use AI SDK OR direct implementations
3. **Unified Interface**: Same API regardless of underlying implementation
4. **Performance**: Choose the best path for each use case
5. **Flexibility**: Easy to switch between implementations

## Architecture

```
packages/ai-new/
├── src/
│   ├── client/
│   │   ├── index.ts                 # Client exports
│   │   ├── manager.ts               # Client AI Manager
│   │   └── providers/
│   │       ├── base.ts              # Base provider interface
│   │       ├── ai-sdk/              # Vercel AI SDK implementations
│   │       │   ├── openai.ts
│   │       │   ├── anthropic.ts
│   │       │   └── google.ts
│   │       └── direct/              # Direct API implementations
│   │           ├── anthropic.ts     # Direct Anthropic SDK
│   │           ├── openai.ts        # Direct OpenAI SDK
│   │           └── custom.ts
│   ├── server/
│   │   ├── index.ts                 # Server exports
│   │   ├── manager.ts               # Server AI Manager
│   │   └── providers/
│   │       ├── base.ts              # Base provider interface
│   │       ├── ai-sdk/              # Vercel AI SDK providers
│   │       └── direct/              # Direct implementations
│   ├── shared/
│   │   ├── types/
│   │   │   ├── provider.ts          # Unified provider interface
│   │   │   ├── options.ts           # Common options
│   │   │   └── responses.ts         # Common response types
│   │   ├── utils/
│   │   │   ├── streaming.ts         # Streaming utilities
│   │   │   ├── tools.ts             # Tool definitions
│   │   │   └── errors.ts            # Error handling
│   │   └── adapters/
│   │       ├── ai-sdk-adapter.ts    # Adapt AI SDK to our interface
│   │       └── direct-adapter.ts    # Adapt direct APIs to our interface
│   └── next/
│       ├── hooks.tsx                # Framework-agnostic hooks
│       └── components.tsx           # UI components
└── package.json
```

## Unified Provider Interface

```typescript
// Every provider implements this interface
interface AIProvider {
  readonly name: string;
  readonly type: 'ai-sdk' | 'direct' | 'custom';

  // Core functionality
  complete(options: CompletionOptions): Promise<CompletionResponse>;
  stream(options: StreamOptions): AsyncIterableIterator<StreamChunk>;
  embed(options: EmbedOptions): Promise<EmbeddingResponse>;

  // Optional capabilities
  generateObject?<T>(options: ObjectOptions<T>): Promise<T>;
  moderate?(content: string): Promise<ModerationResult>;
  useTools?(options: ToolOptions): Promise<ToolResponse>;

  // Provider-specific features
  custom?: Record<string, Function>;
}

// Completion options work for both AI SDK and direct
interface CompletionOptions {
  model: string;
  messages?: Message[];
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  // ... other common options
}
```

## Implementation Examples

### 1. Anthropic - Both Paths

```typescript
// Direct implementation (for special Anthropic features)
class AnthropicDirectProvider implements AIProvider {
  type = 'direct' as const;
  private client: Anthropic;

  constructor(config: AnthropicConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
  }

  async complete(options: CompletionOptions) {
    // Direct API call to Anthropic
    const response = await this.client.messages.create({
      model: options.model,
      messages: options.messages,
      max_tokens: options.maxTokens,
    });

    return this.normalizeResponse(response);
  }

  // Anthropic-specific features
  async moderate(content: string) {
    // Use Anthropic's moderation capabilities
    return this.client.moderate(content);
  }
}

// AI SDK implementation (for standard use)
class AnthropicAISDKProvider implements AIProvider {
  type = 'ai-sdk' as const;
  private anthropic: ReturnType<typeof createAnthropic>;

  constructor(config: AnthropicConfig) {
    this.anthropic = createAnthropic({ apiKey: config.apiKey });
  }

  async complete(options: CompletionOptions) {
    const result = await generateText({
      model: this.anthropic(options.model),
      messages: options.messages,
    });

    return this.normalizeResponse(result);
  }
}
```

### 2. Usage - Framework Agnostic

```typescript
const ai = createAI({
  providers: [
    // Use AI SDK for most providers
    {
      name: 'openai',
      type: 'ai-sdk',
      config: { apiKey: process.env.OPENAI_KEY },
    },
    // Use direct implementation for Anthropic (special features needed)
    {
      name: 'anthropic',
      type: 'direct',
      config: { apiKey: process.env.ANTHROPIC_KEY },
    },
    // Can also use Anthropic via AI SDK
    {
      name: 'anthropic-sdk',
      type: 'ai-sdk',
      config: { apiKey: process.env.ANTHROPIC_KEY },
    },
  ],
  defaultProvider: 'anthropic', // Using direct version
});

// Same API regardless of underlying implementation
const response = await ai.complete({
  provider: 'anthropic', // Uses direct implementation
  model: 'claude-3-5-sonnet',
  messages: [{ role: 'user', content: 'Hello' }],
});

// Use AI SDK version for standard features
const sdkResponse = await ai.complete({
  provider: 'anthropic-sdk', // Uses AI SDK implementation
  model: 'claude-3-5-sonnet',
  messages: [{ role: 'user', content: 'Hello' }],
});

// Access provider-specific features
const moderation = await ai.providers.anthropic.moderate('content');
```

## Migration Strategy

### Phase 1: Core Infrastructure

1. Define unified provider interface
2. Create adapters for AI SDK and direct implementations
3. Build provider registry system
4. Implement core manager class

### Phase 2: Provider Implementations

1. **AI SDK Providers** (for standard cases):
   - OpenAI via AI SDK
   - Anthropic via AI SDK
   - Google via AI SDK
2. **Direct Providers** (for special cases):
   - Anthropic direct (for moderation, classification)
   - OpenAI direct (for specific features)
   - Custom providers

### Phase 3: Feature Parity

1. Ensure both paths support:
   - Streaming
   - Tools/Functions
   - Structured output
   - Embeddings
2. Add path-specific optimizations

### Phase 4: Developer Experience

1. Unified configuration
2. Automatic provider selection based on features
3. Clear documentation on when to use which path

## Benefits

1. **True Flexibility**: Choose the best implementation for each use case
2. **Not Framework-Locked**: Can use AI SDK, direct SDKs, or custom implementations
3. **Feature Access**: Get provider-specific features when needed
4. **Performance**: Use optimized paths for different scenarios
5. **Future Proof**: Easy to add new providers or switch implementations
6. **Gradual Migration**: Can migrate providers one at a time

## Configuration Example

```typescript
export const aiConfig = {
  providers: [
    // Most providers via AI SDK (90% of cases)
    {
      name: 'openai',
      type: 'ai-sdk',
      config: { apiKey: process.env.OPENAI_KEY },
      models: ['gpt-4', 'gpt-3.5-turbo'],
    },
    // Direct implementation when needed (10% of cases)
    {
      name: 'anthropic',
      type: 'direct',
      config: { apiKey: process.env.ANTHROPIC_KEY },
      models: ['claude-3-5-sonnet'],
      features: ['moderate', 'classify'], // Provider-specific
    },
  ],
  // Automatic provider selection
  routing: {
    moderate: 'anthropic', // Routes moderation to direct Anthropic
    default: 'openai', // Routes general requests to OpenAI via AI SDK
  },
};
```

This approach gives you the best of both worlds: the convenience of Vercel AI SDK for most use
cases, and the flexibility to use providers directly when you need specific features or
optimizations.
