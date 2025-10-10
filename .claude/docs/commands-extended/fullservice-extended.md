# /fullservice Extended Guide

**Tier 2 Documentation** - Detailed implementation guide for the autonomous development cycle.

**Quick Reference**: See `.claude/commands/fullservice.md` for essentials.

---

## Table of Contents

1. [Detailed Startup Sequence](#detailed-startup-sequence)
2. [Worktree Management Patterns](#worktree-management-patterns)
3. [Git MCP Tool Usage](#git-mcp-tool-usage)
4. [Bash Command Patterns](#bash-command-patterns)
5. [Automation Hooks Reference](#automation-hooks-reference)
6. [REFLECT Phase Implementation](#reflect-phase-implementation)
7. [REVIEW Phase Implementation](#review-phase-implementation)
8. [VERIFY Phase Implementation](#verify-phase-implementation)
9. [COMMIT Phase Implementation](#commit-phase-implementation)
10. [Example Sessions](#example-sessions)
11. [Troubleshooting Guide](#troubleshooting-guide)

---

## Detailed Startup Sequence

### 1. Memory Check
```typescript
const memoryState = await memory.read();
const quickContext = memoryState.quickContext || {};
const lastMode = quickContext.mode || 'full';
```

### 2. Worktree Setup (Orchestrator Only)
```typescript
const timestamp = new Date().toISOString().replace(/[:.TZ-]/g, '');
const worktreePath = `${REPO_ROOT}/.tmp/fullservice-${timestamp}`;
const branchName = `fullservice-${timestamp}`;

await mcp__git__git_worktree({
  cwd: REPO_ROOT,
  args: ['add', '-b', branchName, worktreePath],
});

// Minimal validation with first-class tools
await Glob({ path: worktreePath, pattern: 'turbo.json' });
await Glob({ path: worktreePath, pattern: 'pnpm-workspace.yaml' });
await Glob({ path: worktreePath, pattern: 'package.json' });

await TodoWrite({
  status: 'in_progress',
  notes: `Worktree ready at ${worktreePath} (branch ${branchName})`,
});
```

**If validation fails:**
```typescript
// Remove corrupted worktree
await mcp__git__git_worktree({
  cwd: REPO_ROOT,
  args: ['remove', '--force', worktreePath]
});

// Record failure
await memory.write({
  quickContext: {
    ...quickContext,
    worktreeFailure: {
      timestamp,
      path: worktreePath,
      reason: 'Missing core files'
    }
  }
});

// Recreate from correct location
```

### 2.5. Initialize Memory Files from Templates

**Memory template system**: Templates in git (`*-template.md`) → Working files gitignored

```typescript
// Initialize quick-context.md from template
const templatePath = `${worktreePath}/.claude/memory/quick-context-template.md`;
const workingPath = `${worktreePath}/.claude/memory/quick-context.md`;

const template = await Read({ file_path: templatePath });
await Write({ file_path: workingPath, content: template });

// Add initial checkpoint
const checkpoint = `
## Checkpoint: Worktree Initialized (${new Date().toISOString()})

**Worktree**: ${worktreePath}
**Branch**: ${branchName}
**Bootstrap**: Pending
**Next**: Run pnpm install
`;

const updated = template + checkpoint;
await Write({ file_path: workingPath, content: updated });
```

**Key principle**: Use Read/Write tools, NOT bash (head/mv/cat)

### 3. Service Audit
```typescript
const services = await Read({ file_path: '.claude/memory/services.json' });
const parsed = JSON.parse(services);

for (const service of parsed.running) {
  if (service.stale || Date.now() - service.started > 3600000) {
    await Bash({ command: `kill ${service.pid}` });
    await TodoWrite({
      todos: [...todos, {
        content: `Stopped stale service: ${service.name}`,
        status: 'completed',
        activeForm: `Stopping ${service.name}`
      }]
    });
  }
}
```

### 4. TodoWrite Plan
```typescript
await TodoWrite({
  todos: [
    {
      content: 'PHASE 1: AUDIT (vision vs reality)',
      status: 'in_progress',
      activeForm: 'PHASE 1: Auditing'
    },
    {
      content: '1.1: Review README vs implementation',
      status: 'pending',
      activeForm: '1.1: Reviewing README'
    },
    {
      content: '1.2: Check AGENTS.md vs specialist capabilities',
      status: 'pending',
      activeForm: '1.2: Checking agents'
    },
    {
      content: '1.3: Scan for edge case gaps',
      status: 'pending',
      activeForm: '1.3: Scanning edge cases'
    },
    {
      content: 'PHASE 2: BUILD (implement missing features)',
      status: 'pending',
      activeForm: 'PHASE 2: Building'
    },
    // ... continue for all phases
  ]
});
```

### 5. Audit Log
```typescript
const auditEntry = `
=== /fullservice Run Started ===
Timestamp: ${new Date().toISOString()}
Worktree: ${worktreePath}
Branch: ${branchName}
Mode: ${mode}
User: ${process.env.USER}
Session ID: ${sessionId}
================================
`;

await Bash({
  command: `echo "${auditEntry}" >> .claude/memory/tool-audit.log`
});
```

---

## Worktree Management Patterns

### Working in Worktree - File Operations

**Always use absolute paths:**
```typescript
// ✅ CORRECT
await Read({
  file_path: `${REPO_ROOT}/.tmp/fullservice-20251006/packages/ai-novel/package.json`
});

await Edit({
  file_path: `${REPO_ROOT}/.tmp/fullservice-20251006/CLAUDE.md`,
  old_string: 'old content',
  new_string: 'new content'
});

// ❌ WRONG - Uses main repo path
await Read({ file_path: 'packages/ai-novel/package.json' });
```

### Working in Worktree - Bash Commands

**Include `cd` in same invocation:**
```typescript
// ✅ CORRECT
await Bash({
  command: `cd ${worktreePath} && pnpm install`
});

await Bash({
  command: `cd ${worktreePath} && pnpm typecheck`
});

// ❌ WRONG - Assumes cwd is preserved
await Bash({ command: 'cd /some/path' });
await Bash({ command: 'pnpm install' }); // Will run in wrong directory!
```

### Worktree Cleanup

**Normal cleanup:**
```typescript
await mcp__git__git_worktree({
  args: ['remove', '--force', worktreePath],
  cwd: REPO_ROOT
});
```

**If worktree is corrupted:**
```typescript
// First, try to prune
await mcp__git__git_worktree({
  args: ['prune'],
  cwd: REPO_ROOT
});

// Then remove
await mcp__git__git_worktree({
  args: ['remove', '--force', worktreePath],
  cwd: REPO_ROOT
});
```

**NEVER do this:**
```typescript
// ❌ DON'T copy config from main repo
await Bash({ command: `cp turbo.json ${worktreePath}/` });

// If files are "missing", worktree was created incorrectly
// Remove and recreate from proper location
```

---

## Git MCP Tool Usage

### Status Check
```typescript
const status = await mcp__git__git_status({
  cwd: worktreePath
});

console.log('Modified files:', status.modified);
console.log('Untracked files:', status.untracked);
```

### View Changes
```typescript
const diff = await mcp__git__git_diff({
  cwd: worktreePath,
  args: ['--cached'] // For staged changes
});

const unstaged = await mcp__git__git_diff({
  cwd: worktreePath
});
```

### Stage Files
```typescript
// Stage all changes
await mcp__git__git_add({
  cwd: worktreePath,
  paths: ['.']
});

// Stage specific files
await mcp__git__git_add({
  cwd: worktreePath,
  paths: ['package.json', 'CLAUDE.md']
});
```

### Create Commits
```typescript
await mcp__git__git_commit({
  cwd: worktreePath,
  message: `feat: implement feature

Detailed description here.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>`
});
```

### Branch Operations
```typescript
// List branches
const branches = await mcp__git__git_branch({
  cwd: worktreePath
});

// Create branch
await mcp__git__git_branch({
  cwd: worktreePath,
  args: ['feature-branch']
});

// Switch branch
await mcp__git__git_branch({
  cwd: worktreePath,
  args: ['-M', 'new-branch-name']
});
```

### View History
```typescript
const log = await mcp__git__git_log({
  cwd: worktreePath,
  args: ['-10', '--oneline'] // Last 10 commits
});
```

---

## Bash Command Patterns

### Approved Commands (Always with cwd)

```typescript
// Package management
await Bash({
  cwd: worktreePath,
  command: 'pnpm install'
});

await Bash({
  cwd: worktreePath,
  command: 'pnpm --filter @repo/db-prisma prisma generate'
});

// Quality gates
await Bash({
  cwd: worktreePath,
  command: 'pnpm repo:preflight'
});

await Bash({
  cwd: worktreePath,
  command: 'pnpm typecheck'
});

await Bash({
  cwd: worktreePath,
  command: 'pnpm lint'
});

// Scoped commands
await Bash({
  cwd: worktreePath,
  command: 'pnpm lint --filter @repo/auth'
});

await Bash({
  cwd: worktreePath,
  command: 'pnpm vitest --filter @repo/auth --run'
});

// Prisma operations
await Bash({
  cwd: worktreePath,
  command: 'pnpm prisma format'
});

await Bash({
  cwd: worktreePath,
  command: 'pnpm prisma validate'
});

// Testing
await Bash({
  cwd: worktreePath,
  command: 'pnpm turbo run storybook:smoke --filter uix-system'
});

await Bash({
  cwd: worktreePath,
  command: 'pnpm playwright test --project=chromium'
});

// Repository scripts
await Bash({
  cwd: worktreePath,
  command: 'node scripts/detect-scope.mjs "packages/auth/src/server.ts"'
});

// Contamination checks
await Bash({
  cwd: worktreePath,
  command: 'node scripts/validate.mjs contamination'
});
```

### Forbidden Commands

```bash
# ❌ NEVER run these
pnpm dev                    # Dev servers (user only)
pnpm build:doppler          # Production builds (approval needed)
terraform apply             # Infra changes (approval needed)
rm -rf                      # Destructive ops (use proper cleanup)
git <command>               # Use MCP git tools instead
```

---

## Automation Hooks Reference

### After File Edits

```typescript
// Detect affected scope
const scopeResult = await Bash({
  cwd: worktreePath,
  command: `node scripts/detect-scope.mjs "${changedPaths.join(' ')}"`
});

const scope = scopeResult.stdout.trim() || '.';

// Run scoped quality gates
await Bash({
  cwd: worktreePath,
  command: `pnpm lint --filter "${scope}"`
});

await Bash({
  cwd: worktreePath,
  command: `pnpm typecheck --filter "${scope}"`
});

await Bash({
  cwd: worktreePath,
  command: `pnpm vitest --filter "${scope}" --run`
});
```

### After Prisma Schema Changes

```typescript
// Format schema
await Bash({
  cwd: worktreePath,
  command: 'pnpm prisma format'
});

// Validate schema
await Bash({
  cwd: worktreePath,
  command: 'pnpm prisma validate'
});

// Generate Prisma Client
await Bash({
  cwd: worktreePath,
  command: 'pnpm --filter @repo/db-prisma prisma generate'
});

// Regenerate Zod schemas if using prisma-zod-generator
await Bash({
  cwd: worktreePath,
  command: 'pnpm --filter @repo/db-prisma run build:schemas'
});
```

### After UI Component Changes

```typescript
// Run Storybook smoke tests
await Bash({
  cwd: worktreePath,
  command: 'pnpm turbo run storybook:smoke --filter uix-system'
});

// Check bundle size impact
await Bash({
  cwd: worktreePath,
  command: 'pnpm turbo run analyze --filter webapp'
});
```

### After E2E Test Changes

```typescript
// Run Playwright tests
await Bash({
  cwd: worktreePath,
  command: 'pnpm playwright test --project=chromium'
});

// Run on specific browsers if needed
await Bash({
  cwd: worktreePath,
  command: 'pnpm playwright test --project=firefox --project=webkit'
});
```

### Hook Failure Handling

```typescript
// Save to quick-context
await memory.write({
  quickContext: {
    ...existingContext,
    hookFailure: {
      timestamp: new Date().toISOString(),
      hook: 'typecheck',
      scope: '@repo/auth',
      error: errorMessage,
      status: 'needs-fix'
    }
  }
});

// Update TodoWrite
await TodoWrite({
  todos: [...existingTodos, {
    content: `Fix typecheck failure in @repo/auth`,
    status: 'in_progress',
    activeForm: 'Fixing typecheck failure'
  }]
});

// Document in tool-audit.log
await Bash({
  cwd: worktreePath,
  command: `echo "[$(date -Iseconds)] HOOK FAILURE: typecheck @repo/auth - ${errorMessage}" >> .claude/memory/tool-audit.log`
});
```

---

## REFLECT Phase Implementation

**REQUIRED FINAL STEP** before completing any /fullservice session.

### Reflection Questions (Complete Analysis)

#### 1. Agent Performance Analysis

```typescript
const agentAnalysis = {
  excelledAgents: [
    {
      name: 'stack-prisma',
      whatWorked: 'Quickly diagnosed silent generator failure',
      whyEffective: 'Used DEBUG flags to expose hidden errors',
      patternsToReplicate: [
        'Use DEBUG environment variables',
        'Document vendor-specific quirks',
        'Verify fixes with scoped tests'
      ]
    }
  ],
  struggledAgents: [
    {
      name: 'integrations',
      whatFailed: 'Type errors when working with Stripe types',
      whyFailed: 'Missing TypeScript specialist consultation',
      proposedFix: 'Add typescript as required reviewer in integrations.md'
    }
  ],
  capabilityGaps: [
    {
      gap: 'No agent for frontend state management patterns',
      proposedAgent: 'stack-state',
      scope: 'Zustand, React Query, TanStack patterns'
    }
  ],
  boundaryViolations: [
    {
      agent: 'orchestrator',
      violation: 'Main session bypassed orchestrator entirely',
      impact: 'No TodoWrite owner tracking, no delegation record',
      prevention: 'Add enforcement check in /fullservice command'
    }
  ]
};
```

#### 2. Guardrail Effectiveness

```typescript
const guardrailReview = {
  successful: [
    {
      guardrail: 'validate.mjs contamination',
      whatCaught: 'Next.js import in package source',
      impact: 'Prevented stage contamination violation'
    }
  ],
  missed: [
    {
      violation: 'Organization import in client component',
      shouldHaveCaught: 'Client-side auth import check',
      proposedFix: 'Add rule to validate.mjs contamination'
    }
  ],
  newChecksNeeded: [
    {
      checkName: 'client-auth-imports',
      whatItShouldCatch: 'Auth server APIs used in client components',
      implementation: 'rg "from [\'\\"]@repo/auth/server" apps/*/src/**/*.tsx'
    }
  ],
  falsePositives: [
    {
      check: 'edge-node-imports',
      scenario: 'Server actions in app/actions/*.ts flagged as edge',
      fix: 'Exclude /app/actions/ from edge runtime checks'
    }
  ]
};
```

#### 3. Workflow Assessment

```typescript
const workflowReview = {
  smoothFlow: [
    'AUDIT phase thoroughly compared docs vs implementation',
    'BUILD phase stayed focused on core mission',
    'VALIDATE phase caught all quality gate violations'
  ],
  issues: [
    {
      phase: 'BUILD',
      issue: 'Worktree isolation violated - worked on main branch',
      impact: 'Higher rollback risk',
      fix: 'Add worktree validation at orchestrator startup'
    },
    {
      phase: 'VALIDATE',
      issue: 'Full typecheck too slow (45s)',
      impact: 'Slows iteration cycle',
      fix: 'Use scoped typecheck for touched packages only'
    }
  ],
  toolUsage: [
    {
      tool: 'MCP git',
      usage: 'Not available, fell back to bash git',
      improvement: 'Document MCP tool availability requirements'
    },
    {
      tool: 'Context7',
      usage: 'Excellent - always used for library docs',
      keepDoing: 'Continue prioritizing Context7 over WebFetch'
    }
  ],
  processImprovements: [
    {
      phase: 'VALIDATE',
      current: 'Sequential quality gates (contamination → typecheck → lint)',
      improved: 'Parallel execution (run all simultaneously)',
      benefit: 'Reduce validation time from 60s to 20s'
    }
  ]
};
```

#### 4. Knowledge Gaps

```typescript
const knowledgeReview = {
  aiHintsAccuracy: [
    {
      hint: 'ai-novel.mdx',
      accuracy: 'Excellent - TipTap v3 patterns correct',
      completeness: '90% - missing FloatingUI migration'
    }
  ],
  missingHints: [
    '@repo/payments - Stripe API version patterns',
    '@repo/analytics - PostHog feature flag usage',
    '@repo/email - React Email component patterns'
  ],
  newPatterns: [
    {
      pattern: 'Dual env export pattern (env + safeEnv)',
      location: 'Package environment configuration',
      shouldDocument: 'apps/docs/ai-hints/environment-configuration.mdx'
    }
  ],
  coordinationMatrixUpdates: [
    {
      issue: 'integrations → typescript dependency missing',
      fix: 'Add to orchestrator.md coordination matrix'
    }
  ],
  examplesNeeded: [
    'Type-safe agent delegation patterns',
    'Worktree isolation for specialists',
    'Hook failure recovery workflows'
  ]
};
```

### Deliverables (3 Required Files)

#### 1. Agent Improvement Proposals

```typescript
await Write({
  file_path: `${REPO_ROOT}/.claude/memory/agent-improvements-${timestamp}.md`,
  content: `# Agent Improvement Proposals - ${timestamp}

## Agents That Excelled

### ${agentAnalysis.excelledAgents[0].name} ✅
**What Worked Well**:
- ${agentAnalysis.excelledAgents[0].whatWorked}
- ${agentAnalysis.excelledAgents[0].whyEffective}

**Pattern to Replicate**:
${agentAnalysis.excelledAgents[0].patternsToReplicate.map(p => `- ${p}`).join('\n')}

## Agents That Struggled

### ${agentAnalysis.struggledAgents[0].name} ❌
**What Failed**:
- ${agentAnalysis.struggledAgents[0].whatFailed}

**Why It Failed**:
- ${agentAnalysis.struggledAgents[0].whyFailed}

**Proposed Fix**:
\`\`\`markdown
# Add to .claude/agents/integrations.md

## Dependencies

**Required Reviewers**:
- typescript: For type-heavy integrations (Stripe, third-party SDKs)
\`\`\`

## New Agent Needs

${agentAnalysis.capabilityGaps.map(gap => `
### ${gap.proposedAgent}
**Gap**: ${gap.gap}
**Scope**: ${gap.scope}
`).join('\n')}

## Agent Spec Updates

${agentAnalysis.struggledAgents.map(agent => `
### ${agent.name}.md
**Current Issue**: ${agent.whatFailed}
**Specific Changes**:
\`\`\`diff
+ ## Required Reviewers
+ - typescript: For type-heavy work
\`\`\`
`).join('\n')}
`
});
```

#### 2. Guardrail Enhancement Recommendations

```typescript
await Write({
  file_path: `${REPO_ROOT}/.claude/memory/guardrail-improvements-${timestamp}.md`,
  content: `# Guardrail Enhancement Recommendations - ${timestamp}

## Successful Guardrails

${guardrailReview.successful.map(g => `
### ${g.guardrail} ✅
**What it caught**: ${g.whatCaught}
**Impact**: ${g.impact}
`).join('\n')}

## Missed Violations

${guardrailReview.missed.map(m => `
### ${m.violation} ❌
**Should have been caught by**: ${m.shouldHaveCaught}
**Proposed fix**: ${m.proposedFix}
`).join('\n')}

## New Checks Needed

${guardrailReview.newChecksNeeded.map(check => `
### ${check.checkName}
**Purpose**: ${check.whatItShouldCatch}
**Implementation**:
\`\`\`bash
${check.implementation}
\`\`\`
`).join('\n')}

## Script Improvements

### validate.mjs contamination
**Enhancement**: Add client-side auth import detection
\`\`\`bash
# Add after existing checks
echo "Checking for auth server APIs in client components..."
if rg "from ['\"]@repo/auth/server" apps/*/src/**/*.tsx; then
  echo "❌ VIOLATION: Auth server APIs used in client component"
  exit 1
fi
\`\`\`
`
});
```

#### 3. Workflow Optimization Suggestions

```typescript
await Write({
  file_path: `${REPO_ROOT}/.claude/memory/workflow-improvements-${timestamp}.md`,
  content: `# Workflow Optimization Suggestions - ${timestamp}

## What Worked Well

${workflowReview.smoothFlow.map(item => `- ${item}`).join('\n')}

## What Didn't Work

${workflowReview.issues.map(issue => `
### ${issue.phase}: ${issue.issue}
**Impact**: ${issue.impact}
**Fix**: ${issue.fix}
`).join('\n')}

## Tool Usage Improvements

${workflowReview.toolUsage.map(tool => `
### ${tool.tool}
**Current usage**: ${tool.usage}
**Improvement**: ${tool.improvement || tool.keepDoing}
`).join('\n')}

## Process Enhancements

${workflowReview.processImprovements.map(improvement => `
### ${improvement.phase}
**Current**: ${improvement.current}
**Improved**: ${improvement.improved}
**Benefit**: ${improvement.benefit}
`).join('\n')}
`
});
```

### Programmatic File Updates

**Based on analysis, make direct edits:**

```typescript
// Example: Update agent spec based on learnings
await Edit({
  file_path: `${REPO_ROOT}/.claude/agents/integrations.md`,
  old_string: `## Scope`,
  new_string: `## Dependencies

**Required Reviewers**:
- typescript: For type-heavy integrations (Stripe, Hotelbeds, third-party SDKs)

## Scope`
});

// Example: Enhance contamination checks
await Edit({
  file_path: `${REPO_ROOT}/node scripts/validate.mjs contamination`,
  old_string: `echo "✅ All contamination checks passed"`,
  new_string: `# Check for auth server APIs in client components
echo "Checking for auth server imports in client components..."
if rg "from ['\"]@repo/auth/server" apps/*/src/**/*.tsx 2>/dev/null; then
  echo "❌ Client: Auth server APIs in client component"
  exit 1
fi

echo "✅ All contamination checks passed"`
});

// Example: Update CLAUDE.md with new pattern
await Edit({
  file_path: `${REPO_ROOT}/CLAUDE.md`,
  old_string: `## Common Fixes`,
  new_string: `## Agent Delegation Patterns

### Type-Heavy Integrations
When working with complex third-party SDKs (Stripe, Hotelbeds):
1. Consult typescript specialist before implementation
2. Use Context7 for latest SDK types
3. Test with @repo/qa type mocks

## Common Fixes`
});
```

### Success Criteria Checklist

```typescript
const reflectComplete = {
  analysisComplete: [
    '✅ Agent performance analyzed',
    '✅ Guardrail effectiveness reviewed',
    '✅ Workflow assessment done',
    '✅ Knowledge gaps identified'
  ],
  deliverables: [
    '✅ agent-improvements-{timestamp}.md created',
    '✅ guardrail-improvements-{timestamp}.md created',
    '✅ workflow-improvements-{timestamp}.md created'
  ],
  programmaticUpdates: [
    '✅ At least 1 agent spec updated',
    '✅ At least 1 guardrail enhanced',
    '✅ At least 1 pattern documented'
  ],
  memory: [
    '✅ Session learnings in agent-specific memory',
    '✅ User recommendations documented'
  ]
};

// Only proceed to REVIEW phase when all checked
```

---

## REVIEW Phase Implementation

**Enabled with `--review` flag.**

### Spawning Reviewer Agent

```typescript
await Task({
  subagent_type: 'reviewer',
  description: 'External validation of orchestrator work',
  prompt: `You are the independent reviewer agent for Forge /fullservice session ${timestamp}.

Your role: Validate orchestrator's execution and improvement proposals with CRITICAL EYE.

**Session to Review**:
- Timestamp: ${timestamp}
- Worktree: ${worktreePath}
- Branch: ${branchName}
- Orchestrator proposals: .claude/memory/agent-improvements-${timestamp}.md

**Your Analysis Must Include**:

1. **Session Quality Grading** (A-F scale):
   - AUDIT phase completeness
   - BUILD phase scope adherence
   - VALIDATE phase thoroughness
   - REFLECT phase depth
   - Overall execution quality

2. **Improvement Validation**:
   - Review EACH proposed improvement
   - Test logic for effectiveness
   - Identify potential side effects
   - Approve (✅) or Reject (❌) with rationale

3. **Blind Spot Detection**:
   - Patterns orchestrator missed
   - Systemic vs one-off issues
   - Self-reflection bias examples
   - Hidden risks

4. **Counter-Proposals**:
   - Better alternatives to weak proposals
   - Root cause fixes (not symptoms)
   - High-impact improvements orchestrator missed

**Deliverables** (create these files):
1. .claude/memory/session-review-${timestamp}.md
2. .claude/memory/validated-improvements-${timestamp}.md
3. .claude/memory/blind-spots-${timestamp}.md
4. .claude/memory/final-recommendations-${timestamp}.md

**Critical Standards**:
- Approve improvement ONLY if: addresses root cause, low risk, concrete, testable, maintainable
- Auto-reject if: vague, high complexity, could break things, no success criteria
- You have AUTHORITY to reject orchestrator's proposals
- You CANNOT skip VERIFY phase

Complete specification: .claude/docs/commands-extended/fullservice-extended.md#review-phase-implementation`
});
```

### Reviewer Deliverables Format

#### 1. Session Review

```markdown
# Session Review - ${timestamp}

## Session Quality: B+ (85/100)

### AUDIT Phase: A (95/100)
✅ Thoroughness: Excellent
✅ Vision alignment: Strong
⚠️  Missed 1 edge case (Doppler fallback)

### BUILD Phase: B (80/100)
✅ Scope adherence: Good
✅ Specialist delegation: Mostly correct
❌ Worktree isolation violated (worked on main)

### VALIDATE Phase: A- (90/100)
✅ Quality gates comprehensive
✅ Contamination checks thorough
⚠️  Could parallelize for speed

### REFLECT Phase: B (85/100)
✅ Good self-analysis
⚠️  Missed root cause on 1 issue
⚠️  Improvement proposals need more specificity

## Overall Assessment
Solid execution with minor process violations. Technical work correct, but coordination discipline lapsed.
```

#### 2. Validated Improvements

```markdown
# Validated Improvements - ${timestamp}

## Approved Improvements ✅

### 1. stack-auth.md Update
**Proposal**: Add Better Auth v3 patterns
**Validation**:
- ✅ Addresses root cause (missing patterns)
- ✅ Low risk (documentation only)
- ✅ Concrete implementation details
- ✅ Testable (agents can verify)
**Status**: APPROVED

### 2. validate.mjs contamination Enhancement
**Proposal**: Add client-side auth import check
**Validation**:
- ✅ Addresses root cause (missed violation)
- ✅ Low risk (read-only check)
- ✅ Concrete bash implementation
- ✅ Testable (can simulate violation)
**Status**: APPROVED

## Rejected Improvements ❌

### 1. Pre-commit Hook Addition
**Proposal**: Add pre-commit hook for organization RBAC
**Rejection Reasons**:
- ❌ Too complex (requires parsing TS files)
- ❌ High maintenance burden
- ❌ Could break developer workflow
**Counter-Proposal**: Use ESLint rule instead
```

#### 3. Blind Spots

```markdown
# Blind Spots Identified - ${timestamp}

## Patterns Orchestrator Missed

### 1. Type Safety in Agent Handoffs
**Missed Pattern**: No type checking before specialist delegation
**Impact**: integrations agent received poorly-typed Stripe work
**Root Cause**: No automated type validation in Task delegation
**Systemic Issue**: YES - affects all agent handoffs

### 2. Documentation Examples
**Missed Pattern**: AI hints lack practical examples
**Impact**: Specialists need to infer usage patterns
**Root Cause**: Docs focus on "what" not "how"
**Systemic Issue**: YES - across all ai-hints files

## Self-Reflection Bias

### Example: Worktree Violation Downplayed
**Orchestrator said**: "Minor issue - work already done"
**Reality**: Violated core /fullservice requirement, set bad precedent
**Bias**: Minimized own process violation

## Hidden Risks

### Risk: Contamination Check False Security
**Issue**: Checks only catch syntax patterns, not semantic violations
**Example**: Could use correct import path but wrong runtime
**Mitigation**: Add runtime validation tests
```

#### 4. Final Recommendations

```markdown
# Final Recommendations - ${timestamp}

## Immediate Actions (Before Next Session)

### High Priority
1. ✅ Add type-safe delegation pattern to orchestrator.md
2. ✅ Enhance validate.mjs contamination with client auth rule
3. ✅ Update stack-auth.md with Better Auth v3 patterns

### Medium Priority
4. ⏳ Create practical examples for all AI hints
5. ⏳ Add worktree validation to orchestrator startup
6. ⏳ Document ESLint alternative to pre-commit hook

### Low Priority
7. ⏳ Create metrics dashboard for agent performance
8. ⏳ Add runtime contamination validation tests

## Improvements for Next Session

**Process Changes**:
- Enforce worktree isolation (fail if on main branch)
- Add type check before specialist delegation
- Parallelize quality gates for speed

**Agent Changes**:
- integrations.md: Add typescript dependency
- orchestrator.md: Add type-safe delegation pattern
- all agents: Add practical examples section

**Guardrail Changes**:
- validate.mjs contamination: Add 3 new rules (client auth, ...)
- Create runtime validation script
- Add ESLint rules as lint-time guardrails
```

### Integration with Orchestrator

```typescript
// After REFLECT phase completes
if (reviewMode) {
  console.log('Spawning reviewer agent for external validation...');

  await Task({
    subagent_type: 'reviewer',
    description: 'Validate session and improvements',
    prompt: reviewerPrompt
  });

  // Reviewer runs independently, creates 4 deliverable files

  console.log('Reviewer analysis complete. Reading validated improvements...');

  const validated = await Read({
    file_path: `.claude/memory/validated-improvements-${timestamp}.md`
  });

  // Parse approved/rejected improvements
  const approved = parseApprovedImprovements(validated);
  const rejected = parseRejectedImprovements(validated);

  console.log(`Reviewer approved ${approved.length} improvements, rejected ${rejected.length}`);

  // Only proceed to VERIFY with approved improvements
  await proceedToVerify(approved);
} else {
  // Skip review, proceed directly to VERIFY
  await proceedToVerify(allImprovements);
}
```

---

## VERIFY Phase Implementation

**REQUIRED** before committing any improvements.

### Create Test Branch

```typescript
const verifyBranch = `verify-improvements-${timestamp}`;

await mcp__git__git_branch({
  cwd: worktreePath,
  args: [verifyBranch]
});

await mcp__git__git_checkout({
  cwd: worktreePath,
  args: [verifyBranch]
});
```

### Apply Improvements

```typescript
for (const improvement of approvedImprovements) {
  if (improvement.type === 'agent-spec-update') {
    await Edit({
      file_path: `${worktreePath}/.claude/agents/${improvement.file}`,
      old_string: improvement.oldContent,
      new_string: improvement.newContent
    });
  } else if (improvement.type === 'guardrail-enhancement') {
    await Edit({
      file_path: `${worktreePath}/.claude/scripts/${improvement.file}`,
      old_string: improvement.oldContent,
      new_string: improvement.newContent
    });
  } else if (improvement.type === 'doc-update') {
    await Edit({
      file_path: `${worktreePath}/${improvement.file}`,
      old_string: improvement.oldContent,
      new_string: improvement.newContent
    });
  }

  await TodoWrite({
    todos: [...todos, {
      content: `Applied improvement: ${improvement.name}`,
      status: 'completed',
      activeForm: `Applying ${improvement.name}`
    }]
  });
}

// Commit improvements to test branch
await mcp__git__git_add({
  cwd: worktreePath,
  paths: ['.']
});

await mcp__git__git_commit({
  cwd: worktreePath,
  message: `test: apply improvements for verification

Testing ${approvedImprovements.length} approved improvements before commit.`
});
```

### Run Verification Suite

```typescript
const verificationResults = {
  timestamp,
  testsRun: [],
  passed: [],
  failed: [],
  warnings: []
};

// Test 1: Contamination checks
try {
  await Bash({
    cwd: worktreePath,
    command: 'node scripts/validate.mjs contamination'
  });
  verificationResults.passed.push('contamination-checks');
} catch (error) {
  verificationResults.failed.push({
    test: 'contamination-checks',
    error: error.message
  });
}

// Test 2: TypeScript compilation
try {
  await Bash({
    cwd: worktreePath,
    command: 'pnpm typecheck'
  });
  verificationResults.passed.push('typecheck');
} catch (error) {
  verificationResults.failed.push({
    test: 'typecheck',
    error: error.message
  });
}

// Test 3: Linting
try {
  await Bash({
    cwd: worktreePath,
    command: 'pnpm lint'
  });
  verificationResults.passed.push('lint');
} catch (error) {
  verificationResults.failed.push({
    test: 'lint',
    error: error.message
  });
}

// Test 4: Circular dependencies
try {
  await Bash({
    cwd: worktreePath,
    command: 'pnpm madge --circular --no-spinner packages apps'
  });
  verificationResults.passed.push('circular-deps');
} catch (error) {
  verificationResults.failed.push({
    test: 'circular-deps',
    error: error.message
  });
}

// Test 5: Agent file syntax validation
try {
  const agentFiles = await Glob({
    path: `${worktreePath}/.claude/agents`,
    pattern: '*.md'
  });

  for (const file of agentFiles) {
    await Read({ file_path: file });
  }

  verificationResults.passed.push('agent-syntax');
} catch (error) {
  verificationResults.failed.push({
    test: 'agent-syntax',
    error: error.message
  });
}

// Test 6: Memory file integrity
try {
  const memoryFiles = await Glob({
    path: `${worktreePath}/.claude/memory`,
    pattern: '*.md'
  });

  for (const file of memoryFiles) {
    const content = await Read({ file_path: file });
    // Validate has required sections
    if (!content.includes('## ')) {
      throw new Error(`${file} missing section headers`);
    }
  }

  verificationResults.passed.push('memory-integrity');
} catch (error) {
  verificationResults.failed.push({
    test: 'memory-integrity',
    error: error.message
  });
}

// Calculate pass rate
const totalTests = verificationResults.passed.length + verificationResults.failed.length;
const passRate = (verificationResults.passed.length / totalTests) * 100;

verificationResults.passRate = passRate;
verificationResults.status = passRate >= 80 ? 'APPROVED' :
                             passRate >= 60 ? 'REVIEW_REQUIRED' :
                             'REJECTED';
```

### Generate Verification Report

```typescript
await Write({
  file_path: `${REPO_ROOT}/.claude/memory/verification-results-${timestamp}.md`,
  content: `# Verification Results - ${timestamp}

## Summary
- **Tests Run**: ${totalTests}
- **Passed**: ${verificationResults.passed.length}
- **Failed**: ${verificationResults.failed.length}
- **Pass Rate**: ${passRate.toFixed(1)}%
- **Status**: ${verificationResults.status}

## Test Results

${verificationResults.passed.map(test => `✅ ${test}: PASSED`).join('\n')}

${verificationResults.failed.map(failure => `
❌ ${failure.test}: FAILED
Error: ${failure.error}
`).join('\n')}

## Decision

${passRate >= 80 ? '✅ **APPROVED FOR COMMIT**\nAll improvements verified and safe to apply.' :
  passRate >= 60 ? '⚠️  **REVIEW REQUIRED**\nSome tests failed. Manual review needed before commit.' :
  '❌ **REJECTED**\nToo many test failures. Improvements need revision.'}

## Next Steps

${passRate >= 80 ? '1. Proceed to COMMIT phase\n2. Apply improvements to main worktree\n3. Commit with verification reference' :
  passRate >= 60 ? '1. Review failed tests\n2. Decide: fix and re-verify OR rollback\n3. Document decision' :
  '1. Rollback to main worktree\n2. Revise improvement proposals\n3. Re-run REFLECT phase with failure context'}
`
});
```

### Auto-Rollback on Failure

```typescript
if (verificationResults.status === 'REJECTED') {
  console.log('Verification failed. Rolling back...');

  // Switch back to main worktree branch
  await mcp__git__git_checkout({
    cwd: worktreePath,
    args: [branchName] // Original fullservice branch
  });

  // Delete test branch
  await mcp__git__git_branch({
    cwd: worktreePath,
    args: ['-D', verifyBranch]
  });

  // Update quick-context with failure
  await memory.write({
    quickContext: {
      ...existingContext,
      verificationFailure: {
        timestamp,
        passRate,
        failures: verificationResults.failed,
        status: 'rolled-back'
      }
    }
  });

  console.log('❌ Improvements REJECTED. Re-running REFLECT phase with failure context...');

  // Re-run REFLECT with knowledge of what failed
  await reflectPhase({
    previousAttempt: {
      improvements: approvedImprovements,
      verificationResults
    }
  });
}
```

---

## COMMIT Phase Implementation

**Only executed when VERIFY phase passes with ≥80% success rate.**

### Separate Commits by Type

```typescript
const improvementsByType = {
  'agent-specs': [],
  'guardrails': [],
  'workflows': [],
  'documentation': []
};

// Group improvements
for (const improvement of approvedImprovements) {
  if (improvement.file.startsWith('.claude/agents/')) {
    improvementsByType['agent-specs'].push(improvement);
  } else if (improvement.file.startsWith('.claude/scripts/')) {
    improvementsByType['guardrails'].push(improvement);
  } else if (improvement.file.includes('fullservice') || improvement.file.includes('modernize')) {
    improvementsByType['workflows'].push(improvement);
  } else {
    improvementsByType['documentation'].push(improvement);
  }
}
```

### Commit Each Type

```typescript
// 1. Agent spec updates
if (improvementsByType['agent-specs'].length > 0) {
  await mcp__git__git_add({
    cwd: worktreePath,
    paths: improvementsByType['agent-specs'].map(i => i.file)
  });

  await mcp__git__git_commit({
    cwd: worktreePath,
    message: `improve(agents): enhance agent specs based on session learnings

Improvement validated via verification suite:
- Pass rate: ${passRate.toFixed(1)}%
- Verification: ${timestamp}

Changes:
${improvementsByType['agent-specs'].map(i => `- ${i.description}`).join('\n')}

Addresses issues from session ${timestamp}

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>`
  });
}

// 2. Guardrail enhancements
if (improvementsByType['guardrails'].length > 0) {
  await mcp__git__git_add({
    cwd: worktreePath,
    paths: improvementsByType['guardrails'].map(i => i.file)
  });

  await mcp__git__git_commit({
    cwd: worktreePath,
    message: `improve(guardrails): enhance contamination checks and quality gates

Improvement validated via verification suite:
- Pass rate: ${passRate.toFixed(1)}%
- Verification: ${timestamp}

Changes:
${improvementsByType['guardrails'].map(i => `- ${i.description}`).join('\n')}

Addresses issues from session ${timestamp}

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>`
  });
}

// 3. Workflow improvements
if (improvementsByType['workflows'].length > 0) {
  await mcp__git__git_add({
    cwd: worktreePath,
    paths: improvementsByType['workflows'].map(i => i.file)
  });

  await mcp__git__git_commit({
    cwd: worktreePath,
    message: `improve(workflow): optimize /fullservice execution patterns

Improvement validated via verification suite:
- Pass rate: ${passRate.toFixed(1)}%
- Verification: ${timestamp}

Changes:
${improvementsByType['workflows'].map(i => `- ${i.description}`).join('\n')}

Addresses issues from session ${timestamp}

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>`
  });
}

// 4. Documentation updates
if (improvementsByType['documentation'].length > 0) {
  await mcp__git__git_add({
    cwd: worktreePath,
    paths: improvementsByType['documentation'].map(i => i.file)
  });

  await mcp__git__git_commit({
    cwd: worktreePath,
    message: `docs: update agent coordination and patterns

Improvement validated via verification suite:
- Pass rate: ${passRate.toFixed(1)}%
- Verification: ${timestamp}

Changes:
${improvementsByType['documentation'].map(i => `- ${i.description}`).join('\n')}

Addresses issues from session ${timestamp}

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>`
  });
}
```

### Update Metrics

```typescript
const metricsPath = `${REPO_ROOT}/.claude/memory/improvement-metrics.json`;

let metrics = { sessions: [] };
try {
  const existing = await Read({ file_path: metricsPath });
  metrics = JSON.parse(existing);
} catch {
  // File doesn't exist yet
}

metrics.sessions.push({
  timestamp,
  improvements_proposed: allImprovements.length,
  improvements_approved: approvedImprovements.length,
  improvements_rejected: allImprovements.length - approvedImprovements.length,
  verification_pass_rate: passRate,
  commits_created: Object.values(improvementsByType).filter(arr => arr.length > 0).length,
  next_session_improvement: {
    // Will be filled in by next session
    issues_reduced: null,
    time_reduced: null
  }
});

await Write({
  file_path: metricsPath,
  content: JSON.stringify(metrics, null, 2)
});
```

### Success Criteria

```typescript
const commitComplete = {
  commits: [
    '✅ Agent spec updates committed',
    '✅ Guardrail enhancements committed',
    '✅ Workflow improvements committed',
    '✅ Documentation updates committed'
  ],
  metrics: [
    '✅ improvement-metrics.json updated',
    '✅ Pass rate recorded',
    '✅ Verification timestamp saved'
  ],
  files: [
    '✅ All agent specs reflect new patterns',
    '✅ All guardrails updated',
    '✅ All documentation current'
  ],
  cleanup: [
    '✅ Test branch deleted',
    '✅ Worktree ready for user review',
    '✅ Quick-context updated'
  ]
};
```

---

## Example Sessions

### Example 1: Successful Full Cycle

```
User: /fullservice --review

Agent (Main Session):
[Immediately delegates to orchestrator]

Task({
  subagent_type: "orchestrator",
  description: "Execute /fullservice autonomous cycle",
  prompt: "..."
})

Orchestrator Agent:
1. AUDIT: Checking vision vs reality...
   Reading README.md, AGENTS.md, CLAUDE.md...
   Comparing against implementation...

   Found gaps:
   - README mentions Better Auth organizations → Not implemented
   - AGENTS.md lists stack-auth agent → Doesn't exist
   - validate.mjs contamination missing

2. BUILD: Implementing core features...
   Delegating to specialists:

   Task({ subagent_type: "stack-auth", prompt: "Create stack-auth.md agent spec" })
   Task({ subagent_type: "integrations", prompt: "Wire Better Auth organizations" })
   Task({ subagent_type: "agentic", prompt: "Create validate.mjs contamination" })

   [Specialists work in parallel]

   stack-auth: ✅ Agent spec created (.claude/agents/stack-auth.md)
   integrations: ✅ Organizations implemented (packages/auth/src/server-next.ts)
   agentic: ✅ Contamination checks created (node scripts/validate.mjs contamination)

3. VALIDATE: Running quality gates...

   pnpm repo:preflight...
   ✅ All packages: typecheck PASSED
   ✅ All packages: lint PASSED
   ✅ Coverage maintained (52% → 53%)

   ./claude/scripts/validate.mjs contamination...
   ✅ No Next.js imports in packages
   ✅ No @/ imports in packages
   ✅ No deep package imports
   ✅ No Node APIs in edge runtime

   All quality gates: ✅ PASSED

4. DISCOVER: Checking for new issues...

   Running scoped tests...
   pnpm vitest --filter @repo/auth --run

   New issues found:
   ⚠️  Better Auth edge runtime needs explicit testing
   ⚠️  Organization role checks need database migration

   [Added to next iteration backlog]

5. REFLECT: Self-improvement analysis...

   Analyzing agent performance...
   - stack-auth worked excellently (clear scope, fast execution)
   - integrations struggled with Better Auth types
   - No capability gaps

   Analyzing guardrails...
   - contamination-checks caught edge runtime violation ✅
   - Missed: Organization import in client component ❌

   Creating improvement documents...
   ✅ agent-improvements-20251006.md
   ✅ guardrail-improvements-20251006.md
   ✅ workflow-improvements-20251006.md

   Applying programmatic updates...
   ✅ Updated stack-auth.md with Better Auth patterns
   ✅ Enhanced validate.mjs contamination with client auth rule
   ✅ Added AI hint for Better Auth organizations

6. REVIEW: External validation (--review mode)...

   Task({ subagent_type: "reviewer", prompt: "Validate session" })

   Reviewer Agent:
   Grading session execution...
   - AUDIT: A (95/100) - Thorough
   - BUILD: B+ (88/100) - Good delegation
   - VALIDATE: A (95/100) - Comprehensive
   - REFLECT: B (85/100) - Missed one root cause

   Overall: B+ (90/100)

   Validating improvements...
   - ✅ APPROVED: stack-auth.md update
   - ✅ APPROVED: contamination-checks enhancement
   - ✅ APPROVED: AI hint addition
   - ❌ REJECTED: pre-commit hook (use ESLint instead)

   Blind spots identified:
   - Type safety not enforced in agent handoffs
   - AI hints lack practical examples

   Counter-proposals:
   - Add typescript reviewer dependency to integrations.md
   - Create type-safe delegation guide

   ✅ session-review-20251006.md
   ✅ validated-improvements-20251006.md
   ✅ blind-spots-20251006.md
   ✅ final-recommendations-20251006.md

7. VERIFY: Automated testing...

   Creating test branch: verify-improvements-20251006
   Applying 3 approved improvements...

   Running verification suite...
   ✅ contamination-checks: PASSED
   ✅ typecheck: PASSED
   ✅ lint: PASSED
   ✅ circular-deps: PASSED
   ✅ agent-syntax: PASSED
   ✅ memory-integrity: PASSED

   Pass rate: 100% (6/6 tests)
   Status: ✅ APPROVED FOR COMMIT

8. COMMIT: Applying validated improvements...

   Creating separate commits...

   improve(agents): enhance stack-auth with Better Auth v3 patterns
   [commit hash: a1b2c3d]

   improve(guardrails): add client-side auth import check
   [commit hash: e4f5g6h]

   docs: add Better Auth organizations AI hint
   [commit hash: i7j8k9l]

   Updating metrics...
   ✅ improvement-metrics.json updated
   - Proposed: 4 improvements
   - Approved: 3 improvements
   - Rejected: 1 improvement
   - Pass rate: 100%

9. REPORT: Session summary...

   Features Completed:
   - ✅ Better Auth organizations
   - ✅ stack-auth agent created
   - ✅ Contamination checks automated

   Issues Discovered (next iteration):
   - ⚠️  Better Auth edge runtime testing
   - ⚠️  Organization role migration needed

   Improvements Applied:
   - ✅ 3 verified improvements committed
   - ✅ 1 improvement rejected (with alternative)

   Worktree Status:
   - Location: .tmp/fullservice-20251006-143022
   - Branch: fullservice-20251006-143022
   - Clean: Yes
   - Ready for review

   Next Session:
   - Use reviewer feedback on type safety
   - Address 2 discovered issues
   - Test improvements effectiveness

User reviews, merges, runs /fullservice again.
```

### Example 2: Verification Failure & Recovery

```
[... AUDIT, BUILD, VALIDATE, DISCOVER, REFLECT, REVIEW phases complete ...]

7. VERIFY: Automated testing...

   Creating test branch: verify-improvements-20251007
   Applying 5 approved improvements...

   Running verification suite...
   ✅ contamination-checks: PASSED
   ❌ typecheck: FAILED
      Error: Type 'string | undefined' not assignable to 'string'
      File: .claude/agents/orchestrator.md:42
   ✅ lint: PASSED
   ✅ circular-deps: PASSED
   ❌ agent-syntax: FAILED
      Error: Missing required section '## Scope'
      File: .claude/agents/integrations.md
   ✅ memory-integrity: PASSED

   Pass rate: 66.7% (4/6 tests)
   Status: ⚠️  REVIEW REQUIRED

   Decision: Manual review needed before commit.

   Creating verification-results-20251007.md...

   Failures:
   1. typecheck: orchestrator.md has type error
   2. agent-syntax: integrations.md missing section

   Options:
   A. Fix issues and re-verify
   B. Rollback and revise proposals

Orchestrator:
   Reviewing failures...

   Issue 1: orchestrator.md line 42 - Easy fix (add type guard)
   Issue 2: integrations.md - Forgot to add ## Scope section

   Decision: FIX AND RE-VERIFY

   Fixing issues on test branch...

   Edit: orchestrator.md:42
   - const value = config.get('key')
   + const value = config.get('key') ?? 'default'

   Edit: integrations.md (add missing section)
   + ## Scope
   + Third-party API integrations...

   Committing fixes...
   git add .claude/agents/orchestrator.md .claude/agents/integrations.md
   git commit -m "fix: address verification failures"

   Re-running verification suite...
   ✅ contamination-checks: PASSED
   ✅ typecheck: PASSED (FIXED)
   ✅ lint: PASSED
   ✅ circular-deps: PASSED
   ✅ agent-syntax: PASSED (FIXED)
   ✅ memory-integrity: PASSED

   Pass rate: 100% (6/6 tests)
   Status: ✅ APPROVED FOR COMMIT (after fixes)

   Updating verification-results-20251007.md with recovery...

8. COMMIT: Applying validated improvements (including fixes)...
   [... normal COMMIT flow ...]
```

---

## Troubleshooting Guide

### Issue: Worktree Creation Fails

**Symptoms**: `git worktree add` fails with "not a git repository"

**Cause**: Command run from wrong directory

**Fix**:
```typescript
// Always specify cwd explicitly
await mcp__git__git_worktree({
  cwd: REPO_ROOT, // Always use absolute path
  args: ['add', '-b', branchName, worktreePath]
});
```

### Issue: Files "Missing" in Worktree

**Symptoms**: `turbo.json`, `pnpm-workspace.yaml` not found

**Cause**: Worktree created from wrong branch or location

**Fix**:
```typescript
// Remove broken worktree
await mcp__git__git_worktree({
  cwd: REPO_ROOT,
  args: ['remove', '--force', worktreePath]
});

// Recreate from correct location
await mcp__git__git_worktree({
  cwd: REPO_ROOT, // Must be repo root
  args: ['add', '-b', branchName, worktreePath]
});
```

### Issue: Bash Commands Run in Wrong Directory

**Symptoms**: `pnpm command not found` or files not found

**Cause**: Bash tool doesn't preserve working directory

**Fix**:
```typescript
// Always include cd in same command
await Bash({
  command: `cd ${worktreePath} && pnpm typecheck`
});

// Not this:
await Bash({ command: `cd ${worktreePath}` }); // ❌
await Bash({ command: 'pnpm typecheck' }); // ❌ Runs in wrong dir
```

### Issue: Contamination Checks Fail After Improvements

**Symptoms**: Verification fails on validate.mjs contamination

**Cause**: Improvement introduced new violation or check is too strict

**Fix**:
```bash
# Run manually to see exact failure
cd $WORKTREE_PATH
./node scripts/validate.mjs contamination

# Review the specific check that failed
# Either:
# A. Fix the improvement to not violate
# B. Adjust check if false positive
```

### Issue: Memory Files Exceed Limit

**Symptoms**: `quick-context.md` over 500 lines

**Cause**: Too many checkpoints without archiving old sessions

**Fix**:
```typescript
// Archive old sessions
const quickContext = await Read({
  file_path: '.claude/memory/quick-context.md'
});

// Move sessions older than 7 days to archive
const sessions = parseCheckpoints(quickContext);
const recent = sessions.filter(s => isWithinDays(s.timestamp, 7));
const old = sessions.filter(s => !isWithinDays(s.timestamp, 7));

// Write recent to quick-context
await Write({
  file_path: '.claude/memory/quick-context.md',
  content: formatCheckpoints(recent)
});

// Archive old to dated file
await Write({
  file_path: `.claude/memory/archive/quick-context-${timestamp}.md`,
  content: formatCheckpoints(old)
});
```

### Issue: Specialist Doesn't Have Necessary Context

**Symptoms**: Specialist asks for information orchestrator already has

**Cause**: Handoff prompt missing key details

**Fix**:
```typescript
// Include all necessary context in Task prompt
await Task({
  subagent_type: 'stack-prisma',
  description: 'Fix Prisma Zod generator',
  prompt: `You are the stack-prisma specialist.

CONTEXT:
- Issue: Prisma Zod generator silent failure
- Location: packages/pkgs-databases/prisma/prisma/schema.prisma
- Current generator name: "client"
- Expected output: 9 Zod schema files
- Actual output: 0 files

TASK:
Diagnose and fix the Zod generator configuration.

RESOURCES:
- Schema: packages/pkgs-databases/prisma/prisma/schema.prisma
- Config: packages/pkgs-databases/prisma/prisma/zod-generator.config.json
- Package: packages/pkgs-databases/prisma/package.json

SUCCESS CRITERIA:
- pnpm exec prisma generate produces Zod schemas
- pnpm typecheck --filter @repo/db-prisma passes
- Document root cause in .claude/memory/stack-prisma-learnings.md

HANDOFF:
Return to orchestrator when complete with summary of fix and verification results.`
});
```

### Issue: Type Errors After Agent Updates

**Symptoms**: TypeScript compilation fails after updating agent .md files

**Cause**: Agent markdown syntax broke TypeScript code fence

**Fix**:
```markdown
<!-- Make sure code fences are properly closed -->

✅ Correct:
```typescript
const value = "example";
```

❌ Wrong:
```typescript
const value = "example"
// Missing closing fence
```

### Issue: Improvements Verified But Don't Help Next Session

**Symptoms**: Metrics show 0% improvement despite 100% verification pass rate

**Cause**: Improvements address symptoms not root causes

**Fix**:
```typescript
// Reviewer should catch this, but if not:

// ❌ Symptom fix
"Add comment explaining why this is confusing"

// ✅ Root cause fix
"Rename function from doThing() to validateUserAuth() for clarity"

// ❌ Symptom fix
"Add try-catch around database call"

// ✅ Root cause fix
"Add connection pool with retry logic for transient failures"
```

---

**End of Extended Guide** | For quick reference, see `.claude/commands/fullservice.md`
