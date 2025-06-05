# AI Package Migration Plan V2

## Overview

This document outlines the revised plan to migrate the existing `@repo/ai` package to the new
`@repo/ai` package. The key change is that **Vercel AI SDK is our primary framework**, with the
ability to add custom providers alongside it.

## Core Architecture Principle

```
┌─────────────────────────────────────────────────┐
│                 AI-New Package                   │
├─────────────────────────────────────────────────┤
│          Vercel AI SDK (Primary Layer)          │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   OpenAI    │ │  Anthropic  │ │  Google   │ │
│  │  Provider   │ │  Provider   │ │ Provider  │ │
│  └─────────────┘ └─────────────┘ └───────────┘ │
├─────────────────────────────────────────────────┤
│         Custom Provider Layer (Secondary)        │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   Custom    │ │   Legacy    │ │  Special  │ │
│  │  Provider   │ │  Provider   │ │ Provider  │ │
│  └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────┘
```

## Revised Architecture

```
packages/ai-new/
├── src/
│   ├── client/
│   │   ├── index.ts              # Client exports (Vercel AI SDK + custom)
│   │   ├── ai-sdk.ts             # Vercel AI SDK client setup
│   │   └── providers/            # Custom client providers
│   │       └── registry.ts
│   ├── server/
│   │   ├── index.ts              # Server exports (Vercel AI SDK + custom)
│   │   ├── ai-sdk.ts             # Vercel AI SDK server setup
│   │   └── providers/            # Custom server providers
│   │       ├── custom-anthropic.ts  # For features not in AI SDK
│   │       ├── specialized.ts       # Domain-specific providers
│   │       └── registry.ts
│   ├── shared/
│   │   ├── types/
│   │   │   ├── types.ts          # Core types extending AI SDK types
│   │   │   ├── providers.ts      # Provider interfaces
│   │   │   └── extensions.ts     # Extensions to AI SDK
│   │   ├── utils/
│   │   │   ├── manager.ts        # AIManager wrapping AI SDK + custom
│   │   │   ├── tools.ts          # Tool definitions (AI SDK format)
│   │   │   └── middleware.ts     # Request/response middleware
│   │   └── providers/
│   │       └── base-provider.ts  # Base for custom providers
│   └── next/
│       ├── index.ts              # Re-exports AI SDK Next.js features
│       ├── hooks.tsx             # Enhanced hooks wrapping useChat, etc.
│       └── components.tsx        # UI components using AI SDK
└── package.json
```

## Key Design Changes

### 1. Vercel AI SDK as Foundation

```typescript
import { createOpenAI, createAnthropic, createGoogleGenerativeAI } from '@ai-sdk/openai';
import { streamText, generateText, embed } from 'ai';

// The AI manager extends Vercel AI SDK functionality
export class AIManager {
  private aiSDKProviders: Map<string, LanguageModelV1>;
  private customProviders: Map<string, CustomProvider>;

  constructor(config: AIConfig) {
    // Initialize Vercel AI SDK providers
    this.initializeAISDKProviders(config);

    // Add custom providers for additional functionality
    this.initializeCustomProviders(config);
  }

  // Use AI SDK as primary method
  async complete(prompt: string, options?: CompletionOptions) {
    const provider = options?.provider || this.defaultProvider;

    // Prefer AI SDK providers
    if (this.aiSDKProviders.has(provider)) {
      return generateText({
        model: this.aiSDKProviders.get(provider)!,
        prompt,
        ...options,
      });
    }

    // Fall back to custom providers
    return this.customProviders.get(provider)?.complete(prompt, options);
  }
}
```

### 2. Custom Providers for Extended Functionality

Custom providers are only for features NOT available in Vercel AI SDK:

```typescript
interface CustomProvider {
  // Only methods not available in AI SDK
  moderate?(content: string): Promise<ModerationResult>;
  classify?(text: string, categories: string[]): Promise<ClassificationResult>;
  analyzeProduct?(data: ProductData): Promise<ProductAnalysis>;

  // Custom business logic
  generateReport?(data: any): Promise<Report>;
}

// Example: Anthropic custom provider for moderation
class AnthropicCustomProvider implements CustomProvider {
  async moderate(content: string) {
    // Direct API call for features not in AI SDK
    return this.anthropicAPI.moderate(content);
  }
}
```

### 3. Unified Interface

```typescript
// Client usage remains simple
const ai = await createClientAI({
  // Vercel AI SDK providers
  providers: {
    openai: { apiKey: '...' },
    anthropic: { apiKey: '...' },
    google: { apiKey: '...' },
  },
  // Custom providers for extended features
  customProviders: {
    'anthropic-moderation': { apiKey: '...' },
    'product-classifier': { endpoint: '...' },
  },
});

// Seamless usage
const result = await ai.complete('Hello'); // Uses AI SDK
const moderation = await ai.moderate('text'); // Uses custom provider
```

## Migration Strategy

### Phase 1: Foundation (Week 1)

1. Set up package structure
2. Create wrappers around Vercel AI SDK
3. Define extension interfaces
4. Implement core AIManager

### Phase 2: AI SDK Integration (Week 2)

1. Implement all AI SDK providers (OpenAI, Anthropic, Google, etc.)
2. Set up streaming with AI SDK's built-in support
3. Integrate AI SDK tools and function calling
4. Add structured output via AI SDK

### Phase 3: Custom Extensions (Week 3)

1. Identify features needed beyond AI SDK
2. Implement custom providers for:
   - Anthropic moderation/classification
   - Product-specific analysis
   - Legacy API compatibility
3. Create unified interface

### Phase 4: Enhanced Features (Week 4)

1. Add middleware system for:
   - Rate limiting
   - Cost tracking
   - Request/response transformation
2. Implement caching layer
3. Add observability

### Phase 5: Next.js & Testing (Week 5)

1. Enhance AI SDK's Next.js integration
2. Create wrapped hooks with additional features
3. Build comprehensive test suite
4. Documentation

## Benefits of This Approach

1. **Leverage AI SDK**: Get all the benefits of Vercel's maintained SDK
2. **Extensibility**: Add custom functionality when needed
3. **Future Proof**: New AI SDK features automatically available
4. **Best of Both**: AI SDK's reliability + custom business logic
5. **Simpler Migration**: Less code to write and maintain

## Example: Enhanced useChat Hook

```typescript
// Wrapping AI SDK's useChat with additional features
import { useChat as useAISDKChat } from 'ai/react';

export function useChat(options: EnhancedChatOptions) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, ...aiSDKProps } =
    useAISDKChat({
      ...options,
      // Add middleware
      onResponse: async (response) => {
        // Track usage
        await trackUsage(response);
        // Apply rate limiting
        await checkRateLimit();
        // Call original handler
        options.onResponse?.(response);
      },
    });

  // Add custom features
  const moderate = useCallback(async () => {
    const result = await ai.moderate(input);
    return result;
  }, [input]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    moderate, // Additional functionality
    ...aiSDKProps,
  };
}
```

## Configuration

```typescript
export interface AIConfig {
  // Vercel AI SDK configuration
  providers: {
    openai?: { apiKey: string; organization?: string };
    anthropic?: { apiKey: string };
    google?: { apiKey: string };
    // Any AI SDK supported provider
  };

  // Custom provider configuration
  customProviders?: {
    [key: string]: CustomProviderConfig;
  };

  // Global settings
  defaultProvider: string;
  middleware?: AIMiddleware[];
  cache?: CacheConfig;
}
```

This revised approach makes Vercel AI SDK the foundation while maintaining flexibility for custom
requirements.
