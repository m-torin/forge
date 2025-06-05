# AI Package Migration Plan - Final

## Overview

This document outlines the complete migration plan for restructuring `packages/ai-new` to follow the
established monorepo patterns (based on `packages/analytics-new`) while incorporating all missing
features from the original `packages/ai`.

## Current State Analysis

### packages/ai-new (Current)

- ✅ Sophisticated provider registry system
- ✅ Multi-path architecture (AI SDK, Direct, Custom)
- ✅ Capability-based routing
- ✅ Client/server separation
- ❌ Complex configuration (no simple env setup)
- ❌ Missing production features (moderation, classification, sentiment)
- ❌ Missing UI components
- ❌ Inconsistent with monorepo structure patterns

### packages/ai (Original)

- ✅ Simple environment configuration
- ✅ Production-ready features (moderation, sentiment, classification)
- ✅ Mantine-based UI components
- ✅ React hooks
- ❌ Limited provider flexibility
- ❌ No capability-based routing
- ❌ Simpler architecture

## Target Structure (Following analytics-new Pattern)

```
packages/ai-new/
├── package.json                     # With proper exports configuration
├── tsconfig.json                    # Extending @repo/typescript-config
├── eslint.config.ts                 # Extending @repo/eslint-config
├── vitest.config.ts                 # Testing configuration
├── keys.ts                          # Environment variables (root level)
│
└── src/
    ├── index.ts                     # Main entry point (general exports + types)
    ├── client.ts                    # Client-side exports
    ├── server.ts                    # Server-side exports
    ├── client-next.ts               # Next.js client exports (re-exports client + Next.js)
    ├── server-next.ts               # Next.js server exports (re-exports server + Next.js)
    │
    ├── client/                      # Client-specific implementations
    │   ├── index.ts                 # Client exports
    │   ├── manager.ts               # Client AI manager
    │   ├── providers/               # Client provider implementations
    │   │   ├── index.ts
    │   │   ├── ai-sdk-provider.ts   # AI SDK proxy provider
    │   │   └── console-provider.ts  # Development/fallback provider
    │   └── utils/
    │       ├── index.ts
    │       └── proxy.ts             # Server proxy utilities
    │
    ├── server/                      # Server-specific implementations
    │   ├── index.ts                 # Server exports
    │   ├── manager.ts               # Server AI manager
    │   ├── providers/               # Server provider implementations
    │   │   ├── index.ts
    │   │   ├── ai-sdk-provider.ts   # Vercel AI SDK providers
    │   │   ├── direct-provider.ts   # Direct provider implementations
    │   │   └── console-provider.ts  # Development provider
    │   └── utils/
    │       ├── index.ts
    │       └── factory.ts           # Provider factory utilities
    │
    ├── shared/                      # Universal code
    │   ├── index.ts                 # Shared exports
    │   ├── types/                   # Type definitions
    │   │   ├── index.ts
    │   │   ├── core.ts              # Core AI types
    │   │   ├── provider.ts          # Provider interface types
    │   │   ├── config.ts            # Configuration types
    │   │   ├── moderation.ts        # Content moderation types
    │   │   ├── classification.ts    # Product classification types
    │   │   └── streaming.ts         # Streaming types
    │   │
    │   ├── utils/                   # Shared utilities
    │   │   ├── index.ts
    │   │   ├── manager.ts           # Base manager class
    │   │   ├── config.ts            # Configuration utilities
    │   │   ├── validation.ts        # Input validation
    │   │   ├── streaming.ts         # Stream processing utilities
    │   │   └── response-normalizer.ts # Response standardization
    │   │
    │   ├── providers/               # Provider base classes
    │   │   ├── index.ts
    │   │   ├── base-provider.ts     # Abstract provider base
    │   │   ├── registry.ts          # Provider registry
    │   │   └── capabilities.ts     # Capability system
    │   │
    │   ├── features/                # Specialized AI features
    │   │   ├── index.ts
    │   │   ├── moderation/
    │   │   │   ├── index.ts
    │   │   │   ├── types.ts
    │   │   │   └── anthropic-moderation.ts
    │   │   ├── classification/
    │   │   │   ├── index.ts
    │   │   │   ├── types.ts
    │   │   │   ├── product-classifier.ts
    │   │   │   └── training-system.ts
    │   │   ├── sentiment/
    │   │   │   ├── index.ts
    │   │   │   ├── types.ts
    │   │   │   └── sentiment-analyzer.ts
    │   │   └── extraction/
    │   │       ├── index.ts
    │   │       ├── types.ts
    │   │       └── entity-extractor.ts
    │   │
    │   └── middleware/              # Cross-cutting concerns
    │       ├── index.ts
    │       ├── logging.ts
    │       ├── rate-limiting.ts
    │       └── error-handling.ts
    │
    ├── components/                  # React components (optional)
    │   ├── index.ts
    │   ├── chat/
    │   │   ├── ai-chat.tsx
    │   │   ├── chat-message.tsx
    │   │   └── chat-input.tsx
    │   └── classification/
    │       └── product-classifier-ui.tsx
    │
    ├── hooks/                       # React hooks (optional)
    │   ├── index.ts
    │   ├── use-ai-chat.ts
    │   ├── use-ai-stream.ts
    │   └── use-classification.ts
    │
    └── __tests__/                   # Test files
        ├── setup.ts
        ├── providers/
        ├── features/
        └── utils/
```

