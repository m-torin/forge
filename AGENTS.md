# Agent Playbook

18 specialist agents coordinated by orchestrator. Clear ownership, contamination
checks, strict quality gates, memory discipline.

## Core Principles

- **Never run** `pnpm dev` in automation
- Work in Git worktrees; keep `main` clean
- **Tools**: Native (Read/Write/Edit/Grep/Glob) → MCP (git/context7/forge) →
  Bash (last resort). See `CLAUDE.md` Tool Priority Order
- **No secrets edits** (`.env*`, `doppler.yaml`, `infra/**/secrets`) - ask for
  approval
- **No attribution** - never add your name anywhere (code, comments, commits, or
  documentation)
- **Scoped changes** - hand off between specialists when crossing boundaries
- **Stage boundaries enforced** - contamination checks block commits
- **Quality gates mandatory** - lint, typecheck, test, coverage must pass before
  merge
- Prefer Context7 documentation and Mintlify site (`apps/docs/**`) before web
  search

## Documentation Guide

| Document                                              | Purpose                                                      | When to Use                   |
| ----------------------------------------------------- | ------------------------------------------------------------ | ----------------------------- |
| **`CLAUDE.md`**                                       | HOW: Tools, imports, patterns, commands, TodoWrite standards | Implementation questions      |
| **`AGENTS.md`** (this)                                | WHO: Ownership, delegation, coordination                     | Ownership & handoff questions |
| `.claude/commands/fullservice.md`                     | /fullservice specification                                   | Autonomous development        |
| `.claude/docs/contamination-web.md`                   | Complete contamination matrices                              | Deep contamination rules      |
| `.claude/memory/README.md`                            | Memory management                                            | Context checkpointing         |
| `.claude/docs/templates/specialist-agent-template.md` | Standard agent structure template                            | Creating new agents           |
| `.claude/docs/guides/creating-new-agents.md`          | Agent creation guide with checklist                          | Adding new specialists        |

## Primary Commands

The assistant should default to these when verifying work. For tool usage (file
operations, git, code analysis), follow the Tool Priority Order in `CLAUDE.md` -
use native Claude Code tools and MCP tools (including `mcp__forge__*` custom
tools for logging, analysis, and reports) before bash.

Use `node scripts/detect-scope.mjs "$CLAUDE_FILE_PATHS"` to pick the correct
`pnpm --filter` value. The `CLAUDE_FILE_PATHS` env var is set by git hooks (see
`.husky/pre-commit`). If the scope is `.` fall back to `pnpm repo:preflight`.

```bash
pnpm repo:preflight                         # lint + typecheck + tests for touched packages
pnpm lint --filter <scope>                  # scope derived from modified paths
pnpm typecheck --filter <scope>
pnpm vitest --filter <scope> --run
pnpm validate:contamination                 # stage boundary checks
pnpm repo:circular                          # circular dependency checks
pnpm turbo run storybook:smoke              # UI changes
pnpm prisma format && pnpm prisma validate  # schema changes
pnpm audit --recursive                      # security tasks
pnpm turbo run analyze --filter webapp      # performance work
```

## Web Domain Ownership Matrix (18 Agents)

Complete mapping of all specialist agents with stage assignments and
coordination patterns:

