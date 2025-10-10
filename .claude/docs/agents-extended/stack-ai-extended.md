# Stack-AI Extended Documentation

> **Extended guide for AI SDK integration, chatbot orchestration, and streaming patterns**

---

## 1. AI SDK v5 Tool Patterns

### Defining Tools with inputSchema

**Critical**: AI SDK v5 uses `inputSchema` (NOT `parameters`). Never use the old `parameters` field.

```typescript
import { tool } from 'ai';
import { z } from 'zod';

// ✅ CORRECT: Using inputSchema
export const searchKnowledgeBase = tool({
  description: 'Search the knowledge base for relevant information',
  inputSchema: z.object({
    query: z.string().describe('Search query'),
    limit: z.number().optional().default(10).describe('Maximum results'),
    filters: z.object({
      category: z.enum(['docs', 'api', 'guides']).optional(),
      dateRange: z.object({
        start: z.string().datetime().optional(),
        end: z.string().datetime().optional(),
      }).optional(),
    }).optional(),
  }),
  execute: async ({ query, limit, filters }) => {
    // Implementation here
    return {
      results: [],
      count: 0,
    };
  },
});

// ❌ WRONG: Using parameters (old API)
export const badTool = tool({
  description: 'This will break',
  parameters: z.object({ ... }),  // DON'T DO THIS!
  execute: async () => {},
});
```

### Tool Registration Pattern

```typescript
// packages/ai/src/tools/index.ts
import { searchKnowledgeBase } from './search';
import { updateUserPreferences } from './preferences';
import { generateSummary } from './summary';

export const tools = {
  searchKnowledgeBase,
  updateUserPreferences,
  generateSummary,
} as const;

export type ToolName = keyof typeof tools;
```

### Conditional Tool Access

```typescript
import { tools } from '@repo/ai/tools';

// Feature-flagged tool access
function getAvailableTools(user: User) {
  const baseTools = {
    searchKnowledgeBase: tools.searchKnowledgeBase,
  };

  if (user.hasFeature('advanced-ai')) {
    return {
      ...baseTools,
      generateSummary: tools.generateSummary,
    };
  }

  return baseTools;
}
```

---

## 2. Streaming Implementation Patterns

### Server Action with Streaming Text

```typescript
'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { auth } from '@repo/auth/server/next';

export async function chat(messages: Message[]) {
  'use server';

  // Auth check
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  // Feature flag check
  if (!session.user.hasFeature('ai-chat')) {
    throw new Error('Feature not available');
  }

  // Create streamable value for RSC
  const stream = createStreamableValue('');

  (async () => {
    const { textStream } = await streamText({
      model: openai('gpt-4-turbo'),
      messages,
      temperature: 0.7,
      maxTokens: 2000,
      onFinish: ({ usage, finishReason }) => {
        // Log metrics
        console.log('Completion finished:', {
          tokens: usage.totalTokens,
          reason: finishReason,
        });
      },
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { output: stream.value };
}
```

### Client-Side Streaming Consumer

```typescript
'use client';

import { useState } from 'react';
import { useActions, readStreamableValue } from 'ai/rsc';
import { chat } from './actions';

export function ChatInterface() {
  const [generation, setGeneration] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleSubmit(input: string) {
    setIsGenerating(true);
    setGeneration('');

    try {
      const { output } = await chat([{ role: 'user', content: input }]);

      for await (const delta of readStreamableValue(output)) {
        setGeneration(current => current + delta);
      }
    } catch (error) {
      console.error('Streaming error:', error);
      // Handle error
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div>
      <div>{generation}</div>
      {isGenerating && <Spinner />}
    </div>
  );
}
```

### Error Boundaries for Streaming

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function StreamingErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Streaming interrupted:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Retry</button>
    </div>
  );
}

export function ChatWithErrorBoundary() {
  return (
    <ErrorBoundary
      FallbackComponent={StreamingErrorFallback}
      onReset={() => {
        // Reset state
      }}
    >
      <ChatInterface />
    </ErrorBoundary>
  );
}
```

---

## 3. Provider Integration Patterns

### Multi-Provider Abstraction

```typescript
// packages/ai/src/providers/index.ts
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

