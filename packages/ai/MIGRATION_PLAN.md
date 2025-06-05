# AI Package Migration Plan

## Overview

This document outlines the plan to migrate the existing `@repo/ai` package to the new `@repo/ai`
package using the modern multi-provider architecture pattern established in `@repo/analytics-new`.

## Goals

1. **Reduce Code**: Eliminate redundancy and consolidate functionality
2. **Modernize**: Use latest TypeScript, AI SDK features, and modern patterns
3. **Multi-Provider Support**: Enable easy switching between AI providers
4. **Environment Separation**: Clear client/server code boundaries
5. **Type Safety**: Enhanced TypeScript types throughout
6. **Extensibility**: Easy to add new AI providers

## Architecture Overview

```
packages/ai-new/
├── src/
│   ├── client/                    # Browser-specific implementations
│   │   ├── index.ts              # Client exports
│   │   └── providers/            # Client-side provider implementations
│   │       ├── openai-client.ts
│   │       ├── anthropic-client.ts
│   │       └── registry.ts
│   ├── server/                    # Node.js-specific implementations
│   │   ├── index.ts              # Server exports
│   │   └── providers/            # Server-side provider implementations
│   │       ├── openai-server.ts
│   │       ├── anthropic-server.ts
│   │       ├── vercel-ai.ts      # Vercel AI SDK provider
│   │       └── registry.ts
│   ├── shared/                    # Universal code
│   │   ├── index.ts              # Shared exports
│   │   ├── types/                # Type definitions
│   │   │   ├── types.ts          # Core AI types
│   │   │   ├── providers.ts      # Provider interfaces
│   │   │   ├── openai.ts         # OpenAI-specific types
│   │   │   └── anthropic.ts      # Anthropic-specific types
│   │   ├── utils/                # Shared utilities
│   │   │   ├── manager.ts        # AIManager class
│   │   │   ├── streaming.ts      # Streaming utilities
│   │   │   ├── tools.ts          # AI tool definitions
│   │   │   └── validation.ts     # Input validation
│   │   └── providers/            # Shared provider logic
│   │       ├── base-provider.ts  # Abstract base provider
│   │       └── console.ts        # Development console provider
│   ├── next/                      # Next.js integrations
│   │   ├── client.ts             # Next.js client manager
│   │   ├── server.ts             # Next.js server manager
│   │   ├── hooks.tsx             # React hooks (useAI, useChat)
│   │   ├── components.tsx        # UI components
│   │   └── actions.ts            # Server actions
│   ├── client-next.ts            # Next.js client entry
│   └── server-next.ts            # Next.js server entry
└── package.json
```

## Core Interfaces

### Provider Interface

```typescript
interface AIProvider {
  readonly name: string;
  readonly capabilities: AICapabilities;

  initialize(config: ProviderConfig): Promise<void>;

  // Core methods
  complete(prompt: string, options?: CompletionOptions): Promise<CompletionResult>;
  stream?(prompt: string, options?: StreamOptions): AsyncIterableIterator<StreamChunk>;

  // Optional capabilities
  embed?(text: string | string[]): Promise<Embedding[]>;
  moderate?(content: string): Promise<ModerationResult>;
  classify?(text: string, categories: string[]): Promise<ClassificationResult>;
  generateStructured?<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T>;

  // Lifecycle
  dispose?(): Promise<void>;
}

interface AICapabilities {
  streaming: boolean;
  embeddings: boolean;
  moderation: boolean;
  classification: boolean;
  structuredOutput: boolean;
  tools: boolean;
  maxTokens: number;
  models: string[];
}
```

### Manager Pattern

