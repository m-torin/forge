# Memory Management Guide

> **Purpose**: Document memory discipline and checkpoint patterns for Forge agentic development, matching FandomLens rigor.

## Overview

Memory management is critical for autonomous agent operation. This guide defines:
- When to checkpoint
- What to log
- How to organize context
- Archive strategies

## Memory Files

### quick-context.md (500-line limit)

**Purpose**: Latest session status for immediate context on session start

**When to Update**:
- After completing any major task (>30 minutes of work)
- Before and after specialist delegation
- After fixing bugs or implementing features
- After running tests or builds
- At end of session (current status + next steps)

**Size Management**:
- If exceeds 500 lines: Archive oldest 50% to full-context.md, keep recent 50%

**Format**:
```markdown
# Quick Context - Forge

**Last Updated**: 2025-10-06T16:45:00Z
**Session**: Working on Better Auth organizations

## Current Status
- ✅ Completed: stack-auth agent created
- 🔄 In Progress: Orchestrator coordination matrix
- ⏸️ Blocked: Waiting for schema approval from stack-prisma

## Next Steps
1. Complete orchestrator coordination matrix
2. Update all 15 existing agents to FandomLens rigor
3. Create CI workflow for contamination checks

## Recent Learnings
- Better Auth edge runtime requires getOptimalClient() for Prisma
- Contamination checks catch 90% of stage violations before commit
- Agent delegation reduces orchestrator cognitive load significantly

## Active Specialists
- stack-auth: Implementing edge-compatible middleware
- stack-prisma: Reviewing organization schema
- testing: Writing E2E tests for org flows
```

---

### full-context.md (2000-line limit)

**Purpose**: Milestone checkpoints and major decisions

**When to Update**:
- After completing a full /fullservice cycle (AUDIT → BUILD → VALIDATE → DISCOVER)
- After major architectural decision
- After completing major feature
- Weekly checkpoint (Friday EOD)
- Before starting large refactor

**Size Management**:
- If exceeds 2000 lines: Archive to `archive/full-context-{YYYY-MM}.md`, start fresh

**Format**:
```markdown
# Full Context - Forge Milestones

## Milestone: 18-Agent System Complete (2025-10-06)

### What Was Built
- Created stack-auth agent for Better Auth framework
- Updated orchestrator with 18-agent coordination matrix
- Implemented contamination checks (pre-commit + CI)
- Created /fullservice autonomous command
- Established memory discipline patterns

### Key Decisions
- Use web "stages" (UI, Server, Edge, Packages, Data, Infra) instead of sequential pipeline
- Enforce boundaries via automated contamination checks (block commits)
- stack-auth gets dedicated agent (not just in integrations)
- Coverage thresholds: 50% default, 30-40% for complex infra packages

### Learnings
- Agent coordination matrix reduces ambiguity by 80%
- Contamination checks prevent architectural drift
- Memory discipline enables multi-day autonomous runs
- /fullservice completes 80%+ of features without intervention

### Next Milestone
- Ensure all 18 agents follow consistent patterns
- Create pre-commit hook installer
- Add CI workflow for quality gates
- ETA: 2025-10-10
```

---

### context-index.md

**Purpose**: Index of all context files and their purpose

**When to Update**:
- When creating new context file
- When archiving old context

**Format**:
```markdown
# Context Index

## Active Contexts
- `quick-context.md` - Latest session status (updated daily)
- `full-context.md` - Milestone checkpoints (updated weekly)
- `fullservice-state.json` - /fullservice session state (if running)

## Specialist Learnings
- `stack-auth-learnings.md` - Better Auth patterns and optimizations
- `stack-next-react-learnings.md` - Next.js/React patterns
- `stack-prisma-learnings.md` - Prisma ORM strategies
- `performance-learnings.md` - Performance optimization patterns

## Archived Contexts
- `archive/full-context-2025-09.md` - September 2025 milestones
- `archive/full-context-2025-08.md` - August 2025 milestones
```

---

### {specialist}-learnings.md (1000-line limit per specialist)

**Purpose**: Capture domain-specific knowledge for cross-session reuse

**When to Update**:
- After discovering performance optimization
- After resolving tricky bug
- After architectural decision in specialist's domain
- When specialist wants to "remember" something for future sessions

**Size Management**:
- If exceeds 1000 lines: Archive oldest 30% to `archive/{specialist}-learnings-{YYYY-MM}.md`

