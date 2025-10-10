# @repo/ai

Monorepo standardization layer for Vercel AI SDK v5 - providing consistent
patterns without hiding the SDK.

## ✨ Recent Improvements (v2.0)

### 🔧 AI SDK v5 Compliance

- ✅ **Fixed `inputSchema` Usage**: All tools now use `inputSchema` instead of
  deprecated `parameters`
- ✅ **Type Safety**: Removed `as any` casts and improved generic constraints
- ✅ **Native AI SDK Integration**: Direct access to all AI SDK v5 features

### 🎯 DRY Optimization

- ✅ **Shared Utilities**: Centralized common schemas, constants, and tool base
  classes
- ✅ **Export Cleanup**: Reduced exports from 437 to 295 lines (33% reduction)
- ✅ **Provider-Specific Features Preserved**: All unique capabilities
  maintained

### ⚡ ES2023 Modernization

- ✅ **Arrow Functions**: Consistent modern function syntax
- ✅ **Nullish Coalescing**: `??` operators for safer defaults
- ✅ **Const Assertions**: `as const` for better type inference
- ✅ **Structured Patterns**: Modern destructuring and spread operators

### 🧪 Quality Improvements

- ✅ **TODO Placeholders**: Middleware implementations ready for future
  development
- ✅ **Comprehensive Tests**: Package exports, schema validation, utility
  functions
- ✅ **Type Definitions**: Complete TypeScript support with proper inference

## 🎯 Philosophy & AI Hints

### What This Package IS

- **Standardization layer** for consistent AI SDK usage across the monorepo
- **DRY helper functions** that reduce boilerplate without adding complexity
- **Configuration presets** for common use cases
- **Provider auto-selection** based on available API keys
- **Monorepo integrations** with auth, database, observability packages

### What This Package IS NOT

- ❌ **NOT a framework** - we don't hide or replace AI SDK
- ❌ **NOT an abstraction layer** - AI SDK remains directly accessible
- ❌ **NOT opinionated** - you can still use AI SDK directly
- ❌ **NOT complete** - only implements what reduces real duplication

### The Line We Walk

```typescript
// ✅ GOOD: Standardization that reduces duplication
import { stepCountIs } from "ai";
import { Chat } from "@repo/ai/generation";
const result = await Chat.stream(messages); // Same pattern everywhere

// ✅ ALSO GOOD: Direct AI SDK when you need it
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
const result = await streamText({
  model: anthropic("claude-3-5-sonnet"),
  messages
});

// ❌ BAD: Over-abstraction that hides the SDK
// We don't do this - no complex frameworks or hidden magic
```

### Flexibility First

- **Providers**: Easy to add 10+ providers - just register them
- **Tools**: Unlimited tools via standard AI SDK v5 tool pattern
- **RAG**: Compatible with any RAG system (Upstash, Pinecone, etc.)
- **Models**: Any model from any provider works
- **Patterns**: Use our patterns or create your own

### For AI Assistants

When working with this package:

1. **Prefer simplicity** - if AI SDK does it well, don't wrap it
2. **Standardize, don't abstract** - make things consistent, not hidden
3. **Keep it flexible** - assume users will extend with many providers/tools
4. **Follow AI SDK patterns** - use `inputSchema` not `parameters`, etc.
5. **No migration required** - this augments, doesn't replace existing code
6. **ES2023 Ready** - uses modern JavaScript patterns throughout
7. **Type Safe** - full TypeScript support with proper inference
8. **Provider Features** - preserves all unique capabilities of each AI provider

## Quick Start

### Installation

This package is already included in the monorepo workspace. Import from
`@repo/ai`.

### Basic Usage

#### Server-side Route Handler

```typescript
// app/api/chat/route.ts
import { Chat } from "@repo/ai/generation";

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Simple streaming chat with automatic provider selection
  const result = await Chat.stream(messages);
  return result.toUIMessageStreamResponse();
}
```

#### Client-side React Component

```typescript
// components/ChatInterface.tsx
import { useChat } from '@repo/ai/ui/react';

export function ChatInterface() {
  const { messages, sendMessage, isLoading } = useChat({
    api: '/api/chat',
    autoSend: true, // Automatically send when tools complete
    telemetry: true,
  });

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>{m.parts[0]?.text}</div>
      ))}
      <input onSubmit={(text) => sendMessage({ text })} />
    </div>
  );
}
```

## Core Features

### 1. Universal Operation Executor

Similar to the database ORM pattern, all AI operations go through a universal
executor:

