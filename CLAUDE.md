# CLAUDE.md

Guidance for Claude Code (claude.ai/code) - optimized for autonomous operation
in the Forge monorepo.

> **📘 Companion Document**: See `AGENTS.md` for agent ownership, coordination
> patterns, and detailed delegation workflows.

## 🎯 Primary Goal

Enable fully autonomous operation with explicit rules, self-correction, and
minimal user intervention.

## 🚨 Critical Rules

### NEVER Do:

- Run `pnpm dev` (user only)
- Use localStorage/sessionStorage in artifacts
- Create bulk fix scripts
- Use file extensions in imports
- Use `@/` imports in package source code (`/packages/*/src/**`)
- Build packages (consumed from source, except `@repo/qa`)
- Deep import package internals (`@repo/pkg/src/*`)
- Import Next.js in packages (use `/client/next` or `/server/next` exports)
- Use Node APIs in client components or edge middleware
- Create files unless necessary
- Use leading underscores (except Prisma `_count`)
- Throw errors in package env validation
- Use "enhanced" in function/file names

### ALWAYS Do:

- Run contamination checks before commits (`pnpm validate:contamination`)
- Use approved tools in priority order (see Tool Priority below)
- Use Context7 MCP for library documentation
- **Use custom MCP tools** (`mcp__forge__*`) for logging, analysis, and reports
- Use `/next` imports in Next.js, `/edge` in edge runtime
- Use Mantine UI as primary UI solution
- Prefer server actions over API routes
- Use `"catalog:"` versions
- Add `"type": "module"` to packages (NOT apps)
- Run `pnpm typecheck && pnpm lint` before commits
- **Use hierarchical TodoWrite tracking (1.1, 1.2.1) for ALL tasks** - critical
  for context compacting resilience
- **INSERT new tasks into existing list, never replace** - use ⚠️ INJECTED
  markers and renumber
- Test with `@repo/qa` centralized mocks
- Checkpoint to memory after major changes

## 🎯 Your Role in the System

**3-tier architecture**: User/Slash Command (PM: defines WHAT) → Orchestrator
(EM: plans HOW) → Specialists (Engineers: implement)

**Quick Role Check**: Main session? → Delegate via `Task(orchestrator)`, never
edit files | Orchestrator? → Coordinate via `Task(specialist)`, never edit
implementation | Specialist? → Implement in domain, report to orchestrator

> **📘 For detailed coordination patterns, agent ownership matrix, and handoff
> procedures, see `AGENTS.md`**

## 🔧 Tool Priority Order (CRITICAL)

**Always use tools in this order** (highest priority first):

### 1. Claude Code Native Tools (FIRST - No Permission Needed)

- **Read** - For reading files (NOT `cat`)
- **Write** - For creating files (NOT `echo >`)
- **Edit** - For modifying files (NOT `sed`)
- **Grep** - For searching content (NOT `grep`)
- **Glob** - For finding files (NOT `find`)
- **TodoWrite** - For task tracking

### 2. MCP Tools (SECOND - No Permission for Git)

**Standard MCP Tools:**

- **`mcp__git__*`** - ALL git operations (`git_status`, `git_diff`, `git_add`,
  `git_commit`)
- **`mcp__context7__*`** - Library docs
- **`mcp__perplexity__*`** - Research

**Custom Forge MCP Tools (`mcp__forge__*` - 24 pre-approved tools):**

| Category              | Key Tools                                                                                                                          | Use For                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Core** (3)          | `safe_stringify`, `report_generator`, `optimization_engine`                                                                        | Structured summaries, reporting, optimization  |
| **Session** (3)       | `initialize_session`, `close_session`, `context_session_manager`                                                                   | Session lifecycle, context tracking            |
| **File & Batch** (4)  | `batch_processor`, `file_discovery`, `file_streaming`, `path_manager`                                                              | File operations, batch processing              |
| **Code Analysis** (6) | `extract_imports`, `extract_exports`, `calculate_complexity`, `extract_file_metadata`, `pattern_analyzer`, `architecture_detector` | Code intelligence, structure analysis          |
| **Dependencies** (2)  | `dependency_analyzer`, `circular_deps`                                                                                             | Dependency analysis, circular detection        |
| **Memory** (3)        | `memory_monitor`, `advanced_memory_monitor`, `memory_aware_cache`                                                                  | Memory pressure, performance monitoring        |
| **Workflow** (3)      | `workflow_orchestrator`, `worktree_manager`, `resource_lifecycle_manager`                                                          | Multi-step workflows, Git worktrees, resources |

> **📘 See `packages/mcp-server/README.md` for complete tool list and usage
> patterns.**

