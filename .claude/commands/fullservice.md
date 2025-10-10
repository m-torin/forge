---
description: "Forge autonomous development cycle: continuous software engineering to close the gap between vision and reality"
allowed-tools: Task
model: claude-sonnet-4-5
permission_mode: manual
---

# ⚠️ ATTENTION: You Are Receiving a Product Requirement

This slash command defines **WHAT** needs to be done, not **HOW** to do it.

**Your role:** Product Manager → Delegate to Engineering Manager (orchestrator)

---

## IMMEDIATE ACTION: Delegate to Orchestrator

**Focus?** (Enter = full codebase check)
Examples: `auth`, `README gaps`, `type errors`, `packages/ai`

Execute this Task call NOW (before reading further):

```typescript
Task({
  subagent_type: "orchestrator",
  description: "Execute /fullservice autonomous cycle",
  prompt: `You are the Engineering Manager (orchestrator) for Forge.

## PRODUCT REQUIREMENT FROM /fullservice

**WHAT to accomplish:**
Close the gap between vision (README, docs) and reality (implementation).

**Focus**: [PARSE USER INPUT OR DEFAULT TO: "Full codebase check and remediation"]

**Your three-loop workflow:**

// Loop 1: Worktree Setup & Context Switch
- Create isolated worktree: .tmp/fullservice-$(date +%Y%m%d%H%M%S)
- Set git working directory to worktree (CRITICAL!)
- Bootstrap dependencies (pnpm install, prisma generate)
- Verify setup complete before proceeding

**ENFORCEMENT: Worktree Required**

Loop 1 MUST be completed before any other loops. This is a safety requirement:

✅ **Validation checks:**
1. Orchestrator validates CWD contains `.tmp/fullservice-` (Step 0.5 in orchestrator.md)
2. Specialists reject non-worktree paths (safety check in each agent spec)
3. Automated detection via `node .claude/scripts/validate-claude.mjs worktree`

❌ **Main session MUST NOT:**
- Spawn specialists directly (only orchestrator can delegate)
- Edit files outside worktree
- Skip orchestrator delegation

🚨 **Violations result in blocked execution.** No exceptions.

// Loop 2: Main Development Cycle (9 stages)
1. AUDIT - Run typecheck, lint, turbo build; check outdated packages (pnpm 10) & unused deps (knip); compare README/docs vs implementation; identify gaps (static analysis only, no tests)
2. AUDIT-FUNCTIONS - Verify external package usage against Context7 docs (delegate to specialists)
3. BUILD - Plan implementation using audit data (errors, breaking changes, gaps), delegate to specialist engineers
4. VALIDATE - Run quality gates (contamination, typecheck, lint) + all tests (vitest, playwright, storybook smoke)
5. DISCOVER - Run all tests (vitest, playwright, storybook smoke) to find new issues
6. REFLECT - Analyze what worked/didn't work
7. REVIEW - External validation (if --review flag)
8. VERIFY - Automated testing of improvements
9. COMMIT - Commit changes to worktree branch

