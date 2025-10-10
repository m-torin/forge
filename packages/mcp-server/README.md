# @repo/mcp-server

- _Can build:_ **NO**
- _Exports:_
  - **Core**: MCP server providing utilities for Claude Code agents
- **Tools**: `safe_stringify`, `report_generator`, `workflow_orchestrator`,
  analysis helpers, and supporting session utilities.

- _AI Hints:_
  ```typescript
  // Primary: MCP protocol utilities for Claude agents - reduces duplication
  // Use: mcp__forge__safe_stringify({ obj, maxLength })
  // ❌ NEVER: Re-implement MCP tool logic locally – call the server instead
  ```

A centralized Model Context Protocol (MCP) server that wraps `@repo/core-utils`
to expose shared utilities to Claude Code agents. The server standardizes tool
registration, resources, prompts, and diagnostics so every agent can reuse a
consistent toolbox without copying implementation details.

## Table of Contents

1. [Overview](#overview)
2. [What's New (October 2025)](#whats-new-october-2025)
3. [Quick Start](#quick-start)
4. [Tool Catalog](#tool-catalog)
5. [Resources & Prompts](#resources--prompts)
6. [Usage Patterns & Best Practices](#usage-patterns--best-practices)
7. [Runtime Configuration](#runtime-configuration)
8. [Argument Completions](#argument-completions)
9. [Compliance & Audit Status](#compliance--audit-status)
10. [Roadmap](#roadmap)
11. [Development Workflow](#development-workflow)
12. [Troubleshooting](#troubleshooting)

## Overview

`@repo/mcp-server` is a **thin MCP layer** over `@repo/core-utils`. The package
bootstraps an MCP server, registers the shared tool suite, and exposes session
resources and prompts for Claude Code’s autonomous agents.

### Architecture

- **Core implementation** – `@repo/core-utils` (framework-agnostic utilities)
- **MCP wrapper** – `@repo/mcp-server` (tool registration + transports)
- **Utilities** – Safe stringify, caching helpers, logging, workflow tools

This separation ensures:

- ✅ Core utilities remain reusable across packages
- ✅ Agents share a single MCP interface for discovery
- ✅ No duplicated implementations across agent repositories

## What's New (October 2025)

Recent realignment removed legacy cache-management tools and focused the server
on diagnostics, logging, workflow orchestration, and advanced analysis helpers.
Highlights:

- Cache tools (`create_bounded_cache`, `cache_operation`, etc.) removed from MCP
  registration; underlying TypeScript utilities still exist for direct imports.
- Tool catalog now centers on `safe_stringify`, session lifecycle helpers,
  memory diagnostics, workflow orchestration, and analysis utilities.
- Documentation consolidated here with agent-focused guidance, transport notes,
  and migration details.

## Quick Start

### 1. Install dependencies

```bash
cd packages/mcp-server
pnpm install
```

### 2. Enable the MCP server

Update `.mcp.json` in the workspace root:

```json
{
  "mcpServers": {
    "forge": {
      "command": "node",
      "args": ["./packages/mcp-server/bin/mcp-server.mjs"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "info",
        "PROJECT_ROOT": "${PROJECT_ROOT}"
      },
      "disabled": false,
      "alwaysAllow": [
        "safe_stringify",
        "batch_processor",
        "file_discovery",
        "file_streaming",
        "path_manager",
        "extract_imports",
        "extract_exports",
        "calculate_complexity",
        "extract_file_metadata",
        "pattern_analyzer",
        "architecture_detector",
        "dependency_analyzer",
        "circular_deps",
        "memory_monitor",
        "advanced_memory_monitor",
        "memory_aware_cache",
        "workflow_orchestrator",
        "worktree_manager",
        "resource_lifecycle_manager",
        "initialize_session",
        "close_session",
        "context_session_manager",
        "report_generator",
        "optimization_engine"
      ]
    }
  }
}
```

### 3. Allow MCP tools in agent definitions

```yaml
---
name: refactoring-agent
model: claude-sonnet-4-5
allowed_tools:
  - Read
  - Write
  - Edit
  - Grep
  - Bash
  - Task
  - mcp__forge__safe_stringify
  - mcp__forge__workflow_orchestrator
  - mcp__forge__report_generator
permission_mode: acceptEdits
---
```

### 4. Optional HTTP transport

```bash
export MCP_TRANSPORTS=stdio,http
export MCP_HTTP_PORT=4411
export MCP_ENABLE_SSE=true # optional SSE streaming
```

Restart the server after changing transport variables. HTTP mode shares the same
tool, resource, and prompt registry as stdio with DNS-rebinding protection and
lifecycle cleanup.

### 5. Smoke test the server (optional)

```bash
node packages/mcp-server/bin/mcp-server.mjs

echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' \
  | node packages/mcp-server/bin/mcp-server.mjs
```

### 6. Quick usage example

```typescript
const stringifyResult = await mcp__forge__safe_stringify({
  obj: {
    session: `analysis-${Date.now()}`,
    files: changedFiles,
    metrics: runMetrics
  },
  prettify: true,
  includeMetadata: true
});

const summary = JSON.parse(stringifyResult.content[0].text);
console.log(summary.result);
```

## Tool Catalog

The MCP server registers the complete utility set sourced from
`@repo/core-utils`. Tools are grouped by mission area.

### Core utilities

- `safe_stringify` – stringify complex objects with circular reference handling,
  size limits, and metadata.
- `report_generator`, `optimization_engine` – produce structured summaries and
  optimization plans.
- Session lifecycle: `initialize_session`, `close_session`,
  `context_session_manager`.

### File & batch processing

- `batch_processor` – run batched operations with concurrency control.
- `file_discovery`, `file_streaming`, `path_manager` – discover and stream files
  with Git ignore support.

### Code intelligence

- `extract_imports`, `extract_exports`, `extract_file_metadata`,
  `calculate_complexity`, `pattern_analyzer`, `architecture_detector` – analyse
  project structure, dependencies, and patterns.

### Dependency insight

- `dependency_analyzer`, `circular_deps` – map dependency graphs and surface
  cycles.

### Memory & performance

- `memory_monitor`, `advanced_memory_monitor`, `memory_aware_cache` – inspect
  memory pressure, capture telemetry, and manage cache workloads.

### Workflow orchestration

- `workflow_orchestrator`, `worktree_manager`, `resource_lifecycle_manager` –
  coordinate multi-step missions, manage Git worktrees, and enforce cleanup.

Each tool returns JSON payloads (`content[0].text`) so agents can parse results
reliably.

## Resources & Prompts

The server publishes discovery surfaces for agents and humans alike:

- `forge://config/runtime` – validated runtime configuration (transports,
  logging, HTTP/SSE flags).
- `forge://catalog/tools` – JSON catalog of registered tools with display
  titles.

Registered prompts:

- `tool-discovery-brief` – generates a 150-word overview of available tools for
  audiences such as `engineer`, `analyst`, or `agent`.

Example CLI usage:

```bash
claude mcp resources/read forge forge://config/runtime
claude mcp prompts/get forge tool-discovery-brief --args '{"audience":"engineer"}'
```

## Usage Patterns & Best Practices

- **Structured summaries** – combine `safe_stringify` with `report_generator`
  for consistent hand-offs.
- **Session coordination** – use `initialize_session` and
  `context_session_manager` to share context across long-running missions.
- **Memory diagnostics** – call `memory_monitor` with `comprehensiveReport`
  before expensive analyses.
- **Workflow automation** – orchestrate steps with `workflow_orchestrator` and
  manage worktrees using `worktree_manager`.
- **Namespace session IDs** – include agent name + timestamp to avoid
  collisions.
- **Handle tool errors** – wrap calls in `try/catch` and inspect the `isError`
  field.
- **Log strategically** – batch low-priority logs; reserve `log_message` for
  critical transitions.

## Runtime Configuration

Configuration is loaded via `loadConfig` with Zod validation and environment
variable overrides.

| Variable         | Description                                  | Default |
| ---------------- | -------------------------------------------- | ------- |
| `MCP_TRANSPORTS` | Comma-separated transports (`stdio`, `http`) | `stdio` |
| `MCP_HTTP_PORT`  | HTTP listener port                           | `3000`  |
| `MCP_ENABLE_SSE` | Enable SSE streaming for HTTP clients        | `false` |
| `MCP_LOG_LEVEL`  | Diagnostic verbosity (`debug`‒`error`)       | `info`  |

HTTP transport reuses the lifecycle manager for cleanup, includes DNS-rebinding
protection, and shares session state with stdio. OAuth scaffolding is deferred
until the SDK’s 2.x line lands.

## Argument Completions

Selected tools expose live completions sourced from active session data. For
example, `context_session_manager` suggests known `sessionId` values so agents
can continue missions without manual lookups. Expand coverage as new interactive
deliverables arrive.

## Compliance & Audit Status

_Last reviewed: 2025-10-09_

- **SDK alignment** – Tracks `@modelcontextprotocol/sdk@1.19.1`; prepare for the
  2.x migration once stable helpers ship.
- **Tool registration** – Uses Zod-backed schemas with shared output wrapping;
  consider migrating away from JSON Schema adapters when 2.x helpers arrive.
- **Dynamic capabilities** – Emits `sendToolListChanged`,
  `sendResourceListChanged`, and `sendPromptListChanged` after registration;
  tool handles are stored for future toggling.
- **Transports** – Supports stdio and optional Streamable HTTP with SSE toggle;
  lifecycle manager cleans transports on shutdown.
- **Security** – OAuth providers are not yet implemented. Plan to adopt
  `ProxyOAuthServerProvider`/`mcpAuthRouter` when the SDK exposes first-class
  helpers. Logging currently uses `console.error`; migrate to structured logging
  via `@repo/observability` and `sendLoggingMessage` for client visibility.
- **Testing** – Integration tests cover export wiring. Add suites for runtime
  transports, prompts/resources, schema validation, and auth flow once scoped.

## Roadmap

_Target completion for current alignment: 2025-10-09_

**Phase A – SDK upgrade & core refactor**

- Upgrade to latest stable SDK (currently `^1.19.1`) and rebuild dist artifacts.
- Centralize configuration in `src/config.ts`, modularize server bootstrap, and
  capture transport/lifecycle wiring.
- Modernize tool registration with typed descriptors and handles for dynamic
  updates.

**Phase B – Capabilities expansion**

- Add resource modules for cache summaries and configuration snapshots.
- Register prompts with completers and document usage.
- Extend argument completions for high-traffic tools.

**Phase C – Transports, sessions, and auth**

- Solidify Streamable HTTP transport with session reuse and SSE option.
- Scaffold optional OAuth or pluggable auth layers with guardrails.
- Route diagnostics through structured logging and lifecycle hooks.

**Phase D – Advanced interactions**

- Explore `elicitInput` workflows and optional `createMessage` helpers for LLM
  sampling.
- Emit observability metrics through `@repo/observability`.

**Phase E – Documentation & DX**

- Maintain this README as the single source, update samples, and add
  configuration examples.
- Record migrations and changelog entries alongside SDK upgrades.

**Phase F – Testing & validation**

- Add unit, integration, and end-to-end suites for transports, prompts,
  resources, and auth scenarios.
- Ensure `pnpm repo:preflight` covers updated scopes and contamination checks.

_Open questions_ – Monitor SDK 2.x GA timeline, decide default HTTP framework,
clarify auth requirements in HTTP mode, and determine compatibility strategy for
legacy JSON-schema-based tools.

## Development Workflow

### Running tests

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

### Linting & type checking

```bash
pnpm lint
pnpm typecheck
```

### Development mode

```bash
pnpm dev # Runs with --watch for auto-restart
```

## Troubleshooting

- **Tools missing?** Ensure `.mcp.json` lists the server and restart Claude Code
  after edits.
- **Memory warnings?** Invoke `memory_monitor` with `comprehensiveReport` to
  identify pressure sources.
- **Need direct imports?** Internal utilities (e.g., `src/utils/cache.ts`)
  remain available for bespoke cases outside MCP workflows.

---

While MCP is the recommended interface for agents, direct TypeScript imports
from `@repo/core-utils` remain available when protocol calls are unsuitable. Use
MCP tools wherever possible to keep behavior consistent across agents.