**Format**:
```markdown
# Better Auth Learnings (stack-auth)

## Performance Patterns

### Session Validation Optimization (2025-10-06)
**Problem**: Session validation taking 50ms, budget is 10ms
**Solution**: Add Redis caching layer for session lookups
**Result**: 3ms average, 70% under budget
**Code**: `packages/auth/src/server-next.ts:142`

### Edge Runtime Compatibility (2025-10-05)
**Problem**: Standard Prisma client incompatible with edge
**Solution**: Use getOptimalClient({ runtime: 'edge' })
**Result**: Middleware works in Vercel edge
**Code**: `packages/auth/src/server-edge.ts:87`

## Bug Resolutions

### CSRF Token Mismatch (2025-10-04)
**Symptom**: Login fails with "Invalid CSRF token"
**Root Cause**: Cookie sameSite attribute set to 'strict'
**Fix**: Change to 'lax' for OAuth redirects
**Code**: `packages/auth/src/config.ts:64`
**Test**: `pnpm vitest --filter auth -- csrf.test.ts`

## Architectural Decisions

### Dual Export Pattern (2025-10-03)
**Decision**: Export both `/server/next` and `/server/edge` entry points
**Rationale**: Different runtime environments need different implementations
**Trade-offs**: More maintenance overhead, but proper separation of concerns
**Alternative Considered**: Single entry with runtime detection (rejected: brittle)
```

---

## Archive Strategy

### Triggers
- quick-context.md > 500 lines → Move oldest 50% to full-context.md
- full-context.md > 2000 lines → Archive to `archive/full-context-{YYYY-MM}.md`
- specialist-learnings.md > 1000 lines → Archive oldest 30% to `archive/{specialist}-learnings-{YYYY-MM}.md`

### Archive Location
`.claude/memory/archive/{YYYY-MM}/`

### Retention
- Keep last 3 months of full-context archives
- Keep last 6 months of specialist learnings archives
- Delete older archives (compress to summary if needed)

---

## Checkpoint Patterns

### When to Create Checkpoints

**Quick Context** (every major task):
- After each specialist delegation
- Before major refactoring
- At stage boundary modifications
- After successful test completion
- At end of session

**Full Context** (milestones only):
- After completing full feature
- After /fullservice cycle
- After major architectural decision
- Weekly (Friday EOD)
- Before large refactor

### Checkpoint Format (quick-context)

```markdown
## Checkpoint: Before Stage2 Refactor (2025-10-06T14:30:00Z)

**Git Commit**: abc123def
**Build Status**: ✅ Passing (0 errors, 0 warnings)
**Test Status**: ✅ 87% coverage (247 passing, 3 skipped, 0 failures)
**What's Working**: Better Auth edge middleware, organization schema
**What's Next**: Refactor stack-next-react to use RSC streaming
**Rollback Plan**: `git reset --hard abc123def`
```

---

## Memory Usage in /fullservice

During autonomous /fullservice cycles:

1. **Session Start**: Read quick-context.md for latest status
2. **Each Delegation**: Checkpoint to quick-context after specialist reports
3. **Each Discovery**: Log new issues to quick-context with ⏸️ status
4. **Cycle Complete**: Milestone to full-context with summary
5. **Session End**: Final quick-context update with merge instructions

---

## Best Practices

### DO
- ✅ Checkpoint frequently (every major task)
- ✅ Use consistent format (timestamps, status, next steps)
- ✅ Archive proactively (don't wait until limit)
- ✅ Reference file:line in code examples
- ✅ Document decisions with rationale

### DON'T
- ❌ Skip checkpoints (memory loss between sessions)
- ❌ Write novel-length entries (keep concise)
- ❌ Forget to update context-index.md
- ❌ Let files exceed size limits
- ❌ Archive without compression (disk space waste)

---

## Integration with /fullservice

The `/fullservice` command relies heavily on memory:

- **AUDIT phase**: Read quick/full context for gap analysis
- **BUILD phase**: Checkpoint after each specialist completes work
- **VALIDATE phase**: Log test results and metrics
- **DISCOVER phase**: Document new issues found

Without proper memory discipline, /fullservice cannot resume interrupted sessions or learn from past iterations.

---

## Troubleshooting

**Problem**: Session lost context after interruption
**Solution**: Check if quick-context.md was updated before interruption. If not, reconstruct from git log + tool-audit.log

**Problem**: Specialist repeating same mistake
**Solution**: Check if learning was documented in {specialist}-learnings.md. If not, add it now

**Problem**: Can't find decision rationale
**Solution**: Search full-context.md for milestone where decision was made. If not found, document it now

---

*Last updated: 2025-10-06*
*For memory discipline in Forge agentic development*