```typescript
import { executeAIOperation } from '@repo/ai/core';

const result = await executeAIOperation('streamText', {
  model: 'claude-3-5-sonnet',
  messages: [...],
  temperature: 0.7,
  retry: { maxRetries: 3 },
  // AI SDK v5 Callbacks
  onError: ({ error }) => console.error('Stream error:', error.message),
  onFinish: (result) => console.log('Completed:', result.usage),
  onChunk: ({ chunk }) => console.log('Chunk:', chunk.type),
});
```

### 2. Configuration Fragments

Reusable configurations like Prisma validators:

```typescript
import { chatFragments } from "@repo/ai/fragments";

const result = await Chat.stream(messages, {
  ...chatFragments.withTools,
  tools: myTools
});
```

### 3. Automatic Provider Selection

Provider registry automatically selects the best available provider:

```typescript
import { providerRegistry } from "@repo/ai";

// Automatically uses Anthropic > OpenAI > Perplexity based on API key availability
const model = providerRegistry.getModel();
```

## API Reference

### Chat Operations

```typescript
import { Chat } from "@repo/ai/generation";

// Basic completion
const result = await Chat.create(messages);

// Streaming
const stream = await Chat.stream(messages);

// With tools
const toolResult = await Chat.withTools(messages, tools);

// Multi-step reasoning
const multiStep = await Chat.multiStep(messages, { stopWhen: stepCountIs(5) });
```

### Enhanced React Hooks

```typescript
import { useChat } from "@repo/ai/ui/react";

const chat = useChat({
  api: "/api/chat",
  autoSend: true,
  onFinish: (message) => console.log("Done:", message)
});

// Additional methods
chat.regenerate(); // Regenerate last response
chat.clear(); // Clear conversation
```

### Provider Management

```typescript
import { ProviderRegistry } from "@repo/ai/providers";

const registry = new ProviderRegistry()
  .register("anthropic", anthropicProvider, 1)
  .register("openai", openaiProvider, 2);

const model = registry.getModel("claude-3-5-sonnet");
```

## Configuration Fragments

### Chat Fragments

```typescript
import { chatFragments } from "@repo/ai/fragments";

chatFragments.basicChat; // Standard chat settings
chatFragments.withTools; // Tool-enabled chat
chatFragments.structured; // For JSON output
chatFragments.fast; // Quick responses
```

### Model Fragments

```typescript
import { modelFragments } from "@repo/ai/fragments";

modelFragments.fast; // Quick, less precise
modelFragments.quality; // Balanced quality
modelFragments.precise; // Maximum accuracy
```

## Environment Setup

Add API keys to your `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
```

The package automatically detects available providers and sets up the registry.

## Error Handling

Built-in retry logic and error standardization:

```typescript
const result = await Chat.stream(messages, {
  retry: {
    maxRetries: 3,
    backoffMs: 1000,
    retryOn: (error) => error.message.includes("rate limit")
  }
});

if (!result.success) {
  console.error("Failed:", result.error);
}
```

## Best Practices

1. **Use fragments** for consistent configurations
2. **Let the registry** handle provider selection automatically
3. **Enable auto-send** for tool-enabled chats
4. **Use streaming** for better UX
5. **Handle errors** gracefully with built-in retry

## Extending the Package

### Adding More Providers

```typescript
import { registry } from "@repo/ai/providers";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createCohere } from "@ai-sdk/cohere";

// Add as many providers as needed
registry
  .register(
    "google",
    createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY })
  )
  .register("mistral", createMistral({ apiKey: process.env.MISTRAL_API_KEY }))
  .register("cohere", createCohere({ apiKey: process.env.COHERE_API_KEY }));

// Works with 10+ providers seamlessly
```

### Adding RAG Systems

```typescript
import { Index } from "@upstash/vector";
import { Pinecone } from "@pinecone-database/pinecone";

// This package works with any RAG system
const vectorStore = new Index({
  /* config */
});
const embeddings = await vectorStore.query({
  /* query */
});

// Use with our chat helpers
const result = await Chat.stream([
  { role: "system", content: `Context: ${embeddings.join("\n")}` },
  ...messages
]);
```

### Adding Custom Tools

```typescript
import { tool } from "ai";
import { z } from "zod/v3";

// Standard AI SDK v5 tool pattern - unlimited tools
const customTool = tool({
  description: "My custom tool",
  inputSchema: z.object({
    param: z.string()
  }),
  execute: async ({ param }) => {
    // Tool logic
  }
});

// Use with our standardized patterns
await Chat.withTools(messages, { customTool, ...moreTool });
```

