# Testing /fullservice Delegation

## Purpose
Verify that `/fullservice` properly delegates to the orchestrator agent instead of executing directly in the main session.

---

## Test 1: Basic Delegation

### Steps
1. Start new Claude Code session
2. Run: `/fullservice --plan`
3. Observe first actions

### Success Criteria
✅ **First tool call** should be:
```typescript
Task({
  subagent_type: "orchestrator",
  description: "Execute /fullservice autonomous cycle",
  prompt: "You are the orchestrator agent..."
})
```

❌ **FAILURE**: If main session starts reading files, making edits, or running bash commands

---

## Test 2: Orchestrator Takes Over

### Steps
1. After Task delegation (from Test 1)
2. Wait for orchestrator agent to spawn
3. Monitor orchestrator's actions

### Success Criteria
✅ **Orchestrator should**:
- Create TodoWrite plan with subtasks
- Delegate to specialists (docs, agentic, foundations, etc.)
- Update TodoWrite with `owner` fields showing specialist names
- Write to `.claude/memory/quick-context.md` with agent ownership
- Create the worktree via `mcp__git__git_worktree` (no raw `git worktree`/`mkdir` commands)
- Validate worktree files using `Glob`/`Read` instead of Bash `test`

❌ **FAILURE**: If orchestrator does work directly without delegating
❌ **FAILURE**: If worktree creation triggers Bash permission prompts (indicates raw Bash usage)

---

## Test 3: Specialist Coordination

### Steps
1. Continue from Test 2
2. Observe specialist delegations

### Success Criteria
✅ **Each specialist should**:
- Receive clear task from orchestrator
- Report completion back to orchestrator
- Have work documented in TodoWrite with their name as owner
- No circular delegation (specialist → orchestrator → same specialist)

❌ **FAILURE**: If no specialists are invoked, or if orchestrator delegates to itself

---

## Test 4: Memory & Artifacts

### Steps
1. After /fullservice completes (or partial run)
2. Check memory files

### Success Criteria
✅ **Files should contain**:

`.claude/memory/quick-context.md`:
```markdown
**Session**: /fullservice autonomous cycle
**Active Specialists**:
- docs: Updating README agent count
- agentic: Verifying agent coordination
...
```

`.claude/memory/tool-audit.log` (if it exists):
```
Task(orchestrator): Execute /fullservice...
Task(docs): Update README...
Task(agentic): Verify agents...
```

❌ **FAILURE**: If memory shows only main session activity

---

## Regression Test Script

```bash
# Run /fullservice in plan mode
/fullservice --plan

# After completion, verify:

# 1. First action was Task delegation
grep -A5 "IMMEDIATE ACTION" <transcript>

# 2. TodoWrite has specialist owners
grep "owner.*docs\|stack-\|agentic\|reviewer" .claude/memory/quick-context.md

# 3. Worktree created via MCP (no raw git in transcript after handoff)
grep "mcp__git__git_worktree" .claude/memory/tool-audit.log

# 4. Multiple agents involved
grep -c "owner" .claude/memory/quick-context.md
# Should be > 1

# 5. No direct file edits by main session
! grep "File.*updated\|File.*created" <transcript_before_task_call>
```

---

## Common Failure Modes

### 1. Main Session Ignores IMMEDIATE ACTION
**Symptom**: Main session continues past delegation block

**Debug**:
- Check if IMMEDIATE ACTION block is visible in expanded prompt
- Verify model reads instruction before proceeding

**Fix**: Make IMMEDIATE ACTION more emphatic (bigger warning, multiple STOP directives)

### 2. Orchestrator Doesn't Delegate
**Symptom**: Orchestrator does work directly

**Debug**:
- Check orchestrator.md has proper coordination matrix
- Verify orchestrator understands delegation requirement
- Check if specialists are discoverable

**Fix**: Update orchestrator.md with explicit "NEVER do work yourself" instruction

### 3. Specialists Not Found
**Symptom**: Task tool fails with "unknown subagent_type"

**Debug**:
- Verify all 18 .md files in `.claude/agents/`
- Check frontmatter has correct `name:` field
- Run agents:validate script

**Fix**: Ensure agent name matches filename (minus .md)

---

## Observable Outputs Summary

| Indicator | Expected | Failure |
|-----------|----------|---------|
| **First tool call** | Task(orchestrator) | Read, Edit, Bash, etc. |
| **TodoWrite owners** | docs, agentic, stack-* | orchestrator, main, none |
| **Memory artifacts** | Multiple agent names | Only orchestrator or main |
| **File modifications** | Via specialists only | Direct by main/orchestrator |

---

## Next Steps After Verification

1. ✅ If delegation works: Move to Phase 2 (validation infrastructure)
2. ❌ If delegation fails: Debug with failure mode guide above
3. 📋 Document results in `.claude/memory/quick-context.md`

---

*Created: 2025-10-07*
*Last Updated: 2025-10-07*