```typescript
class AIManager {
  private providers = new Map<string, AIProvider>();
  private defaultProvider: string;

  constructor(config: AIConfig) {
    this.initializeProviders(config);
  }

  // Dynamic provider selection
  async complete(prompt: string, options?: CompletionOptions & { provider?: string }) {
    const provider = this.getProvider(options?.provider);
    return provider.complete(prompt, options);
  }

  // Multi-provider operations
  async completeWithFallback(prompt: string, options?: CompletionOptions) {
    for (const [name, provider] of this.providers) {
      try {
        return await provider.complete(prompt, options);
      } catch (error) {
        console.warn(`Provider ${name} failed, trying next...`, error);
      }
    }
    throw new Error('All AI providers failed');
  }
}
```

## Migration Steps

### Phase 1: Core Infrastructure (Week 1)

1. **Set up directory structure** matching the pattern above
2. **Define core interfaces** in `shared/types/`
3. **Implement base provider** class with common functionality
4. **Create AIManager** with provider registry pattern
5. **Set up build configuration** and exports map

### Phase 2: Provider Implementation (Week 2)

1. **OpenAI Provider**

   - Server: Direct API implementation with streaming
   - Client: Lightweight proxy to server endpoints
   - Full feature support (completion, embeddings, tools)

2. **Anthropic Provider**

   - Server: Direct API with Claude models
   - Client: Streaming support via server proxy
   - Moderation and classification features

3. **Vercel AI SDK Provider**
   - Server-only implementation
   - Wraps existing AI SDK functionality
   - Maintains compatibility with current code

### Phase 3: Feature Migration (Week 3)

1. **Tools System**

   - Migrate existing tools (calculator, search, datetime)
   - Create tool registry pattern
   - Add tool validation and error handling

2. **Streaming Support**

   - Unified streaming interface across providers
   - Proper backpressure handling
   - Stream transformation utilities

3. **Structured Output**
   - Zod schema validation
   - Provider-specific implementations
   - Fallback for providers without native support

### Phase 4: Next.js Integration (Week 4)

1. **React Hooks**

   - Migrate and enhance `useAIChat`
   - New `useAI` hook for general operations
   - `useCompletion` for non-chat completions

2. **UI Components**

   - Migrate Message and Thread components
   - Add provider-aware components
   - Streaming UI support

3. **Server Actions**
   - App Router server actions
   - Edge runtime support
   - Streaming responses

### Phase 5: Testing & Documentation (Week 5)

1. **Unit Tests**

   - Provider implementations
   - Manager functionality
   - Utility functions

2. **Integration Tests**

   - Multi-provider scenarios
   - Error handling and fallbacks
   - Streaming operations

3. **Documentation**
   - Migration guide
   - API reference
   - Provider configuration

## Key Improvements

### 1. Provider Flexibility

- Easy provider switching at runtime
- Fallback chains for reliability
- Provider-specific optimizations

### 2. Modern Patterns

- Async iterators for streaming
- Proper TypeScript generics
- Error boundaries and recovery

### 3. Performance

- Lazy provider initialization
- Connection pooling
- Request deduplication

### 4. Developer Experience

- Clear error messages
- Development mode with console provider
- Comprehensive TypeScript types

## Migration Checklist

- [ ] Create directory structure
- [ ] Define core types and interfaces
- [ ] Implement AIManager class
- [ ] Migrate OpenAI provider
- [ ] Migrate Anthropic provider
- [ ] Implement Vercel AI SDK provider
- [ ] Migrate tools system
- [ ] Implement streaming utilities
- [ ] Create React hooks
- [ ] Migrate UI components
- [ ] Add Next.js integrations
- [ ] Write comprehensive tests
- [ ] Create documentation
- [ ] Update dependent packages
- [ ] Deprecate old package

## Breaking Changes

1. **Import Paths**: Change from `@repo/ai` to `@repo/ai/client` or `@repo/ai/server`
2. **Configuration**: New provider-based configuration structure
3. **API Methods**: Some method signatures will change for consistency
4. **Streaming**: New async iterator-based streaming API

## Backwards Compatibility

A compatibility layer will be provided:

```typescript
// @repo/ai/compat
export * from './legacy-exports';
```

This will ease migration for existing code while encouraging adoption of new patterns.