### Custom Configurations

```typescript
// Create your own fragments for your use cases
export const myFragments = {
  legalDocument: {
    temperature: 0.1,
    maxOutputTokens: 8192,
    stopSequences: ["END_DOCUMENT"]
  },
  creativeStory: {
    temperature: 0.95,
    maxOutputTokens: 4096,
    topP: 0.9
  }
};

// Use anywhere in the monorepo
await Chat.create(messages, myFragments.legalDocument);
```

## Working with AI SDK Directly

This package is designed to complement, not replace, direct AI SDK usage:

```typescript
// Mix and match as needed
import { streamText } from "ai";
import { registry } from "@repo/ai/providers";
import { chatFragments } from "@repo/ai/fragments";

// Use our provider registry with direct AI SDK
const result = await streamText({
  model: registry.getModel(),
  ...chatFragments.basicChat,
  messages
});

// That's the point - flexibility!
```

This package provides monorepo standardization while maintaining full
flexibility and direct access to Vercel AI SDK v5.

## ✨ NEW: AI SDK v5 Structured Data Generation

### Object Generation with Multiple Output Strategies

```typescript
import {
  generateObject,
  generateArray,
  generateEnum,
  generateNoSchema
} from "@repo/ai";
import { z } from "zod/v3";

// Object generation
const product = await generateObject(
  "Generate laptop product data",
  z.object({
    name: z.string(),
    price: z.number(),
    specs: z.object({
      cpu: z.string(),
      ram: z.string()
    })
  })
);

// Array generation with element streaming
const products = await generateArray(
  "Generate 5 laptop products",
  ProductSchema,
  { output: "array" }
);

// Enum classification
const category = await generateEnum(
  "Classify: 'This is a tutorial about React'",
  ["tutorial", "blog", "news", "review"]
);

// Flexible unstructured output
const data = await generateNoSchema(
  "Extract any relevant information from this text"
);
```

### Advanced Streaming with Partial Updates

```typescript
import { streamObject, streamArray, streamObjectWithPartials } from "@repo/ai";

// Stream object with partial updates
const { result, partialObjectStream } = await streamObjectWithPartials(
  "Generate complex recipe data",
  RecipeSchema,
  {
    onPartialUpdate: (partial) => {
      console.log("Partial update:", Object.keys(partial));
      // Update UI in real-time
    }
  }
);

// Stream array with element-by-element processing
const arrayResult = await streamArray("Generate user profiles", UserSchema);

// Process elements as they're generated
if (arrayResult.elementStream) {
  const reader = arrayResult.elementStream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log("New element:", value);
  }
}
```

### Schema Metadata and Error Handling

```typescript
import { generateObject, StructuredDataError } from "@repo/ai";

try {
  const result = await generateObject(prompt, schema, {
    schemaName: "ProductData",
    schemaDescription: "E-commerce product information",
    experimental_repairText: async ({ text, error }) => {
      // Attempt to repair malformed JSON
      if (error.message.includes("Unexpected end")) {
        return text + "}";
      }
      return text;
    }
  });
} catch (error) {
  if (error instanceof Error && error.name === "AI_NoObjectGeneratedError") {
    const structuredError = error as StructuredDataError;
    console.log("Generation failed:", structuredError.text);
    console.log("Usage:", structuredError.usage);
  }
}
```

### Experimental Structured Output with Text Generation

```typescript
import {
  generateTextWithStructuredOutput,
  streamTextWithStructuredOutput
} from "@repo/ai";

// Combine text generation with structured data extraction
const result = await generateTextWithStructuredOutput(
  "Write a product review and extract key product data",
  ProductSchema
);

console.log("Review text:", result.text);
console.log("Extracted data:", result.experimental_output);

// Stream text with structured data
const streamResult = await streamTextWithStructuredOutput(
  "Generate product description with specs",
  ProductSchema
);

// Access partial structured data stream
if (streamResult.experimental_partialOutputStream) {
  const reader = streamResult.experimental_partialOutputStream.getReader();
  // Process partial structured data as it streams
}
```

### Configuration Fragments for Structured Data

```typescript
import { structuredFragments, outputStrategyFragments } from "@repo/ai";

// Use specialized configurations
const result = await generateObject(prompt, schema, {
  ...structuredFragments.objectGeneration, // Zero temperature, precise
  ...structuredFragments.withMetadata // Schema guidance
});

const array = await generateArray(prompt, schema, {
  ...structuredFragments.largeDataExtraction // Higher token limits
});

const classification = await generateEnum(text, options, {
  ...outputStrategyFragments.contentClassification // Optimized for classification
});
```