### 3. Bash (LAST RESORT - Requires Permission)

- **Only for**: `pnpm`, `npm`, `node`, repository scripts
- **Never for**: File ops, git, search, text processing
- **Approved patterns** (no permission needed):
  - `pnpm <command>`
  - `npm <command>`
  - `node .claude/scripts/*.mjs`
  - `.claude/scripts/*.sh`

### Common Mistakes

| ❌ Wrong (asks permission) | ✅ Right (approved)                                                 |
| -------------------------- | ------------------------------------------------------------------- |
| `cat file.json`            | `Read({ file_path: "file.json" })`                                  |
| `git status`               | `mcp__git__git_status()`                                            |
| `git diff`                 | `mcp__git__git_diff()`                                              |
| `grep pattern files`       | `Grep({ pattern: "pattern", path: "." })`                           |
| `find . -name "*.ts"`      | `Glob({ pattern: "**/*.ts" })`                                      |
| `echo "text" > file`       | `Write({ file_path: "file", content: "text" })`                     |
| `sed -i 's/old/new/' file` | `Edit({ file_path: "file", old_string: "old", new_string: "new" })` |

### Quick Decision Tree

```
Need to do X?
├─ Read/write/edit file? → Use Read/Write/Edit tool
├─ Search content? → Use Grep tool
├─ Find files? → Use Glob tool
├─ Git operation? → Use mcp__git__* MCP tool
├─ Library docs? → Use mcp__context7__* MCP tool
├─ Analyze/report? → Use mcp__forge__* custom tools
│  ├─ Workflow orchestration → mcp__forge__workflow_orchestrator
│  ├─ Code analysis → mcp__forge__extract_imports, complexity, etc.
│  ├─ Dependencies → mcp__forge__dependency_analyzer
│  ├─ Memory → mcp__forge__memory_monitor
│  └─ Reports → mcp__forge__report_generator
├─ Run pnpm/npm? → Use Bash (approved: pnpm/npm commands)
└─ Anything else? → Check if MCP tool exists first
```

**REMEMBER**: If you're typing `Bash(` for file operations or git, you're doing
it wrong!

## 📊 Task Tracking Standards

**CRITICAL**: ALWAYS use hierarchical numbering (1.1, 1.2.1, 1.2.1.1) for ALL
tasks. Context compacting destroys flat lists - hierarchical structure preserves
progress tracking.

**Structure Example**:
`1. Main → 1.1 Subtask → 1.1.1 Detail → 1.1.2 Detail → 1.2 Subtask`

**State Markers**: ✅ completed | 🔄 in_progress | ⏸️ paused | ⚠️ INJECTED (new
work discovered)

### Dynamic Task Injection (INSERT, Never Replace)

**When new work discovered during execution**: INSERT into existing list with ⚠️
INJECTED marker. NEVER throw out existing task list.

**Example**: During 1.1.2, discover prerequisite needed

```
Before:                              After injection:
1. Feature                           1. Feature
   1.1 Setup                            1.1 Setup
       1.1.1 Config ✅                      1.1.1 Config ✅
       1.1.2 Schema (🔄)                    1.1.2 Update DB client (⚠️ INJECTED - prerequisite)
   1.2 Implementation                           1.1.2.1 Modify config
                                                1.1.2.2 Test connection
                                            1.1.3 Schema (⏸️ paused, was 1.1.2) ← Renumbered
                                       1.2 Implementation
```

**Rules**: INSERT at correct level | Mark ⚠️ INJECTED + reason | Pause blocked
(⏸️) | Renumber downstream | Resume when unblocked | NEVER discard list

**Best Practices**: Detailed hierarchy upfront | Inject as discovered | Update
immediately | One 🔄 at a time | Mark ✅ promptly | Always show full list

> **📘 For specialist-specific patterns, see `AGENTS.md`**

## ⚡ Quick Reference

| Type        | Key                                                            | Value                                                                                                                                         |
| ----------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ports**   | webapp / ai-chatbot / email / studio / storybook / docs        | 3200 / 3100 / 3500 / 3600 / 3700 / 3800                                                                                                       |
| **Imports** | Next.js Client / Server / Edge / Node / Pkg Source / Pkg Tests | `/client/next` / `/server/next` / `/server/edge` / `/server` / Relative only / `@/` allowed                                                   |
| **Env**     | Next.js / Packages / Client / Pkg Validation / App Validation  | `import { env } from "#/root/env"` / Export `env` + `safeEnv()` / `env.NEXT_PUBLIC_*` / Never throw, return fallbacks / Always throw on error |

## 📋 Essential Commands

