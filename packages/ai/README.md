# @repo/ai

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `.`, `./client`, `./server`, `./client/next`, `./server/next`,
    `./server/edge`
  - **Specialized**: `./rag`, `./vector`, `./mcp`, `./providers`

- _AI Hints:_

  ```typescript
  // Primary: Centralized model registry - never hardcode model names
  import { getBestModelForTask, registry } from "@repo/ai/server";
  // Use task-based selection: getBestModelForTask("reasoning")
  // ❌ NEVER: Hardcode model IDs like "claude-3-5-sonnet-20241022"
  ```

- _Key Components:_
  - **Multi-Step Agents**: Advanced agent orchestration with step conditions
  - **Computer Use Tools**: Anthropic computer interaction (screenshots, clicks,
    automation)
  - **React Server Components**: Streaming UI with createStreamableUI and render
    functions
  - **Prompt Management**: Template system with caching, versioning,
    optimization
  - **Advanced Streaming**: Rich metadata, interruption control, backpressure
    handling
  - **Vector Operations**: Upstash Vector database integration for embeddings

- _Providers Supported:_
  - **Multi-Provider**: OpenAI, Anthropic, Google, Perplexity, xAI, Deep Infra
  - **Task-Based Selection**: Use `getBestModelForTask("reasoning")` for optimal
    model selection
  - **Centralized Registry**: Never hardcode model IDs - use dynamic selection

- _Quick Start:_

  ```typescript
  import { getBestModelForTask, registry } from "@repo/ai/server";
  const reasoningModel = getBestModelForTask("reasoning");
  const model = registry.languageModel(`anthropic:${reasoningModel}`);
  ```

- _Documentation:_ **[AI Package](../../apps/docs/packages/ai/index.mdx)**
