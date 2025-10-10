# Orchestrator Extended Guide

**Tier 2 Documentation** - Detailed orchestrator coordination patterns and procedures.

**Quick Reference**: See `.claude/agents/orchestrator.md` for essentials.

---

## Table of Contents

1. [TodoWrite Templates](#todowrite-templates)
2. [Detailed Coordination Scenarios](#detailed-coordination-scenarios)
3. [Automatic Delegation Patterns](#automatic-delegation-patterns)
4. [Verification Loop Procedures](#verification-loop-procedures)
5. [Hand-off & Completion Protocols](#hand-off--completion-protocols)
6. [Escalation Paths](#escalation-paths)
7. [Framework Entrypoints Policy](#framework-entrypoints-policy)
8. [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

## TodoWrite Templates

### Planning Phase Template

```json
{
  "status": "planning",
  "completedTasks": [],
  "blockers": [],
  "nextSteps": [
    {
      "owner": "stack-next-react",
      "task": "Audit route streaming regressions",
      "acceptance": "Identify all routes with streaming issues, document patterns"
    },
    {
      "owner": "testing",
      "task": "Run vitest --filter webapp",
      "acceptance": "All tests pass, coverage ≥50%"
    }
  ],
  "notes": "Reference CLAUDE.md guardrails before edits"
}
```

### Handoff Phase Template

```json
{
  "status": "handoff",
  "completedTasks": [
    {
      "owner": "stack-auth",
      "task": "Implement Better Auth organizations",
      "result": "RBAC schema added, middleware updated, tests passing"
    }
  ],
  "blockers": [],
  "nextSteps": [
    {
      "owner": "stack-next-react",
      "task": "Integrate org context in App Router",
      "acceptance": "Organization context available in server components",
      "dependencies": ["stack-auth completion"],
      "handoff": {
        "from": "stack-auth",
        "files": ["packages/auth/src/server-next.ts", "packages/auth/src/middleware.ts"],
        "tests": "pnpm vitest --filter @repo/auth -- org.test.ts",
        "docs": "Added organization RBAC to auth AI hint"
      }
    }
  ],
  "notes": "stack-auth → stack-next-react: Middleware exports ready at @repo/auth/server/next"
}
```

### Blocked Phase Template

```json
{
  "status": "blocked",
  "completedTasks": [...],
  "blockers": [
    {
      "owner": "stack-prisma",
      "task": "Add User.organization relation",
      "blocker": "Schema migration requires production approval",
      "impact": "Cannot proceed with organization features",
      "escalation": "User review needed for migration plan"
    }
  ],
  "nextSteps": [],
  "notes": "Waiting for approval on .claude/memory/migration-plan-20251006.md"
}
```

### Completion Phase Template

```json
{
  "status": "completed",
  "completedTasks": [
    {
      "owner": "stack-auth",
      "task": "Implement Better Auth organizations",
      "result": "✅ Complete - 87% test coverage"
    },
    {
      "owner": "stack-next-react",
      "task": "Integrate org context in App Router",
      "result": "✅ Complete - Organization context available"
    },
    {
      "owner": "testing",
      "task": "E2E tests for organization flows",
      "result": "✅ Complete - 15 scenarios covered"
    }
  ],
  "blockers": [],
  "nextSteps": [],
  "notes": "Session complete. See .claude/memory/session-report-20251006.md for summary."
}
```

---

## Detailed Coordination Scenarios

### Scenario 1: Adding Better Auth Organizations (Complete)

```
PHASE 1: Schema & Core Logic
orchestrator → stack-prisma:
  Task: "Add Organization model with role-based permissions"
  Success criteria: Schema valid, migrations created, fragments exported

stack-prisma → orchestrator:
  Deliverable: Organization schema with Role/Permission relations
  Files: prisma/schema.prisma, prisma/migrations/*, generated/fragments/organization.ts
  Tests: pnpm vitest --filter @repo/db-prisma -- organization.test.ts

orchestrator → stack-auth:
  Task: "Implement Better Auth organization RBAC"
  Handoff from stack-prisma: Organization schema + fragments
  Success criteria: Middleware validates org context, session includes org data

stack-auth → orchestrator:
  Deliverable: Organization middleware, session helpers
  Files: packages/auth/src/server-next.ts, src/middleware.ts, src/organizations.ts
  Tests: pnpm vitest --filter @repo/auth -- org-middleware.test.ts
  Coverage: 89%

PHASE 2: Integration
orchestrator → stack-next-react:
  Task: "Make organization context available in App Router"
  Handoff from stack-auth: Middleware exports, session helpers
  Success criteria: getOrganization() works in server components

stack-next-react → orchestrator:
  Deliverable: Organization context utilities
  Files: apps/webapp/src/lib/organization.ts
  Tests: pnpm vitest --filter webapp -- organization-context.test.ts

PHASE 3: Testing & Documentation
orchestrator → testing:
  Task: "E2E tests for organization flows"
  Context: Organization RBAC fully implemented
  Success criteria: 15+ scenarios covered, all passing

testing → orchestrator:
  Deliverable: E2E test suite
  Files: apps/webapp/__tests__/e2e/organizations.spec.ts
  Results: 15/15 passing, 100% critical path coverage

orchestrator → docs:
  Task: "Document organization RBAC patterns"
  Context: Complete implementation across stack-auth, stack-prisma, stack-next-react
  Success criteria: AI hint created, examples provided

docs → orchestrator:
  Deliverable: Organization AI hint
  Files: apps/docs/ai-hints/better-auth-organizations.mdx
  Content: API examples, RBAC patterns, common pitfalls

COMPLETION
orchestrator → user:
  Summary: Better Auth organizations implemented
  - Schema: Organization, Role, Permission models
  - Auth: Middleware + session integration
  - App: Context available in server components
  - Tests: E2E suite with 100% critical path coverage
  - Docs: AI hint for future reference
  Metrics: 4 specialists coordinated, 87% avg coverage, 0 violations
```

### Scenario 2: Performance Optimization (Multi-Specialist)

```
DISCOVERY
orchestrator → performance:
  Task: "Profile /dashboard load time (reported slow by user)"
  Success criteria: Identify bottlenecks with measurements

performance → orchestrator:
  Findings:
  1. RSC streaming not optimal (stack-next-react domain)
  2. N+1 queries in UserList component (stack-prisma domain)
  3. Bundle size 450KB (should be <300KB) (foundations domain)
  Recommendation: Parallel delegation to 3 specialists

PARALLEL REMEDIATION
orchestrator → stack-next-react:
  Task: "Optimize RSC streaming for /dashboard"
  Finding: Waterfall pattern causing 800ms delay
  Success criteria: Parallel streaming, <200ms to first component

orchestrator → stack-prisma:
  Task: "Eliminate N+1 queries in UserList"
  Finding: 50 queries for 50 users (should be 2-3 queries)
  Success criteria: Use fragments with proper includes, <3 queries total

orchestrator → foundations:
  Task: "Reduce /dashboard bundle size"
  Finding: 450KB (includes unused Mantine components)
  Success criteria: Tree-shake Mantine, code-split heavy deps, target <300KB

[Specialists work in parallel]

VALIDATION
stack-next-react → orchestrator:
  Result: ✅ Streaming optimized, 800ms → 120ms

stack-prisma → orchestrator:
  Result: ✅ Queries reduced, 50 queries → 2 queries

foundations → orchestrator:
  Result: ✅ Bundle optimized, 450KB → 280KB

VERIFICATION
orchestrator → performance:
  Task: "Re-profile /dashboard after optimizations"
  Success criteria: Load time <1s (was 2.1s)

performance → orchestrator:
  Result: ✅ Load time now 0.8s (62% improvement)
  Breakdown:
  - RSC streaming: 120ms (was 800ms)
  - Data fetching: 200ms (was 1100ms)
  - JS execution: 480ms (was 200ms) ⚠️ slight regression from bundle changes
  Overall: Acceptable trade-off, user-facing metrics improved

DOCUMENTATION
orchestrator → docs:
  Task: "Document performance optimization patterns"
  Context: 3 specialists coordinated fix
  Success criteria: Patterns captured for future reference

docs → orchestrator:
  Result: ✅ AI hint created with RSC streaming, query optimization, bundle patterns
```

### Scenario 3: Type Safety Upgrade (Broadcast Delegation)

```
PLANNING
orchestrator → typescript:
  Task: "Analyze codebase for strict mode readiness"
  Success criteria: Categorize violations, create prioritized plan

typescript → orchestrator:
  Analysis:
  - 247 total violations across 42 files
  - Categories: implicit any (120), unsafe casts (87), missing nullability (40)
  - High priority: stack-auth (35 violations), stack-prisma (28), integrations (24)
  - Medium priority: stack-next-react (18), stack-ai (15)
  - Low priority: Others (127 violations, mostly test files)

  Recommendation: Fix high-priority packages first (87 violations), enables strict mode for critical paths

BROADCAST DELEGATION (Parallel)
orchestrator → stack-auth:
  Task: "Fix 35 type violations for strict mode"
  Details: 15 implicit any, 12 unsafe casts, 8 missing nullability
  Success criteria: 0 errors with strict: true

orchestrator → stack-prisma:
  Task: "Fix 28 type violations for strict mode"
  Details: 8 implicit any, 18 unsafe casts (mostly Prisma types), 2 nullability
  Success criteria: 0 errors with strict: true

orchestrator → integrations:
  Task: "Fix 24 type violations for strict mode"
  Details: 20 implicit any (mostly Stripe/Hotelbeds SDKs), 4 unsafe casts
  Success criteria: 0 errors with strict: true

[Specialists work in parallel, each fixes their domain]

PROGRESS TRACKING
orchestrator: Monitors TodoWrite, specialists report completion:
- stack-auth: ✅ 35 violations → 0 (took 45 min)
- stack-prisma: ⚠️ 28 violations → 3 remaining (Prisma type issue, escalated to typescript)
- integrations: ✅ 24 violations → 0 (took 60 min)

ESCALATION RESOLUTION
orchestrator → typescript:
  Task: "Resolve 3 Prisma type violations blocking strict mode"
  Context: stack-prisma found Prisma client types incompatible with strict: true
  Success criteria: Solution that works for all Prisma usage

typescript → stack-prisma:
  Solution: Add custom type utilities for Prisma client
  Files: packages/typescript-config/prisma-types.d.ts
  Pattern: Wrap Prisma generated types in strict-mode-safe wrappers

stack-prisma: Applies solution
  Result: ✅ 3 remaining violations → 0

ACTIVATION
orchestrator → typescript:
  Task: "Enable strict mode for high-priority packages"
  Success criteria: All 3 packages compile with strict: true

typescript → orchestrator:
  Result: ✅ Strict mode enabled
  Files: packages/auth/tsconfig.json, packages/pkgs-databases/prisma/tsconfig.json, packages/integrations/tsconfig.json
  Verification: pnpm typecheck passed for all 3 packages

NEXT ITERATION PLANNING
orchestrator → typescript:
  Task: "Create plan for remaining 160 violations"
  Priority: Medium and low priority packages

typescript → orchestrator:
  Plan: Iterative approach over next 3 sessions
  - Session 2: stack-next-react (18), stack-ai (15) - 33 violations
  - Session 3: Remaining packages (127 violations, mostly test files, low risk)
```

---

## Automatic Delegation Patterns

### Trigger: Type Error Explosion

**Condition**: >10 type errors in a single package after a change

**Pattern**:
```typescript
// Detect explosion
const typeErrors = await Bash({
  cwd: worktreePath,
  command: 'pnpm typecheck --filter @repo/auth 2>&1 | grep "error TS" | wc -l'
});

const count = parseInt(typeErrors.stdout.trim());

if (count > 10) {
  // Automatic delegation
  await TodoWrite({
    todos: [...existingTodos, {
      content: `Fix ${count} type errors in @repo/auth`,
      status: 'handoff',
      activeForm: `Fixing type errors in @repo/auth`,
      owner: 'typescript',
      details: `${count} type errors detected after recent changes`,
      acceptance: 'All type errors resolved, pnpm typecheck passes'
    }]
  });

  await Task({
    subagent_type: 'typescript',
    description: `Fix ${count} type errors in @repo/auth`,
    prompt: `You are the typescript specialist.

CONTEXT:
- Package: @repo/auth
- Type errors: ${count}
- Triggered by: Recent changes to Better Auth integration

TASK:
Fix all type errors in @repo/auth to restore type safety.

Run this to see errors:
cd ${worktreePath} && pnpm typecheck --filter @repo/auth

SUCCESS CRITERIA:
- pnpm typecheck --filter @repo/auth passes
- No unsafe type assertions introduced
- Document any breaking changes

HANDOFF:
Return to orchestrator when complete with summary of fixes.`
  });

  // End current BUILD round
  console.log('Type error explosion detected. Delegated to typescript specialist.');
  console.log('Ending BUILD phase, proceeding to DISCOVER.');

  return 'proceed_to_discover';
}
```

### Trigger: Token Budget Exceeded

**Condition**: Token usage >80% with outstanding blockers

**Pattern**:
```typescript
// Check token usage
const tokenUsage = getTokenUsage(); // Hypothetical function
const tokenLimit = 200000;
const usagePercent = (tokenUsage / tokenLimit) * 100;

if (usagePercent > 80 && hasOutstandingBlockers()) {
  // Identify highest-impact blocker
  const blockers = getBlockersFromTodoWrite();
  const highestImpact = blockers.sort((a, b) => b.impact - a.impact)[0];

  // Automatic delegation
  await TodoWrite({
    todos: [...existingTodos, {
      content: `Resolve blocker: ${highestImpact.task}`,
      status: 'handoff',
      activeForm: `Resolving blocker`,
      owner: highestImpact.owner,
      details: `Token budget exceeded (${usagePercent}%). Delegating highest-impact blocker.`,
      acceptance: highestImpact.acceptance
    }]
  });

  await Task({
    subagent_type: highestImpact.owner,
    description: `Resolve blocker: ${highestImpact.task}`,
    prompt: `You are the ${highestImpact.owner} specialist.

CRITICAL: Token budget exceeded. This is the highest-impact blocker.

TASK: ${highestImpact.task}
DETAILS: ${highestImpact.details}
SUCCESS CRITERIA: ${highestImpact.acceptance}

Work efficiently. Return to orchestrator when complete.`
  });

  // Checkpoint and end session
  console.log('Token budget exceeded. Delegated highest-impact blocker and ending session.');
  await memory.write({
    quickContext: {
      status: 'token_limit_reached',
      delegatedTo: highestImpact.owner,
      remainingBlockers: blockers.length - 1
    }
  });

  return 'end_session';
}
```

### Trigger: CI-Wide Failure

**Condition**: CI failures traceable to specific domain

**Pattern**:
```typescript
// Detect CI failure
const ciStatus = await Bash({
  cwd: worktreePath,
  command: 'pnpm repo:preflight 2>&1'
});

if (ciStatus.exitCode !== 0) {
  // Parse failure output to identify domain
  const output = ciStatus.stderr + ciStatus.stdout;

  let failedDomain = null;
  let specialist = null;

  if (output.includes('@repo/db-prisma')) {
    failedDomain = '@repo/db-prisma';
    specialist = 'stack-prisma';
  } else if (output.includes('contamination')) {
    failedDomain = 'stage boundaries';
    specialist = 'foundations';
  } else if (output.includes('playwright')) {
    failedDomain = 'E2E tests';
    specialist = 'testing';
  }
  // ... more domain detection logic

  if (specialist) {
    // Automatic delegation
    await TodoWrite({
      todos: [...existingTodos, {
        content: `Fix CI failure in ${failedDomain}`,
        status: 'handoff',
        activeForm: `Fixing CI failure`,
        owner: specialist,
        details: `CI failure detected: ${output.slice(0, 500)}`,
        acceptance: 'pnpm repo:preflight passes'
      }]
    });

    await Task({
      subagent_type: specialist,
      description: `Fix CI failure in ${failedDomain}`,
      prompt: `You are the ${specialist} specialist.

CRITICAL: CI failure blocking progress.

FAILURE OUTPUT:
${output}

TASK:
Diagnose and fix the CI failure in ${failedDomain}.

Run this to reproduce:
cd ${worktreePath} && pnpm repo:preflight

SUCCESS CRITERIA:
- pnpm repo:preflight passes
- No new violations introduced
- Root cause documented

HANDOFF:
Return to orchestrator when complete with root cause analysis.`
    });

    return 'delegated_to_specialist';
  }
}
```

---

## Verification Loop Procedures

### After Each Specialist Round

**Step 1: Review Changes**
```typescript
// Get diff from specialist's work
const diff = await mcp__git__git_diff({
  cwd: worktreePath
});

// Check for scope creep
const changedFiles = parseDiff(diff);
const expectedDomain = getSpecialistDomain(currentSpecialist);

for (const file of changedFiles) {
  if (!isInDomain(file, expectedDomain)) {
    console.warn(`⚠️ SCOPE CREEP: ${currentSpecialist} modified ${file} outside their domain`);
    await TodoWrite({
      todos: [...existingTodos, {
        content: `Review scope creep: ${file}`,
        status: 'pending',
        activeForm: 'Reviewing scope creep'
      }]
    });
  }
}

// Check for layering violations
for (const file of changedFiles) {
  if (hasLayeringViolation(file, diff)) {
    console.error(`❌ LAYERING VIOLATION: ${file}`);
    await TodoWrite({
      todos: [...existingTodos, {
        content: `Fix layering violation in ${file}`,
        status: 'blocked',
        activeForm: 'Fixing violation'
      }]
    });
  }
}

// Check for guardrail issues
const violations = await Bash({
  cwd: worktreePath,
  command: 'node scripts/validate.mjs contamination 2>&1'
});

if (violations.exitCode !== 0) {
  console.error(`❌ GUARDRAIL VIOLATION:\n${violations.stdout}`);
  await TodoWrite({
    todos: [...existingTodos, {
      content: `Fix contamination violations`,
      status: 'blocked',
      activeForm: 'Fixing contamination'
    }]
  });
}
```

**Step 2: Trigger Automation Hooks**
```typescript
// Determine affected scope
const scopeResult = await Bash({
  cwd: worktreePath,
  command: `node scripts/detect-scope.mjs "${changedFiles.join(' ')}"`
});

const scope = scopeResult.stdout.trim() || '.';

// Run appropriate hooks based on changes
const hooks = determineHooks(changedFiles);

for (const hook of hooks) {
  if (hook === 'lint') {
    await Bash({
      cwd: worktreePath,
      command: `pnpm lint --filter "${scope}"`
    });
  } else if (hook === 'typecheck') {
    await Bash({
      cwd: worktreePath,
      command: `pnpm typecheck --filter "${scope}"`
    });
  } else if (hook === 'test') {
    await Bash({
      cwd: worktreePath,
      command: `pnpm vitest --filter "${scope}" --run`
    });
  } else if (hook === 'prisma-format') {
    await Bash({
      cwd: worktreePath,
      command: 'pnpm prisma format'
    });
  } else if (hook === 'prisma-validate') {
    await Bash({
      cwd: worktreePath,
      command: 'pnpm prisma validate'
    });
  } else if (hook === 'prisma-generate') {
    await Bash({
      cwd: worktreePath,
      command: 'pnpm --filter @repo/db-prisma prisma generate'
    });
  } else if (hook === 'storybook-smoke') {
    await Bash({
      cwd: worktreePath,
      command: 'pnpm turbo run storybook:smoke --filter uix-system'
    });
  } else if (hook === 'playwright') {
    await Bash({
      cwd: worktreePath,
      command: 'pnpm playwright test --project=chromium'
    });
  }
}
```

**Step 3: Record Results**
```typescript
// Update quick-context
await memory.write({
  quickContext: {
    ...existingContext,
    latestVerification: {
      specialist: currentSpecialist,
      timestamp: new Date().toISOString(),
      scope,
      hooks: hooks.map(h => h.name),
      results: hooks.map(h => ({
        hook: h.name,
        status: h.passed ? 'passed' : 'failed',
        output: h.output
      }))
    }
  }
});

// Update TodoWrite
const allPassed = hooks.every(h => h.passed);
await TodoWrite({
  todos: existingTodos.map(t =>
    t.owner === currentSpecialist && t.status === 'in_progress'
      ? { ...t, status: allPassed ? 'completed' : 'needs-fix' }
      : t
  )
});

// Append to tool-audit.log
await Bash({
  cwd: worktreePath,
  command: `echo "[$(date -Iseconds)] VERIFICATION ${currentSpecialist}: ${allPassed ? 'PASSED' : 'FAILED'} (${hooks.length} hooks)" >> .claude/memory/tool-audit.log`
});
```

**Step 4: Decide Next Action**
```typescript
if (allPassed) {
  // Move to next specialist or phase
  if (hasMoreWork()) {
    console.log('✅ Verification passed. Continuing to next task.');
    return 'continue';
  } else {
    console.log('✅ All work complete. Proceeding to DISCOVER phase.');
    return 'proceed_to_discover';
  }
} else {
  // Handle failures
  const failedHooks = hooks.filter(h => !h.passed);

  if (isSimpleFix(failedHooks)) {
    console.log('⚠️ Simple fix needed. Asking specialist to retry.');
    await Task({
      subagent_type: currentSpecialist,
      description: 'Fix verification failures',
      prompt: `Previous work had verification failures:\n${failedHooks.map(h => h.output).join('\n\n')}\n\nFix these issues and re-verify.`
    });
    return 'retry_specialist';
  } else {
    console.log('❌ Complex failures. Escalating.');
    await TodoWrite({
      todos: [...existingTodos, {
        content: `Escalate verification failures from ${currentSpecialist}`,
        status: 'blocked',
        activeForm: 'Escalating failures'
      }]
    });
    return 'escalate';
  }
}
```

---

## Hand-off & Completion Protocols

### Stage Gates

**UI → Data → Shared Services**

```typescript
// Stage 1: UI validation must pass before data changes
async function validateUIStage() {
  console.log('Stage 1: UI Validation');

  // Run UI-specific checks
  const lintResult = await Bash({
    cwd: worktreePath,
    command: 'pnpm lint --filter "./apps/*"'
  });

  const storybookResult = await Bash({
    cwd: worktreePath,
    command: 'pnpm turbo run storybook:smoke --filter uix-system'
  });

  const typecheckResult = await Bash({
    cwd: worktreePath,
    command: 'pnpm typecheck --filter "./apps/*"'
  });

  if (lintResult.exitCode !== 0 || storybookResult.exitCode !== 0 || typecheckResult.exitCode !== 0) {
    console.error('❌ UI stage validation failed. Cannot proceed to data changes.');
    return false;
  }

  console.log('✅ UI stage validation passed. Proceeding to data stage.');
  return true;
}

// Stage 2: Data validation must pass before shared services
async function validateDataStage() {
  console.log('Stage 2: Data Validation');

  // Run data-specific checks
  const prismaValidate = await Bash({
    cwd: worktreePath,
    command: 'pnpm prisma validate'
  });

  const dbTypecheck = await Bash({
    cwd: worktreePath,
    command: 'pnpm typecheck --filter @repo/db-prisma'
  });

  const dbTests = await Bash({
    cwd: worktreePath,
    command: 'pnpm vitest --filter @repo/db-prisma --run'
  });

  if (prismaValidate.exitCode !== 0 || dbTypecheck.exitCode !== 0 || dbTests.exitCode !== 0) {
    console.error('❌ Data stage validation failed. Cannot proceed to shared services.');
    return false;
  }

  console.log('✅ Data stage validation passed. Proceeding to shared services.');
  return true;
}

// Stage 3: Shared services validation
async function validateSharedServicesStage() {
  console.log('Stage 3: Shared Services Validation');

  // Run shared services checks
  const authTests = await Bash({
    cwd: worktreePath,
    command: 'pnpm vitest --filter @repo/auth --run'
  });

  const integrationTests = await Bash({
    cwd: worktreePath,
    command: 'pnpm vitest --filter @repo/integrations --run'
  });

  if (authTests.exitCode !== 0 || integrationTests.exitCode !== 0) {
    console.error('❌ Shared services stage validation failed.');
    return false;
  }

  console.log('✅ Shared services validation passed.');
  return true;
}

// Enforce stage gates
if (await validateUIStage() &&
    await validateDataStage() &&
    await validateSharedServicesStage()) {
  console.log('✅ All stage gates passed. Ready for final verification.');
  return 'ready_for_completion';
} else {
  console.log('❌ Stage gate failures. Cannot proceed to completion.');
  return 'blocked';
}
```

### Specialist Engagement Requirements

**Before closing tasks, engage required specialists:**

```typescript
const specialistEngagementRules = {
  // High-risk commands require explicit approval
  highRiskCommands: {
    specialists: ['security', 'infra'],
    trigger: [
      'terraform apply',
      'secret rotation',
      'production migration',
      'database schema change'
    ],
    action: 'explicit_approval_in_quick_context'
  },

  // User-facing updates require docs
  userFacingUpdates: {
    specialists: ['docs'],
    trigger: [
      'new feature added',
      'API changed',
      'CLI command updated',
      'configuration pattern changed'
    ],
    action: 'update_ai_hints'
  },

  // Performance-sensitive changes require metrics
  performanceChanges: {
    specialists: ['performance'],
    trigger: [
      'bundle size changed',
      'new async operation',
      'caching strategy changed',
      'database query pattern changed'
    ],
    action: 'profile_and_measure'
  },

  // Security-sensitive changes require audit
  securityChanges: {
    specialists: ['security'],
    trigger: [
      'authentication flow changed',
      'authorization logic changed',
      'secrets handling changed',
      'input validation changed'
    ],
    action: 'security_review'
  }
};

// Check if engagement needed
async function checkSpecialistEngagement(changedFiles, changeDescription) {
  const requiredEngagements = [];

  for (const [category, rules] of Object.entries(specialistEngagementRules)) {
    for (const trigger of rules.trigger) {
      if (changeDescription.toLowerCase().includes(trigger.toLowerCase())) {
        requiredEngagements.push({
          category,
          specialists: rules.specialists,
          action: rules.action
        });
      }
    }
  }

  if (requiredEngagements.length > 0) {
    console.log(`⚠️ Required specialist engagement: ${requiredEngagements.map(e => e.specialists.join(', ')).join(', ')}`);

    for (const engagement of requiredEngagements) {
      for (const specialist of engagement.specialists) {
        await Task({
          subagent_type: specialist,
          description: `${engagement.action} for ${changeDescription}`,
          prompt: `You are the ${specialist} specialist.

CONTEXT:
Changes made: ${changeDescription}
Files changed: ${changedFiles.join(', ')}

TASK:
Perform ${engagement.action} for these changes.

Return findings to orchestrator.`
        });
      }
    }

    return 'engagement_required';
  }

  return 'no_engagement_needed';
}
```

### Completion Criteria

**Session completes only when:**

```typescript
async function checkCompletionCriteria() {
  const criteria = {
    blockingGapsResolved: false,
    verificationPassed: false,
    quickContextUpdated: false,
    fullContextUpdated: false,
    remediationReportCreated: false,
    mergeInstructionsDocumented: false
  };

  // 1. Check for blocking gaps
  const todos = await getTodosFromTodoWrite();
  const blockers = todos.filter(t => t.status === 'blocked' || t.status === 'needs-fix');
  criteria.blockingGapsResolved = blockers.length === 0;

  // 2. Check verification passed
  const verificationResult = await Bash({
    cwd: worktreePath,
    command: 'pnpm repo:preflight 2>&1'
  });
  criteria.verificationPassed = verificationResult.exitCode === 0;

  // 3. Check quick-context updated
  const quickContext = await Read({
    file_path: `${worktreePath}/.claude/memory/quick-context.md`
  });
  criteria.quickContextUpdated = quickContext.includes(new Date().toISOString().split('T')[0]);

  // 4. Check full-context updated (if major work)
  if (isMajorFeature) {
    const fullContext = await Read({
      file_path: `${worktreePath}/.claude/memory/full-context.md`
    });
    criteria.fullContextUpdated = fullContext.includes('## Milestone:');
  } else {
    criteria.fullContextUpdated = true; // Not required for minor work
  }

  // 5. Check remediation report exists
  try {
    await Read({
      file_path: `${worktreePath}/.claude/memory/session-report-${timestamp}.md`
    });
    criteria.remediationReportCreated = true;
  } catch {
    criteria.remediationReportCreated = false;
  }

  // 6. Check merge instructions documented
  const sessionReport = await Read({
    file_path: `${worktreePath}/.claude/memory/session-report-${timestamp}.md`
  });
  criteria.mergeInstructionsDocumented = sessionReport.includes('## Merge Instructions');

  // Report status
  console.log('Completion Criteria:');
  for (const [criterion, met] of Object.entries(criteria)) {
    console.log(`${met ? '✅' : '❌'} ${criterion}`);
  }

  const allMet = Object.values(criteria).every(v => v === true);

  if (allMet) {
    console.log('\n✅ All completion criteria met. Session can be completed.');
    return true;
  } else {
    console.log('\n❌ Not all criteria met. Session cannot be completed yet.');
    return false;
  }
}
```

---

## Escalation Paths

### LLM-as-Judge for Architecture Disagreements

**When to use**: Specialists disagree on architecture or security decisions

**Pattern**:
```typescript
async function escalateToLLMJudge(disagreement) {
  const { specialist1, specialist2, topic, position1, position2 } = disagreement;

  console.log(`⚠️ Escalating ${topic} disagreement between ${specialist1} and ${specialist2} to LLM-as-judge`);

  // Create case file
  const caseFile = `${worktreePath}/.claude/memory/llm-judge-${timestamp}.md`;
  await Write({
    file_path: caseFile,
    content: `# LLM-as-Judge Case - ${timestamp}

## Topic
${topic}

## Disagreement

### ${specialist1}'s Position
${position1}

### ${specialist2}'s Position
${position2}

## Context
- Repository: Forge Forge
- Date: ${new Date().toISOString()}
- Escalated by: orchestrator

## Required Verdict

Please analyze both positions and provide:
1. **Winner**: Which position is technically superior?
2. **Rationale**: Why this position is better (security, performance, maintainability)
3. **Implementation**: Specific steps to implement the winning approach
4. **Trade-offs**: What are we giving up by not choosing the other approach?

## Constraints
- Must honor CLAUDE.md guardrails
- Must respect stage contamination boundaries
- Must be production-ready (not experimental)
`
  });

  // Invoke LLM-as-judge workflow
  const verdict = await Task({
    subagent_type: 'general-purpose', // Or dedicated judge agent
    description: 'Arbitrate technical disagreement',
    prompt: `You are an impartial technical judge for the Forge Forge repository.

Read the case file at ${caseFile} and provide a clear verdict on which technical approach is superior.

Your verdict must be:
1. Technically sound
2. Production-ready
3. Aligned with repository constraints (CLAUDE.md)
4. Maintainable long-term

Provide your verdict in the case file under ## Verdict section.`
  });

  // Read verdict
  const updatedCase = await Read({ file_path: caseFile });
  const verdictSection = extractSection(updatedCase, '## Verdict');

  // Store verdict ID in memory
  await memory.write({
    quickContext: {
      ...existingContext,
      llmJudgeVerdicts: [
        ...(existingContext.llmJudgeVerdicts || []),
        {
          timestamp,
          topic,
          specialists: [specialist1, specialist2],
          verdictFile: caseFile,
          winner: parseWinner(verdictSection)
        }
      ]
    }
  });

  // Inform specialists
  console.log(`✅ Verdict rendered. Winner: ${parseWinner(verdictSection)}`);
  console.log(`See ${caseFile} for full rationale.`);

  return parseWinner(verdictSection);
}
```

### Human Review for Approval Denials

**When to use**: Approvals denied or guardrails cannot be honored

**Pattern**:
```typescript
async function requestHumanReview(issue) {
  const { type, description, blockedWork, guardrailViolated } = issue;

  console.log(`⚠️ Requesting human review for: ${type}`);

  // Create review request
  const reviewFile = `${worktreePath}/.claude/memory/review-request-${timestamp}.md`;
  await Write({
    file_path: reviewFile,
    content: `# Human Review Request - ${timestamp}

## Issue Type
${type}

## Description
${description}

## Blocked Work
${blockedWork}

## Guardrail Violated (if applicable)
${guardrailViolated || 'N/A'}

## Orchestrator Recommendation
Please review and provide one of:
1. **APPROVE**: Override guardrail with justification
2. **DENY**: Reject the approach, suggest alternative
3. **DEFER**: Postpone decision to future session

## Context
- Repository: Forge Forge
- Worktree: ${worktreePath}
- Branch: ${branchName}
- Session: ${timestamp}
`
  });

  // Update TodoWrite with blocker
  await TodoWrite({
    todos: [...existingTodos, {
      content: `BLOCKED: Awaiting human review`,
      status: 'blocked',
      activeForm: 'Awaiting review',
      details: `Review request: ${reviewFile}`,
      escalation: 'human_review_required'
    }]
  });

  // Update quick-context
  await memory.write({
    quickContext: {
      ...existingContext,
      status: 'paused_for_review',
      reviewRequest: {
        timestamp,
        file: reviewFile,
        type,
        description
      }
    }
  });

  // Pause work
  console.log(`⏸️ Work paused. Awaiting human review at ${reviewFile}`);
  console.log('Session will resume when review is complete.');

  return 'paused';
}
```

### Automation Failure Coordination

**When to use**: Automation fails repeatedly

**Pattern**:
```typescript
async function coordinateAutomationFix(failure) {
  const { hook, attempts, lastError } = failure;

  if (attempts >= 3) {
    console.log(`⚠️ Hook ${hook} failed ${attempts} times. Coordinating with foundations/agentic.`);

    // Delegate to appropriate specialist
    const specialist = hook.includes('prisma') ? 'stack-prisma' :
                      hook.includes('storybook') ? 'stack-tailwind-mantine' :
                      hook.includes('playwright') ? 'testing' :
                      'foundations';

    await Task({
      subagent_type: specialist,
      description: `Fix failing ${hook} hook`,
      prompt: `You are the ${specialist} specialist.

CRITICAL: Automation hook failing repeatedly.

Hook: ${hook}
Attempts: ${attempts}
Last error: ${lastError}

TASK:
Diagnose why ${hook} is failing and fix it.

This is blocking all progress. Fix must be reliable.

Return to orchestrator when hook passes consistently.`
    });

    // If specialist can't fix, escalate to foundations/agentic
    if (stillFailing) {
      await Task({
        subagent_type: 'agentic',
        description: 'Adjust hook execution',
        prompt: `The ${hook} automation hook is failing despite ${specialist} specialist attempts.

Last error: ${lastError}

TASK:
Adjust hook execution to be more resilient. Options:
1. Add retry logic
2. Add timeout handling
3. Add error context capture
4. Update hook invocation pattern

Return to orchestrator with solution.`
      });
    }

    return 'coordinating_fix';
  }

  return 'retrying';
}
```

---

## Framework Entrypoints Policy

### Allowlist Management

**Current allowlisted packages:**
- `@repo/auth` - May import Next.js in server-next.ts, server-edge.ts, client-next.ts

**How to add new package to allowlist:**

```typescript
// 1. Verify need is legitimate
// Package must have genuine need for framework-specific entrypoints
// (e.g., provides middleware, uses Next.js-specific APIs)

// 2. Update validate.mjs contamination checks
await Edit({
  file_path: `${worktreePath}/scripts/validate.mjs`,
  old_string: `// Allowlisted packages (may import Next.js)
const ALLOWLIST = ['@repo/auth'];`,
  new_string: `// Allowlisted packages (may import Next.js)
const ALLOWLIST = ['@repo/auth', '@repo/new-package'];`
});

// 3. Document in orchestrator.md
await Edit({
  file_path: `${worktreePath}/.claude/agents/orchestrator.md`,
  old_string: `- Current allowlisted packages: \`@repo/auth\``,
  new_string: `- Current allowlisted packages: \`@repo/auth\`, \`@repo/new-package\` (reason: provides Next.js middleware)`
});

// 4. Add to package exports
await Edit({
  file_path: `${worktreePath}/packages/new-package/package.json`,
  old_string: `"exports": {
    "./server": "./src/server.ts",
    "./client": "./src/client.ts"
  }`,
  new_string: `"exports": {
    "./server": "./src/server.ts",
    "./server/next": "./src/server-next.ts",
    "./server/edge": "./src/server-edge.ts",
    "./client": "./src/client.ts",
    "./client/next": "./src/client-next.ts"
  }`
});

// 5. Verify contamination checks still pass
await Bash({
  cwd: worktreePath,
  command: 'node scripts/validate.mjs contamination'
});
```

### Enforcement

**Contamination checks enforce the allowlist:**

```bash
# In validate.mjs (contamination validator)

# Check for Next.js imports in packages
for PKG in packages/*/src; do
  PKG_NAME=$(basename $(dirname $PKG))

  # Skip if on allowlist
  if echo "$ALLOWLIST" | grep -q "@repo/$PKG_NAME"; then
    continue
  fi

  # Check for Next.js imports
  if rg "from ['\"]next/" "$PKG"; then
    echo "❌ Packages: Next.js import in $PKG (not on allowlist)"
    exit 1
  fi
done
```

---

## Troubleshooting Common Issues

### Issue: Specialist Scope Creep

**Symptoms**: Specialist modifies files outside their domain

**Diagnosis**:
```typescript
const diff = await mcp__git__git_diff({ cwd: worktreePath });
const changedFiles = parseDiff(diff);
const specialistDomain = getSpecialistDomain(currentSpecialist);

for (const file of changedFiles) {
  if (!isInDomain(file, specialistDomain)) {
    console.warn(`⚠️ SCOPE CREEP: ${currentSpecialist} modified ${file}`);
  }
}
```

**Resolution**:
1. Revert out-of-scope changes
2. Delegate properly to appropriate specialist
3. Update specialist spec with clearer boundaries

### Issue: Parallel Specialist Conflicts

**Symptoms**: Two specialists modify same file simultaneously

**Diagnosis**: Git merge conflicts or unexpected changes

**Resolution**:
```typescript
// Before parallel delegation, identify potential conflicts
const proposedTasks = [
  { specialist: 'stack-auth', files: ['auth/server.ts', 'auth/middleware.ts'] },
  { specialist: 'stack-next-react', files: ['app/layout.tsx', 'auth/middleware.ts'] }
];

const conflicts = findFileConflicts(proposedTasks);

if (conflicts.length > 0) {
  console.log(`⚠️ Potential conflicts: ${conflicts.join(', ')}`);
  console.log('Running specialists sequentially instead of parallel.');

  // Run sequentially
  await Task({ subagent_type: 'stack-auth', ...task1 });
  // Wait for completion
  await Task({ subagent_type: 'stack-next-react', ...task2 });
} else {
  // Safe to run in parallel
  await Promise.all([
    Task({ subagent_type: 'stack-auth', ...task1 }),
    Task({ subagent_type: 'stack-next-react', ...task2 })
  ]);
}
```

### Issue: Specialist Missing Context

**Symptoms**: Specialist asks questions already answered

**Diagnosis**: Handoff prompt missing key information

**Resolution**: Use detailed handoff prompts (see Coordination Scenarios section)

### Issue: Verification Loop Stuck

**Symptoms**: Hook keeps failing, no progress

**Diagnosis**: Fundamental issue not being addressed

**Resolution**:
1. After 3 attempts, automatically escalate to specialist
2. If specialist can't fix, escalate to foundations/agentic
3. If still stuck, request human review

---

**End of Extended Guide** | For quick reference, see `.claude/agents/orchestrator.md`
