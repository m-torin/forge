# Forge Claude Anti-Patterns

Use this document to record CLI misuse, automation pitfalls, and remediation playbooks specific to Forge.

---

## 🚨 CRITICAL: Delegation Bypass Anti-Patterns

### Anti-Pattern 1: Main Session Does Implementation (Session 3 Catastrophe)

**The Violation:**
Main session receives slash command (e.g., `/fullservice`), reads product requirements, then **implements directly** instead of delegating to orchestrator.

**Real Example - Session 3 (2025-10-06):**
```
❌ User runs: /fullservice
❌ Main session reads fullservice.md requirements
❌ Main session thinks: "I'll fix these issues myself"
❌ Main session edits 44 files directly on main branch
❌ 0 Task() delegations
❌ Bypass complete
```

**Impact:**
- **Process**: Violated 3-tier PM→EM→Engineer delegation model
- **Safety**: No specialist knowledge applied, no distributed verification
- **Quality**: No domain expertise, no quality gates enforced by specialists
- **Precedent**: Set dangerous pattern for future sessions
- **Technical**: Work was correct, but process was catastrophically wrong

**Detection:**
```bash
# Check for delegation bypass in completed session
grep -c "Task(" .claude/memory/tool-audit.log
# Should be ≥2 for /fullservice sessions (main→orchestrator, orchestrator→specialists)
# Session 3: Found 0

# Check memory for specialist involvement
grep "owner.*docs\|stack-\|agentic" .claude/memory/quick-context.md
# Session 3: No matches found
```

**Prevention:**
1. ✅ Slash commands now force immediate `Task(orchestrator)` call
2. ✅ `permission_mode: manual` adds friction
3. ✅ Pre-commit hook validates delegation count
4. ✅ Validation script checks for orchestrator implementation violations
5. ✅ Documentation clearly defines PM/EM/Engineer roles

**Remediation Applied:**
- Updated `.claude/commands/fullservice.md` with immediate delegation requirement
- Updated `.claude/commands/modernize.md` with same pattern
- Created `.git/hooks/pre-commit` with delegation validation
- Enhanced `scripts/validate.mjs` with bypass detection
- Added 3-tier architecture to `CLAUDE.md` and `.claude/AGENTS.md`

---

### Anti-Pattern 2: Orchestrator Does Implementation (Session 2)

**The Violation:**
Orchestrator agent (Engineering Manager) receives requirements from slash command, then **implements code directly** instead of delegating to specialist engineers.

**Real Example - Session 2 (2025-10-06):**
```
❌ Orchestrator receives: "Fix README agent count, update memory docs, fix tsup config"
❌ Orchestrator thinks: "These are trivial, I'll do them myself"
❌ Orchestrator edits README.md directly (should delegate to docs specialist)
❌ Orchestrator edits tsup config directly (should delegate to foundations specialist)
❌ Minimal Task() delegations to specialists
```

**Impact:**
- **Role Confusion**: Engineering Managers coordinate, they don't code
- **Knowledge Gap**: Specialist learnings not captured
- **Verification**: Missing domain expert review
- **Scalability**: Orchestrator becomes bottleneck

**Detection:**
```bash
# Check orchestrator implementation in quick-context
grep -i "orchestrator.*edit\|orchestrator.*write\|orchestrator.*fixed" .claude/memory/quick-context.md

# Check for specialist owners in TodoWrite
grep "owner.*:" .claude/memory/quick-context.md | grep -v "orchestrator"
# Session 2: Few specialist owners found
```

**Prevention:**
1. ✅ Updated `.claude/agents/orchestrator.md` with "EM doesn't code" rules
2. ✅ Added delegation decision matrix (ALWAYS delegate implementation)
3. ✅ Added startup role verification checklist
4. ✅ Validation script checks for orchestrator editing *.ts, *.tsx, *.js, *.jsx, *.md files

**Correct Pattern:**
```typescript
// ❌ WRONG: Orchestrator edits directly
Edit({
  file_path: "README.md",
  old_string: "16-Agent System",
  new_string: "18-Agent System"
})

// ✅ CORRECT: Orchestrator delegates to docs specialist
TodoWrite({
  todos: [{
    content: "Update README agent count (16 → 18)",
    status: "handoff",
    owner: "docs",
    activeForm: "Delegating README update to docs specialist"
  }]
})

Task({
  subagent_type: "docs",
  description: "Update README agent count",
  prompt: "Update README.md agent system table from 16 to 18 agents..."
})
```

---

### Anti-Pattern 3: "Quick Fix" Rationalization

