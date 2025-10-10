# /fullservice Command - Complete 16-Phase Autonomous Development Cycle

Complete autonomous development process from command execution to final git worktree merge.

```
┌═════════════════════════════════════════════════════════════════════════════════┐
│                           🚀 /fullservice COMMAND EXECUTION                     │
│                                                                                │
│  Command: /fullservice [--plan] [--resume]                                     │
│  Duration: 2-12 hours autonomous operation                                     │
│  Phases: 16 (PM→EM delegation + 15 execution phases)                           │
│  Output: Worktree ready for human merge to main                                │
└═════════════════════════════════════════════════════════════════════════════════┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 0. SLASH COMMAND DELEGATION (PM → EM) 📋                                        │
│                                                                                │
│ 🎯 Product Manager Role: Slash command defines WHAT to accomplish              │
│ ⚠️  IMMEDIATE ACTION REQUIRED: Delegate to orchestrator                         │
│                                                                                │
│ 📞 Delegation Call:                                                             │
│   Task({                                                                       │
│     subagent_type: "orchestrator",                                             │
│     description: "Execute /fullservice autonomous cycle",                      │
│     prompt: "You are the Engineering Manager (orchestrator)..."                │
│   })                                                                           │
│                                                                                │
│ 🚫 PM Responsibilities:                                                         │
│   ✅ Define product requirements (WHAT)                                         │
│   ✅ Delegate to Engineering Manager (orchestrator)                             │
│   ❌ NEVER implement (no edits, no file operations)                             │
│   ❌ NEVER read implementation details                                          │
│                                                                                │
│ 🎯 Success Criteria: Task(orchestrator) called, PM session waits for report     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 1. INITIALIZATION & VALIDATION (EM Takes Over)                                 │
│                                                                                │
│ ✅ Check permissions (--dangerously-skip-permissions required)                  │
│ ✅ Validate repository state (clean working tree)                               │
│ ✅ Generate timestamp: TIMESTAMP=$(date +%Y%m%d-%H%M%S)                         │
│ ✅ Set paths: REPO_ROOT=$(git rev-parse --show-toplevel)                        │
│ ✅ Create worktree directory: mkdir -p "$REPO_ROOT/.tmp"                        │
│ ✅ Set worktree path: WORKTREE_PATH="$REPO_ROOT/.tmp/fullservice-${TIMESTAMP}"  │
│ ✅ Set branch name: BRANCH_NAME="fullservice-${TIMESTAMP}"                      │
│                                                                                │
│ 📁 Worktree Location: $REPO_ROOT/.tmp/fullservice-20250106-143022               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 2. WORKTREE CREATION & VALIDATION                                              │
│                                                                                │
│ 🔧 Create worktree: mcp__git__git_worktree({ args: ['add', '-b', BRANCH_NAME,   │
│    WORKTREE_PATH], cwd: REPO_ROOT })                                           │
│ 🔍 Verify branch: mcp__git__git_branch({ args: ['--show-current'],              │
│    cwd: WORKTREE_PATH })                                                       │
│ 🔍 Validate toplevel: git rev-parse --show-toplevel (must equal WORKTREE_PATH)  │
│ 🔍 Check root files exist: turbo.json, pnpm-workspace.yaml, package.json        │
│ ❌ If validation fails: Remove worktree and recreate from repo root             │
│                                                                                │
│ 🎯 Success Criteria: Isolated worktree with all root files present              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 3. FRESH WORKTREE BOOTSTRAP (CRITICAL ORDER) ⚠️                                │
│                                                                                │
│ 🚨 MUST RUN IN EXACT SEQUENCE - NO SHORTCUTS:                                   │
│                                                                                │
│ 1. cd "$WORKTREE_PATH" && pnpm install                    # Install deps       │
│ 2. cd "$WORKTREE_PATH" && pnpm --filter @repo/db-prisma   # Generate Prisma    │
│      prisma generate                                                           │
│ 3. cd "$WORKTREE_PATH" && pnpm --filter @repo/db-prisma   # Build schemas      │
│      run build:schemas                                                         │
│ 4. cd "$WORKTREE_PATH" && pnpm typecheck                 # Typecheck           │
│                                                                                │
│ ⚠️  Why this order? Prisma needs deps → schemas need Prisma → typecheck needs  │
│     schemas. Skipping steps causes "generator not found" errors.               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 4. AUDIT PHASE - Reality vs Vision 🔍                                           │
│                                                                                │
│ 📊 Compare README/docs vs implementation                                        │
│ 🔍 Identify gaps: "README says use Mantine v8, but forms use react-hook"        │
│ 🔍 Check agent coordination: "AGENTS.md registry differs from orchestrator"     │
│ 🔍 Find edge cases: "What if Doppler secrets unavailable?"                      │
│ 📝 Log findings to quick-context.md                                             │
│                                                                                │
│ 🎯 Goal: Find discrepancies between documentation and actual code               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 5. BUILD PHASE - Implement Missing Features 🔨                                  │
│                                                                                │
│ 🎯 Focus on core mission (avoid scope creep)                                    │
│ ➕ Add missing framework integrations                                           │
│ 🔗 Wire agent coordination patterns                                             │
│ 🛡️  Add edge case handling (fallbacks, error states)                           │
│                                                                                │
│ 🛠️  MCP Git Tools (PREFERRED):                                                 │
│   • mcp__git__git_add() for staging                                            │
│   • mcp__git__git_commit() for commits                                         │
│   • mcp__git__git_status() for checking state                                  │
│   • mcp__git__git_diff() for viewing changes                                   │
│                                                                                │
│ 📁 All file operations use absolute paths to worktree files                     │
│ 🚫 NO copying config files from main repo into worktree                         │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 6. VALIDATION PHASE - Quality Gates ✅                                          │
│                                                                                │
│ 🧪 Run contamination checks: node scripts/validate.mjs contamination            │
│ 🧪 Execute scope-aware tests: pnpm repo:preflight                               │
│ 🚫 Verify no stage boundary violations                                          │
│ 🔄 Check circular dependencies: pnpm madge --circular                           │
│ 📝 Run typecheck: pnpm typecheck                                                │
│ 🧹 Run linting: pnpm lint                                                       │
│                                                                                │
│ 🎯 All quality gates MUST pass before proceeding                                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 7. DISCOVER PHASE - Find New Issues 🔍                                          │
│                                                                                │
│ 🔍 Analyze test results for new problems                                        │
│ 🔍 Check for edge cases discovered during testing                               │
│ 🔍 Identify additional gaps: "Server actions fail with edge runtime"            │
│ 📝 Add findings to next iteration queue                                         │
│ 📝 Update quick-context.md with discoveries                                     │
│                                                                                │
│ 🎯 Goal: Find issues that testing revealed                                      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 8. ITERATION DECISION POINT 🤔                                                  │
│                                                                                │
│ ❓ New issues found?                                                            │
│    ├─ YES → Return to AUDIT phase (step 4) 🔄                                   │
│    └─ NO  → Proceed to REFLECT phase (step 9) ➡️                               │
│                                                                                │
│ ⏰ Maximum iterations: 2-12 hours autonomous operation                          │
│ 🎯 Goal: Close gap between vision and reality                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 9. REFLECT PHASE - Self-Improvement Analysis 🧠                                 │
│                                                                                │
│ 📊 Analyze session performance and outcomes                                     │
│ 🔍 Identify patterns: What worked? What failed?                                 │
│ 📝 Generate improvement proposals:                                              │
│    • agent_specs: Updates to .claude/agents/*.md                               │
│    • guardrails: Enhanced .claude/scripts/*-checks.sh                          │
│    • workflow: Process improvements in fullservice.md                          │
│    • documentation: AI hints in apps/docs/ai-hints/                            │
│                                                                                │
│ 📋 Deliverables:                                                                │
│    • agent-improvements-{TIMESTAMP}.md                                         │
│    • guardrail-improvements-{TIMESTAMP}.md                                     │
│    • workflow-improvements-{TIMESTAMP}.md                                      │
│    • Update .claude/memory/improvement-metrics.json                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 10. REVIEW PHASE - External Validation 👁️                                      │
│                                                                                │
│ 🔍 External validation by reviewer agent (--review flag)                        │
│ ✅ Validate improvement proposals:                                              │
│    • Addresses root causes (not symptoms)                                      │
│    • Verification pass rate ≥80%                                               │
│    • Measurable impact (time saved, errors prevented)                          │
│    • Low maintenance burden (no bureaucracy)                                   │
│                                                                                │
│ 🎯 Reviewer authority:                                                          │
│    • Can REJECT orchestrator improvements                                      │
│    • Can MODIFY proposals with better alternatives                             │
│    • Can ADD new improvements orchestrator missed                              │
│    • Can ESCALATE to user for decisions                                        │
│    • Provides blind spot analysis                                              │
│                                                                                │
│ 📋 Deliverables:                                                                │
│    • session-review-{TIMESTAMP}.md                                             │
│    • validated-improvements-{TIMESTAMP}.md                                     │
│    • blind-spots-{TIMESTAMP}.md                                                │
│    • final-recommendations-{TIMESTAMP}.md                                      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 11. VERIFY PHASE - Automated Testing 🧪                                         │
│                                                                                │
│ 🔬 Test improvements in isolated environment                                    │
│ 📊 Create test branch with proposed changes                                     │
│ ✅ Run comprehensive test suite:                                                │
│    • pnpm repo:preflight (lint + typecheck + tests)                            │
│    • node scripts/validate.mjs contamination                                   │
│    • .claude/scripts/verify-improvements.sh                                    │
│    • pnpm turbo run storybook:smoke (UI changes)                               │
│                                                                                │
│ 🎯 Success criteria: Pass rate ≥80%                                             │
│ ❌ Failure handling: Reject improvements that fail verification                 │
│ 📋 Deliverables:                                                                │
│    • verification-results-{TIMESTAMP}.json                                     │
│    • test-branch: fullservice-verify-{TIMESTAMP}                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 12. COMMIT PHASE - Apply Validated Improvements 💾                              │
│                                                                                │
│ ✅ Apply only improvements that passed VERIFY phase                             │
│ 📊 Update metrics tracking:                                                     │
│    • total_sessions: Count of /fullservice runs                                │
│    • improvements_proposed: Total suggestions                                  │
│    • improvements_approved: Passed verification                                │
│    • improvements_rejected: Failed verification/review                         │
│    • verification_pass_rate: Success percentage                                │
│    • next_session_delta: Issues reduced, time saved                            │
│                                                                                │
│ 🔄 Update system files:                                                         │
│    • .claude/agents/*.md (agent improvements)                                  │
│    • .claude/scripts/*-checks.sh (guardrail improvements)                      │
│    • .claude/commands/fullservice.md (workflow improvements)                   │
│    • apps/docs/ai-hints/*.mdx (documentation improvements)                     │
│                                                                                │
│ 📋 Deliverables:                                                                │
│    • All validated improvements applied to main system                         │
│    • .claude/memory/improvement-metrics.json updated                           │
│    • System ready for next /fullservice session                                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 13. CLEANUP PHASE - Worktree Management 🧹                                      │
│                                                                                │
│ 🛑 Stop any background services (recorded in services.json)                     │
│ 📋 Prepare merge instructions for Git worktrees                                 │
│ 📁 Archive quick-context and full-context                                       │
│ 📊 Create remediation reports per rotation policy                               │
│ 💾 Log final status to memory                                                   │
│                                                                                │
│ 🎯 Goal: Prepare worktree for human review and merge                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌═════════════════════════════════════════════════════════════════════════════════┐
│ 14. HANDOFF TO HUMAN - Git Worktree Merge 👤                                    │
│                                                                                │
│ 📁 Worktree ready for review at: $REPO_ROOT/.tmp/fullservice-TIMESTAMP          │
│ 🌿 Branch created: fullservice-TIMESTAMP                                        │
│ ✅ All changes committed and ready for merge                                    │
│                                                                                │
│ 👤 Human reviews changes and merges to main:                                    │
│                                                                                │
│   git checkout main                                                            │
│   git merge fullservice-TIMESTAMP                                              │
│   git branch -d fullservice-TIMESTAMP                                          │
│   git worktree remove .tmp/fullservice-TIMESTAMP                               │
│                                                                                │
│ 🎯 Only human intervention required: Final merge to main                        │
└═════════════════════════════════════════════════════════════════════════════════┘
                                        │
                                        ▼
┌═════════════════════════════════════════════════════════════════════════════════┐
│ 15. COMPLETION ✅                                                               │
│                                                                                │
│ ✅ Changes merged to main branch                                                │
│ 🧹 Worktree cleaned up                                                          │
│ 🎉 Full service cycle complete                                                  │
│ 🚀 Ready for next /fullservice command                                          │
│                                                                                │
│ 🏆 Mission Accomplished: Vision ↔ Reality gap closed!                           │
└═════════════════════════════════════════════════════════════════════════════════┘

## 🎯 Key Principles

### 🏝️ Worktree Isolation
- **All work happens in isolated worktree** at `$REPO_ROOT/.tmp/fullservice-TIMESTAMP`
- **Main repository remains clean** throughout process
- **All commands prefixed** with `cd "$WORKTREE_PATH" &&`
- **No copying config files** from main repo into worktree

### 🛠️ Tool Usage Priority (CRITICAL)

**ALWAYS use tools in this order** (highest priority first):

1. **🥇 Claude Code Native Tools (FIRST - No Permission Needed)**
   - Read() - For reading files (NOT cat/head/tail)
   - Write() - For creating files (NOT echo >/cat <<EOF)
   - Edit() - For modifying files (NOT sed/awk/perl)
   - Grep() - For searching content (NOT grep/rg/ag command)
   - Glob() - For finding files (NOT find/ls)
   - TodoWrite() - For task tracking

2. **🥈 MCP Tools (SECOND - No Permission for Git)**
   - mcp__git__* - For ALL git operations (NOT bash git)
   - mcp__context7__* - For library docs (NOT WebFetch)
   - mcp__perplexity__* - For research (NOT WebSearch)

3. **🥉 Bash (LAST RESORT - Requires Permission)**
   - Only for: pnpm, npm, node, .claude/scripts/*
   - Never for: File ops, git, search, text processing

**Common Mistakes:**
- ❌ cat file.json → ✅ Read({file_path: "file.json"})
- ❌ git status → ✅ mcp__git__git_status()
- ❌ grep pattern → ✅ Grep({pattern: "pattern"})

### ✅ Quality Gates
- **Contamination checks** prevent stage boundary violations
- **Scope-aware testing** ensures only affected packages are tested
- **All quality gates must pass** before proceeding to next phase
- **No shortcuts** - complete validation required

### 💾 Memory Management Patterns

**Active Memory Files (with line limits):**

**quick-context.md** (500 lines)
- Update after: Each specialist delegation, major features, hook failures
- Format: Status (✅/🔄/⏸️), Specialist, Changes, Tests Run, Next Steps
- Checkpoint triggers: After each BUILD phase completion

**full-context.md** (2000 lines)
- Update after: Full /fullservice cycle, architectural decision, weekly (Friday)
- Format: Milestones, What Built, Key Decisions, Learnings, Next Steps

**tool-audit.log** (unlimited)
- Every bash/MCP command logged with timestamp
- Used for REFLECT phase analysis and session reconstruction

**services.json** (structured JSON)
- Tracks background services: PIDs, ports, start times
- Ensures cleanup in Phase 13 (CLEANUP)

**{specialist}-learnings.md** (1000 lines per agent)
- 18 specialist agents = 18 learning files
- Performance patterns, bug resolutions, architectural decisions
- Code examples with file:line references
- Updated during REFLECT phase

**improvement-metrics.json** (metrics tracking)
- Session history with improvement proposals/approvals
- Verification pass rates
- Time/issue reduction metrics
- Updated during COMMIT phase

### 👤 Human Handoff
- **Only final merge to main** requires human intervention
- **All git operations within worktree** are autonomous
- **Clear instructions provided** for worktree cleanup
- **Worktree ready for review** with all changes committed

## 🚨 Critical Success Factors

### ⚠️ Bootstrap Order (Step 3)
**MUST follow exact sequence** - skipping steps causes "generator not found" errors:
1. `pnpm install` (dependencies)
2. `prisma generate` (needs deps)
3. `build:schemas` (needs Prisma)
4. `pnpm typecheck` (needs schemas)

### 🔄 Iteration Logic (Steps 4-8)
**Continuous feedback loop** until vision matches reality:
- **AUDIT** → **BUILD** → **VALIDATE** → **DISCOVER** → **AUDIT** (repeat)
- **Maximum 2-12 hours** autonomous operation
- **Focus on core mission** - avoid scope creep

### 🎯 Success Metrics
- **Zero contamination violations** (stage boundaries respected)
- **All quality gates pass** (lint, typecheck, tests)
- **Worktree ready for merge** (all changes committed)
- **Vision ↔ Reality gap closed** (documentation matches code)

## 🚨 Troubleshooting Guide

### ❌ Common Issues & Solutions

#### "Generator not found" Error
- **Cause**: Skipped bootstrap steps or wrong order
- **Solution**: Follow exact sequence: `pnpm install` → `prisma generate` → `build:schemas` → `typecheck`

#### Worktree Missing Root Files
- **Cause**: Created from wrong directory or validation failed
- **Solution**: Remove worktree and recreate from repo root with proper validation

#### Contamination Violations
- **Cause**: Stage boundary violations (e.g., Next.js in packages)
- **Solution**: Fix imports, run contamination checks, re-validate

#### CWD Reset Issues
- **Cause**: Bash tool resets working directory between commands
- **Solution**: Always prefix with `cd "$WORKTREE_PATH" &&`

#### Permission Denied
- **Cause**: Trying to create worktree outside repo
- **Solution**: Use repo-local `.tmp/` directory instead of `/tmp/`

### 🔧 Debug Commands
```bash
# Check worktree status
git worktree list