```bash
# Setup
pnpm install && pnpm doppler:pull:all
pnpm repo:setup # Full setup with playwright

# Build & Quality
pnpm build                             # Local build
pnpm test:coverage                     # Tests with coverage
pnpm typecheck && pnpm lint            # Quality gates
pnpm --filter @repo/db-prisma generate # After schema changes

# Database
pnpm migrate # Run migrations
pnpm studio  # Prisma Studio (port 3600)

# Validation
pnpm repo:preflight         # Lint + typecheck + test for touched scopes
pnpm validate:contamination # Check stage boundaries
pnpm repo:circular          # Check circular deps
pnpm validate:mcp-schemas   # Validate MCP tool schemas
```

**⚠️ NEVER run `pnpm dev` - user only**

> **📘 For scope detection and domain-specific test commands, see `AGENTS.md`
> Primary Commands section**

## 🛠 Technology Stack

| Category            | Technology                           | Notes                        |
| ------------------- | ------------------------------------ | ---------------------------- |
| **Core**            | Next.js 15.x, React 19.1, TypeScript | App Router, typed routes     |
| **Package Manager** | pnpm v10.13.1+                       | Workspaces, catalog versions |
| **Build**           | Turborepo, Node 22+                  | ESM only                     |
| **UI**              | Mantine v8, Tailwind v4              | Mantine hooks + Zod forms    |
| **Data**            | PostgreSQL, Prisma ORM               | Server actions > API routes  |
| **Auth**            | Better Auth                          | Organizations support        |
| **Infrastructure**  | Vercel, Upstash, Sentry              | Redis, QStash, monitoring    |

## 📦 Module System

- **ESM only** - No CommonJS
- **Packages**: `"type": "module"` required
- **Apps**: NO `"type": "module"` (Next.js handles it)
- **Imports**: Always `@repo/*` namespace
- **Source consumption**: Packages aren't built (except `@repo/qa`)
- **JS files**: Always use `.mjs` extension (not `.js` or `.cjs`)

### Package Organization

**CRITICAL**: Some packages are nested under group folders:

- Any path `packages/pkg-*` is a **folder**, NOT a package
- Example: `packages/pkgs-databases/` contains 5 packages (`prisma/`,
  `firestore/`, etc.)
- Example: `packages/pkgs-integrations/` contains 4 packages (`3p-core/`,
  `3p-posthog/`, etc.)
- The actual packages are **inside** these folders:
  `packages/pkgs-databases/prisma/` → `@repo/db-prisma`

## 🔐 Environment Configuration

**Setup**: `.env.local` via `pnpm doppler:pull:all` | **Production**: Doppler |
**Location**: `env.ts` at root (never in `src/`)

### Patterns

**Next.js Apps** (throw on error):

```typescript
import { env } from "#/root/env";
export const env = createEnv({
  extends: [databaseEnv],
  server: {
    /* app-specific */
  },
  client: {
    /* NEXT_PUBLIC_* */
  },
  onValidationError: (error) => {
    throw new Error("Invalid environment");
  }
});
```

**Packages** (dual export, never throw):

```typescript
export const env = createEnv({
  server: { API_KEY: z.string().optional() },
  onValidationError: () => undefined as never // Never throw!
});
export function safeEnv() {
  return env || { API_KEY: process.env.API_KEY || "" };
}
```

### Common Mistakes

| ❌ Wrong              | ✅ Right                           |
| --------------------- | ---------------------------------- |
| `process.env.VAR`     | `import { env } from "#/root/env"` |
| `safeEnv()` in client | `env.NEXT_PUBLIC_*`                |
| Throwing in packages  | Return fallbacks                   |
| Duplicating vars      | Use `extends: [pkgEnv]`            |

## 🚀 Development Workflows

### Documentation First

```bash
1. mcp__context7__resolve-library-id("library-name")
2. mcp__context7__get-library-docs("/org/lib", topic="feature")
3. Implement with latest APIs
```

### Common MCP Patterns

**Safe Stringify**:
`safe_stringify({ obj, prettify, maxLength, includeMetadata })` for complex
objects with circular refs

**Code Analysis**: `extract_imports/exports(filePath)` →
`circular_deps(directory)` → `calculate_complexity(filePath)`

**Report Generation**:
`report_generator({ data, format: "markdown", includeStats })`

> **📘 Full code examples in `packages/mcp-server/AGENT_USAGE_GUIDE.md`**

### New Feature Workflow

