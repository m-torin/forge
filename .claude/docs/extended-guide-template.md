# Extended Guide Template

**Purpose**: Structure for Tier 2 agent extended documentation in the two-tier system.

**Target Size**: Unlimited (detailed examples and comprehensive patterns)

**Last Updated**: 2025-10-07 (v2.0.0 compliant)

---

## Template Structure

```markdown
# [Agent Name] Extended Guide

> **Extended guide for [technology/domain]**: [one-line description]

---

## 1. [Core Patterns/Implementation Patterns]

### Pattern 1: [Pattern Name]

**Purpose**: [What this pattern solves]

**When to use**: [Specific scenarios]

**Implementation**:

\`\`\`typescript
// Complete, runnable code example (20-50 lines)
import { dependency } from '@repo/package';

export function example() {
  // Detailed implementation with comments
  // showing best practices
}
\`\`\`

**Key Points**:
- [Important detail 1]
- [Important detail 2]
- [Important detail 3]

**Related Patterns**: [Link to other sections]

---

### Pattern 2: Memory Tool Usage (v2.0.0)

**Purpose**: Store and retrieve agent learnings outside conversation context

**When to use**: Recording patterns, caching lookups, sharing context between sessions

**Implementation**:

\`\`\`typescript
// Basic CRUD operations with memory tool
import { memory } from '@claude/tools';

// Store learning
await memory.write({
  path: 'stack-prisma-learnings.md',
  content: \`
## Query Optimization Pattern
**Context**: Slow findMany on large tables
**Solution**: Add index on frequently queried columns
**Impact**: 10x query speedup
\`
});

// Retrieve learning
const learnings = await memory.read({
  path: 'stack-prisma-learnings.md'
});

// List all memory files
const files = await memory.list({
  directory: 'learnings/'
});

// Search memory
const results = await memory.search({
  query: 'optimization',
  directory: 'learnings/'
});
\`\`\`

**Directory Structure**:
\`\`\`
.claude/memory/
├── quick-context.md          # Current session state (500 lines)
├── full-context.md           # Long-term context (2000 lines)
├── stack-prisma-learnings.md # Agent-specific patterns
├── stack-auth-learnings.md
└── orchestrator-sessions/    # Session history
    └── 2025-10-07/
\`\`\`

**Checkpoint After**:
- Discovering new pattern
- Solving complex bug
- Completing major feature
- Before session ends

**Format**:
\`\`\`markdown
## [YYYY-MM-DD] {Task}
**Context**: {what was being done}
**Changes**: {files modified}
**Learning**: {insight or pattern discovered}
**References**: {file:line citations}
\`\`\`

**Key Points**:
- Use hierarchical directories for organization
- Keep individual files focused (1000 lines max)
- Include file:line references for patterns
- Checkpoint regularly to persist learnings

**Related Patterns**: [Session Management](#2-workflows), [Checkpointing](#session-checkpoint-pattern)

---

### Pattern 3: [Additional Pattern]

[... repeat structure ...]

---

## 2. [Workflows/Integration Patterns/Configuration]

### Workflow: Session Management & Checkpointing (v2.0.0)

**Purpose**: Maintain agent state across restarts and enable point-in-time restoration

**When to use**: Long-running sessions, before risky operations, after major milestones

**Step-by-step**:

1. **Configure Agent for Sessions**
   \`\`\`yaml
   # .claude/agents/agent-name.md
   ---
   checkpoint_enabled: true
   session_persistence: true
   memory_scope: project
   ---
   \`\`\`

2. **Create Manual Checkpoint Before Risky Operation**
   \`\`\`bash
   # Create named checkpoint
   /checkpoint "Before schema migration"
   \`\`\`

   Expected output:
   \`\`\`
   ✅ Checkpoint created: checkpoint-abc123
   \`\`\`

3. **View Available Checkpoints**
   \`\`\`bash
   /checkpoints
   \`\`\`

   Expected output:
   \`\`\`
   Recent checkpoints:
   - checkpoint-abc123: "Before schema migration" (2 min ago)
   - checkpoint-def456: "After auth implementation" (1 hour ago)
   - checkpoint-ghi789: "Auto checkpoint" (30 min ago)
   \`\`\`

4. **Restore Specific Checkpoint**
   \`\`\`bash
   # Full restore (conversation + code)
   /rewind checkpoint-abc123

   # Or quick restore to last checkpoint
   # Press: Esc + Esc
   \`\`\`

5. **Selective Restore**
   \`\`\`bash
   # Restore conversation only (keep code changes)
   /rewind checkpoint-abc123 --conversation-only

   # Restore code only (keep conversation)
   /rewind checkpoint-abc123 --code-only
   \`\`\`

**Success Criteria**:
- [ ] Checkpoint created before risky operations
- [ ] Session state preserved across restarts
- [ ] Can restore to previous state without data loss
- [ ] Memory persisted for cross-session learning

**Checkpoint Types**:
1. **Conversation Only**: Restore chat, keep code changes
2. **Code Only**: Restore files, keep conversation
3. **Full**: Restore both conversation and code

**Best Practices**:
- Checkpoint before: schema changes, deployments, major refactors
- Max 100 checkpoints per session (automatic compression)
- 30-day retention by default
- Use descriptive checkpoint messages

---

### Workflow: [Standard Task Name]

**Scenario**: [When you need this]

**Step-by-step**:

1. **[Step 1 Name]**
   \`\`\`bash
   # Command to run
   command --with --flags
   \`\`\`

   Expected output:
   \`\`\`
   Output here
   \`\`\`

2. **[Step 2 Name]**
   \`\`\`typescript
   // Code to write
   \`\`\`

3. **[Step 3 Name]**
   - [Action item]
   - [Verification step]

**Success Criteria**:
- [ ] [Verification 1]
- [ ] [Verification 2]
- [ ] [Verification 3]

---

## 3. [Advanced Techniques/Specialized Patterns]

### Technique: MCP v2.0 Tool Integration

**Use Case**: Connect agents to external services via Model Context Protocol

**Background**: MCP v2.0 provides enhanced security, SSE support, and NO_PROXY configuration for local servers

**Implementation**:

**MCP Server Registration**:

**Note**: MCP configuration file location varies by Claude Code version. Common locations:
- `.claude/mcp.json` (recommended for project-specific servers)
- `mcp.json` (project root)
- `~/.claude/mcp.json` (user-level global configuration)

Check your Claude Code documentation for the correct location in your version.

\`\`\`json
// .claude/mcp.json (or mcp.json, or ~/.claude/mcp.json)
{
  "servers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"],
      "env": {
        "CONTEXT7_API_KEY": "..."
      }
    },
    "git": {
      "command": "mcp-server-git",
      "args": ["--repo", "."]
    },
    "perplexity": {
      "command": "npx",
      "args": ["-y", "@perplexity/mcp-server"],
      "env": {
        "PERPLEXITY_API_KEY": "..."
      }
    }
  },
  "mcp_security": {
    "require_approval": ["git_push", "git_commit"],
    "blocked_operations": ["git_reset --hard"],
    "allowed_domains": ["github.com"]
  }
}
\`\`\`

**Tool Usage in Agent**:
\`\`\`typescript
// Agent automatically has access to MCP tools
// No manual import needed

// Context7: Get latest library docs
const docs = await mcp__context7__get_library_docs({
  context7CompatibleLibraryID: '/vercel/next.js',
  topic: 'server-actions'
});

// Git: Check repository status
const status = await mcp__git__git_status();

// Perplexity: Research complex topics
const research = await mcp__perplexity__reason({
  query: 'optimal database indexing strategies for time-series data'
});
\`\`\`

**Security Configuration (v2.0.0)**:
\`\`\`json
{
  "mcp_security": {
    "require_approval": [
      "git_push",
      "git_commit",
      "file_write_outside_workspace"
    ],
    "blocked_operations": [
      "git_reset --hard",
      "rm -rf /",
      "sudo"
    ],
    "allowed_domains": [
      "github.com",
      "api.context7.com"
    ],
    "no_proxy": [
      "localhost",
      "127.0.0.1"
    ]
  }
}
\`\`\`

**Trade-offs**:
- ✅ **Pros**:
  - Access to external services and real-time data
  - Enhanced security controls in v2.0
  - SSE for real-time updates
  - NO_PROXY for local development servers
- ❌ **Cons**:
  - Requires API keys and configuration
  - Network dependency
  - Performance overhead for remote calls
- 🔄 **Alternatives**:
  - Native tools for file operations
  - WebFetch for simple HTTP requests

**Key Points**:
- MCP v2.0 uses SSE (Server-Sent Events)
- Configure NO_PROXY for local servers
- Require approval for destructive operations
- All MCP tools prefixed with `mcp__<server>__<tool>`

---

### Technique: Background Task Execution (v2.0.0)

**Use Case**: Long-running operations that don't block agent interaction

**When to use**: Database migrations, large file processing, build operations, test suites

**Background**: Claude Code v2.0.0 supports running operations in background while agent remains interactive

**Implementation**:

**Basic Background Execution**:
\`\`\`typescript
// Start long-running operation in background
const taskId = await startBackgroundTask({
  command: 'pnpm migrate:deploy',
  description: 'Production database migration',
  timeout: 600000  // 10 minutes
});

// Agent remains interactive
console.log(\`Migration started: \${taskId}\`);
console.log('You can continue working while migration runs...');

// Continue with other work
await performOtherWork();

// Check task status later
const status = await checkTaskStatus(taskId);
if (status.complete) {
  console.log('Migration completed successfully:', status.output);
} else if (status.error) {
  console.error('Migration failed:', status.error);
}
\`\`\`

**Monitoring Background Tasks**:
\`\`\`typescript
// Monitor output stream in real-time
monitorBackgroundTask(taskId, (output) => {
  // Output appears as task progresses
  console.log('Progress:', output);
});

// Or use async iteration
for await (const chunk of backgroundTaskStream(taskId)) {
  console.log('Output:', chunk);
}
\`\`\`

**With Checkpointing**:
\`\`\`typescript
// Checkpoint before starting background task
await createCheckpoint('Before running tests');

// Start background task
const taskId = await startBackgroundTask({
  command: 'pnpm test:e2e',
  timeout: 1800000  // 30 minutes
});

// If task fails, can restore checkpoint
if (status.error) {
  console.log('Tests failed, restoring checkpoint...');
  await restoreCheckpoint('Before running tests');
}
\`\`\`

**Parallel Background Tasks**:
\`\`\`typescript
// Run multiple independent tasks in parallel
const tasks = await Promise.all([
  startBackgroundTask({ command: 'pnpm build:app1' }),
  startBackgroundTask({ command: 'pnpm build:app2' }),
  startBackgroundTask({ command: 'pnpm build:app3' })
]);

console.log('All builds started, continuing work...');

// Check all later
const results = await Promise.all(
  tasks.map(id => checkTaskStatus(id))
);

results.forEach((result, i) => {
  console.log(\`Build \${i + 1}: \${result.complete ? '✅' : '⏳'}\`);
});
\`\`\`

**Trade-offs**:
- ✅ **Pros**:
  - Agent remains interactive during long operations
  - Can run multiple operations in parallel
  - Better user experience for slow commands
  - Can continue planning while work executes
- ❌ **Cons**:
  - More complex to manage (async state tracking)
  - Requires checking status before using results
  - Potential for orphaned processes if not managed
  - Terminal output may be out of sync
- 🔄 **Alternatives**:
  - Synchronous Bash for operations <30 seconds
  - Separate terminal for manual command execution
  - CI/CD for truly long-running builds

**Key Points**:
- Use for operations taking >30 seconds
- Always set appropriate timeouts
- Checkpoint before risky background operations
- Monitor for errors and handle failures
- Don't background operations that need immediate results

**Best Practices**:
1. **Checkpoint First**: Always checkpoint before background operations
2. **Set Timeouts**: Prevent runaway processes
3. **Monitor Status**: Check task completion before using results
4. **Handle Errors**: Background tasks can fail silently
5. **Independent Operations**: Only background truly independent work
6. **Clean Up**: Ensure tasks complete or are properly terminated

**When NOT to Use**:
- Operations that complete in <30 seconds (use regular Bash)
- Operations whose results are needed immediately
- Interactive commands requiring user input
- Commands that need real-time output for decision-making

**Related Patterns**: [Checkpointing](#session-management), [Error Handling](#error-patterns)

---

### Technique: [Advanced Pattern]

**Use Case**: [Complex scenario]

**Background**: [Context and prerequisites]

**Implementation**:

\`\`\`typescript
// More complex example showing advanced usage
// 50-100 lines with detailed comments
\`\`\`

**Trade-offs**:
- ✅ **Pros**: [Benefits]
- ❌ **Cons**: [Drawbacks]
- 🔄 **Alternatives**: [Other approaches]

---

## 4. [Integration/Coordination Patterns]

### Pattern: Orchestrator-Worker Delegation (Multi-Agent)

**Context**: Complex tasks spanning multiple domains requiring parallel execution

**Purpose**: Coordinate multiple specialists for efficient parallel work

**Coordination Protocol**:

**Orchestrator Agent** (claude-opus-4-1):
\`\`\`typescript
// 1. Analyze task and break down into sub-tasks
async function coordinateFeatureImplementation(requirements: string) {
  // Use extended thinking for complex planning
  const plan = await analyzeFeasibility(requirements);

  // 2. Identify required specialists
  const specialists = [
    'stack-prisma',         // Database schema
    'stack-next-react',     // Server actions
    'stack-tailwind-mantine' // UI components
  ];

  // 3. Delegate in parallel using Promise.allSettled
  const results = await Promise.allSettled([
    delegateToSpecialist('stack-prisma', {
      task: plan.schemaChanges,
      context: requirements,
      dependencies: []
    }),
    delegateToSpecialist('stack-next-react', {
      task: plan.apiChanges,
      context: requirements,
      dependencies: ['stack-prisma'] // Waits for schema
    }),
    delegateToSpecialist('stack-tailwind-mantine', {
      task: plan.uiChanges,
      context: requirements,
      dependencies: ['stack-next-react'] // Waits for API
    })
  ]);

  // 4. Validate and integrate results
  return await integrateResults(results);
}

async function delegateToSpecialist(
  agentName: string,
  taskInfo: TaskInfo
): Promise<SpecialistResult> {
  // Checkpoint before delegation
  await createCheckpoint(\`Before delegating to \${agentName}\`);

  // Execute specialist with bounded context
  const result = await executeAgent(agentName, taskInfo);

  // Validate specialist stayed within domain
  if (!result.withinBoundaries) {
    throw new Error(\`\${agentName} exceeded domain boundaries\`);
  }

  return result;
}
\`\`\`

**Specialist Agent** (claude-sonnet-4-5):
\`\`\`typescript
// Focused execution within domain boundaries
async function executeSchemaChanges(task: Task): Promise<SpecialistResult> {
  // 1. Validate within domain boundaries
  if (!isWithinDomain(task, 'stack-prisma')) {
    return {
      status: 'rejected',
      reason: 'Outside stack-prisma domain',
      escalate_to: 'orchestrator'
    };
  }

  // 2. Execute focused changes
  const changes = await applySchemaChanges(task);

  // 3. Run domain-specific tests
  await runTests(['pnpm typecheck', 'pnpm migrate']);

  // 4. Checkpoint after major change
  await createCheckpoint('Schema migration completed');

  // 5. Report back to orchestrator
  return {
    status: 'complete',
    changes: ['prisma/schema.prisma', 'migrations/001_add_user.sql'],
    tests: 'passed',
    withinBoundaries: true,
    handoff: {
      to: 'stack-next-react',
      context: 'New User model requires updated createUser action',
      artifacts: {
        types: 'generated types in node_modules/.prisma/client',
        migrations: 'migrations/001_add_user.sql'
      }
    }
  };
}
\`\`\`

**Handoff Protocol**:
\`\`\`markdown
**Status**: ✅ Complete | 🔄 In Progress | ⚠️ Blocked
**Specialist**: stack-prisma
**Changes**: prisma/schema.prisma, migrations/001_add_user.sql
**Tests**: ✅ Passed (pnpm test --filter @repo/pkgs-databases)
**Artifacts**:
- Types: \`User\`, \`UserCreateInput\`, \`UserSelectBasic\`
- Migrations: \`migrations/001_add_user.sql\`
**Next**:
- **stack-next-react**: Update server actions for new User fields
  - Dependencies: User types from @repo/pkgs-databases
  - Files to modify: app/actions/user.ts
- **stack-tailwind-mantine**: Add profile UI components
  - Dependencies: createUser server action
  - Files to create: packages/uix-system/src/UserProfile.tsx
**Blockers**: None
\`\`\`

**Pre-integration Checklist**:
- [ ] All specialists completed within domain boundaries
- [ ] Tests passed for each specialist
- [ ] Handoff artifacts documented
- [ ] Dependencies between specialists resolved
- [ ] Checkpoint created before integration

**Common Issues**:
- **Problem**: Specialist exceeds domain boundaries
  - **Cause**: Unclear boundaries or complex cross-cutting concern
  - **Solution**: Orchestrator intervenes, clarifies boundaries, potentially creates new sub-task

- **Problem**: Circular dependencies between specialists
  - **Cause**: Poor task decomposition
  - **Solution**: Orchestrator re-analyzes, breaks dependency cycle, sequences tasks

- **Problem**: Integration conflicts between specialists
  - **Cause**: Parallel work on related files
  - **Solution**: Use checkpoints to restore, coordinate sequential execution for conflicting areas

**Performance**: 90.2% improvement over single-agent [Anthropic research, multi-agent systems]

**Related Patterns**: [Handoff Protocols](#handoff), [Domain Boundaries](#boundaries), [Checkpointing](#session-management)

---

### Integration: [With System/Agent]

**Context**: [When you need to integrate]

**Coordination Protocol**:

1. **Pre-integration checklist**:
   - [ ] [Requirement 1]
   - [ ] [Requirement 2]

2. **Implementation**:
   \`\`\`typescript
   // Integration code
   \`\`\`

3. **Handoff to [other-agent]**:
   \`\`\`markdown
   **Status**: ✅ Ready for [agent]
   **Changes**: [files]
   **Context**: [information needed]
   \`\`\`

**Common Issues**:
- **Problem**: [Issue description]
  - **Cause**: [Why it happens]
  - **Solution**: [How to fix]

---

## 5. [Performance/Optimization/Testing]

### Performance Pattern: [Optimization]

**Problem**: [What performance issue this addresses]

**Measurement**:
\`\`\`bash
# How to measure current performance
pnpm run measure
\`\`\`

**Baseline**: [Expected metrics]
- Before: [metric value]
- After: [target value]

**Implementation**:
\`\`\`typescript
// Optimized code
\`\`\`

**Verification**:
- [ ] Performance improved by X%
- [ ] No regression in [area]
- [ ] Tests still pass

---

## 6. [Testing/Monitoring/Validation]

### Test Pattern: [Type of Test]

**What to test**: [Scope]

**Test Structure**:

\`\`\`typescript
// test-file.test.ts
import { describe, it, expect } from 'vitest';

describe('[Feature]', () => {
  it('should [behavior]', async () => {
    // Arrange
    const input = setupInput();

    // Act
    const result = await functionUnderTest(input);

    // Assert
    expect(result).toStrictEqual(expected);
  });
});
\`\`\`

**Coverage Targets**:
- Critical paths: 80%+
- Edge cases: 60%+
- Happy path: 100%

---

## 7. [Troubleshooting/Common Issues/Edge Cases]

### Issue: Session State Lost After Restart

**Symptoms**:
- Agent forgets previous context after Claude Code restart
- Memory files exist but not loaded
- Checkpoints not restoring properly

**Common Causes**:

1. **session_persistence not enabled**
   - **Check**: Review agent YAML frontmatter
     \`\`\`bash
     grep "session_persistence" .claude/agents/agent-name.md
     \`\`\`
   - **Fix**: Enable session persistence
     \`\`\`yaml
     ---
     session_persistence: true
     checkpoint_enabled: true
     ---
     \`\`\`

2. **Memory scope set to "session" instead of "project"**
   - **Check**: Review agent configuration
   - **Fix**: Use project scope for persistence
     \`\`\`yaml
     memory_scope: project  # Not "session"
     \`\`\`

3. **Checkpoint retention expired (>30 days)**
   - **Check**: List available checkpoints
     \`\`\`bash
     /checkpoints
     \`\`\`
   - **Fix**: Create new checkpoint before long breaks
     \`\`\`bash
     /checkpoint "Before break - preserve state"
     \`\`\`

**Prevention**:
- Always enable session_persistence and checkpoint_enabled
- Use memory_scope: project for long-term retention
- Create named checkpoints before major breaks
- Review memory files regularly

---

### Issue: [Problem Description]

**Symptoms**:
- [Observable symptom 1]
- [Observable symptom 2]

**Common Causes**:
1. **[Cause 1]**
   - **Check**: [How to verify]
   - **Fix**: [How to resolve]
   \`\`\`bash
   # Fix command
   \`\`\`

2. **[Cause 2]**
   - **Check**: [Verification]
   - **Fix**: [Resolution]

**Prevention**:
- [How to avoid in future]
- [Best practice to follow]

---

### Issue: [Another Problem]

[... repeat structure ...]

---

## 8. Anti-Patterns & Common Mistakes

### ❌ Anti-Pattern: Not Using Checkpoints Before Risky Operations

**Problem**:
\`\`\`bash
# ❌ WRONG - Running migration without checkpoint
pnpm prisma migrate deploy
# If migration fails, hard to recover
\`\`\`

**Why it's bad**:
- No recovery point if operation fails
- Lost work if something goes wrong
- Manual rollback required (error-prone)

**Correct approach**:
\`\`\`bash
# ✅ RIGHT - Checkpoint before risky operation
/checkpoint "Before production migration"

# Now run migration
pnpm prisma migrate deploy

# If it fails, easy restore:
# /rewind checkpoint-id
\`\`\`

**Real-world impact**: Without checkpoints, a failed schema migration in production required 3 hours of manual rollback and data recovery. With checkpoints, restoration takes <1 minute.

---

### ❌ Anti-Pattern: Memory Scope Mismatch for Long-Running Projects

**Problem**:
\`\`\`yaml
# ❌ WRONG - Using session scope for multi-day project
---
memory_scope: session  # Cleared on restart!
session_persistence: true
---
\`\`\`

**Why it's bad**:
- Agent forgets learnings after restart
- Cross-session patterns not preserved
- Must re-explain context every session

**Correct approach**:
\`\`\`yaml
# ✅ RIGHT - Use project scope for persistence
---
memory_scope: project  # Persists across sessions
session_persistence: true
checkpoint_enabled: true
---
\`\`\`

**Real-world impact**: Agent spent 30% of each session re-learning project patterns that should have been remembered.

---

### ❌ Anti-Pattern: Orchestrator Using Sonnet Instead of Opus

**Problem**:
\`\`\`yaml
# ❌ WRONG - Orchestrator with Sonnet
---
name: orchestrator
model: claude-sonnet-4-5  # Not enough reasoning power
---
\`\`\`

**Why it's bad**:
- Sonnet optimized for code generation, not complex coordination
- Orchestrator needs superior reasoning for task decomposition
- Poor delegation decisions lead to rework

**Correct approach**:
\`\`\`yaml
# ✅ RIGHT - Orchestrator with Opus
---
name: orchestrator
model: claude-opus-4-1  # Better reasoning
thinking_budget: 4096   # Extended thinking
---
\`\`\`

**Real-world impact**: Switching orchestrator from Sonnet to Opus reduced failed delegations by 45% and improved task decomposition quality.

---

### ❌ Anti-Pattern: [Bad Practice Name]

**Problem**:
\`\`\`typescript
// ❌ WRONG - This will cause [issue]
badExample();
\`\`\`

**Why it's bad**:
- [Reason 1: technical issue]
- [Reason 2: maintenance burden]
- [Reason 3: performance impact]

**Correct approach**:
\`\`\`typescript
// ✅ RIGHT - This properly handles [concern]
goodExample();
\`\`\`

**Real-world impact**: [Explanation of consequences]

---

### ❌ Anti-Pattern: [Another Bad Practice]

[... repeat structure ...]

---

## Resources

### Official Documentation
- **[Library]**: [URL]
- **[Framework]**: [URL]
- **Claude Code v2.0**: https://docs.claude.com/en/docs/claude-code
- **Checkpointing**: https://docs.claude.com/en/docs/claude-code/checkpointing
- **MCP v2.0**: https://modelcontextprotocol.io/

### Internal Resources
- **Agent doc**: \`.claude/agents/[agent].md\`
- **Related packages**: [List]
- **Memory files**: \`.claude/memory/[agent]-learnings.md\`

### Context7 MCP Quick Access
\`\`\`bash
# Get latest docs for [library]
mcp__context7__get-library-docs("/org/lib", topic="feature")
\`\`\`

### v2.0.0 Features
- **Session Persistence**: 30-day retention, cross-session learning
- **Checkpoint System**: Automatic + manual, 100 per session, 30-day retention
- **Rewind**: \`/rewind checkpoint-id\` or \`Esc + Esc\`
- **Memory Tool**: File-based CRUD operations
- **MCP v2.0**: Enhanced security, SSE, NO_PROXY

---

*Last updated: YYYY-MM-DD*
*Part of the Forge two-tier agent documentation system*
*v2.0.0 Compliant*
```

