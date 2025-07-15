# @repo/ai

AI SDK integrations, vector operations, and product classification for machine
learning and artificial intelligence features.

Complete documentation is available in
[../../apps/docs/packages/ai](../../apps/docs/packages/ai).

## Key Features

- **Multi-Provider AI SDK**: OpenAI, Anthropic, Google, Perplexity integrations
- **Vector Operations**: Upstash Vector database integration
- **Product Classification**: Basic AI-powered categorization
- **RAG Framework**: Retrieval-augmented generation tools

## Quick Start

```typescript
import { generateText } from "ai";
import { createOpenAIModel } from "@repo/ai/server/next";

const model = createOpenAIModel("gpt-4");
const result = await generateText({
  model,
  prompt: "Explain artificial intelligence"
});
```

See [documentation](../../apps/docs/packages/ai) for complete usage examples and
API reference.