1. **Search** existing code with Grep tool
2. **Docs** via Context7 MCP
3. **Schema** → `pnpm migrate` → `pnpm --filter @repo/db-prisma generate`
4. **Server Action** in `/app/actions/*.ts` with Zod
5. **UI** with Mantine components
6. **Test** with `@repo/qa` mocks
7. **Verify** → `pnpm typecheck && pnpm lint`

### Debug Checklist

`pnpm repo:circular` (deps) | `pnpm typecheck` (types) | Check `@repo/*` imports
| Verify env vars | Packages shouldn't be built

## 🧪 Testing

### Quick Setup

```typescript
// vitest.config.ts
import { createNextAppConfig } from "@repo/qa/vitest/configs";
export default createNextAppConfig({ setupFiles: ["./setup.ts"] });

// setup.ts
import "@repo/qa/vitest/setup/next-app";
```

### Structure

- **Location**: `__tests__/` at root (NOT in `src/`)
- **Naming**: `*.test.{ts,tsx}` (Vitest), `*.spec.ts` (E2E)
- **Imports**: `@/` allowed in tests only
- **Assertions**: `.toBe()` primitives, `.toStrictEqual()` objects
- **IDs**: Always `data-testid`

### Coverage

**Default**: 50% threshold | **Complex**: 30-40% allowed | **Check**:
`pnpm test:coverage`

### Centralized Mocks

```typescript
import { createRatelimitScenarios } from "@repo/qa";
const rateLimit = createRatelimitScenarios();
rateLimit.exceeded.mockLimit();
```

**Available**: Upstash (Redis, QStash, Rate Limit), Stripe, Better Auth, AI SDK,
Vercel Analytics, React, Next.js, Prisma

## 📝 Git & Package Architecture

### Git Workflow

Branch from `master` | Conventional commits: `feat`, `fix`, `docs`, `style`,
`refactor`, `test`, `chore` | Pre-commit hooks (Husky + lint-staged + Turbo) |
Never commit secrets | No attribution

### Git Hooks (Husky + lint-staged + Turbo)

**Location**: `.husky/pre-commit` (version controlled) **Auto-install**: Runs on
`pnpm install` via `prepare` script

**3-layer approach**:

1. **File-level** (lint-staged): Prettier formatting on staged files only
   (~1-2s)
2. **Package-level** (Turbo): ESLint + typecheck with caching (~2-3s)
3. **Validation**: contamination + coverage checks (~2s)

**Manual setup**: `pnpm scripts:hooks:setup` (runs `husky`)

> **📘 For complete hook implementation details, see `AGENTS.md` Quality Gates
> section**

### Package Layers (Dependency Order)

1. **Foundation**: configs (typescript, eslint, next)
2. **Core**: qa, security, observability
3. **Data**: pkgs-databases/\* → `@repo/db-prisma`, `@repo/db-firestore`, etc.
4. **Services**: analytics, email, notifications, pkgs-integrations/_ →
   `@repo/3p-_`
5. **Logic**: auth, payments, orchestration, seo, i18n, feature-flags
6. **Specialized**: ai, scraping, storage
7. **UI**: uix-system
8. **Apps**: End-user applications

**Note**: `pkgs-databases/` and `pkgs-integrations/` are grouping folders, not
packages.

### Export Patterns

```json
{
  "exports": {
    "./client": "./src/client.ts",
    "./server": "./src/server.ts",
    "./client/next": "./src/client-next.ts",
    "./server/next": "./src/server-next.ts",
    "./server/edge": "./src/server-edge.ts"
  }
}
```

## 💻 Code Patterns

### Forms (Mantine + Zod)

```typescript
const form = useForm({
  validate: zodResolver(z.object({ email: z.string().email() })),
  initialValues: { email: "" }
});
```

### AI SDK v5 Tools

```typescript
export const myTool = tool({
  description: "...",
  inputSchema: z.object({ query: z.string() }), // NOT "parameters"
  execute: async ({ query }) => {
    /* ... */
  }
});
```

### Server Actions

```typescript
"use server";
export async function action(data: FormData) {
  const validated = schema.parse(Object.fromEntries(data));
  // logic
}
```

### Prisma ORM

```typescript
// Use validator fragments, not hardcoded selects
import { userSelectBasic } from "@repo/db-prisma/prisma/fragments";
const user = await prisma.user.findUnique({
  where: { id },
  select: userSelectBasic.select
});

// Transaction support (always include client parameter)
async function createUserWithProfile(
  userData,
  client: PrismaTransactionClient = prisma
) {
  return await createUserOrm({ data: userData }, client);
}

// Edge optimization
import { getOptimalClient } from "@repo/db-prisma/prisma/clients/resolver";
const client = getOptimalClient({ runtime: "edge" });
```