// Loop 3: Review & Merge (Human approval required)
- Present work summary to user
- Present agentic system improvement proposals (agent specs, guardrails, workflows)
- User reviews and approves/rejects each proposal
- If approved: Apply improvements in worktree (edit .claude/agents/*.md, scripts, CLAUDE.md)
- Run VERIFY phase on approved improvements
- Squash commits in worktree
- Merge worktree branch into main
- Cleanup worktree

**HOW you work:**
- Delegate ALL implementation to specialists (never edit code yourself)
- Use TodoWrite with specialist owners for coordination
- Update .claude/memory/quick-context.md after each delegation
- Use ABSOLUTE worktree paths for all file operations
- Synthesize specialist results in REFLECT phase
- Loop back to earlier phases on failure using judgment (analyze error type, severity, patterns)
- Max 3 attempts per failure pattern, document reasoning in quick-context.md

**Resources:**
- Full specification (for your reference): See below in this file
- Coordination matrix: .claude/agents/orchestrator.md
- Delegation thresholds: See orchestrator.md "When to Delegate"
- Contamination rules: .claude/docs/contamination-web.md
- Extended guide: .claude/docs/commands-extended/fullservice-extended.md

**Flags:** [PARSE USER FLAGS: --plan, --resume, --review, --continuous]

**Success criteria:**
- All specialists properly delegated to
- Quality gates pass (contamination, typecheck, lint)
- Memory artifacts created
- Session report with delegation metrics
`
})
```

**STOP - Do Not Read Beyond This Line**

Your job is done. Wait for orchestrator to report results.

---

## 🚫 Product Requirements (For Orchestrator Reference Only)

---

# /fullservice Command Spec

## Overview

`/fullservice` implements **continuous software engineering** to close the gap between vision (README) and reality (code). It's a focused, iterative cycle to fulfill the project vision without scope creep.

**NOT just bug fixing** - this is systematic implementation of missing features, edge cases, and integrations.

## The 9-Stage Loop

1. **AUDIT**: Static analysis only - typecheck, lint, turbo build, pnpm outdated, knip. Compare README/docs vs implementation, identify gaps. NO tests. Orchestrator uses error data + breaking changes to decide agent priority and focus.
2. **AUDIT-FUNCTIONS**: Verify external package usage against Context7 docs. Orchestrator delegates to domain specialists in parallel.
3. **BUILD**: Implement missing features using audit data (stay focused on core mission)
4. **VALIDATE**: Quality gates (contamination, typecheck, lint) + all tests (vitest unit, playwright e2e, storybook visual regression)
5. **DISCOVER**: Run all tests (vitest unit, playwright e2e, storybook visual regression) to find new issues → next iteration
6. **REFLECT**: Analyze session, create improvement proposals
7. **REVIEW**: External validation by reviewer agent (if --review flag)
8. **VERIFY**: Automated testing of improvements (required)
9. **COMMIT**: Apply validated improvements (≥80% pass rate required)

## Phase Loop-Back & Retry Logic

**Orchestrator decides loop-backs based on failure context and analysis.**

**Decision principles:**

- **Type/lint errors** → Usually BUILD (fix implementation)
- **Test failures** → Analyze patterns: isolated bug vs systemic issue, then BUILD or AUDIT
- **Contamination** → Architectural violation, may need AUDIT (reassess) or BUILD (fix imports)
- **Breaking changes** → May need AUDIT to reassess dependencies and priorities
- **Multiple failure types** → Return to earliest relevant phase

**Hard limits (prevent infinite loops):**

- Max 3 attempts per distinct failure pattern
- Max 5 total iterations (--continuous mode)
- Escalate after 3rd attempt: document failures in quick-context.md, create diagnostic report, request user guidance

**Orchestrator autonomy**: Use judgment to determine optimal phase return. Document reasoning in quick-context.md.

## AUDIT-FUNCTIONS Phase

**Verify external package usage against latest Context7 docs.**

**Orchestrator delegates to domain specialists in parallel.**

**Specialist workflow:**

1. Grep domain for package imports/function calls
2. Extract unique functions (sample if >50)
3. Verify against Context7 latest docs
4. Report: deprecated, incorrect usage, better alternatives

**Orchestrator synthesis:**

- Compile reports
- Prioritize: breaking > deprecated > suboptimal
- Feed to BUILD phase

**Scale:** Context isolated per specialist. Parallel execution.

## Usage

```bash
# REQUIRED: Start with permission bypass
claude --dangerously-skip-permissions

# Then run command
> /fullservice [--plan] [--resume] [--review] [--continuous]
```

**Modes:**

- Default: Full codebase check (runs all agents at least once, orchestrator decides order/priority from audit data)
- `--plan`: Discovery only, no edits
- `--resume`: Continue from last checkpoint
- `--review`: Enable external validation (recommended)
- `--continuous`: Multi-iteration mode (max 5 iterations)

**Default Focus Notes:**

- AUDIT: Static analysis only (typecheck, lint, turbo build, pnpm outdated, knip) - NO tests
- DISCOVER/VALIDATE/VERIFY: Run all tests (vitest unit, playwright e2e, storybook visual regression)
- Package upgrades are check-only; orchestrator considers breaking changes before delegating
- Turbo builds each app/package independently (watch for race conditions)
- Orchestrator uses error data to delegate specialists in priority order

## Stateful Continuation (Multi-Session Workflows)

**Agent constraint**: Orchestrators run to completion and return ONE message. They cannot pause mid-execution to ask questions.

**Solution**: Use `quick-context.md` + `--resume` flag for multi-session workflows.

### Pattern

1. **Orchestrator #1** runs phase(s) → writes state to `.claude/memory/quick-context.md` → returns
2. **Main session** reads quick-context.md → presents to user → gets decision
3. **Orchestrator #2** spawned with `--resume` → reads quick-context.md → continues from checkpoint

### Example: Plan → Build Flow

**Session 1: Discovery**

```bash
> /fullservice --plan
```

Orchestrator runs AUDIT, writes findings to `quick-context.md`, returns: "AUDIT complete. See quick-context.md."

**Session 2: Execute**

```bash
> /fullservice --resume
```

New orchestrator reads `quick-context.md`, sees AUDIT done, proceeds to BUILD phase.

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
## /fullservice Checkpoint (2025-10-09T14:30:00Z)

**Worktree**: .tmp/fullservice-20251009143000
**Last Phase**: AUDIT ✅
**Next Phase**: BUILD
**Flags**: --plan

**AUDIT Findings**:

- 88 type errors in @labs/flows (HIGH)
- 12 lint warnings in ai-chatbot (MEDIUM)

**Resume**: /fullservice --resume
```

## Scope Boundaries

### ✅ WILL Build

- Missing framework integrations (auth flows, DB patterns, UI components)
- Edge cases & robustness (Doppler fallback, connection failures, error states)
- Integration gaps (agent coordination, build optimization, quality gates)

### ❌ WON'T Build

- Social features beyond existing
- New authentication providers
- Additional UI frameworks (stick to Mantine v8)
- Features outside "production-ready Next.js platform"

**Key Principle**: Each cycle brings codebase closer to production-ready without scope creep.

## Worktree Isolation (REQUIRED)

- ✅ All work in isolated worktree: `$REPO_ROOT/.tmp/fullservice-<timestamp>`
- ✅ Use `mcp__git__git_worktree` for creation/management
- ✅ Main branch stays pristine during 2-12 hour run
- ✅ Easy rollback: delete worktree
- ❌ NEVER work directly on main branch

**Creation:**

```typescript
const timestamp = new Date().toISOString().replace(/[:.TZ-]/g, "");
const worktreePath = `${REPO_ROOT}/.tmp/fullservice-${timestamp}`;
const branchName = `fullservice-${timestamp}`;

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

## REFLECT Phase (REQUIRED)

**Must complete before finishing session.** Analyze the entire run and create:

1. **Agent Improvement Proposals** (`.claude/memory/agent-improvements-{TIMESTAMP}.md`)
   - Which agents excelled/struggled? Why?
   - New agent needs?
   - Agent spec updates

2. **Guardrail Enhancements** (`.claude/memory/guardrail-improvements-{TIMESTAMP}.md`)
   - What did checks catch/miss?
   - New checks needed?
   - Script improvements

3. **Workflow Optimizations** (`.claude/memory/workflow-improvements-{TIMESTAMP}.md`)
   - What worked/didn't work?
   - Tool usage improvements
   - Process enhancements

**Proposals require user approval before applying.** See Loop 3: Review & Merge for human-in-the-loop approval process.

## REVIEW Phase (--review flag)

Spawns independent **reviewer agent** to validate orchestrator's work:

- Grade session execution (A-F scale)
- Approve/reject each improvement proposal
- Identify blind spots and missed patterns
- Generate counter-proposals

**Reviewer has authority to:** Reject proposals, modify improvements, add new ones, escalate to user

## VERIFY Phase (REQUIRED)

**All improvements must pass automated verification before commit.**

1. Create test branch: `verify-improvements-{TIMESTAMP}`
2. Apply improvements
3. Run verification suite:
   - Static: contamination, typecheck, lint, circular deps, syntax, memory integrity
   - Tests: vitest unit, playwright e2e, storybook visual regression
4. Calculate pass rate

**Pass rate requirements:**

- ≥80%: APPROVED (safe to commit)
- 60-79%: REVIEW REQUIRED (manual check)
- <60%: REJECTED (unsafe, auto-rollback)

## COMMIT Phase

**Only after VERIFY passes (≥80%).**

Separate commits by type:

1. Agent spec updates
2. Guardrail enhancements
3. Workflow improvements
4. Documentation updates

Update `.claude/memory/improvement-metrics.json` with session results.

## Human-in-the-Loop Approval (Loop 3)

**Agentic system improvements require explicit user approval.**

After COMMIT, orchestrator presents proposals → user approves/rejects → apply in worktree → VERIFY (≥80%) → squash commits → merge to main → cleanup.

**Proposal types:**

- Agent specs (`.claude/agents/*.md`)
- Guardrails (`.claude/scripts/*.sh`, `*.mjs`)
- Workflows (`CLAUDE.md`, slash commands)

**User options**: Approve all, some, none, or request modifications.

**Rationale**: Meta-improvements need human oversight to prevent unintended side effects.

## Common Pitfalls

### ❌ DON'T

- Work directly on main branch (use worktree)
- Run `pnpm dev` (autonomous mode doesn't need dev servers)
- Skip contamination checks
- Commit without running quality gates

### ✅ DO

- Run `scripts/detect-scope.mjs` before scoped commands
- Document all decisions in full-context
- Complete REFLECT phase before finishing

## Stop Conditions

**Immediate stop (write memory & exit):**

- Approvals pending (Terraform, secrets, production migration)
- Critical tests failing with no mitigation
- Approaching context limit (>80%)
- User interruption request

## Extended Documentation

For detailed implementation guides:

- **Startup sequence**: `.claude/docs/commands-extended/fullservice-extended.md#detailed-startup-sequence`
- **Worktree patterns**: `.claude/docs/commands-extended/fullservice-extended.md#worktree-management-patterns`
- **Git MCP usage**: `.claude/docs/commands-extended/fullservice-extended.md#git-mcp-tool-usage`
- **Automation hooks**: `.claude/docs/commands-extended/fullservice-extended.md#automation-hooks-reference`
- **REFLECT details**: `.claude/docs/commands-extended/fullservice-extended.md#reflect-phase-implementation`
- **REVIEW details**: `.claude/docs/commands-extended/fullservice-extended.md#review-phase-implementation`
- **VERIFY details**: `.claude/docs/commands-extended/fullservice-extended.md#verify-phase-implementation`
- **COMMIT details**: `.claude/docs/commands-extended/fullservice-extended.md#commit-phase-implementation`
- **Example sessions**: `.claude/docs/commands-extended/fullservice-extended.md#example-sessions`
- **Troubleshooting**: `.claude/docs/commands-extended/fullservice-extended.md#troubleshooting-guide`

---

**Remember**: /fullservice is about continuous improvement toward project vision. Stay focused, enforce boundaries, document everything.
