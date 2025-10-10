---
description: "Forge modernization command: plan or execute multi-specialist upgrades safely"
allowed-tools: Task
model: claude-sonnet-4-5
permission_mode: manual
---

# ⚠️ ATTENTION: You Are Receiving a Product Requirement

This slash command defines **WHAT** needs to be done, not **HOW** to do it.

**Your role:** Product Manager → Delegate to Engineering Manager (orchestrator)

---

## IMMEDIATE ACTION: Delegate to Orchestrator

Execute this Task call NOW (before reading further):

```typescript
Task({
  subagent_type: "orchestrator",
  description: "Execute /modernize autonomous remediation",
  prompt: `You are the Engineering Manager (orchestrator) for Forge.

## PRODUCT REQUIREMENT FROM /modernize

**WHAT to accomplish:**
Coordinate autonomous remediation across the Forge monorepo following established patterns.

**Modes available:**
- Default: Full implementation + verification in isolated worktree
- --plan: Discovery only (audit notes, TodoWrite plan, recommended specialists)
- --resume <mode>: Continue from last checkpoint
- --review: Enable external validation (recommended)
- --continuous: Multi-iteration mode (max 5 iterations)

**HOW you work:**
- Create isolated worktree: .tmp/modernize-<timestamp>
- Delegate ALL implementation to specialists (never edit code yourself)
- Use TodoWrite with specialist owners for coordination
- Update .claude/memory/quick-context.md after each delegation
- Follow all guardrails in CLAUDE.md

**Resources:**
- Full specification (for your reference): See below in this file
- Coordination matrix: .claude/agents/orchestrator.md
- Contamination rules: .claude/docs/contamination-web.md
- Quality gates: `node scripts/validate.mjs contamination` or `pnpm validate:contamination`

**Flags:** [PARSE USER FLAGS: --plan, --resume, --review, --continuous]

**Success criteria:**
- All specialists properly delegated to
- Quality gates pass (contamination, typecheck, lint)
- Worktree ready for merge
`
})
```

**STOP - Do Not Read Beyond This Line**

Your job is done. Wait for orchestrator to report results.

---

## 🚫 Product Requirements (For Orchestrator Reference Only)

---

# /modernize Command Spec

## Overview

`/modernize` coordinates autonomous remediation across the Forge monorepo. It mirrors `/fullservice` but is tuned for pnpm/Turborepo, Prisma, and the repository guardrails in `CLAUDE.md`.

## Usage

```bash
claude --dangerously-skip-permissions > /modernize [--plan] [--resume <mode>] [--review] [--continuous]
```

### Modes

- **Default**: full implementation + verification. Creates/uses worktree `.tmp/modernize-<timestamp>`.
- **`--plan`**: discovery only—produce TodoWrite plan, audit notes, and recommended specialists; no edits.
- **`--resume <mode>`**: reloads latest quick-context/memory state and continues a previous run (`mode` = `default` or `plan`).
- **`--review`**: Enable external validation (recommended).
- **`--continuous`**: Multi-iteration mode (max 5 iterations).

## Startup Sequence

1. `memory.read` for latest mode and quick-context entries.
2. Verify/create Git worktree using `mcp__git__git_worktree` (`.tmp/modernize-<timestamp>`).
3. Bootstrap dependencies (pnpm install, prisma generate).
4. List active services via `.claude/memory/services.json`; stop stale jobs.
5. Emit TodoWrite plan using template from orchestrator prompt.
6. Append run header to `.claude/memory/tool-audit.log` with timestamp and worktree path.

### Flag Behavior

| Flags          | What Happens                                              |
| -------------- | --------------------------------------------------------- |
| None           | Full cycle (AUDIT→BUILD→VALIDATE→DISCOVER→REFLECT→COMMIT) |
| `--plan`       | AUDIT only, checkpoint, stop                              |
| `--resume`     | Read checkpoint, continue next phase                      |
| `--review`     | Add REVIEW phase (reviewer agent validation)              |
| `--continuous` | Multi-iteration mode (max 5 cycles, checkpoint each)      |

### State Format (quick-context.md)

```markdown
## /modernize Checkpoint (2025-10-09T14:30:00Z)

**Worktree**: .tmp/modernize-20251009143000
**Last Phase**: AUDIT ✅
**Next Phase**: BUILD
**Flags**: --plan

**AUDIT Findings**:

- 88 type errors in @labs/flows (HIGH)
- 12 lint warnings in ai-chatbot (MEDIUM)

**Resume**: /modernize --resume
```

## Worktree Isolation (REQUIRED)

- ✅ All work in isolated worktree: `$REPO_ROOT/.tmp/modernize-<timestamp>`
- ✅ Use `mcp__git__git_worktree` for creation/management
- ✅ Main branch stays pristine during run
- ✅ Easy rollback: delete worktree
- ❌ NEVER work directly on main branch

**Creation:**