export type Provider = 'openai' | 'anthropic' | 'google';
export type Model = 'gpt-4-turbo' | 'claude-3-opus' | 'gemini-pro';

export function getModel(provider: Provider, model: Model) {
  switch (provider) {
    case 'openai':
      return openai(model);
    case 'anthropic':
      return anthropic(model);
    case 'google':
      return google(model);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// Feature-flagged provider selection
export function getOptimalProvider(user: User): Provider {
  if (user.hasFeature('anthropic-access')) {
    return 'anthropic';
  }
  return 'openai';
}
```

### Provider Failover Pattern

```typescript
import { generateText } from 'ai';

async function generateWithFailover(prompt: string) {
  const providers: Provider[] = ['anthropic', 'openai', 'google'];
  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      const model = getModel(provider, getDefaultModel(provider));
      const result = await generateText({
        model,
        prompt,
        maxRetries: 2,
      });

      console.log(`Success with provider: ${provider}`);
      return result;
    } catch (error) {
      console.warn(`Provider ${provider} failed:`, error);
      lastError = error;
      continue;
    }
  }

  throw lastError || new Error('All providers failed');
}
```

---

## 4. Feature Flags & SafeEnv Patterns

### SafeEnv Configuration

```typescript
// packages/ai/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    OPENAI_API_KEY: z.string().min(1).optional(),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    AI_FEATURE_FLAG_ENABLED: z.coerce.boolean().default(false),
    AI_LATENCY_LOG_ENABLED: z.coerce.boolean().default(true),
  },
  client: {
    NEXT_PUBLIC_AI_FEATURES: z.string().optional(),
  },
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    AI_FEATURE_FLAG_ENABLED: process.env.AI_FEATURE_FLAG_ENABLED,
    AI_LATENCY_LOG_ENABLED: process.env.AI_LATENCY_LOG_ENABLED,
    NEXT_PUBLIC_AI_FEATURES: process.env.NEXT_PUBLIC_AI_FEATURES,
  },
  onValidationError: (error) => {
    console.error('❌ Invalid AI env vars:', error);
    // In packages, return fallbacks instead of throwing
    return undefined as never;
  },
});

export function safeEnv() {
  return env || {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
    AI_FEATURE_FLAG_ENABLED: false,
    AI_LATENCY_LOG_ENABLED: true,
  };
}
```

### Feature Flag Checking

```typescript
// packages/ai/src/features.ts
import { env } from '../env';

export async function checkFeatureAccess(
  user: User,
  feature: string
): Promise<boolean> {
  // Global kill switch
  if (!env.AI_FEATURE_FLAG_ENABLED) {
    return false;
  }

  // User-level feature flags
  return user.features?.includes(feature) ?? false;
}

// Usage in server action
export async function chat(messages: Message[]) {
  'use server';

  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const hasAccess = await checkFeatureAccess(session.user, 'ai-chat');
  if (!hasAccess) {
    throw new Error('AI chat not enabled for this user');
  }

  // Proceed with chat
}
```

---

## 5. Error Handling & Boundaries

### Comprehensive Error Handling

```typescript
import { generateText } from 'ai';

