# Creating New Agents - Complete Guide

## When to Create a New Agent

Create a new agent when:

✅ **YES - Create New Agent**:

- New technology stack requiring deep expertise (e.g., adding GraphQL would need `stack-graphql`)
- New cross-cutting concern with clear boundaries (e.g., adding `internationalization`)
- Existing agent's scope becomes too broad (split responsibilities)
- Clear domain ownership needed for quality gates

❌ **NO - Extend Existing Agent**:

- Minor feature additions within existing domain
- Temporary experimental features
- Simple integrations that fit existing agents
- Overlapping responsibilities with existing agents

## Agent Creation Checklist

### 1. Planning Phase

- [ ] Identify clear domain boundaries (what's allowed/forbidden)
- [ ] Map stage/layer responsibilities (UI/Server/Edge/Packages/Data/Infra)
- [ ] Define coordination needs (which agents to work with)
- [ ] Establish performance/quality targets
- [ ] Review existing agents for overlaps

### 2. File Creation

- [ ] Copy `.claude/docs/templates/specialist-agent-template.md`
- [ ] Rename to `.claude/agents/{agent-name}.md`
- [ ] Update YAML frontmatter with unique name and description

### 3. Core Sections

#### 3.1 Safety (Mandatory)

```markdown
## Safety: Worktree Only

- MUST edit in `.tmp/fullservice-*` paths only
- REJECT all paths outside worktree
- Report violations: `Status: BLOCKED | Issue: non-worktree path | Action: orchestrator create worktree`
```

#### 3.2 Mission (Required)

Target: 1-2 sentences, 40-60 words
Pattern: "Own {domain}. {Key responsibilities} while {constraints}."

Example:

> Own Prisma ORM integration and database schema. Manage migrations, query optimization, and SafeEnv validation while ensuring transaction safety and edge runtime compatibility.

#### 3.3 Domain Boundaries (Required)

```markdown
**Allowed:**

- {specific files/directories}
- {framework APIs}
- {patterns within domain}

**Forbidden:**

- {contamination boundaries}
- {other agent domains}
- {anti-patterns}
```

#### 3.4 Default Tests (Required)

```bash
# Quality gates (when applicable)
pnpm lint --filter {scope}
pnpm typecheck --filter {scope}

# Tests
pnpm vitest --filter {scope} --run

# Domain-specific (as needed)
{agent-specific commands}
```

#### 3.5 Handoff Protocols (Required)

```markdown
**To Orchestrator - Report when:**

- {specific escalation triggers}
- {blocking issues}
- {coordination needs}

**Format:**
\`\`\`markdown
**Status**: ✅ Complete | 🔄 In Progress | ⚠️ Blocked
**Issue**: {What was found/requested}
**Impact**: {Impact assessment}
**Recommendation**: {Specific fix with file:line}
**Verification**: {Commands run}
\`\`\`
```

#### 3.6 Memory Management (Required)

```markdown
**Checkpoint after:**

- {major changes}
- {learnings captured}

**Format in `.claude/memory/{agent}-learnings.md`**:

\`\`\`markdown

## [YYYY-MM-DD] {Task Name}

**{Agent-specific fields}**
**Learning**: {key insight}
\`\`\`
```

#### 3.7 Escalation Paths (Required)

```markdown
**To Other Specialists:**

- **{specialist}**: {when to escalate}

**To Orchestrator:**

- {orchestrator escalation triggers}
```

### 4. Optional Sections

These sections are optional and should only be added if relevant:

- **Stage/Layer Mapping**: If agent works across multiple stages
- **MCP Utils Integration**: If using custom MCP tools
- **Contamination Rules**: If domain has specific contamination concerns
- **Common Tasks**: Top 5-7 workflows
- **Resources**: Extended guides, external docs, internal references

### 5. Update Orchestrator

Add new agent to orchestrator's coordination matrix:

**File**: `.claude/agents/orchestrator.md` (lines ~466-487)

```markdown
| **{agent-name}** | {Domain} | {Coordinates With} | {Decision Authority} |
```

### 6. Update AGENTS.md

Add agent to the 18-agent table:

**File**: `AGENTS.md` (top section)

```markdown
| `{agent-name}` | {Domain} | {Highlights} |
```

### 7. Create Extended Guide (Optional but Recommended)

Create `.claude/docs/agents-extended/{agent-name}-extended.md` with:

- Detailed patterns and examples
- Common pitfalls and solutions
- Advanced workflows
- Troubleshooting guide

### 8. Validation

Run these commands to verify the new agent:

```bash
# Verify YAML frontmatter is valid
grep -A 30 "^---$" .claude/agents/{agent-name}.md

# Verify all required sections present
grep "^## " .claude/agents/{agent-name}.md

# Check for consistent format
grep "^## Handoff Protocols" .claude/agents/{agent-name}.md -A 10
grep "^## Memory Management" .claude/agents/{agent-name}.md -A 5

# Verify orchestrator knows about it
grep "{agent-name}" .claude/agents/orchestrator.md
```

## Examples of Well-Structured Agents

Review these agents as examples:

- **stack-prisma.md**: Domain specialist with clear boundaries
- **testing.md**: Cross-cutting concern with coordination patterns
- **security.md**: Quality gate agent with escalation paths
- **stack-next-react.md**: Framework specialist with performance focus

## Common Mistakes to Avoid

❌ **Don't**:

- Create agents with overlapping domains
- Skip the Safety section
- Forget to update orchestrator coordination matrix
- Use inconsistent Handoff Protocol format
- Add Performance Targets unless critical to mission
- Create agents for temporary features

✅ **Do**:

- Follow the template structure exactly
- Define clear domain boundaries
- Coordinate with existing agents
- Test delegation workflows
- Document in AGENTS.md
- Use standard format for all sections

## Testing the New Agent

1. **Unit Test**: Verify agent can be loaded by orchestrator
2. **Integration Test**: Test delegation from orchestrator
3. **Handoff Test**: Verify handoff protocol format works
4. **Memory Test**: Test checkpoint writing
5. **Coordination Test**: Verify interaction with other agents

## Maintenance

After creating an agent:

- [ ] Monitor for scope creep (agent doing too much)
- [ ] Update when dependencies change
- [ ] Refine domain boundaries based on usage
- [ ] Document learnings in extended guide
- [ ] Review coordination patterns quarterly

---

**Template Location**: `.claude/docs/templates/specialist-agent-template.md`
**Questions**: Escalate to `agentic` specialist or orchestrator