```typescript
const timestamp = new Date().toISOString().replace(/[:.TZ-]/g, "");
const worktreePath = `${REPO_ROOT}/.tmp/modernize-${timestamp}`;
const branchName = `modernize-${timestamp}`;

await mcp__git__git_worktree({
  cwd: REPO_ROOT,
  args: ["add", "-b", branchName, worktreePath],
});
```

**Working in Worktree:**

- File operations: Use absolute paths (`${worktreePath}/packages/...`)
- Bash commands: Always `cd ${worktreePath} && <command>`
- Git operations: Always specify `cwd: worktreePath`

## Git MCP Tools (REQUIRED)

**Use these INSTEAD of bash git commands:**

- `mcp__git__git_status()` - Check status
- `mcp__git__git_diff()` - View changes
- `mcp__git__git_add()` - Stage files
- `mcp__git__git_commit()` - Create commits
- `mcp__git__git_worktree()` - Manage worktrees
- `mcp__git__git_branch()` - Branch operations

**Prisma MCP Tools (for stack-prisma specialist):**

- `mcp__prisma-local__migrate-status` - Check migration status
- `mcp__prisma-local__migrate-dev` - Run development migrations
- `mcp__prisma-local__migrate-reset` - Reset database to clean state
- `mcp__prisma-local__Prisma-Studio` - Open Prisma Studio GUI

❌ NO `bash git` commands - always use MCP tools

## Permissions & Tooling

- **Git MCP**: status, diff, add, commit, worktree (no branch creation).
- **Bash**: curated pnpm/turbo scripts (no `pnpm dev`), Prisma commands, Terraform plan/apply (apply requires approval), Playwright smoke tests.
- **Memory/TodoWrite**: required for logging state and handoffs.
- **Delegation**: orchestrator may spawn specialists (`stack-*`, shared services) via `Task` tool.
- **Doc lookup**: prioritize Context7; Perplexity only if internal docs lack coverage.

## Automation Hooks

- Post-write lint/typecheck via `pnpm lint --filter <scope>` and `pnpm typecheck --filter <scope>`.
- Prisma schema writes trigger `pnpm prisma format` and diff summary; use `mcp__prisma-local__migrate-status` to verify migrations.
- UI edits run `pnpm turbo run storybook:smoke`; Playwright tests run for spec changes (chromium project by default).
- Hook failures must be saved to quick-context and TodoWrite with `status: "needs-fix"`.

## Quality Gates (Pre-Commit Checklist)

**Required before any commit:**

- [ ] Contamination checks pass (`node scripts/validate.mjs contamination` or `pnpm validate:contamination`)
- [ ] TypeCheck passes (`pnpm typecheck --filter <scope>`)
- [ ] Lint passes (`pnpm lint --filter <scope>`)
- [ ] Coverage maintained (≥50% or package-specific threshold)
- [ ] Quick-context checkpoint created

## Memory Discipline

### Quick Context (500-line limit)

**Update after:** Each specialist delegation, major feature, test completion, hook failures

**Format:**

```markdown
## Checkpoint: {Task} (YYYY-MM-DDTHH:MM:SSZ)

**Status**: ✅ Completed | 🔄 In Progress | ⏸️ Blocked
**Specialist**: {agent-name}
**Changes**: {file paths}
**Tests Run**: {commands}
**Next Steps**: {actionable items}
```

### Full Context (2000-line limit)

**Update after:** Completing full cycle, major architectural decision, weekly checkpoint

## REVIEW Phase (--review flag)

Spawns independent **reviewer agent** to validate orchestrator's work:

- Grade session execution (A-F scale)
- Approve/reject each improvement proposal
- Identify blind spots and missed patterns
- Generate counter-proposals

**Reviewer has authority to:** Reject proposals, modify improvements, add new ones, escalate to user

## Common Pitfalls

### ❌ DON'T

- Work directly on main branch (use worktree)
- Run `pnpm dev` (autonomous mode doesn't need dev servers)
- Skip contamination checks
- Commit without running quality gates

### ✅ DO

- Run `scripts/detect-scope.mjs` before scoped commands
- Document all decisions in full-context
- Complete memory checkpoint before finishing

## Stop Conditions

- Approvals pending (Terraform apply, secret rotation, migration).
- Critical tests failing with no mitigation.
- Approaching context/token limit.
  In each case, write quick-context entry, update TodoWrite, and store remediation notes before exiting.

## Outputs

- Updated quick-context and full-context entries.
- TodoWrite plan reflecting completion/handoffs.
- Remediation report draft summarizing gaps resolved, tests run, metrics, approvals.
- Tool audit log entries for every command.
- Worktree merge checklist (commands to apply, manual follow-ups).

## Cleanup

- Ensure background services are stopped and recorded in `services.json`.
- Provide `git status` overview and instructions for publishing worktree changes.
- If session ends early, mark outstanding blockers in TodoWrite and quick-context so `/modernize --resume` can continue safely.

Use `/modernize` responsibly: keep scope tight, respect guardrails, and never proceed without deterministic validation.
