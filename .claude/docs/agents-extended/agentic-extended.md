# Agentic Extended Guide

Comprehensive patterns, workflows, and examples for the agentic automation and agent tooling specialist.

## Table of Contents

1. [Detailed Agent Configuration Patterns](#detailed-agent-configuration-patterns)
2. [Slash Command Specifications](#slash-command-specifications)
3. [Automatic Delegation Patterns](#automatic-delegation-patterns)
4. [Common Task Workflows](#common-task-workflows)
5. [Agent Coordination Best Practices](#agent-coordination-best-practices)
6. [Contamination Guardrails](#contamination-guardrails)
7. [Memory Management Patterns](#memory-management-patterns)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## Detailed Agent Configuration Patterns

### Pattern 1: Complete Agent Frontmatter

```yaml
---
name: agent-name
description: "Clear one-line description of agent purpose and scope"
model: claude-sonnet-4-5
fallback_model: claude-sonnet-4-1
allowed_tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - TodoWrite
  - memory
  - Task
  - mcp__context7__resolve-library-id
  - mcp__context7__get-library-docs
  - mcp__perplexity__search
  - mcp__perplexity__reason
  - mcp__git__git_status
  - mcp__git__git_diff
  - mcp__git__git_log
permission_mode: acceptEdits  # or "manual" for orchestrator
max_turns: 60
thinking_budget: 2048
memory_scope: project
checkpoint_enabled: true
delegation_type: auto
session_persistence: true
---
```

**Field Explanations:**

- **name**: Unique identifier matching filename
- **description**: One-line summary (shown in agent list)
- **model**: Primary model (claude-sonnet-4-5 for specialists)
- **fallback_model**: Backup model if primary unavailable
- **allowed_tools**: Explicit list of permitted tools
- **permission_mode**:
  - `acceptEdits`: Auto-approve file edits (specialists)
  - `manual`: Require approval (orchestrator)
- **max_turns**: Conversation limit before handoff
- **thinking_budget**: Token budget for <thinking> blocks
- **memory_scope**: `project` (shared) or `agent` (isolated)
- **checkpoint_enabled**: Enable memory checkpoints
- **delegation_type**: `auto` (can spawn sub-agents)
- **session_persistence**: Maintain state across invocations

### Pattern 2: Mission Statement

```markdown
## Mission

Own [domain] for Forge. [High-level responsibility] while [key constraints/goals].

**Example (TypeScript Specialist):**
Own TypeScript configuration across the Forge monorepo. Drive type safety through strict compiler options, maintain shared type utilities, and ensure consistent tsconfig patterns without breaking existing code.

**Example (Performance Specialist):**
Own Forge observability and performance. Monitor web vitals, profile bottlenecks, optimize bundle size and runtime metrics while coordinating with stack specialists on implementation.
```

**Key elements:**
1. Clear ownership scope
2. Primary responsibility
3. Constraints or goals
4. Coordination context (if applicable)

### Pattern 3: Domain Boundaries

```markdown
## Domain Boundaries

### Allowed
- Specific directories/files (be explicit)
- Types of changes permitted
- Configuration areas owned
- Integration points managed

### Forbidden
- ❌ Areas outside expertise (delegate to X)
- ❌ Changes requiring coordination (coordinate with Y)
- ❌ Security-sensitive operations (coordinate with security)
- ❌ Production operations (coordinate with infra)
```

**Best Practices:**
- Use explicit file paths or glob patterns
- Always specify who to delegate/coordinate with
- Include examples of edge cases
- Link to related specialists

### Pattern 4: Handoff Protocols

```markdown
## Handoff Protocols

### To Orchestrator

Report when:
- [Trigger condition 1]
- [Trigger condition 2]
- [Escalation scenario]

**Format**:
\`\`\`markdown
**Status**: ✅ Complete | 🔄 In Progress | ⚠️ Blocked
**Affected**: [specific packages/apps]
**Changes**: [file:line references]
**Testing**: [commands run]
**Impact**: [performance/functionality description]
**Next**: [required actions]
\`\`\`

### From Orchestrator

Expect:
- TodoWrite tasks with specific targets
- Links to relevant context
- Acceptance criteria
- Coordination requirements

### Cross-Agent Coordination

Coordinate with:
- **[Agent 1]**: [What requires coordination]
- **[Agent 2]**: [Integration points]
```

### Pattern 5: Common Patterns Section

```markdown
## Common Patterns

### ✅ Good Patterns

#### Pattern Name 1
\`\`\`typescript
// Working example with comments explaining why it's good
export const config = {
  // ...
};
\`\`\`

#### Pattern Name 2
\`\`\`typescript
// Another good example
\`\`\`

### ❌ Anti-Patterns

#### Anti-Pattern Name 1
\`\`\`typescript
// Example to avoid with explanation
// ❌ BAD: This breaks X because Y
\`\`\`

**Solution:**
\`\`\`typescript
// ✅ GOOD: Correct approach
\`\`\`
```

---

## Slash Command Specifications

### Pattern 1: Complete Command Spec Template

```markdown
# /commandname Command Spec

## Overview

Clear description of what the command does, when to use it, and what problems it solves.

## Usage

\`\`\`bash
# Required: Permission bypass for autonomous operation
claude --dangerously-skip-permissions

# Command invocation
> /commandname [--flag] <arg>
\`\`\`

## Flags

- `--plan`: Dry run mode, show plan without executing
- `--resume`: Continue from previous interrupted session
- `--flag`: Description of what this flag does

## Permissions

**Required:**
- File system write access (agent edits code)
- Git operations (commits, branches, worktrees)
- Package manager execution (pnpm commands)

**Why `--dangerously-skip-permissions` is required:**
[Explanation of why this command needs permission bypass]

## Workflow Stages

### Stage 1: [Name]
**Purpose**: [What this stage accomplishes]

**Steps**:
1. [Step 1 description]
2. [Step 2 description]

**Outputs**:
- [File/artifact created]
- [TodoWrite entries]

### Stage 2: [Name]
...

## Success Criteria

Command completes when:
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Final checkpoint documented]

## Stop Conditions

Command halts if:
- User requests cancellation
- Unrecoverable errors detected
- Permission escalation needed
- Maximum iterations reached

## Outputs

### Files Created/Modified
- `.claude/memory/quick-context.md` - Session state
- [Other files]

### Reports Generated
- [Report name] - [Purpose and location]

### State Changes
- TodoWrite updated with final status
- Memory checkpoints created
- Git commits (if applicable)

## Example Session

\`\`\`bash
> /commandname --plan

[Example output showing plan]

> /commandname

[Example output showing execution]
\`\`\`

## Troubleshooting

**Issue**: [Common problem]
**Solution**: [How to resolve]

**Issue**: [Another problem]
**Solution**: [Resolution steps]
```

### Pattern 2: Command Coordination with Orchestrator

```markdown
## Delegation Strategy

### Automatic Specialist Delegation

When [condition], the orchestrator automatically:

1. **Create TodoWrite entry**:
   \`\`\`json
   {
     "status": "handoff",
     "owner": "<specialist-name>",
     "task": "Clear task description",
     "details": "Specific requirements",
     "acceptance": "Completion criteria"
   }
   \`\`\`

2. **Spawn specialist**:
   \`\`\`typescript
   Task({
     subagent_type: "<specialist-name>",
     description: "Brief task summary",
     prompt: "Detailed task prompt with context and acceptance criteria"
   })
   \`\`\`

3. **Update tracking**:
   - Update quick-context.md with delegation
   - Log task ID in tool-audit.log
   - End current BUILD phase
   - Move to DISCOVER phase

### Manual Specialist Invocation

For tasks requiring human judgment:
1. Present options to user
2. Wait for selection
3. Delegate to chosen specialist
4. Track decision in memory
```

---

## Automatic Delegation Patterns

### Pattern 1: Error-Triggered Delegation

```typescript
// In orchestrator workflow
const typeErrors = await runTypecheck();

if (typeErrors.count > 10 && typeErrors.scope === 'single-package') {
  // Automatic delegation to typescript specialist
  await TodoWrite({
    todos: [
      {
        content: `Fix ${typeErrors.count} type errors in ${typeErrors.package}`,
        status: 'handoff',
        activeForm: 'Fixing type errors',
        owner: 'typescript'
      }
    ]
  });

  await Task({
    subagent_type: 'typescript',
    description: `Fix type errors in ${typeErrors.package}`,
    prompt: `
      Package ${typeErrors.package} has ${typeErrors.count} type errors.

      Files affected:
      ${typeErrors.files.map(f => `- ${f.path}:${f.line}`).join('\n')}

      Acceptance criteria:
      - pnpm typecheck --filter ${typeErrors.package} passes
      - No new type errors introduced
      - Changes documented in memory
    `
  });

  // Update tracking
  await memory.write('quick-context.md', {
    lastDelegation: {
      to: 'typescript',
      reason: `${typeErrors.count} type errors in ${typeErrors.package}`,
      timestamp: new Date().toISOString()
    }
  });

  // End BUILD phase
  return { phase: 'DISCOVER', reason: 'Type errors require specialist' };
}
```

### Pattern 2: Token-Pressure Delegation

```typescript
// Check token usage
const tokenUsage = getTokenUsage();

if (tokenUsage.percentage > 80 && hasBlockingIssues()) {
  // Delegate to most relevant specialist
  const specialist = determineSpecialist(blockingIssues);

  await TodoWrite({
    todos: [
      {
        content: `Complete ${blockingIssues.length} blocking issues`,
        status: 'handoff',
        activeForm: 'Completing blocking issues',
        owner: specialist
      }
    ]
  });

  await Task({
    subagent_type: specialist,
    description: 'Complete blocking issues',
    prompt: `
      Token pressure detected (${tokenUsage.percentage}% used).

      Blocking issues:
      ${blockingIssues.map(i => `- ${i.description}`).join('\n')}

      Complete these issues and report back with:
      - Changes made (file:line)
      - Tests run
      - Next steps
    `
  });

  return { phase: 'DISCOVER', reason: 'Token pressure requires delegation' };
}
```

### Pattern 3: Domain-Triggered Delegation

```typescript
// Detect domain-specific changes
const changedFiles = await git.diff();

if (changedFiles.some(f => f.path.includes('prisma/schema.prisma'))) {
  // Always delegate Prisma changes to stack-prisma
  await Task({
    subagent_type: 'stack-prisma',
    description: 'Review Prisma schema changes',
    prompt: `
      Prisma schema has been modified.

      Changes:
      ${changedFiles.filter(f => f.path.includes('prisma')).map(f => f.path).join('\n')}

      Please:
      1. Validate schema with pnpm prisma validate
      2. Generate migration if needed
      3. Run quality gates
      4. Update types
      5. Report impact
    `
  });
}

if (changedFiles.some(f => f.path.includes('middleware.ts'))) {
  // Coordinate on middleware changes
  await Task({
    subagent_type: 'stack-next-react',
    description: 'Review middleware changes',
    prompt: `
      Middleware modified. Coordinate with stack-auth to ensure:
      1. Edge runtime compatibility
      2. Auth checks correct
      3. Performance acceptable
    `
  });
}
```

---

## Common Task Workflows

### Workflow 1: Create New Agent

**Step-by-step process:**

#### 1. Copy Template

```bash
# Use existing agent as template
cp .claude/agents/stack-next-react.md .claude/agents/new-agent.md
```

#### 2. Define Frontmatter

```yaml
---
name: new-agent
description: "Clear one-line description"
model: claude-sonnet-4-5
fallback_model: claude-sonnet-4-1
allowed_tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - TodoWrite
  - memory
  - Task
  # Add specialized tools if needed
permission_mode: acceptEdits
max_turns: 60
thinking_budget: 2048
memory_scope: project
checkpoint_enabled: true
delegation_type: auto
session_persistence: true
---
```

#### 3. Write Mission

```markdown
## Mission

Own [specific domain] for Forge. [Primary responsibility] while [constraints].
```

#### 4. Define Domain Boundaries

```markdown
## Domain Boundaries

### Allowed
- [Specific files/directories]
- [Types of changes]
- [Configuration areas]

### Forbidden
- ❌ [Out of scope areas] (delegate to X)
- ❌ [Requires coordination] (coordinate with Y)
```

#### 5. Add Default Tests

```markdown
## Default Tests

\`\`\`bash
# Quality gates
pnpm lint --filter [scope]
pnpm typecheck --filter [scope]
pnpm vitest --filter [scope] --run

# Integration tests (if applicable)
pnpm playwright test -- [spec]
\`\`\`

### Verification Checklist
- [ ] [Check 1]
- [ ] [Check 2]
```

#### 6. Document Patterns

```markdown
## Common Patterns

### ✅ Good Patterns

#### Pattern Name
\`\`\`typescript
// Example code
\`\`\`

### ❌ Anti-Patterns

#### Anti-Pattern Name
\`\`\`typescript
// Bad example
\`\`\`

**Solution:**
\`\`\`typescript
// Good example
\`\`\`
```

#### 7. Add to Orchestrator Matrix

```markdown
# In .claude/agents/orchestrator.md

| Agent | Domain | Coordinates With | Decision Authority |
|-------|--------|------------------|-------------------|
| **new-agent** | [domain] | [other agents] | [decisions] |
```

#### 8. Update AGENTS.md

```markdown
# In AGENTS.md

## Specialist Agents

### [New Agent Category]

- **new-agent**: [Description]
```

#### 9. Document in README

```markdown
# In .claude/README.md

### Specialist Agents (by domain)

#### [Category]
- **new-agent** (`.claude/agents/new-agent.md`): [Description]
```

#### 10. Test Agent

```bash
# Invoke agent via orchestrator or directly
claude --dangerously-skip-permissions

> Can you test the new-agent configuration?
```

### Workflow 2: Create New Slash Command

**Step-by-step process:**

#### 1. Create Command File

```bash
touch .claude/commands/mycommand.md
```

#### 2. Write Command Spec

```markdown
# /mycommand Command Spec

## Overview
[What the command does]

## Usage
\`\`\`bash
claude --dangerously-skip-permissions
> /mycommand [--flag] <arg>
\`\`\`

## Permissions
**Required:**
- [Permission 1]
- [Permission 2]

## Workflow Stages

### Stage 1: [Name]
**Purpose**: [Goal]

**Steps**:
1. [Step]
2. [Step]

### Stage 2: [Name]
...

## Success Criteria
- [ ] [Criterion]

## Outputs
- [File/report]
```

#### 3. Add to AGENTS.md

```markdown
# In AGENTS.md

## Available Commands

- `/mycommand [--flag]` - [Description]
```

#### 4. Create TodoWrite Template (if needed)

```markdown
# In command spec

## TodoWrite Template

\`\`\`json
[
  {
    "content": "Stage 1: [Description]",
    "status": "pending",
    "activeForm": "Stage 1 in progress"
  }
]
\`\`\`
```

#### 5. Test Command

```bash
# Test in plan mode first
> /mycommand --plan

# Then execute
> /mycommand
```

### Workflow 3: Update Agent Coordination Matrix

**Step-by-step process:**

#### 1. Open Orchestrator Config

```bash
open .claude/agents/orchestrator.md
```

#### 2. Update Coordination Matrix

```markdown
| Agent | Domain | Coordinates With | Decision Authority |
|-------|--------|------------------|-------------------|
| **updated-agent** | [new domain] | [new agents] | [new decisions] |
```

#### 3. Add/Modify Conflict Resolution

```markdown
### Conflict Resolution

1. **New conflict type** → [Resolution process]
```

#### 4. Update Coordination Examples

```markdown
### Coordination Example: [New Scenario]

**Situation**: [Describe conflict]

**Resolution**:
1. [Step 1]
2. [Step 2]

**Decision**: [Who decides]
```

#### 5. Verify All Agents Listed

```bash
# Check all agents from AGENTS.md are in matrix
grep "^- \*\*" AGENTS.md | wc -l  # Count agents
grep "^\| \*\*" .claude/agents/orchestrator.md | wc -l  # Count matrix rows
```

### Workflow 4: Add Automation Guardrail

**Step-by-step process:**

#### 1. Create Script

```bash
touch .claude/scripts/my-guardrail.sh
chmod +x .claude/scripts/my-guardrail.sh
```

#### 2. Write Guardrail Logic

```bash
#!/usr/bin/env bash
# .claude/scripts/my-guardrail.sh

set -euo pipefail

echo "Running my-guardrail check..."

# Example: Check for forbidden patterns
if rg "FORBIDDEN_PATTERN" packages/*/src; then
  echo "❌ ERROR: Forbidden pattern detected"
  exit 1
fi

echo "✅ PASSED: my-guardrail check"
exit 0
```

#### 3. Add to Pre-Commit Hook

```bash
# In .claude/scripts/pre-commit.sh

# Add new guardrail
.claude/scripts/my-guardrail.sh || {
  echo "❌ my-guardrail check failed"
  exit 1
}
```

#### 4. Document in CLAUDE.md

```markdown
# In CLAUDE.md

## Automation Guardrails

- **my-guardrail**: [Description of what it checks]
```

#### 5. Test with Known Violations

```bash
# Create test case
echo "FORBIDDEN_PATTERN" > test-violation.txt

# Run guardrail (should fail)
.claude/scripts/my-guardrail.sh

# Clean up
rm test-violation.txt
```

#### 6. Add to CI Workflow

```yaml
# In .github/workflows/quality-gates.yml

- name: Run my-guardrail
  run: .claude/scripts/my-guardrail.sh
```

### Workflow 5: Update Agent for Forge Rigor

**Step-by-step process:**

#### 1. Audit Current Agent

```markdown
Checklist:
- [ ] Mission statement clear?
- [ ] Domain boundaries explicit?
- [ ] Contamination rules defined?
- [ ] Handoff protocols structured?
- [ ] Common patterns with code examples?
- [ ] Performance targets listed?
- [ ] Common tasks documented?
- [ ] Resources section complete?
- [ ] Escalation paths defined?
```

#### 2. Add Missing Sections

```markdown
## Mission
[If missing, add clear mission]

## Domain Boundaries

### Allowed
[List explicit allowed areas]

### Forbidden
[List forbidden areas with delegation targets]

## Contamination Rules
[Add import/export rules specific to domain]

## Common Patterns

### ✅ Good Patterns
[Add code examples]

### ❌ Anti-Patterns
[Add anti-patterns with solutions]

## Performance Targets
[Add measurable targets]

## Common Tasks
[Add step-by-step workflows]

## Resources
[Add relevant docs]

## Escalation Paths
[Define when to escalate]
```

#### 3. Verify Consistency

```bash
# Check all agents have required sections
for agent in .claude/agents/*.md; do
  echo "Checking $agent..."
  grep "## Mission" "$agent" || echo "  ❌ Missing Mission"
  grep "## Domain Boundaries" "$agent" || echo "  ❌ Missing Boundaries"
  grep "## Contamination Rules" "$agent" || echo "  ❌ Missing Rules"
  grep "## Common Patterns" "$agent" || echo "  ❌ Missing Patterns"
done
```

#### 4. Update Extended Docs

```bash
# Create extended guide if needed
touch .claude/docs/agents-extended/${agent}-extended.md
```

#### 5. Test Updated Agent

```bash
# Invoke agent and verify it has all context
claude --dangerously-skip-permissions

> Can you review your configuration and confirm all sections are present?
```

---

## Agent Coordination Best Practices

### Best Practice 1: Clear Decision Authority

```markdown
## Decision Matrix

| Decision Type | Owner | Consult | Inform |
|--------------|-------|---------|--------|
| Schema changes | stack-prisma | stack-next-react, stack-auth | orchestrator |
| Auth flow | stack-auth | stack-next-react, infra | orchestrator |
| UI patterns | stack-tailwind-mantine | stack-next-react | docs |
| Performance targets | performance | All specialists | orchestrator |
```

**Usage:**
- **Owner**: Makes final decision
- **Consult**: Must be consulted before decision
- **Inform**: Must be informed after decision

### Best Practice 2: Handoff Packets

```markdown
## Handoff Packet Template

**From**: [Agent name]
**To**: [Agent name]
**Context**: [What led to this handoff]

**Work Completed**:
- [File:line] - [Change description]
- [File:line] - [Change description]

**Tests Run**:
\`\`\`bash
pnpm typecheck --filter [scope]  # ✅ Passed
pnpm vitest --filter [scope]     # ✅ Passed
\`\`\`

**Remaining Work**:
- [ ] [Task 1]
- [ ] [Task 2]

**Blockers**:
- [Blocker description] - needs [specialist]

**Documentation**:
- Updated: [files]
- Memory checkpoint: [timestamp]

**Next Steps**:
1. [Action 1]
2. [Action 2]
```

### Best Practice 3: Conflict Resolution Protocol

```markdown
## Conflict Resolution Steps

1. **Identify Conflict**
   - Document disagreement
   - List affected agents
   - Describe impact

2. **Attempt Resolution**
   - Agents discuss via TodoWrite comments
   - Reference domain boundaries
   - Check coordination matrix

3. **Escalate if Unresolved**
   - Notify orchestrator
   - Provide context and options
   - Request decision

4. **Document Decision**
   - Record in memory
   - Update relevant agent configs
   - Notify affected agents

5. **Prevent Recurrence**
   - Update coordination matrix
   - Clarify domain boundaries
   - Add to FAQ
```

### Best Practice 4: Parallel Specialist Management

```markdown
## Managing Multiple Specialists

### Maximum Concurrency: 5 Specialists

**When to Scale Down:**
- Token usage > 80%
- Memory pressure detected
- Too many context switches
- Coordination overhead high

**Prioritization:**
1. Blocking issues first
2. Critical path items
3. High-impact optimizations
4. Nice-to-have improvements

**Tracking:**
\`\`\`json
{
  "active_specialists": [
    { "name": "stack-prisma", "task": "Schema migration", "priority": 1 },
    { "name": "stack-auth", "task": "RBAC implementation", "priority": 1 },
    { "name": "testing", "task": "E2E coverage", "priority": 2 }
  ],
  "queued_specialists": [
    { "name": "performance", "task": "Bundle optimization", "priority": 3 }
  ]
}
\`\`\`
```

---

## Contamination Guardrails

### Guardrail 1: Framework Entrypoint Allowlist

```bash
#!/usr/bin/env bash
# .claude/scripts/framework-entrypoint-check.sh

set -euo pipefail

echo "Checking framework entrypoint allowlist..."

# Define allowlisted packages
ALLOWED_PACKAGES=(
  "@repo/auth"
)

# Define sanctioned subpaths
SANCTIONED_SUBPATHS=(
  "/server/next"
  "/server/edge"
  "/client/next"
)

# Check for Next.js imports in package source
for pkg in packages/*/src/**/*.ts; do
  package_name=$(echo "$pkg" | cut -d'/' -f2)

  # Skip allowlisted packages
  if [[ " ${ALLOWED_PACKAGES[@]} " =~ " @repo/${package_name} " ]]; then
    # Check that Next.js imports only in sanctioned files
    if grep -q "from ['\"]next" "$pkg"; then
      filename=$(basename "$pkg")
      if [[ ! "$filename" =~ (server-next|server-edge|client-next)\.ts ]]; then
        echo "❌ VIOLATION: Next.js import in non-sanctioned file: $pkg"
        exit 1
      fi
    fi
  else
    # Not allowlisted - no Next.js imports allowed
    if grep -q "from ['\"]next" "$pkg"; then
      echo "❌ VIOLATION: Next.js import in non-allowlisted package: $pkg"
      echo "   Package @repo/${package_name} is not allowlisted."
      echo "   If this is intentional, add to allowlist in orchestrator.md"
      exit 1
    fi
  fi
done

echo "✅ PASSED: Framework entrypoint check"
exit 0
```

### Guardrail 2: Deep Import Check

```bash
#!/usr/bin/env bash
# .claude/scripts/deep-import-check.sh

set -euo pipefail

echo "Checking for deep imports..."

# Find deep imports in apps
if rg "@repo/.+?/src/" apps/ --type ts --type tsx; then
  echo "❌ VIOLATION: Deep imports detected in apps"
  echo "   Use public exports only: @repo/package (not @repo/package/src/*)"
  exit 1
fi

echo "✅ PASSED: No deep imports"
exit 0
```

### Guardrail 3: Node API in Client Check

```bash
#!/usr/bin/env bash
# .claude/scripts/client-node-api-check.sh

set -euo pipefail

echo "Checking for Node APIs in client components..."

# List of Node.js core modules
NODE_APIS=(
  "fs"
  "path"
  "crypto"
  "os"
  "process"
  "child_process"
)

# Find client components
client_files=$(rg -l "'use client'" apps/ packages/ --type ts --type tsx || true)

# Check each client file for Node API imports
for file in $client_files; do
  for api in "${NODE_APIS[@]}"; do
    if grep -q "from ['\"]$api['\"]" "$file"; then
      echo "❌ VIOLATION: Node API '$api' imported in client component: $file"
      exit 1
    fi
  done
done

echo "✅ PASSED: No Node APIs in client components"
exit 0
```

### Guardrail 4: Edge Runtime Check

```bash
#!/usr/bin/env bash
# .claude/scripts/edge-runtime-check.sh

set -euo pipefail

echo "Checking edge runtime compatibility..."

# Find middleware files
middleware_files=$(find apps/ -name "middleware.ts" || true)

# Check for Node APIs in middleware
for file in $middleware_files; do
  if grep -q "from ['\"]fs['\"]" "$file"; then
    echo "❌ VIOLATION: Node API in edge middleware: $file"
    echo "   Edge runtime cannot use fs module"
    exit 1
  fi

  # Check for correct auth import
  if grep -q "@repo/auth/server/next" "$file"; then
    echo "❌ VIOLATION: Wrong auth import in middleware: $file"
    echo "   Use @repo/auth/server/edge for edge runtime"
    exit 1
  fi
done

echo "✅ PASSED: Edge runtime check"
exit 0
```

---

## Memory Management Patterns

### Pattern 1: Quick Context Update

```markdown
## Checkpoint: [Task Name] (2025-01-15T14:30:00Z)

**Status**: ✅ Complete | 🔄 In Progress | ⏸️ Blocked

**Agent**: agentic

**Changes**:
- .claude/agents/new-agent.md:1-100 (created)
- .claude/agents/orchestrator.md:112 (added to matrix)
- AGENTS.md:45 (documented)

**Type**: New agent creation

**Purpose**: Enable specialized handling of [domain]

**Coordination**:
- Consulted: orchestrator (coordination matrix)
- Informed: docs (README update)

**Testing**:
\`\`\`bash
# Validated agent config
pnpm turbo run agents:validate  # ✅ Passed

# Tested invocation
# Agent responded correctly to test prompt
\`\`\`

**Impact**:
- +1 agent (now 19 total)
- Orchestrator delegation updated
- Agent matrix expanded

**Next Steps**:
- [ ] Monitor agent performance in first session
- [ ] Gather feedback from orchestrator
- [ ] Refine patterns based on usage
```

### Pattern 2: Agent Learnings Log

```markdown
## [2025-01-15] Agent Creation: stack-new-domain

**Type**: New specialist agent

**Purpose**: Own [domain] for Forge with [specific responsibility]

**Files Created**:
- `.claude/agents/stack-new-domain.md` (185 lines)
- `.claude/docs/agents-extended/stack-new-domain-extended.md` (800 lines)

**Configuration**:
- Model: claude-sonnet-4-5
- Permission: acceptEdits
- Max turns: 60
- Delegation: auto

**Domain Boundaries**:
- **Allowed**: [specific areas]
- **Forbidden**: [delegated areas]

**Coordination**:
- Primary: [agent1], [agent2]
- Secondary: [agent3]

**Patterns Documented**:
1. [Pattern 1 name]
2. [Pattern 2 name]
3. [Pattern 3 name]

**Testing**:
- Config validation: ✅ Passed
- Test invocation: ✅ Responded correctly
- Integration test: ✅ Coordinated with orchestrator

**Learning**: [Key insight from creating this agent]

**Next**: Monitor performance over 5 sessions, refine based on feedback
```

### Pattern 3: Command Documentation

```markdown
## [2025-01-15] Command Creation: /newcommand

**Type**: New slash command

**Purpose**: [What the command accomplishes]

**File**: `.claude/commands/newcommand.md`

**Stages**:
1. STAGE1: [Name] - [Purpose]
2. STAGE2: [Name] - [Purpose]
3. STAGE3: [Name] - [Purpose]

**Delegation Pattern**:
- Orchestrator spawns [specialists]
- Automatic delegation when [condition]

**Permissions Required**:
- `--dangerously-skip-permissions` (why: [reason])
- File write access
- Git operations
- Package manager execution

**Success Criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] Memory checkpointed

**Testing**:
\`\`\`bash
# Plan mode test
> /newcommand --plan
# ✅ Plan generated correctly

# Execution test
> /newcommand
# ✅ Completed successfully
\`\`\`

**Learning**: [Key insight from creating this command]

**Next**: Monitor usage, gather feedback, optimize workflow
```

---

## Troubleshooting Guide

### Issue 1: Agent Config Validation Fails

**Symptoms:**
- `pnpm turbo run agents:validate` fails
- Error: "Invalid YAML frontmatter"

**Diagnosis:**
```bash
# Check specific agent
cat .claude/agents/problematic-agent.md | head -30

# Look for YAML syntax errors
```

**Common Causes:**
1. Missing closing `---`
2. Incorrect indentation in YAML
3. Missing required fields
4. Invalid tool names

**Solution:**
```yaml
# Ensure proper structure
---
name: agent-name
description: "Description"
model: claude-sonnet-4-5
fallback_model: claude-sonnet-4-1
allowed_tools:
  - Read  # Proper indentation (2 spaces)
  - Write
permission_mode: acceptEdits
max_turns: 60
thinking_budget: 2048
memory_scope: project
checkpoint_enabled: true
delegation_type: auto
session_persistence: true
---  # Don't forget closing

## Mission  # Content starts here
```

### Issue 2: Agent Not Responding to Invocation

**Symptoms:**
- Agent doesn't activate when invoked
- Orchestrator doesn't delegate to agent
- Agent not in available agents list

**Diagnosis:**
```bash
# Check agent is in AGENTS.md
grep "agent-name" AGENTS.md

# Check agent file exists
ls -la .claude/agents/agent-name.md

# Check orchestrator coordination matrix
grep "agent-name" .claude/agents/orchestrator.md
```

**Solution:**

1. **Add to AGENTS.md:**
```markdown
### [Category]
- **agent-name**: [Description]
```

2. **Add to orchestrator matrix:**
```markdown
| **agent-name** | [domain] | [coordinates with] | [authority] |
```

3. **Verify filename matches name in frontmatter:**
```bash
# Filename: agent-name.md
# Frontmatter: name: agent-name
```

### Issue 3: Contamination Check Failing

**Symptoms:**
- `node scripts/validate.mjs contamination` fails
- Violation detected but unclear why
- False positive on allowed pattern

**Diagnosis:**
```bash
# Run specific check manually
node scripts/validate.mjs contamination

# Check for specific violation
rg "@repo/.+?/src/" apps/ --type ts
```

**Solution:**

1. **Verify violation is real:**
```typescript
// ❌ BAD: Deep import
import { util } from '@repo/package/src/utils';

// ✅ GOOD: Public export
import { util } from '@repo/package';
```

2. **If allowlisted, verify allowlist:**
```bash
# Check if package is allowlisted
grep -A 5 "## Framework Entrypoints Policy" .claude/agents/orchestrator.md
```

3. **Update contamination script if needed:**
```bash
# Add exception for specific case
if [[ "$file" == "apps/special/exception.ts" ]]; then
  continue
fi
```

### Issue 4: Slash Command Not Found

**Symptoms:**
- `/commandname` shows "command not found"
- Command exists in `.claude/commands/`

**Diagnosis:**
```bash
# Check command file exists
ls -la .claude/commands/commandname.md

# Check filename format
# Should be: commandname.md (no leading slash)
```

**Solution:**

1. **Verify filename:**
```bash
# Correct: .claude/commands/commandname.md
# Wrong: .claude/commands//commandname.md
```

2. **Check Claude Code can read file:**
```bash
# File should be readable
chmod +r .claude/commands/commandname.md
```

3. **Restart Claude Code session:**
```bash
# Exit and restart
> exit
claude --dangerously-skip-permissions
```

### Issue 5: Agent Delegation Loop

**Symptoms:**
- Agent keeps delegating to itself
- Infinite delegation chain
- Same specialist invoked repeatedly

**Diagnosis:**
```bash
# Check TodoWrite logs
cat .claude/memory/quick-context.md | grep -A 5 "delegation"

# Check task history
# Look for repeated invocations
```

**Solution:**

1. **Add delegation guard:**
```typescript
// In orchestrator
const recentDelegations = getRecentDelegations();

if (recentDelegations.filter(d => d.to === specialist).length > 2) {
  // Too many delegations to same specialist
  throw new Error(`Delegation loop detected: ${specialist}`);
}
```

2. **Clear task boundaries:**
```markdown
## In agent config

### Forbidden
- ❌ Re-delegating to self (escalate to orchestrator instead)
```

3. **Add stop condition:**
```typescript
// In command workflow
if (iterationCount > MAX_ITERATIONS) {
  return {
    status: 'blocked',
    reason: 'Maximum iterations reached'
  };
}
```

### Issue 6: Permission Denied on Agent Operation

**Symptoms:**
- Agent tries to edit file but permission denied
- "This operation requires permission" error
- Unexpected permission prompt

**Diagnosis:**
```bash
# Check agent permission_mode
cat .claude/agents/agent-name.md | grep "permission_mode"

# Check if command invoked with permission bypass
# Should use: claude --dangerously-skip-permissions
```

**Solution:**

1. **Update agent permission_mode:**
```yaml
# For specialists (auto-approve edits)
permission_mode: acceptEdits

# For orchestrator (manual approval)
permission_mode: manual
```

2. **Use permission bypass for commands:**
```bash
# Required for autonomous operation
claude --dangerously-skip-permissions

> /commandname
```

3. **Add to allowed_tools if tool missing:**
```yaml
allowed_tools:
  - Read
  - Write
  - Edit  # Add if missing
```

---

**End of Extended Guide**

For quick reference, see `.claude/agents/agentic.md`