## ✨ AI SDK v5 Enhanced Features

### Enhanced Streaming with Full Stream Access

```typescript
import { streamTextWithFullStream, processFullStream } from "@repo/ai";

// Get full stream access for complete control
const { result, fullStream } = await streamTextWithFullStream(prompt);

// Process all stream events
const processed = await processFullStream(fullStream, {
  onStart: () => console.log("Stream started"),
  onTextDelta: (text) => process.stdout.write(text),
  onToolCall: (tool) => console.log("Tool:", tool.toolName),
  onFinish: () => console.log("Done!")
});
```

### Stream Transformations

```typescript
import { smoothStream, textTransforms } from "@repo/ai";

// Smooth streaming for better UX
const result = await streamText(prompt, {
  experimental_transform: smoothStream()
});

// Content filtering and transformation
const filtered = await streamText(prompt, {
  experimental_transform: textTransforms.filterWords(["spam", "bad"])
});
```

### Advanced Callbacks and Hooks

```typescript
import { streamingFragments, callbackFragments } from "@repo/ai";

const result = await streamText(prompt, {
  ...streamingFragments.fullCallbacks,
  ...callbackFragments.performanceMonitoring,
  onError: ({ error }) => logError("Stream failed:", error),
  onFinish: (result) => trackUsage(result.usage),
  onChunk: ({ chunk }) => updateProgress(chunk.type)
});
```

### Enhanced Response Access

```typescript
import { ResponseUtils, responseUtils } from "@repo/ai";

const result = await generateText(prompt);

// Comprehensive response analysis
const summary = ResponseUtils.createResponseSummary(result);
const validation = ResponseUtils.validateResponse(result);

// Extract specific data
const headers = ResponseUtils.getHeaders(result);
const reasoning = ResponseUtils.getReasoning(result);
const sources = ResponseUtils.getSources(result);

// Convenience access
const text = responseUtils.getText(result);
const isSuccess = responseUtils.isSuccess(result);
```

## Consumer Capabilities

### Maximum DRY - Default Usage

```typescript
import { webSearchTool, generateTextTool } from "@repo/ai/tools";

// Just works with all defaults from registry
const searchResult = await webSearchTool.execute({
  query: "latest AI news"
});

const textResult = await generateTextTool.execute({
  prompt: "Write a haiku"
});
```

### Maximum Flexibility - Runtime Overrides

```typescript
import { webSearchTool, generateTextTool } from "@repo/ai/tools";
import { anthropic } from "@ai-sdk/anthropic";

// Override temperature at runtime
const preciseResult = await webSearchTool.executeWithOptions(
  { query: "latest AI news" },
  { settings: { temperature: 0.1, maxOutputTokens: 500 } }
);

// Switch to different model from registry
const fastResult = await webSearchTool.executeWithOptions(
  { query: "breaking news" },
  { modelId: "fast-precise" }
);

// Use completely custom model not in registry
const customResult = await generateTextTool.executeWithOptions(
  { prompt: "Explain quantum computing" },
  {
    model: anthropic("claude-3-sonnet-20240229"),
    settings: { temperature: 0.8, maxOutputTokens: 1000 }
  }
);

// Add request-specific headers and timeout
const timedResult = await webSearchTool.executeWithOptions(
  { query: "urgent query" },
  {
    headers: { "X-Priority": "high" },
    abortSignal: AbortSignal.timeout(3000),
    maxRetries: 1
  }
);
```

### Tool Sets - Pre-configured Collections

```typescript
import { getToolSet } from "@repo/ai/tools";

// Get pre-configured tool collections
const adminTools = getToolSet("admin"); // database, email, auth, tracking
const dataTools = getToolSet("data"); // database, fileSystem, httpRequest

// Use with AI SDK
import { streamText } from "ai";
const result = await streamText({
  model: registry.getModel(),
  messages,
  tools: adminTools
});
```

### Direct Registry Access

```typescript
import { models } from "@repo/ai/tools";

// Semantic model names instead of cryptic IDs
const preciseModel = models.language("tool-precise"); // Pre-configured for accuracy
const fastModel = models.language("fast"); // Optimized for speed
const ragEmbeddings = models.embedding("rag"); // Purpose-built for RAG

// Use anywhere AI SDK expects a model
const result = await generateText({
  model: preciseModel,
  prompt: "Complex analysis task"
});
```

This package provides monorepo standardization while maintaining full
flexibility and direct access to Vercel AI SDK v5.