| Agent                      | Domain                   | Web Stage(s)           | Key Paths                                                          | Default Tests                                                                                                  |
| -------------------------- | ------------------------ | ---------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **orchestrator**           | Multi-stage coordination | All stages             | `.claude/agents/orchestrator.md`                                   | Delegates to specialists                                                                                       |
| **stack-next-react**       | Next.js/React runtime    | Server, UI             | `apps/webapp`, `apps/ciseco-nextjs`, `packages/orchestration`      | `pnpm lint --filter webapp`, `pnpm typecheck --filter webapp`, `pnpm vitest --filter webapp --run`             |
| **stack-tailwind-mantine** | UI system                | UI                     | `packages/uix-system`, `apps/storybook`                            | `pnpm lint --filter uix-system`, `pnpm typecheck --filter uix-system`, `pnpm turbo run storybook:smoke`        |
| **stack-editing**          | Rich text editing        | UI, Packages           | `packages/editing`, `packages/editor`                              | `pnpm lint --filter editing`, `pnpm typecheck --filter editing`, `pnpm vitest --filter editing --run`          |
| **stack-ai**               | AI chatbot & SDKs        | Server, UI             | `apps/ai-chatbot`, `packages/ai`                                   | `pnpm lint --filter ai`, `pnpm typecheck --filter ai`, `pnpm vitest --filter ai --run`                         |
| **stack-prisma**           | Database/ORM             | Data                   | `packages/pkgs-databases/prisma`, `packages/pkgs-databases/shared` | `pnpm prisma format`, `pnpm prisma validate`, `pnpm typecheck --filter @repo/db-prisma`                        |
| **stack-auth**             | Authentication           | Server, Edge, Packages | `packages/auth`                                                    | `pnpm lint --filter @repo/auth`, `pnpm typecheck --filter @repo/auth`, `pnpm vitest --filter @repo/auth --run` |
| **testing**                | QA automation            | All stages             | `packages/qa`, app `__tests__`                                     | `pnpm vitest run --coverage`, `pnpm playwright test`                                                           |
| **typescript**             | Type safety              | All stages             | `packages/config-typescript`, `packages/types`                     | `pnpm typecheck`, `pnpm typecheck --filter tooling`                                                            |
| **linting**                | Code quality             | All stages             | `packages/config-eslint`, `.prettier*`                             | `pnpm lint --filter tooling`, `pnpm format --check`                                                            |
| **foundations**            | Build system             | All stages             | `pnpm-workspace.yaml`, `turbo.json`, `knip.json`                   | `pnpm repo:preflight`, `pnpm repo:knip`, `pnpm repo:circular`                                                  |
| **infra**                  | Infrastructure           | Infra                  | `infra/**`, `.github/workflows/**`                                 | `terraform fmt -check`, `terraform plan`, `pnpm turbo run infra:lint`                                          |
| **integrations**           | External services        | Packages               | `packages/pkgs-integrations/**`, `services/cf-workers`             | Run lint/typecheck/vitest for each touched `@repo/3p-*` package                                                |
| **agentic**                | Automation               | All stages             | `.claude/**`, `.mcp.json`, `AGENTS.md`                             | `pnpm turbo run agents:validate`                                                                               |
| **docs**                   | Documentation            | Docs                   | `apps/docs/**`, `README.md`                                        | `pnpm docs:lint`, `pnpm turbo run docs:build`                                                                  |
| **security**               | Security                 | All stages             | `packages/security`, `infra/security`                              | `pnpm audit --recursive`, `pnpm lint --filter security`                                                        |
| **performance**            | Observability            | Server, UI             | `packages/observability`, `apps/webapp`                            | `pnpm turbo run analyze --filter webapp`                                                                       |
| **reviewer**               | External validation      | All stages             | `.claude/agents/reviewer.md`, `.claude/memory/**`                  | Session quality audits                                                                                         |

**Note**: `pkgs-databases/` and `pkgs-integrations/` are grouping folders
containing multiple packages (e.g., `packages/pkgs-databases/prisma/` →
`@repo/db-prisma`). See `CLAUDE.md` Module System section for package directory
structure details.

## Web "Stages" Architecture

Unlike Forge's sequential stages (Vision → CoreML → CreateML), web development
has **concurrent stages** with clear boundaries:

```
┌───────────────────────────────────────────────────────────┐
│  UI Stage          Server Stage         Edge Stage        │
│  (Client Components) (Server Actions)    (Middleware)     │
└───────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────┐
│  Packages Stage (Shared across all runtime environments)  │
└───────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────┐
│  Data Stage (Database access)                             │
└───────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────┐
│  Infra Stage (CI/CD, deployment)                          │
└───────────────────────────────────────────────────────────┘
```

### Stage Details

| Stage        | Paths                                      | Owners                                              | Allowed                                                               | Forbidden                                                                  |
| ------------ | ------------------------------------------ | --------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **UI**       | `apps/webapp`, `apps/storybook`            | stack-tailwind-mantine, stack-next-react (client)   | React, Mantine, `/client/next` imports, Browser APIs                  | Node core, Prisma, deep package imports                                    |
| **Server**   | `apps/*/app/**/actions`, server components | stack-next-react (server), stack-prisma, stack-auth | `/server/next` imports, database, Node core                           | DOM/window, browser-only APIs                                              |
| **Edge**     | `apps/*/middleware.ts`                     | stack-auth, stack-next-react                        | `/server/edge` imports, Web APIs only                                 | Node core, standard Prisma (requires edge client)                          |
| **Packages** | `packages/*/src/**`                        | All domain specialists per package                  | ESM, relative imports, dual exports (see `CLAUDE.md` Export Patterns) | `@/` app imports, Next.js-only imports in base, deep cross-package imports |
| **Data**     | `packages/pkgs-databases/**`               | stack-prisma                                        | Prisma, validators, transaction-aware functions                       | UI/Next.js imports, browser APIs                                           |
| **Infra**    | `infra/**`, `.github/workflows/**`         | infra                                               | Terraform, CI configs                                                 | Application runtime code                                                   |

## Contamination Rules (Enforced via Pre-commit + CI)