## Migration Tasks

### Phase 1: Structure Setup

- [ ] Create new directory structure
- [ ] Move `keys.ts` to package root
- [ ] Update package.json with proper exports
- [ ] Update TypeScript configuration
- [ ] Update ESLint configuration

### Phase 2: Core Migration

- [ ] Restructure existing provider system
- [ ] Move shared types to `shared/types/`
- [ ] Move utilities to `shared/utils/`
- [ ] Update entry points (index.ts, client.ts, server.ts, etc.)

### Phase 3: Feature Migration from Original

- [ ] Migrate content moderation system
- [ ] Migrate product classification system
- [ ] Migrate sentiment analysis
- [ ] Migrate entity extraction
- [ ] Add training system for classification

### Phase 4: Component Migration

- [ ] Migrate Mantine-based chat components
- [ ] Migrate React hooks
- [ ] Update component styling to use Mantine v8

### Phase 5: Integration & Testing

- [ ] Update all imports across codebase
- [ ] Add comprehensive tests
- [ ] Verify all exports work correctly
- [ ] Update documentation

## Key Configuration Changes

### Package.json Exports

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./client": "./src/client.ts",
    "./server": "./src/server.ts",
    "./client/next": "./src/client-next.ts",
    "./server/next": "./src/server-next.ts"
  },
  "type": "module"
}
```

### Environment Variables (keys.ts)

```typescript
// keys.ts (in package root, not src/)
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const aiKeys = createEnv({
  server: {
    OPENAI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    GOOGLE_AI_API_KEY: z.string().optional(),
  },
  runtimeEnv: process.env,
});
```

### Entry Point Strategy

```typescript
// src/index.ts - Main exports (types + general functionality)
export * from './shared/types';
export * from './shared/features';

// src/client.ts - Client-specific exports
export * from './client';

// src/server.ts - Server-specific exports
export * from './server';

// src/client-next.ts - Next.js client (extends client)
export * from './client';
export * from './components';
export * from './hooks';

// src/server-next.ts - Next.js server (extends server)
export * from './server';
export * from './shared/middleware';
```

## Missing Features to Migrate

### 1. Content Moderation (from packages/ai/providers/anthropic/index.ts)

- `AnthropicClient.moderateContent()`
- Safety category classification
- Confidence scoring
- Batch content analysis

### 2. Product Classification (from packages/ai/providers/product-classification.ts)

- `AIProductClassifier` class
- Category hierarchy support
- Training system with feedback
- Batch classification

### 3. Sentiment Analysis

- `AnthropicClient.analyzeSentiment()`
- Emotion detection
- Confidence scoring

### 4. Entity Extraction

- `AnthropicClient.extractEntities()`
- Named entity recognition
- Custom extraction rules

### 5. UI Components (from packages/ai/components/)

- Mantine-based chat interface
- Message display components
- Streaming input components

### 6. React Hooks (from packages/ai/hooks/)

- `use-ai-chat.ts`
- Streaming hooks
- Error handling hooks

## Benefits of New Structure

1. **Follows Monorepo Patterns**: Consistent with analytics-new structure
2. **Preserves Advanced Architecture**: Keeps provider registry and capability system
3. **Adds Missing Production Features**: All content moderation, classification, etc.
4. **Simple + Complex Config**: Both simple env setup and advanced configuration
5. **Proper TypeScript Setup**: Following established patterns
6. **Component Integration**: Mantine-based UI components
7. **Backward Compatibility**: Easy migration path

## Implementation Priority

1. **High Priority**: Structure setup, core migration, feature migration
2. **Medium Priority**: Component migration, testing
3. **Low Priority**: Documentation updates, advanced optimizations

This migration plan ensures the new AI package follows established monorepo patterns while
preserving both the advanced architecture of ai-new and the production-ready features of the
original ai package.
