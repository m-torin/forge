# Agent File Template

**Purpose**: Optimal structure for Tier 1 agent files (≤200 lines strict limit)

**Quick Start**: Copy the template below → Fill in placeholders → Validate → Restart → Create extended guide

**Last Updated**: 2025-10-07 (v2.0.0 compliant)

---

## Agent Discovery (CRITICAL)

**How Claude Code Finds Agents**:
1. Scans `.claude/agents/` directory on startup
2. Parses YAML frontmatter in each `.md` file
3. Invalid YAML = agent **silently ignored** (no error!)
4. **RESTART REQUIRED**: Changes require `/q .` command (or press `Esc` + `Esc`)

**Common Discovery Failures**:
- ❌ Agent file outside `.claude/agents/` directory
- ❌ Invalid YAML frontmatter (missing quotes, wrong indentation)
- ❌ Forgot to restart Claude Code with `/q .`
- ❌ Agent name not kebab-case (spaces, uppercase, underscores)

**Verification**:
```bash
# Check agent will be discovered
pnpm agents:validate

# After creating agent, MUST restart
/q .
# Or press: Esc + Esc

# Verify agent appears
> /agents
```

---

## ⚠️ YAML Validation Warning

**Invalid YAML = Agent won't be discovered** (no error message!)

**Common YAML Mistakes**:

❌ **Missing quotes around description**:
```yaml
description: Some text with: colons
```
✅ **Correct**:
```yaml
description: "Some text with: colons"
```

❌ **Wrong indentation** (tabs or inconsistent spaces):
```yaml
allowed_tools:
    - Read  # 4 spaces (wrong)
```
✅ **Correct** (2 spaces):
```yaml
allowed_tools:
  - Read
```

❌ **String value for integer field**:
```yaml
max_turns: "60"
```
✅ **Correct**:
```yaml
max_turns: 60
```

**Always validate before committing**:
```bash
pnpm agents:validate
```

---

## The Template