**Critical**: These rules are automatically enforced. Violations block commits
and CI.

| Violation Type            | Check Command                                                                                                     | Required Result                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Next.js in packages       | `rg -n "from ['\"]next/" packages/*/src`                                                                          | Empty                            |
| `@/` imports in packages  | `rg -n "from ['\"]@/" packages/*/src`                                                                             | Empty                            |
| Deep package imports      | `rg -n "@repo/.+?/src/" packages/*/src`                                                                           | Empty                            |
| Package internals in apps | `rg -n "@repo/.+?/src/" apps`                                                                                     | Empty                            |
| Node in client components | `rg -l "from ['\"]( fs\|path\|net\|crypto)['\"]" apps \| xargs -I {} sh -c 'grep -l "use client\|\.client\." {}'` | Empty                            |
| Node in edge middleware   | `rg -n "from ['\"]( fs\|path\|net\|crypto\|http\|https)['\"]" apps/**/middleware.{ts,tsx}`                        | Empty                            |
| Standard Prisma in edge   | `rg -n "from ['\"]@repo/pkgs-databases['\"]" apps/**/middleware.{ts,tsx}`                                         | Empty (use edge client resolver) |
| UI frameworks in data     | `rg -n "from ['\"]( react\|next\|@mantine)['\"]" packages/pkgs-databases/src`                                     | Empty                            |

**See `.claude/docs/contamination-web.md` for complete matrices and examples.**

## Agent Coordination Patterns

### Conflict Resolution Rules

When agents disagree:

| Conflict Type            | Owner                  | Rationale                         |
| ------------------------ | ---------------------- | --------------------------------- |
| Domain boundary disputes | **orchestrator**       | Enforces stage separation         |
| Performance trade-offs   | **Domain owner**       | They know budgets and constraints |
| Type/lint patterns       | **typescript/linting** | Code quality authority            |
| Security concerns        | **security**           | Security is paramount             |
| Testing strategy         | **testing**            | QA approach authority             |
| Unresolvable conflicts   | **LLM-as-judge**       | Escalation workflow               |

### Common Coordination Flows

**Example 1: Adding Better Auth Organizations**

```
orchestrator → stack-auth: Implement organization RBAC
stack-auth → stack-prisma: Need org schema
stack-prisma → stack-auth: Schema ready with fragments
stack-auth → stack-next-react: Middleware needs org context
stack-next-react → stack-auth: Integrated
stack-auth → testing: Need E2E tests
testing → orchestrator: Complete (87% coverage)
```

**Example 2: Performance Optimization**

```
orchestrator → performance: Profile dashboard load time
performance → stack-next-react: RSC streaming suboptimal
performance → stack-prisma: N+1 queries detected
stack-prisma → performance: Queries optimized
performance → orchestrator: 2.1s → 0.8s improvement
```

## Delegation Best Practices

### Core Delegation Flow

**Main Session → Orchestrator → Specialists** (NEVER skip orchestrator)

1. **Slash Commands** (`/fullservice`, `/modernize`):
   - Main session IMMEDIATELY delegates to orchestrator via Task tool
   - Main session STOPS after delegation (no direct work)
   - Orchestrator coordinates all specialist work

2. **Orchestrator → Specialists**:
   - Uses coordination matrix to select appropriate specialist
   - Provides clear task description and success criteria
   - Updates TodoWrite with `owner` field showing specialist name
   - Never does work directly - always delegates

3. **Specialists → Orchestrator**:
   - Reports completion with evidence (tests run, files changed)
   - Updates TodoWrite status
   - Logs to quick-context
   - Never delegates circularly (back to orchestrator → same specialist)

### Task Tool Usage

```typescript
// Main session delegating to orchestrator
Task({
  subagent_type: "orchestrator",
  description: "Execute /fullservice autonomous cycle",
  prompt: "You are orchestrator. Coordinate specialists per AGENTS.md...",
});

// Orchestrator delegating to specialist
Task({
  subagent_type: "docs",
  description: "Update README agent count",
  prompt: "Update README.md to reflect 18-agent system (currently says 16)...",
});
```

### Observable Outputs

Every delegation MUST produce:

1. **TodoWrite entry** with hierarchical numbering and `owner` field:

   ```json
   {
     "content": "1.2.1 Update README",
     "owner": "docs",
     "status": "in_progress"
   }
   ```

   See `CLAUDE.md` Task Tracking Standards for hierarchical numbering (1.1,
   1.2.1, 1.2.1.1) and INJECTED pattern for dynamic task insertion.

2. **Quick-context log**:

   ```markdown
   **Active Specialists**:

   - docs: Updating README agent count
   - agentic: Verifying coordination matrix
   ```