**Critical**: Always use validator fragments; all ORM functions support
`PrismaTransactionClient`

### UI & State Priority

1. **Mantine UI v8** or **Tailwind v4** (local consistency)
2. **State**: Mantine hooks → Server state → Component state → Zustand (rare)

### Config Standards

- **Dependencies**: `"catalog:"` versions
- **TypeScript**: Extend `@repo/typescript-config/*`
- **ESLint**: Extend `@repo/eslint-config/*`
- **Vitest**: Use `@repo/qa/vitest/configs`

## 🔧 Troubleshooting

### Anti-Patterns

**Environment**: `process.env.VAR` → `import { env } from "#/root/env"` |
`safeEnv()` in client → `env.NEXT_PUBLIC_*` | Throw in packages → Return
fallbacks

**Imports**: `@repo/pkg/src/file` → `@repo/pkg` | `/client` in Next.js →
`/client/next` | `/server/next` in edge → `/server/edge` | `@/` in package
source → Relative imports

**Patterns**: `react-hook-form` → `@mantine/form` | `/api/route.ts` →
`/actions/*.ts` | `useEffect` + fetch → Server components | `.toEqual()` objects
→ `.toStrictEqual()` | Custom mocks → `@repo/qa` mocks

**Runtime**: Node.js APIs in edge → Web APIs only | Node.js APIs in client →
Browser APIs

### Common Fixes

Module not found → Add `"type": "module"` | Type errors → `pnpm typecheck` +
regenerate Prisma | Auth issues → Check env vars | Build fails →
`pnpm repo:circular` | Form issues → Use Mantine `useForm`

## 🚧 Stage Contamination (Quick Reference)

**Stages**: UI (client components) | Server (actions, RSC) | Edge (middleware,
Web APIs only) | Packages (framework-agnostic) | Data (Prisma/database) | Infra
(CI/CD)

**Quick Check**: `pnpm validate:contamination`

**Common Violations**: Next.js in packages | `@/` in packages | Deep imports |
Node in client/edge

> **📘 For complete contamination matrices, enforcement rules, and
> stage-specific examples, see `AGENTS.md` Contamination Rules section**

## 📚 Key Package Reference

| Package               | Purpose        | Edge? | Import                 |
| --------------------- | -------------- | ----- | ---------------------- |
| `@repo/auth`          | Better Auth    | ✅    | `/server/next`         |
| `@repo/db-prisma`     | Prisma ORM     | ❌    | `createNodeClient()`   |
| `@repo/analytics`     | PostHog/GA     | ✅    | Feature flags included |
| `@repo/observability` | Multi-provider | ✅    | Sentry/LogTape/Console |

> **📘 For complete agent ownership of packages, see `AGENTS.md` Web Domain
> Ownership Matrix**

## 📄 /fullservice Command

**Primary command** for autonomous development - closes gap between vision
(README) and reality (code).

### Usage

```bash
claude --dangerously-skip-permissions # REQUIRED
> /fullservice [--plan] [--resume]    # Runs 2-12 hours

# Eight phases: AUDIT → BUILD → VALIDATE → DISCOVER → REFLECT → REVIEW → VERIFY → COMMIT
```

**Builds**: Framework integrations, agent coordination, edge cases, quality
gates **Won't Build**: Social features, new framework adoption, scope creep

> **📘 Complete spec: `AGENTS.md` /fullservice section and
> `.claude/commands/fullservice.md`**

## 🧠 Memory & Checkpoints

**Templates** (git): `quick-context-template.md`, `full-context-template.md`,
`*-report-template.md` **Working** (gitignored): `quick-context.md` (500-line,
update after: delegation/features/tests/failures), `full-context.md` (2000-line,
update after: /fullservice/decisions/weekly), `*-learnings.md` (1000-line,
specialist knowledge)

**See `.claude/memory/README.md` for complete guide.**

## 🎯 Final Reminders

- Do only what's asked, nothing more
- Prefer editing over creating files
- Never create docs unless explicitly requested
- Always use `/next` imports in Next.js, `/edge` in middleware
- Check Context7 MCP for latest library documentation
- Use TodoWrite for multi-step tasks
- Run contamination checks before commits (`pnpm validate:contamination`)
- Checkpoint to memory after major changes
- **When in doubt about coordination or ownership, consult `AGENTS.md`**

---

**📘 Related Documentation**:

- `AGENTS.md` - Agent playbook, ownership matrix, coordination patterns
- `.claude/commands/fullservice.md` - Complete /fullservice specification
- `.claude/docs/contamination-web.md` - Complete contamination matrices
- `.claude/memory/README.md` - Memory management guide