# Verify worktree location
git rev-parse --show-toplevel

# Check contamination
node scripts/validate.mjs contamination

# Run quality gates
pnpm repo:preflight
```

### 📞 Escalation Path
1. **Check logs** in quick-context.md
2. **Verify worktree** integrity
3. **Re-run validation** steps
4. **Clean restart** if needed
5. **Human intervention** for complex issues

## 🔄 Continuous Improvement System

### How It Works

Each /fullservice session learns from itself:

1. **REFLECT** (Phase 9): Analyze what worked/failed
2. **REVIEW** (Phase 10): External validation (--review flag)
3. **VERIFY** (Phase 11): Automated testing of improvements
4. **COMMIT** (Phase 12): Apply validated changes

### Metrics Tracked

.claude/memory/improvement-metrics.json tracks:
- total_sessions: Count of /fullservice runs
- improvements_proposed: Total suggestions
- improvements_approved: Passed verification
- improvements_rejected: Failed verification/review
- verification_pass_rate: Success percentage
- next_session_delta: Issues reduced, time saved

### Improvement Categories

- agent_specs: Updates to .claude/agents/*.md
- guardrails: Enhanced .claude/scripts/*-checks.sh
- workflow: Process improvements in fullservice.md
- documentation: AI hints in apps/docs/ai-hints/

### Success Criteria

- Addresses root causes (not symptoms)
- Verification pass rate ≥80%
- Measurable impact (time saved, errors prevented)
- Low maintenance burden (no bureaucracy)

### Reviewer Agent Authority (--review flag)

When enabled:
- Can REJECT orchestrator improvements
- Can MODIFY proposals with better alternatives
- Can ADD new improvements orchestrator missed
- Can ESCALATE to user for decisions
- Provides blind spot analysis

**Critical:** All improvements must pass VERIFY phase before COMMIT

## 📚 Related Documentation

**Core Specs:**
- .claude/commands/fullservice.md (lines 1-956) - Complete command specification
- .claude/agents/orchestrator.md - Agent coordination matrix
- .claude/AGENTS.md - All 18 specialist agents

**Memory System:**
- .claude/memory/README.md - Memory management patterns
- .claude/memory/quick-context.md - Session checkpoints (500 lines)
- .claude/memory/full-context.md - Milestone tracking (2000 lines)

**Quality Gates:**
- node scripts/validate.mjs contamination - Stage boundary enforcement
- .claude/scripts/verify-improvements.sh - Improvement testing
- .claude/docs/contamination-web.md - Web stage anti-patterns

**Operational Rules:**
- CLAUDE.md - Autonomous operation guidelines
- .claude/docs/anti-patterns.md - Common mistakes to avoid
- AGENTS.md - Agent coordination playbook