export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export async function generateWithErrorHandling(prompt: string) {
  try {
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt,
    });

    return { success: true, text: result.text };
  } catch (error) {
    // Handle rate limits
    if (error.statusCode === 429) {
      throw new AIError(
        'Rate limit exceeded. Please try again later.',
        'RATE_LIMIT',
        'openai',
        429
      );
    }

    // Handle invalid API keys
    if (error.statusCode === 401) {
      console.error('Invalid API key for provider');
      throw new AIError(
        'Service configuration error',
        'AUTH_ERROR',
        'openai',
        401
      );
    }

    // Handle context length exceeded
    if (error.message?.includes('context_length_exceeded')) {
      throw new AIError(
        'Input too long. Please shorten your message.',
        'CONTEXT_LENGTH',
        'openai'
      );
    }

    // Generic error
    throw new AIError(
      'An unexpected error occurred',
      'UNKNOWN_ERROR',
      'openai'
    );
  }
}
```

### User-Facing Error Messages

```typescript
export function getErrorMessage(error: unknown): string {
  if (error instanceof AIError) {
    switch (error.code) {
      case 'RATE_LIMIT':
        return 'Too many requests. Please wait a moment and try again.';
      case 'CONTEXT_LENGTH':
        return 'Your message is too long. Please make it shorter.';
      case 'AUTH_ERROR':
        return 'Service temporarily unavailable. We\'re working on it.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  return 'An unexpected error occurred';
}
```

---

## 6. Latency Monitoring & Optimization

### Latency Tracking

```typescript
export class LatencyTracker {
  private startTime: number;
  private metrics: Map<string, number> = new Map();

  start() {
    this.startTime = performance.now();
  }

  mark(label: string) {
    const elapsed = performance.now() - this.startTime;
    this.metrics.set(label, elapsed);
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  log(feature: string) {
    const metrics = this.getMetrics();
    console.log(`[AI Latency] ${feature}:`, metrics);

    // Log to monitoring service
    if (env.AI_LATENCY_LOG_ENABLED) {
      // Send to monitoring (e.g., Sentry, DataDog)
      logMetric('ai.latency', metrics);
    }
  }
}

// Usage
export async function chat(messages: Message[]) {
  const tracker = new LatencyTracker();
  tracker.start();

  const session = await auth();
  tracker.mark('auth');

  const result = await streamText({ ... });
  tracker.mark('stream_start');

  tracker.log('chat');

  return result;
}
```

### Caching for Performance

```typescript
import { unstable_cache } from 'next/cache';

// Cache embeddings for common queries
export const getCachedEmbedding = unstable_cache(
  async (text: string) => {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: text,
    });
    return embedding;
  },
  ['embeddings'],
  { revalidate: 3600 } // 1 hour
);

// Usage
const embedding = await getCachedEmbedding('common query');
```

### Streaming Optimization

```typescript
// Optimize first token latency
const stream = await streamText({
  model: openai('gpt-4-turbo'),
  messages,
  temperature: 0.7,
  // Reduce max tokens for faster first token
  maxTokens: 1000,
  // Add streaming buffer
  streamOptions: {
    bufferSize: 16, // Adjust based on testing
  },
});
```

---

## 7. Server Action Patterns

### Validated Server Action

```typescript
'use server';

import { z } from 'zod';
import { generateText } from 'ai';
import { auth } from '@repo/auth/server/next';

const chatInputSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(4000),
  })),
  model: z.enum(['gpt-4-turbo', 'gpt-3.5-turbo']).default('gpt-4-turbo'),
});

export async function chatAction(input: unknown) {
  // Validate input
  const validated = chatInputSchema.parse(input);

  // Auth
  const session = await auth();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  // Feature flag
  if (!session.user.hasFeature('ai-chat')) {
    return { error: 'Feature not available' };
  }

  try {
    const result = await generateText({
      model: openai(validated.model),
      messages: validated.messages,
    });

    return { success: true, text: result.text };
  } catch (error) {
    console.error('Chat error:', error);
    return { error: getErrorMessage(error) };
  }
}
```

### Rate-Limited Server Action

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

export async function rateLimitedChat(messages: Message[]) {
  'use server';

  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  // Check rate limit
  const { success, remaining } = await ratelimit.limit(
    `ai-chat:${session.user.id}`
  );

  if (!success) {
    return {
      error: 'Rate limit exceeded',
      remaining: 0,
      resetAt: Date.now() + 60_000,
    };
  }

  // Proceed with chat
  const result = await generateText({ ... });

  return {
    success: true,
    text: result.text,
    remaining,
  };
}
```

---

## 8. Anti-Patterns & Common Mistakes

### ❌ Anti-Pattern: Using `parameters` instead of `inputSchema`