---

## Structure Guidelines

### Required Structure

**8 Core Sections** (## headings):

| Section | Content | v2.0.0 Required |
|---------|---------|-----------------|
| 1. Patterns/Implementation | Core code patterns (20-50 lines) | Memory Tool patterns |
| 2. Workflows/Integration | Step-by-step procedures | Session/checkpoint workflows |
| 3. Advanced Techniques | Complex scenarios | MCP v2.0, Background Tasks |
| 4. Coordination | Multi-agent patterns | Orchestrator-Worker |
| 5. Performance/Optimization | Tuning, benchmarks | - |
| 6. Testing/Validation | Test patterns, coverage | - |
| 7. Troubleshooting | Symptoms→Causes→Fixes→Prevention | Session/checkpoint issues |
| 8. Anti-Patterns | ❌ Wrong vs ✅ Right + impact | v2.0.0-specific anti-patterns |

### Code Format

**Include**: Full imports, type annotations, comments, error handling
**Length**: 20-50 (basic), 50-100 (complex), 100+ (workflows) OK

```typescript
import { specific } from '@repo/package/subpath';

export function example(input: InputType): ReturnType {
  // Explain key decisions
  const result = process(input);
  if (!result) throw new Error('Meaningful message');
  return result;
}
```

### Content Rules

**Include**:
- ✅ Working code examples (20-100 lines)
- ✅ Complete workflows (commands + expected output)
- ✅ Error handling in all examples
- ✅ v2.0.0 features (sessions, checkpoints, memory, MCP, multi-agent)

**Avoid**:
- ❌ Redundant Tier 1 content
- ❌ Theoretical content without code
- ❌ Incomplete workflows
- ❌ Missing error handling

---

## Example Reference

See existing extended guides for pattern examples:
- **Stack specialists**: `.claude/docs/agents-extended/stack-prisma-extended.md`, `stack-next-react-extended.md`
- **Shared services**: `.claude/docs/agents-extended/security-extended.md`, `testing-extended.md`
- **Orchestrator**: `.claude/docs/agents-extended/orchestrator-extended.md`
- **Commands**: `.claude/docs/commands-extended/fullservice-extended.md`

**Pattern format**:
```markdown
### Pattern: [Name]
**Purpose**: [What it solves]
**When to use**: [Scenarios]
**Implementation**: [20-100 line code example with comments]
**Key Points**: [Bullet list]
**Related**: [Cross-references]
```

**Troubleshooting format**:
```markdown
### Issue: [Problem]
**Symptoms**: [Observable behavior]
**Causes**: 1. [Cause] → Check: [command] → Fix: [solution]
**Prevention**: [Best practices]
```

---

## Validation Checklist

Before finalizing an extended guide:

- [ ] **8 sections**: All numbered sections present
- [ ] **v2.0.0 features**: Session management, checkpoints, memory tool, MCP v2.0, multi-agent patterns
- [ ] **Code examples**: 5+ complete examples per section
- [ ] **Runnable code**: All examples syntactically correct
- [ ] **Error handling**: Shown in all examples
- [ ] **Cross-references**: Links between sections
- [ ] **Troubleshooting**: 3+ common issues documented (include v2.0.0 issues)
- [ ] **Anti-patterns**: 3+ wrong/right comparisons (include v2.0.0 anti-patterns)
- [ ] **Resources**: Links to official docs, Context7, and v2.0.0 changelog
- [ ] **Date**: Last updated timestamp current
- [ ] **Format**: Consistent with template

---

## Maintenance

### Monthly Review
- [ ] Verify code examples still work
- [ ] Update deprecated patterns
- [ ] Add newly discovered issues to troubleshooting
- [ ] Check cross-reference links
- [ ] Ensure v2.0.0 features documented accurately

### When to Update Tier 2
Update extended guide when:
- Adding detailed code examples
- Documenting complex workflows
- Recording troubleshooting procedures
- Expanding anti-patterns section
- New v2.0.0 features released

Be **thorough and detailed** - this is unlimited space for comprehensive knowledge.

---

## v2.0.0 Compliance Checklist

Ensure extended guide includes:

- [ ] **Session Management**: Checkpoint workflows in Section 2
- [ ] **Memory Tool**: CRUD patterns in Section 1
- [ ] **Checkpointing**: Manual/automatic checkpoint examples
- [ ] **Rewind**: Restore workflows (\`/rewind\`, \`Esc + Esc\`)
- [ ] **MCP v2.0**: Tool integration in Section 3
- [ ] **Multi-Agent**: Orchestrator-worker patterns in Section 4
- [ ] **Session Troubleshooting**: Lost state issues in Section 7
- [ ] **Checkpoint Anti-patterns**: What NOT to do in Section 8
- [ ] **Memory Scope**: project vs session vs isolated
- [ ] **Thinking Budgets**: 256/2048/4096 recommendations

---

*Template Version: 2.2 (LLM-Optimized for Claude Sonnet 4.5)*
*Based on 15 extended guides totaling ~16,000 lines, optimized for structured parsing*
*Updated: 2025-10-07*
*See: `.claude/docs/template-llm-optimization-report.md`*