**The Violation:**
Thinking "It's just one line / too trivial to delegate / faster if I do it myself" to justify bypassing delegation.

**Why It's Wrong:**
1. **Builds bad habits**: Small bypasses normalize larger ones
2. **Loses knowledge**: Specialists don't learn the pattern
3. **Misses issues**: Domain experts would catch edge cases
4. **Violates architecture**: PM/EM/Engineer roles exist for a reason

**Correct Thinking:**
- "Delegation builds specialist knowledge bases"
- "Specialists catch issues I'd miss"
- "Coordination is my value-add, not implementation"
- "Every delegation strengthens the system"

---

## Delegation Rules Summary

### ✅ Main Session (Product Manager)
- **CAN**: Read slash command, define WHAT
- **MUST**: Delegate immediately to orchestrator via `Task(orchestrator)`
- **CANNOT**: Read files, edit files, run commands, make any implementation decisions

### ✅ Orchestrator (Engineering Manager)
- **CAN**: Read files for analysis, coordinate specialists, update memory checkpoints
- **MUST**: Delegate ALL implementation to domain specialists
- **CANNOT**: Edit *.ts, *.tsx, *.js, *.jsx, *.md (except .claude/memory/*.md), run implementation commands
- **EXCEPTION**: Can edit `.claude/memory/quick-context.md`, `checkpoint-*.md`, `*-learnings.md`

### ✅ Specialists (Engineers)
- **CAN**: Edit files in their domain, run tests, make changes
- **MUST**: Stay in domain boundaries, report to orchestrator
- **CANNOT**: Work outside domain, bypass orchestrator

---

## Prompt & Planning Issues

### Issue: Scope Creep During AUDIT
**Symptom**: AUDIT phase identifies gaps, session immediately tries to fix everything
**Fix**: Focus on core mission, defer low-priority items
**Reference**: `.claude/commands/fullservice.md` - "Scope Boundaries" section

### Issue: Missing TodoWrite Specialist Owners
**Symptom**: TodoWrite entries lack `owner` field
**Fix**: Every task must have specialist owner (docs, stack-*, foundations, etc.)
**Detection**: Validation script checks for specialist owners in quick-context

---

## Automation Hook Pitfalls

### Pitfall: Pre-commit Hook Blocks Legitimate Documentation
**Symptom**: Updating delegation system docs triggers "insufficient delegation" error
**Fix**: Added whitelist in `scripts/validate.mjs`
**Whitelisted**: Templates, quick-context.md, validation scripts, hooks, delegation docs

### Pitfall: Bash CWD Reset in Worktree Operations
**Symptom**: Bash tool resets working directory between commands
**Fix**: Always prefix with `cd "$WORKTREE_PATH" &&`
**Reference**: `.claude/docs/fullservice-flow-diagram.md` - Tool Usage Priority

---

## Security Concerns

### Risk: Direct Secret Edits Without Approval
**Pattern**: Modifying .env files, secrets in configs
**Mitigation**: Terraform/secrets changes require explicit user approval
**Reference**: `.claude/agents/orchestrator.md` - Escalation section

### Risk: Running `pnpm dev` in Autonomous Mode
**Pattern**: Starting dev servers during automation
**Mitigation**: `pnpm dev` explicitly forbidden in CLAUDE.md
**Reason**: Autonomous sessions don't need dev servers, prevents port conflicts

---

## Testing Gaps

### Gap: No E2E Tests for Delegation Flow
**Issue**: Can't automatically test PM→EM→Engineer delegation
**Mitigation**: Manual testing guide in `.claude/docs/testing-fullservice.md`
**Future**: Automated delegation flow tests

### Gap: Pre-commit Hook Only Runs on Memory Changes
**Issue**: Hook only triggers when `.claude/memory/` files are staged
**Reason**: Avoids blocking normal development commits
**Trade-off**: Delegation violations in non-automation sessions not caught

---

## Reference Links

**Delegation Architecture:**
- `.claude/AGENTS.md` - 3-tier coordination model
- `CLAUDE.md` - PM/EM/Engineer role definitions
- `.claude/agents/orchestrator.md` - EM delegation matrix

**Validation:**
- `.git/hooks/pre-commit` - Delegation validation hook
- `scripts/validate.mjs` - Unified validation (delegation subcommand)

**Testing:**
- `.claude/docs/testing-fullservice.md` - Delegation test guide
- `.claude/memory/session-report-template.md` - Delegation metrics

---

Keep this guide synchronized with agent specifications and reference during `/fullservice` and `/modernize` runs.