3. **Tool audit** (if enabled):
   ```
   Task(docs): Update README.md...
   ```

### Handoff & Approvals

1. **Source specialist** runs required tests and prepares a handoff note (diff
   summary, tests run, pending approvals, docs impacted)
2. **Update TodoWrite** (`status: "handoff"`) tagging the receiving specialist
3. **Log the handoff** in quick-context
4. **Receiving specialist** acknowledges in memory before editing
5. **High-risk actions** (Terraform apply, secret rotation, production
   migration) require human approval; log approver + timestamp in
   `memory/audit-report-*`

### Common Anti-Patterns

❌ **DON'T**:

- Main session executing work directly (bypass orchestrator)
- Orchestrator doing specialist work (violates coordination matrix)
- Circular delegation (A → B → A)
- Missing TodoWrite owner fields
- Skipping quick-context logs

✅ **DO**:

- Always delegate via orchestrator
- Use coordination matrix for specialist selection
- Track all work in TodoWrite with owners
- Document all handoffs in memory
- Test delegation with observable outputs

### Validation

Use testing guide (`.claude/docs/testing-fullservice.md`) to verify:

- First action is Task delegation
- TodoWrite has specialist owners
- Quick-context shows multiple agents
- No direct file edits by main session

## /fullservice Autonomous Development Cycle

**Primary Command**: `/fullservice` implements continuous software engineering
to close the gap between vision (README) and reality (code).

### The Four-Stage Feedback Loop

**1. AUDIT: Reality vs Vision**

- "README mentions feature X, not implemented"
- "AGENTS.md defines 18 agents, orchestrator only knows 17"
- "Edge case: what if Doppler unavailable?"

**2. BUILD: Implement Missing Features** (stay focused!)

- ✅ Add missing framework integrations
- ✅ Wire agent coordination patterns
- ✅ Add edge case handling
- ❌ Don't add random features outside core mission

**3. VALIDATE: End-to-End Verification**

- Run `pnpm repo:preflight` on touched scopes
- Test contamination boundaries
- Performance check (build times, bundle sizes)

**4. DISCOVER: New Issues from Testing**

- "Server actions fail with edge runtime" → back to step 1
- "Prisma fragments need transaction support" → step 1

### Usage

```bash
# REQUIRED: Start with permission bypass
claude --dangerously-skip-permissions

# Then run command
> /fullservice [--plan] [--resume]

# Runs 2-12 hours autonomously:
# - Audits gaps between docs and implementation
# - Builds missing features (focused on core mission)
# - Validates via repo:preflight + contamination checks
# - Discovers new issues → adds to next iteration
# - Reports comprehensive summary
```

**See `.claude/commands/fullservice.md` for complete specification.**

## Quality Gates (Mandatory)

### Pre-commit (Local - Husky + lint-staged + Turbo)

Git hooks managed by Husky (`.husky/pre-commit`) with 3-layer approach:

```bash
# Layer 1: File-level (lint-staged)
# - Prettier --write (auto-format staged files only)

# Layer 2: Package-level (Turbo with cache)
SCOPE=$(node scripts/detect-scope.mjs "$CLAUDE_FILE_PATHS")
pnpm turbo lint typecheck --filter "$SCOPE"

# Layer 3: Validation (always run)
node scripts/validate.mjs contamination
node scripts/validate.mjs coverage --scope "$SCOPE"
```

**Performance**: ~5s for single file changes (with cache), ~2s for no changes
**Note**: Tests run in CI only, not in pre-commit hooks

### CI (GitHub Actions)

- Jobs: scope-aware `repo:preflight`, contamination checks, storybook smoke
  tests
- Fail-fast on violations
- Upload coverage artifacts

### Enforcement Levels

- **Blocking**: Contamination violations, lint/typecheck errors
- **Warning**: Coverage below threshold (package-specific exceptions in
  `CLAUDE.md`)
- **Manual**: Security audits, performance regressions

## Security & Observability

- Fetch secrets via Doppler commands; never hardcode
- Log security findings in `memory/audit-report-*` with severity and owner
- Store performance metrics (web vitals, cache hits) under
  `memory/artifacts/performance/` and summarize in quick-context

## Documentation

- Update `apps/docs/**` and AI hints when APIs or workflows evolve
- Capture doc changes and reviewer in quick-context; **do not mark complete
  until reviewed**

## Cleanup Checklist

- Stop background services recorded in `memory/services.json`
- Provide merge instructions for Git worktrees (path + commands)
- Archive quick/full context and remediation reports to
  `.claude/memory/archive/`

---

Follow this playbook whenever Codex or a human assistant contributes. If a task
falls outside these rules, escalate via TodoWrite and wait for clarification.