```typescript
// WRONG - Old AI SDK API
export const badTool = tool({
  description: 'Bad tool',
  parameters: z.object({  // ❌ This will break!
    query: z.string(),
  }),
  execute: async ({ query }) => {},
});

// RIGHT - AI SDK v5
export const goodTool = tool({
  description: 'Good tool',
  inputSchema: z.object({  // ✅ Correct
    query: z.string(),
  }),
  execute: async ({ query }) => {},
});
```

### ❌ Anti-Pattern: Hardcoded API Keys

```typescript
// WRONG
const client = new OpenAI({
  apiKey: 'sk-...',  // ❌ Never hardcode!
});

// RIGHT
import { env } from '#/root/env';

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,  // ✅ From SafeEnv
});
```

### ❌ Anti-Pattern: Client-Side API Calls

```typescript
// WRONG - Client component
'use client';
import { openai } from '@ai-sdk/openai';  // ❌ Exposes API keys!

export function BadChat() {
  const handleSubmit = async () => {
    const result = await generateText({  // ❌ Client-side API call!
      model: openai('gpt-4-turbo'),
      prompt: 'Hello',
    });
  };
}

// RIGHT - Server action
'use server';
export async function chat(prompt: string) {
  const result = await generateText({  // ✅ Server-side only
    model: openai('gpt-4-turbo'),
    prompt,
  });
  return result.text;
}

// Client component
'use client';
export function GoodChat() {
  const handleSubmit = async (prompt: string) => {
    const text = await chat(prompt);  // ✅ Call server action
  };
}
```

### ❌ Anti-Pattern: Missing Error Boundaries

```typescript
// WRONG - No error handling
export function BadStreamingUI() {
  const [text, setText] = useState('');

  useEffect(() => {
    streamText().then(async (stream) => {
      for await (const chunk of stream) {
        setText(prev => prev + chunk);  // ❌ Will crash on error
      }
    });
  }, []);
}

// RIGHT - With error boundary
export function GoodStreamingUI() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <StreamingContent />  {/* ✅ Protected */}
    </ErrorBoundary>
  );
}
```

### ❌ Anti-Pattern: No Latency Logging

```typescript
// WRONG - No monitoring
export async function chat(messages: Message[]) {
  const result = await generateText({ ... });  // ❌ No metrics
  return result.text;
}

// RIGHT - With latency tracking
export async function chat(messages: Message[]) {
  const tracker = new LatencyTracker();
  tracker.start();

  const result = await generateText({ ... });
  tracker.mark('generation_complete');

  tracker.log('chat');  // ✅ Log metrics
  return result.text;
}
```

### ❌ Anti-Pattern: Modifying Existing Tool Schemas

```typescript
// WRONG - Breaking change
export const existingTool = tool({
  description: 'Tool in production',
  inputSchema: z.object({
    query: z.string(),
    newField: z.number(),  // ❌ Adding required field breaks existing usage!
  }),
  execute: async ({ query, newField }) => {},
});

// RIGHT - Backward compatible
export const existingTool = tool({
  description: 'Tool in production',
  inputSchema: z.object({
    query: z.string(),
    newField: z.number().optional(),  // ✅ Optional field is safe
  }),
  execute: async ({ query, newField }) => {},
});
```

---

## Resources

### Official Documentation
- **AI SDK**: https://sdk.vercel.ai/docs
- **OpenAI Node SDK**: https://github.com/openai/openai-node
- **Anthropic SDK**: https://github.com/anthropics/anthropic-sdk-typescript

### Internal Resources
- **Agent doc**: `.claude/agents/stack-ai.md`
- **Package README**: `packages/ai/README.md`
- **Chatbot README**: `apps/ai-chatbot/README.md`
- **CLAUDE.md**: Project-wide AI patterns

### Context7 MCP Quick Access
```bash
# Get latest AI SDK docs
mcp__context7__resolve-library-id("ai")
mcp__context7__get-library-docs("/vercel/ai", topic="streaming")

# Get provider SDKs
mcp__context7__get-library-docs("/openai/openai-node")
mcp__context7__get-library-docs("/anthropics/anthropic-sdk-typescript")
```

---

*Last updated: 2025-10-07*
*Part of the Forge two-tier agent documentation system*