```markdown
---
name: agent-name
description: "One-line description of agent purpose and domain"
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
permission_mode: acceptEdits
max_turns: 60
thinking_budget: 2048
memory_scope: project
checkpoint_enabled: true
delegation_type: auto
session_persistence: true
---

## Mission

[2-3 lines max: What does this agent own? What is its primary responsibility?]

## Domain Boundaries

### Allowed
- `path/to/files/**` (specific directories this agent modifies)
- [Technology or framework this agent specializes in]
- [Specific responsibilities within scope]

### Forbidden
- ❌ [Domain outside scope] (delegate to [other-agent])
- ❌ [Technology not owned] (coordinate with [other-agent])
- ❌ [Actions requiring approval] (escalate to orchestrator)

## Stage/Layer Mapping

**Primary Stage**: [UI/Server/Edge/Data/Infra/Docs]
- **Apps**: [list apps this agent works on]
- **Packages**: [list packages owned]
- **Runtime**: [Browser/Node.js/Edge/Static/etc.]

## Default Tests & Verification

```bash
pnpm lint --filter [package]
pnpm typecheck --filter [package]
pnpm vitest --filter [package] --run
pnpm vitest --filter [package] --coverage --run
```

### Verification Checklist
- [ ] [Key check 1 - e.g., "All tests pass"]
- [ ] [Key check 2 - e.g., "No type errors"]
- [ ] [Key check 3 - e.g., "Contamination checks pass"]
- [ ] [Key check 4 - e.g., "Coverage ≥50%"]

## Contamination Rules

```typescript
// ✅ ALLOWED in [agent's domain]
import { allowed } from '@repo/allowed-package';

// ❌ FORBIDDEN in [agent's domain]
import { forbidden } from '@repo/wrong-package';  // Delegate to [agent]

// ❌ FORBIDDEN: [specific anti-pattern for this domain]
// ✅ ALLOWED: [correct pattern]
```

## Handoff Protocols

**To Orchestrator - Report when:**
- [Blocker requiring coordination]
- [Breaking change affecting multiple agents]
- [Decision requiring approval]

**Format**:
```markdown
**Status**: ✅ Complete | 🔄 In Progress | ⚠️ Blocked
**Changes**: [file paths]
**Tests**: [results]
**Next**: [handoffs needed]
```

## Performance Targets

- **[Key Metric]**: < X ms/seconds
- **[Coverage]**: ≥ Y%
- **[Build Time]**: < Z seconds

_Note: Omit this section if not applicable_

## Common Tasks

1. **[Task Name]**
   - [Brief workflow: Step 1 → Step 2 → Step 3]
   - See [Detailed Guide](../docs/agents-extended/[agent]-extended.md#task-section)

2. **[Task Name]**
   - [Brief workflow]
   - See [Guide Link](../docs/agents-extended/[agent]-extended.md#section)

3. **[Task Name]**
   - [Brief workflow]
   - See [Guide Link](../docs/agents-extended/[agent]-extended.md#section)

_Keep to 3-5 most common tasks. Link to extended guide for details._

## Memory Management

**Checkpoint after:**
- [Significant change type - e.g., "Schema migrations"]
- [Major feature - e.g., "New component pattern"]

**Format in `.claude/memory/[agent]-learnings.md`**:
```markdown
## [YYYY-MM-DD] {Task}
**Changes**: {files}
**Learning**: {insight}
```

## Resources

- **Extended Guide**: [`.claude/docs/agents-extended/[agent]-extended.md`](../docs/agents-extended/[agent]-extended.md)
  - [Section 1](../docs/agents-extended/[agent]-extended.md#1-section-name)
  - [Section 2](../docs/agents-extended/[agent]-extended.md#2-section-name)
  - [Section 3](../docs/agents-extended/[agent]-extended.md#3-section-name)
  - [Section 4](../docs/agents-extended/[agent]-extended.md#4-section-name)
  - [Section 5](../docs/agents-extended/[agent]-extended.md#5-section-name)
  - [Section 6](../docs/agents-extended/[agent]-extended.md#6-section-name)
  - [Section 7](../docs/agents-extended/[agent]-extended.md#7-section-name)
  - [Section 8](../docs/agents-extended/[agent]-extended.md#8-anti-patterns)

- **[Library/Framework]**: Context7 MCP → `org/library`
- **Internal**: `CLAUDE.md`, `[package]/README.md`

## Escalation Paths

**To Other Specialists:**
- **[agent-name]**: [Specific scenario requiring delegation]
- **[agent-name]**: [Another delegation scenario]

**To Orchestrator:**
- [Breaking changes requiring approval]
- [Cross-agent coordination needed]
```

---

## Section Guidelines

### 1. Mission (2-3 lines max)
**Purpose**: Immediate clarity on agent's role

**Formula**: `[Action verb] + [what] + [for whom/where]`

✅ **Good**:
> Deliver reliable database layer using Prisma ORM. Own schema design, migrations, query optimization, and client resolver patterns.

❌ **Bad** (too vague):
> Handle database stuff

---

### 2. Domain Boundaries

**Allowed**: Be specific about paths, technologies, and responsibilities

✅ **Good**:
```markdown
- `packages/uix-system/**` (components, tokens, themes)
- Mantine v8 configuration and theming
- Component accessibility (ARIA, keyboard navigation)
```

❌ **Bad** (too vague):
```markdown
- UI stuff
- Components
- Styling
```

**Forbidden**: Always delegate or coordinate

✅ **Good**:
```markdown
- ❌ Server actions (delegate to stack-next-react)
- ❌ Database queries (coordinate with stack-prisma)
```

❌ **Bad** (no delegation info):
```markdown
- ❌ Server stuff
- ❌ Database stuff
```

---

### 3. YAML Frontmatter Fields

#### Quick Reference Table

| Field | Type | Default | Purpose | Options |
|-------|------|---------|---------|---------|
| **name** | string | - | Agent ID (kebab-case only) | `my-agent` ✅ not `My Agent` ❌ |
| **description** | string | - | One-line purpose (quoted) | `"Manages X using Y"` |
| **model** | string | sonnet-4-5 | Primary model | `opus-4-1` (orchestrator) / `sonnet-4-5` (specialist) |
| **fallback_model** | string | sonnet-4-1 | Backup model | See model selection below |
| **thinking_budget** | int | 2048 | Extended thinking tokens | 256 / 2048 / 4096 |
| **permission_mode** | enum | acceptEdits | Approval level | manual / acceptEdits / acceptAll |
| **memory_scope** | enum | project | Memory visibility | project / session / user / isolated |
| **max_turns** | int | 60 | Session turn limit | 30 (simple) / 60 (default) / 100+ (complex) |
| **delegation_type** | enum | auto | Delegation behavior | auto / manual / conditional |
| **checkpoint_enabled** | bool | true | Enable checkpoints | `true` (recommended) |
| **session_persistence** | bool | true | Persist across restarts | `true` (recommended) |
| **allowed_tools** | array | - | Available tools | See tools section below |

**Detailed field docs below for complex fields.**

---

#### model / fallback_model

**Selection by role**:

| Agent Type | Model | Fallback | Why |
|------------|-------|----------|-----|
| Orchestrator | `claude-opus-4-1` | `claude-sonnet-4-5` | Superior reasoning for coordination ($15/$75 per M tokens) |
| Specialist | `claude-sonnet-4-5` | `claude-sonnet-4-1` | Fast generation, 77.2% SWE-bench ($3/$15 per M tokens) |

---

#### thinking_budget

Extended thinking token allocation. Higher = better reasoning but slower/costlier.

| Value | Use Case | Agent Type |
|-------|----------|------------|
| 256 | Simple ops (read, basic edit) | Config agents |
| 2048 | Moderate complexity (DEFAULT) | Most specialists |
| 4096 | Complex reasoning, multi-step | Orchestrators |

---

#### permission_mode

Controls approval requirements for operations.

| Mode | Approval | Use Case | Risk |
|------|----------|----------|------|
| `manual` | Every edit | Orchestrators, cross-cutting changes | Low ✅ |
| `acceptEdits` | Auto-apply edits (DEFAULT) | Specialists, bounded domains | Low ✅ |
| `acceptAll` | Auto-approve all (Bash too) | ⚠️ Sandboxed only | High ❌ |

**Default**: `acceptEdits` for specialists, `manual` for orchestrators.

---

#### memory_scope

Controls memory visibility and retention.

| Scope | Visibility | Persistence | Use Case |
|-------|------------|-------------|----------|
| `project` | All agents in project | 30 days (DEFAULT) | Shared learnings, patterns |
| `session` | Current session only | Cleared on restart | Scratch work |
| `user` | All projects | 30 days | Global preferences (rare) |
| `isolated` | This agent only | 30 days | Agent-specific patterns |

---

#### checkpoint_enabled / session_persistence

**v2.0.0 features** - both should be `true`:

```yaml
checkpoint_enabled: true      # Automatic + manual checkpoints
session_persistence: true     # State preserved across restarts
```

**Checkpoint system**: Auto-save every 5min, manual `/checkpoint "msg"`, restore `/rewind` or `Esc+Esc`, 100 max/session, 30-day retention.

---

#### max_turns

Maximum turns before session ends. 1 turn = user message + agent response.

| Agent Type | Value | Use Case |
|------------|-------|----------|
| Simple edit | 30 | Quick edits, single ops |
| Specialist (DEFAULT) | 60 | Most tasks |
| Orchestrator | 100-150 | Complex multi-file work |

⚠️ Sessions >8 hours may degrade. Checkpoint and restart for long tasks.

---

#### delegation_type

Controls how agent delegates to other specialists.

| Type | Behavior | Use Case |
|------|----------|----------|
| `auto` (DEFAULT) | Auto-delegate based on boundaries | Most efficient |
| `manual` | Ask before delegating | Orchestrator oversight |
| `conditional` | Auto for known patterns, ask for ambiguous | High-stakes ops |

---

#### allowed_tools

**Core tools** (most agents):
- `Read`, `Write`, `Edit` - File operations
- `Grep`, `Glob` - Search/find
- `Bash` - Command execution (⚠️ see security below)
- `TodoWrite` - Task tracking
- `memory` - Cross-session learnings
- `Task` - Delegate to other agents

**MCP tools** (optional, requires setup):
- `mcp__context7__*` - Library docs
- `mcp__perplexity__*` - Research
- `mcp__git__*` - Git operations

**Optional**:
- `WebFetch` - Web content (built-in)
  ```typescript
  await WebFetch({
    url: 'https://nextjs.org/docs/app/api-reference',
    prompt: 'Extract server action patterns'
  });
  ```
- `computer_use` - Desktop automation (⚠️ beta, see below)

**Task delegation**:
```typescript
await Task({
  subagent_type: "stack-prisma",
  description: "Add User model",
  prompt: "Create User with email, name, createdAt"
});
```

---

### ⚠️ Bash Security (v2.0.0 Critical Change)

**Bash sandbox removed** in v2.0.0 - commands execute directly on host.

**Never allow**: `rm -rf /`, `sudo`, `curl ... | bash`, `dd`, `mkfs`, `fdisk`

**Mitigation**:
1. **Container execution** - Run agents in Docker/VM (production requirement)
2. **Permission mode** - Use `manual` for orchestrators (requires approval per command)
3. **Remove if not needed** - Omit `Bash` from `allowed_tools` if file ops sufficient
4. **Approval workflow** - Log commands, use allowlist, require review

**High-security**:
```yaml
allowed_tools:
  # Omit Bash entirely
  - Read
  - Write
  - Edit
  # ... other tools only
```

---

### Advanced Tools (Optional)

#### Computer Use (Beta)

Desktop automation via GUI interaction. **Beta, requires containerized execution**.

**Use cases**: Browser automation, GUI testing, visual regression, desktop workflows

**Security**: ⚠️ **Desktop control** - container-only (Docker/VM), dev environments, never production

**Enable**:
```yaml
allowed_tools:
  - computer_use  # Only if sandboxed
```

**Example**:
```typescript
// Sandboxed environment only
await computer_use({
  action: 'screenshot',
  description: 'Capture app state'
});
```

**Not recommended** for most agents. Prefer: Read/Write/Edit, MCP integrations, Bash.

See [Extended Guide](./extended-guide-template.md#computer-use) for setup, security model, full examples.

---

### 4. Contamination Rules

**Show patterns, not implementations**. Keep code examples ≤10 lines.

✅ **Good** (pattern with link):
```typescript
// ✅ ALLOWED in server actions
import { createNodeClient } from '@repo/db-prisma/node';

// ❌ FORBIDDEN in client components
'use client';
import { createNodeClient } from '@repo/db-prisma/node';  // Server-only

See [Full Examples](../docs/agents-extended/agent-extended.md#contamination)
```

❌ **Bad** (30+ line implementation):
```typescript
// Full function implementation here...
// [25 more lines]
```

---

### 5. Common Tasks

**Format**: Task name + Brief workflow (one line) + Link

✅ **Good**:
```markdown
1. **Add New Component**
   - Design API → Implement → Add Story → Test accessibility
   - See [Component Workflow](../docs/agents-extended/ui-extended.md#new-component)
```

❌ **Bad** (too detailed):
```markdown
1. **Add New Component**
   First, you need to understand the design requirements...
   [15 more lines of detailed steps]
```

---

### 6. Resources Section

**Always include**:
1. Extended guide with all 8 section links
2. Key external libraries (via Context7)
3. Internal documentation

**Link format**: Use descriptive section names, not just numbers.

---

### 7. Optional Sections

**Include only if relevant**:
- Performance Targets (not all agents need this)
- Stage/Layer Mapping (useful for stack specialists)

**Omit if not applicable** - save the lines!

---

## Validation Checklist

Run before committing:

- [ ] **Line count ≤200**: `wc -l .claude/agents/[agent].md`
- [ ] **Valid YAML**: `pnpm agents:validate`
- [ ] **Agent name is kebab-case**: No spaces, underscores, or uppercase
- [ ] **Description is quoted**: `"description here"`
- [ ] **Mission is 2-3 lines**
- [ ] **Forbidden list delegates**: Each ❌ says "delegate to X"
- [ ] **Code examples ≤10 lines each**
- [ ] **All 8 extended guide sections linked**
- [ ] **No detailed implementations**: Details are in extended guide
- [ ] **Common tasks ≤5 items**: Most frequent tasks only

---

## Creating a New Agent

### Step-by-Step Process

1. **Copy template** above into `.claude/agents/[agent-name].md`

2. **Fill in YAML frontmatter**
   - **Name**: Must be kebab-case (lowercase-with-dashes)
     - ✅ `code-reviewer`, `stack-prisma`, `orchestrator`
     - ❌ `Code Reviewer`, `code_reviewer`, `codeReviewer`
   - **Description**: Must be quoted string
     - ✅ `"Manages database schema and migrations"`
     - ❌ `Manages database schema` (missing quotes)
   - **Model**: Use `claude-opus-4-1` for orchestrators, `claude-sonnet-4-5` for specialists
   - **Thinking Budget**: 256 (simple), 2048 (moderate), 4096 (complex)
   - Keep default tool list (remove only if truly not needed)

3. **Write 2-3 line mission**
   - What does this agent own?
   - What is its primary responsibility?

4. **Define boundaries**
   - Allowed: Be specific (paths, technologies, scope)
   - Forbidden: Always delegate (name the agent)

5. **Create minimal content**
   - 3-5 common tasks max
   - ≤10 line code examples
   - Link to extended guide for everything else

6. **Validate YAML**
   - Check line count: `wc -l .claude/agents/[agent].md`
   - Run: `pnpm agents:validate`
   - Review against checklist above

7. **Create extended guide** (see [extended-guide-template.md](./extended-guide-template.md))
   - 8 comprehensive sections
   - Full code examples (20-100 lines)
   - Troubleshooting and anti-patterns

8. **RESTART CLAUDE CODE (REQUIRED)**
   ```bash
   /q .
   # Or press: Esc + Esc
   ```

   Agent won't appear in /agents list until restart!

9. **Verify agent discovered**
   ```bash
   # Should see your new agent in list
   > /agents
   ```

10. **Link documentation**
    - Agent file links to extended guide (8 section links)
    - Extended guide references agent file

---

## Troubleshooting Agent Creation

### Agent Not Appearing in /agents

**Cause** → **Fix** → **Verify**

1. No restart → `/q .` (or Esc+Esc) → Re-run `/agents`
2. Invalid YAML → `pnpm agents:validate` → Fix errors shown
3. Wrong location → Move to `.claude/agents/` → Check path
4. Name format → Use kebab-case → Rename `my-agent`
5. Missing quotes → Add to description → `"quoted"`

See [Agent Discovery](#agent-discovery) for requirements.

---

### Agent Crashes on Startup

**Cause** → **Fix**

1. Invalid tools → Remove unused from `allowed_tools`
2. Wrong model → Use `claude-sonnet-4-5` (not `4.5`)
3. Quoted integers → Remove quotes from `max_turns`, `thinking_budget`
4. Quoted booleans → Use `true`/`false` (not `"true"`)

---

### YAML Validation Fails

**Common mistakes**:
- Missing quotes: `description: "Text with: colons"`
- Wrong indentation: 2 spaces (not tabs)
- Quoted numbers: `max_turns: 60` (not `"60"`)

See [YAML Validation Warning](#yaml-validation-warning) for patterns.

---

## Real Examples from Repo

### Config-Focused Agent (~180 lines)

**Reference**: `.claude/agents/linting.md`

**Characteristics**:
- Minimal Common Tasks (3 items)
- No Performance Targets section
- Heavy focus on configuration patterns
- Links to extended guide for details

---

### Stack Specialist (~200 lines)

**Reference**: `.claude/agents/stack-prisma.md`

**Characteristics**:
- Comprehensive Domain Boundaries
- Detailed Contamination Rules
- 4-5 Common Tasks
- Performance Targets included
- Extensive Resources section

---

### Coordination Agent (~220 lines)

**Reference**: `.claude/agents/orchestrator.md`

**Characteristics**:
- Uses "Extended Documentation" instead of "Resources"
- Different structure (but still compressed)
- Heavy focus on delegation patterns

**Note**: Orchestrator slightly exceeds 200 lines but has special coordination requirements.

---

## Common Mistakes

### ❌ Mistake 1: Too Verbose
**Problem**: Explaining everything in detail in Tier 1
**Fix**: One-line summaries with links to extended guide

### ❌ Mistake 2: Missing Delegation
**Problem**: Forbidden list without saying who to delegate to
**Fix**: Every ❌ item should say "(delegate to X)" or "(coordinate with Y)"

### ❌ Mistake 3: Code Examples Too Long
**Problem**: 30+ line implementations in contamination rules
**Fix**: ≤10 lines showing pattern, link to extended guide for full examples

### ❌ Mistake 4: Outdated Information
**Problem**: References to old patterns or deprecated libraries
**Fix**: Review quarterly, remove outdated content

### ❌ Mistake 5: No Extended Guide Links
**Problem**: Resources section missing extended guide links
**Fix**: Always link all 8 sections of extended guide

### ❌ Mistake 6: Forgot to Restart
**Problem**: Created agent but didn't run `/q .` so it's not discovered
**Fix**: ALWAYS restart after creating/modifying agent files

### ❌ Mistake 7: Invalid YAML (Silent Failure)
**Problem**: Agent has YAML error so it's silently ignored
**Fix**: Run `pnpm agents:validate` before committing

---

## Maintenance

### Quarterly Review
- [ ] Line count still ≤200
- [ ] Extended guide links work
- [ ] Patterns are current
- [ ] Dependencies up to date
- [ ] No outdated technology references
- [ ] YAML still validates

### When to Update

**Update Tier 1 (agent file) when**:
- Mission changes
- Domain boundaries shift
- Critical contamination rules change
- New common task emerges

**Keep changes minimal** - extensive details go in extended guide (Tier 2)

**Update Tier 2 (extended guide) when**:
- New patterns discovered
- Adding code examples
- Documenting troubleshooting
- Expanding anti-patterns

---

## Related Templates

- **[Extended Guide Template](./extended-guide-template.md)** - Tier 2 comprehensive documentation
- **[Context Reduction Report](./context-reduction-report.md)** - Metrics and achievements
- **[Template Validation Report](./template-validation-report.md)** - v2.0.0 compliance verification

---

## Success Metrics

This template is based on achieving:
- **44.8% context reduction** (3,213 lines saved)
- **≤200 lines per agent** (average 206, strict limit)
- **15 extended guides** created alongside compressed agents
- **All agents validated** and working
- **v2.0.0 compliant** (checkpoint, session persistence, thinking budgets)

See [Context Reduction Report](./context-reduction-report.md) for full metrics.

---

*Template Version: 4.0 (LLM-Optimized for Claude Sonnet 4.5)*
*Based on comprehensive audit, v2.0.0 compliance, and LLM optimization*
*Updated: 2025-10-07*
