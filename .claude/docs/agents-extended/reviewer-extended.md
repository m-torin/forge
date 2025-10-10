# Reviewer Extended Guide

Comprehensive validation patterns, blind spot detection, and quality assessment criteria.

## Table of Contents

1. [Session Analysis Review Workflows](#session-analysis-review-workflows)
2. [Improvement Proposal Validation](#improvement-proposal-validation)
3. [Blind Spot Detection Patterns](#blind-spot-detection-patterns)
4. [Counter-Proposal Generation](#counter-proposal-generation)
5. [Quality Scoring Rubrics](#quality-scoring-rubrics)
6. [Common Orchestrator Mistakes](#common-orchestrator-mistakes)
7. [Review Output Templates](#review-output-templates)
8. [Troubleshooting](#troubleshooting)

---

## Session Analysis Review Workflows

### Workflow 1: Complete Session Review

**Inputs:**
- `.claude/memory/fullservice-session-{TIMESTAMP}.md`
- `.claude/memory/tool-audit.log`
- TodoWrite history
- Git commits from session
- quick-context.md and full-context.md updates

**Step-by-Step Analysis:**

1. **Phase Completeness Check**
```markdown
AUDIT Phase:
- [ ] README comparison completed
- [ ] Gaps identified with evidence
- [ ] Priority assigned to gaps
- [ ] Scope boundaries defined

BUILD Phase:
- [ ] Only README-documented features implemented
- [ ] No scope creep (social features, new frameworks)
- [ ] Specialist delegation followed
- [ ] Code quality maintained

VALIDATE Phase:
- [ ] repo:preflight executed
- [ ] Contamination checks passed
- [ ] Type checking clean
- [ ] Tests passing

DISCOVER Phase:
- [ ] New issues from testing identified
- [ ] Root causes analyzed
- [ ] Patterns recognized

REFLECT Phase:
- [ ] agent-improvements-{TS}.md created
- [ ] guardrail-improvements-{TS}.md created
- [ ] workflow-improvements-{TS}.md created
- [ ] Concrete examples provided
```

2. **Tool Usage Audit**
```bash
# Analyze tool-audit.log for violations

# RED FLAGS:
grep "Bash.*git" tool-audit.log        # Should use MCP git
grep "Bash.*cat\|head\|tail" tool-audit.log  # Should use Read
grep "Bash.*grep" tool-audit.log       # Should use Grep
grep "Bash.*find" tool-audit.log       # Should use Glob
grep "WebFetch" tool-audit.log         # Should use Context7

# Example bad pattern:
# [2025-01-15T10:30:00Z] Bash: git status
# VIOLATION: Should use mcp__git__git_status()

# Example good pattern:
# [2025-01-15T10:30:00Z] mcp__git__git_status: executed
# ✅ Correct tool usage
```

3. **Memory Discipline Check**
```markdown
quick-context.md:
- [ ] Updated after each delegation
- [ ] Within 500-line limit
- [ ] Contains actionable next steps
- [ ] Timestamped checkpoints

full-context.md:
- [ ] Updated at cycle completion
- [ ] Within 2000-line limit
- [ ] Milestones documented
- [ ] Key decisions recorded

Specialist learnings:
- [ ] {agent}-learnings.md updated
- [ ] Code examples with file:line refs
- [ ] Within 1000-line limit per agent
```

4. **Guardrail Compliance**
```bash
# Check for contamination violations
node scripts/validate.mjs contamination

# Common violations to verify:
rg "from ['\"]next/" packages/*/src       # Next.js in packages
rg "from ['\"]@/" packages/*/src          # @/ imports in packages
rg "@repo/.+?/src/" apps                  # Deep imports
```

### Workflow 2: Scope Adherence Validation

**Question:** Did orchestrator stay within mission boundaries?

**Check against forbidden behaviors:**
```markdown
❌ VIOLATIONS (auto-fail):
- Built social features (chat, messaging, profiles)
- Adopted new frameworks (switched from Mantine to shadcn)
- Created bulk fix scripts
- Skipped specialist delegation
- Made breaking changes without approval

✅ ALLOWED:
- Framework integrations (Mantine + Next.js patterns)
- Agent coordination improvements
- Edge case handling (fallbacks, errors)
- Quality gate enforcement
- Test coverage improvements
```

**Scope creep detection:**
```typescript
// Example: Orchestrator built user profiles
// VIOLATION: Not in README mission
//
// README: "Travel booking platform with Hotelbeds integration"
// Built: User profile pages, avatar uploads, bio editing
// Assessment: SCOPE CREEP - social features outside core mission

// Counter-example: Orchestrator added error boundaries
// ALLOWED: Quality improvement within mission
//
// README: "Reliable travel booking"
// Built: Error boundaries for booking flow
// Assessment: WITHIN SCOPE - reliability is documented
```

---

## Improvement Proposal Validation

### Pattern 1: Root Cause Analysis

**Orchestrator proposes:**
```markdown
Issue: Agent X failed to import correct module
Fix: Add import validation hook
```

**Reviewer validation process:**

1. **Challenge the root cause**
```markdown
Q: Why did Agent X import incorrectly?
- Missing documentation?
- Contamination rule unclear?
- No examples in agent .md?
- Tool used incorrectly?

Actual root cause analysis:
- Agent X .md lacks import patterns section
- No examples of @repo/* imports
- Contamination checks don't cover this case
- Agent X doesn't have foundations specialist as dependency
```

2. **Evaluate proposed fix**
```markdown
Orchestrator's fix: Add import validation hook

Problems:
- ❌ Doesn't prevent future mistakes
- ❌ Adds runtime overhead
- ❌ Doesn't help agent learn
- ❌ Treats symptom not cause

Alternative fixes:
1. Update Agent X .md with import patterns
2. Add import examples to AI hints
3. Add pre-delegation import check in orchestrator
4. List foundations as required reviewer for Agent X
5. Enhance validate.mjs contamination checks

Recommendation: Implement #1, #2, #5 (systemic prevention)
```

3. **Generate counter-proposal**
```markdown
## Counter-Proposal: Import Patterns Education

### Changes:
1. `.claude/agents/{agent}.md`:
   Add Import Patterns section:
   ```markdown
   ## Import Patterns

   ✅ ALLOWED:
   - `@repo/pkg` - Public package exports
   - Relative imports within package

   ❌ FORBIDDEN:
   - `@repo/pkg/src/file` - Deep imports
   - `@/` imports in package source
   ```

2. `/apps/docs/ai-hints/import-patterns.mdx`:
   Create comprehensive guide with examples

3. `scripts/validate.mjs`:
   Add check for deep imports in contamination validator:
   ```bash
   rg "@repo/[^/]+/src/" apps packages
   ```

### Success Criteria:
- Agent X documentation updated
- AI hints published
- Contamination check catches violation
- Next session: 0 import violations

### Priority: HIGH (prevents recurrence)
### Risk: LOW (documentation only)
```

### Pattern 2: Side Effect Analysis

**For each proposed improvement, check:**

```markdown
## Side Effect Checklist

### Performance Impact
- [ ] Does this add runtime overhead?
- [ ] Does this slow down builds?
- [ ] Does this increase startup time?

### Complexity Impact
- [ ] Does this add mental overhead?
- [ ] Does this make debugging harder?
- [ ] Does this require training?

### Maintenance Impact
- [ ] Does this need regular updates?
- [ ] Does this add technical debt?
- [ ] Does this create new failure modes?

### Integration Impact
- [ ] Does this affect other agents?
- [ ] Does this change workflows?
- [ ] Does this break existing patterns?
```

**Example validation:**

```markdown
Proposal: Add pre-commit hook that runs full test suite

Side Effects:
❌ Performance: Adds 5 minutes to every commit
❌ Developer experience: Frustrating for small changes
❌ Workarounds: Developers will use --no-verify
⚠️ False security: Gives false confidence

Alternative: Pre-push hook for full tests, pre-commit for fast checks
✅ Performance: Only 30 seconds per commit
✅ Developer experience: Reasonable overhead
✅ Still catches issues before push

Recommendation: REJECT full test pre-commit, APPROVE modified version
```

---

## Blind Spot Detection Patterns

### Pattern 1: Cross-Session Pattern Recognition

**Look for repeated issues across sessions:**

```markdown
# Session Analysis

Session 1 (Jan 10):
- stack-prisma struggled with edge runtime
- Fix: Added edge client example

Session 2 (Jan 12):
- stack-auth struggled with edge runtime
- Fix: Added edge example

Session 3 (Jan 15):
- integrations struggled with edge runtime
- Fix: Added edge example

## BLIND SPOT IDENTIFIED:
**Pattern**: Three different agents had same edge runtime issue
**Root Cause**: Global documentation gap, not agent-specific
**Missed by orchestrator**: Each treated as isolated incident

## Systemic Fix:
1. Create `/apps/docs/ai-hints/edge-runtime-patterns.mdx`
2. Add edge runtime checklist to ALL agents
3. Create edge-runtime specialist agent
4. Add edge runtime section to CLAUDE.md

## Impact:
- Prevents future edge runtime confusion
- Reduces specialist session time
- Improves consistency across agents
```

### Pattern 2: Attribution Error Detection

**Orchestrator blames wrong cause:**

```markdown
# Orchestrator's Analysis
Issue: Build failed during validation
Root Cause: Turborepo cache corruption
Fix: Clear cache before validation

# Reviewer's Investigation
```bash
# Check actual build logs
cat .tmp/fullservice-*/build.log

# Output shows:
# ❌ Type error in packages/auth/src/server.ts
# ❌ 'Session' is not exported from '@better-auth/core'

# ACTUAL root cause: Dependency version mismatch
# NOT cache corruption
```

**Correct attribution:**
```markdown
## Attribution Correction

Orchestrator blamed: Cache corruption
Evidence against: Build log shows type errors, not cache issues

Actual root cause:
- better-auth upgraded from 0.5.0 to 0.6.0
- Breaking change: Session export moved
- pnpm.lock not updated correctly

Correct fix:
1. Verify dependency versions
2. Update import paths
3. Run pnpm install --force
4. Add better-auth to catalog versions for consistency

Lesson: Always read actual error messages, don't assume
```

### Pattern 3: Systemic vs. One-Off Detection

**Distinguish between isolated issues and systemic problems:**

```markdown
# Issue Classification

## ONE-OFF (Low Priority)
Issue: Typo in variable name caused test failure
Frequency: First occurrence
Impact: Single test
Fix: Correct typo
Prevention: Not needed (random human error)

## SYSTEMIC (High Priority)
Issue: Agent X requested manual confirmation during autonomous session
Frequency: Happened in 3 of last 5 sessions
Impact: Breaks automation promise
Fix: Update Agent X permission mode
Prevention: Add pre-delegation permission check

## Analysis
Orchestrator treated systemic issue as one-off:
- Fixed the specific instance
- Didn't check for pattern
- Didn't update agent config

Reviewer escalation:
- Identified 3 occurrences via grep
- Root cause: permission_mode: manual
- Systemic fix: Change to acceptEdits
- Add validation in orchestrator pre-delegation
```

---

## Counter-Proposal Generation

### Template 1: Enhanced Alternative

```markdown
## Counter-Proposal: {Improvement Name}

### Orchestrator's Original Proposal
{what they suggested}

### Why It's Insufficient
- ❌ {specific problem 1}
- ❌ {specific problem 2}
- ❌ {specific problem 3}

### Enhanced Alternative
{better approach}

### Why This Is Better
- ✅ {advantage 1}
- ✅ {advantage 2}
- ✅ {advantage 3}

### Implementation
{concrete steps with file paths}

### Success Criteria
- [ ] {measurable outcome 1}
- [ ] {measurable outcome 2}

### Risk Assessment
**Risk**: {Low|Medium|High}
**Mitigation**: {how to reduce risk}

### Priority: {Critical|High|Medium|Low}
### Confidence: {High|Medium|Low}
```

### Template 2: Complete Rejection

```markdown
## Rejected Proposal: {Name}

### Orchestrator's Proposal
{what they suggested}

### Why This Is Wrong
{fundamental flaws}

### Evidence Against
{data/logs/examples showing it won't work}

### What Should Happen Instead
{completely different approach}

### Recommendation
**Action**: REJECT original, implement alternative
**Rationale**: {brief explanation}
```

### Example Counter-Proposal

```markdown
## Counter-Proposal: Agent Memory Persistence

### Orchestrator's Original Proposal
Add `memory_enabled: true` to all agents to preserve context across sessions

### Why It's Insufficient
- ❌ Doesn't specify what to persist (everything? selective?)
- ❌ No memory size limits (will grow unbounded)
- ❌ No expiration policy (stale data persists forever)
- ❌ Doesn't address memory conflicts between sessions

### Enhanced Alternative
Implement tiered memory system with explicit retention policies:

1. **Session Memory** (temporary, discarded after session)
   - TodoWrite state
   - Current working context
   - Ephemeral decisions

2. **Short-term Memory** (7-day retention)
   - Recent bug fixes and solutions
   - Active feature work
   - Current iteration learnings

3. **Long-term Memory** (permanent, curated)
   - Architecture decisions
   - Successful patterns
   - Hard-learned lessons

### Implementation
```markdown
# .claude/agents/{agent}.md
memory_scope: project
memory_retention:
  session: discard_on_exit
  short_term: 7_days
  long_term: permanent
memory_limits:
  session: 500_lines
  short_term: 1000_lines
  long_term: 2000_lines
```

### Success Criteria
- [ ] Memory doesn't exceed defined limits
- [ ] Old sessions auto-archived after 7 days
- [ ] Critical learnings preserved in long-term memory
- [ ] No memory-related performance degradation

### Risk Assessment
**Risk**: Low
**Mitigation**:
- Limits prevent unbounded growth
- Archival system prevents data loss
- Rollback: remove memory_retention config

### Priority: HIGH
### Confidence: HIGH
```

---

## Quality Scoring Rubrics

### Phase Execution Scoring

#### AUDIT Phase (Max 10 points each)

**Completeness (10 points):**
- 10: All README sections analyzed, gaps documented with evidence
- 7-9: Most sections covered, minor gaps
- 4-6: Partial coverage, major sections missed
- 1-3: Superficial analysis
- 0: Phase skipped

**Accuracy (10 points):**
- 10: All identified gaps are real, no false positives
- 7-9: <10% false positives
- 4-6: 10-30% false positives
- 1-3: >30% false positives
- 0: Completely inaccurate

#### BUILD Phase (Max 10 points each)

**Scope Adherence (10 points):**
- 10: Zero scope creep, all work README-aligned
- 7-9: Minor tangential work (<10% of time)
- 4-6: Moderate scope creep (10-30% of time)
- 1-3: Major scope creep (>30% of time)
- 0: Completely off-mission

**Code Quality (10 points):**
- 10: Clean, tested, documented, follows patterns
- 7-9: Good code, minor issues
- 4-6: Functional but technical debt added
- 1-3: Messy code, shortcuts taken
- 0: Broken code committed

#### VALIDATE Phase (Max 10 points each)

**Coverage (10 points):**
- 10: All quality gates executed, no shortcuts
- 7-9: Most gates executed
- 4-6: Some gates skipped
- 1-3: Minimal validation
- 0: No validation

**Rigor (10 points):**
- 10: Actually verified results, didn't just run commands
- 7-9: Mostly verified
- 4-6: Ran commands but didn't check results
- 1-3: Superficial checks
- 0: Claimed passing without evidence

#### DISCOVER Phase (Max 10 points each)

**Thoroughness (10 points):**
- 10: Comprehensive issue analysis, nothing missed
- 7-9: Most issues found
- 4-6: Some issues found, major gaps
- 1-3: Superficial discovery
- 0: No discovery attempt

**Root Cause Analysis (10 points):**
- 10: True root causes identified, not symptoms
- 7-9: Mostly accurate, minor attribution errors
- 4-6: Some correct, some symptoms misidentified as causes
- 1-3: Mostly symptoms, not causes
- 0: Completely wrong attribution

#### REFLECT Phase (Max 10 points each)

**Self-Awareness (10 points):**
- 10: Honest assessment, acknowledges mistakes
- 7-9: Mostly honest, minor blind spots
- 4-6: Some self-awareness, some self-justification
- 1-3: Defensive, blames externals
- 0: No self-reflection

**Improvement Quality (10 points):**
- 10: Systemic fixes with concrete implementation
- 7-9: Good improvements, minor gaps
- 4-6: Surface-level improvements
- 1-3: Vague suggestions
- 0: No improvements proposed

### Overall Grade Calculation

```
Total Score = Sum of all phase scores (max 100)

Grade mapping:
A (90-100): Excellent session, minimal issues
B (80-89): Good session, minor improvements needed
C (70-79): Acceptable, notable issues to address
D (60-69): Poor session, major problems
F (<60): Failed session, significant rework required
```

---

## Common Orchestrator Mistakes

### Mistake 1: Self-Validation Bias

**Pattern:**
```markdown
REFLECT output:
"✅ All improvements validated and working correctly"

Reviewer check:
- No external validation performed
- No tests showing improvements work
- Just orchestrator saying "looks good to me"
```

**Detection:**
```bash
grep -r "validated" .claude/memory/fullservice-session-*.md
# If only source is orchestrator, NOT validated
```

**Counter:**
```markdown
## Validation Requirements

Every improvement MUST have:
1. Specific test that demonstrates fix
2. Before/after comparison
3. Independent verification (specialist or automated test)

❌ INSUFFICIENT: "I verified the import works"
✅ REQUIRED: "stack-prisma specialist confirmed edge imports work in test session"
```

### Mistake 2: Tool Misuse Patterns

**Pattern:**
```bash
# tool-audit.log shows:
Bash: git status
Bash: cat file.json
Bash: grep "pattern" file.ts
Bash: find . -name "*.ts"
```

**Should be:**
```bash
mcp__git__git_status()
Read(file_path="file.json")
Grep(pattern="pattern", path="file.ts")
Glob(pattern="**/*.ts")
```

**Impact:**
- Requires user permission (slows down automation)
- Doesn't follow CLAUDE.md tool priority order
- Sets bad example for other agents

**Correction:**
```markdown
## Tool Usage Violations

Session: 2025-01-15
Violations: 12 instances of Bash for file operations

Required retraining:
1. Update orchestrator.md with tool priority
2. Add tool-usage-checker hook
3. Add examples to memory
4. Require permission prompt review before approval
```

### Mistake 3: Shallow Root Cause Analysis

**Pattern:**
```markdown
Issue: Build failed
Root Cause: Cache problem
Fix: Clear cache
```

**Actual investigation needed:**
```bash
# Read the actual build log
cat .tmp/fullservice-*/build.log

# Check what actually failed
# Check recent changes
git log -5 --oneline

# Check dependency changes
git diff HEAD~1 pnpm-lock.yaml
```

**Correct root cause:**
```markdown
Issue: Build failed
Surface symptom: "Cache" in error message
ACTUAL root cause: Typescript upgraded from 5.3 to 5.4
Breaking change: Stricter type checking
Real fix: Fix type errors in 3 files
```

### Mistake 4: Scope Creep Justification

**Pattern:**
```markdown
"While implementing Hotelbeds integration, I noticed we need user profiles,
so I built a complete profile management system with avatar uploads."
```

**Red flags:**
- "While implementing X, I noticed..."
- "It would be easy to also..."
- "Users probably want..."
- "This is required for..."

**Validation:**
```markdown
Q: Is profile management in README?
A: No

Q: Is avatar upload documented?
A: No

Q: Is this part of core mission?
A: No (travel booking, not social features)

Assessment: SCOPE CREEP
Action: Revert profile system, focus on documented features
```

---

## Review Output Templates

### Session Quality Report Template

```markdown
# Session Review - {TIMESTAMP}

## Overall Assessment
**Grade**: {A|B|C|D|F}
**Summary**: {2-3 sentence assessment}
**Recommendation**: {Apply|Apply with modifications|Reject and redo}

---

## Phase Execution Quality

### AUDIT Phase
**Completeness**: {score}/10 - {assessment}
**Accuracy**: {score}/10 - {assessment}
**Issues**:
- {issue 1}
- {issue 2}

### BUILD Phase
**Scope Adherence**: {score}/10 - {assessment}
**Code Quality**: {score}/10 - {assessment}
**Issues**:
- {issue 1}
- {issue 2}

### VALIDATE Phase
**Coverage**: {score}/10 - {assessment}
**Rigor**: {score}/10 - {assessment}
**Issues**:
- {issue 1}
- {issue 2}

### DISCOVER Phase
**Thoroughness**: {score}/10 - {assessment}
**Root Cause Analysis**: {score}/10 - {assessment}
**Issues**:
- {issue 1}
- {issue 2}

### REFLECT Phase
**Self-Awareness**: {score}/10 - {assessment}
**Improvement Quality**: {score}/10 - {assessment}
**Issues**:
- {issue 1}
- {issue 2}

---

## Orchestrator Performance

### Tool Usage
**Assessment**: {Good|Fair|Poor}
**Violations**: {count} violations
**Details**:
- {violation pattern 1}
- {violation pattern 2}

### Memory Discipline
**Assessment**: {Good|Fair|Poor}
**Issues**:
- {issue 1}
- {issue 2}

### Guardrail Compliance
**Assessment**: {Good|Fair|Poor}
**Violations**: {list}

### Time Efficiency
**Total Session**: {duration}
**Time per Phase**:
- AUDIT: {duration}
- BUILD: {duration}
- VALIDATE: {duration}
- DISCOVER: {duration}
- REFLECT: {duration}

**Assessment**: {Efficient|Acceptable|Inefficient}

---

## Session Effectiveness

**Issues Resolved**: {count}
- {issue 1}
- {issue 2}

**Issues Introduced**: {count}
- {issue 1}
- {issue 2}

**Technical Debt**: {+X added | -X removed | neutral}

**Vision Alignment**: {score}/10 - {how well work aligned with product vision}

---

## Critical Issues Requiring Attention

### P0 (Must Fix Before Apply)
- {critical issue 1}
- {critical issue 2}

### P1 (Fix in Next Session)
- {high priority issue 1}
- {high priority issue 2}

### P2 (Nice to Have)
- {medium priority issue 1}
- {medium priority issue 2}

---

## Blind Spots Identified

### Patterns Orchestrator Missed
- {pattern 1}
- {pattern 2}

### Systemic Issues Not Addressed
- {systemic issue 1}
- {systemic issue 2}

### Hidden Risks
- {risk 1}
- {risk 2}

---

## Final Recommendation

**Action**: {Approve|Approve with modifications|Reject}

**Rationale**:
{1-2 paragraphs explaining decision}

**Conditions** (if conditional approval):
- [ ] {condition 1}
- [ ] {condition 2}

**Next Steps**:
1. {step 1}
2. {step 2}
3. {step 3}
```

### Validated Improvements Template

```markdown
# Validated Improvements - {TIMESTAMP}

---

## ✅ APPROVED (Apply Immediately)

### 1. {Improvement Name}
**Orchestrator's Proposal**: {summary}
**Reviewer's Assessment**: Validated as effective
**Files to Change**:
- {file:line}
**Expected Impact**: {what this fixes}
**Risk**: Low

---

## ⚠️ APPROVED WITH MODIFICATIONS

### 1. {Improvement Name}
**Orchestrator's Proposal**: {original}
**Required Modifications**:
- Change: {what to change}
- Reason: {why}
**Modified Proposal**: {updated version}
**Files to Change**:
- {file:line}
**Expected Impact**: {what this fixes}
**Risk**: Low

---

## ❌ REJECTED

### 1. {Improvement Name}
**Orchestrator's Proposal**: {summary}
**Rejection Reason**:
- {specific flaw 1}
- {specific flaw 2}
**Alternative Approach**: {what to do instead}
**Rationale**: {why alternative is better}

---

## 💡 REVIEWER ADDITIONS

### 1. {New Improvement Name}
**Issue Identified**: {what orchestrator missed}
**Root Cause**: {actual root cause}
**Proposed Fix**:
{detailed solution}
**Files to Change**:
- {file:line}
**Expected Impact**: {what this improves}
**Risk**: {Low|Medium|High}
**Priority**: {Critical|High|Medium|Low}

---

## Implementation Priority

### Critical (Do First - Blocking Issues)
1. {improvement name} - {reason}
2. {improvement name} - {reason}

### High (Do Soon - Important)
1. {improvement name} - {reason}
2. {improvement name} - {reason}

### Medium (Nice to Have)
1. {improvement name} - {reason}
2. {improvement name} - {reason}

### Low (Defer to Future)
1. {improvement name} - {reason}
2. {improvement name} - {reason}

---

## Summary

**Total Proposals**: {count}
- Approved: {count}
- Approved with modifications: {count}
- Rejected: {count}
- New additions: {count}

**Implementation Estimate**: {time estimate}
**Risk Level**: {Low|Medium|High}
```

---

## Troubleshooting

### Issue: Orchestrator Defensive About Feedback

**Symptom:**
Orchestrator REFLECT output includes justifications for every decision

**Solution:**
1. Clarify reviewer is independent auditor, not adversary
2. Focus feedback on patterns, not blame
3. Emphasize continuous improvement, not perfection
4. Provide specific examples, not vague criticism

**Template response:**
```markdown
This review identified patterns for systemic improvement, not criticism
of this specific session. The goal is to make the entire system better
for all future sessions.
```

### Issue: Unable to Determine Root Cause

**Symptom:**
Build logs unclear, symptoms ambiguous

**Solution:**
```bash
# Systematically gather evidence
1. Read all error logs
cat .tmp/fullservice-*/build.log
cat .tmp/fullservice-*/test.log

2. Check recent changes
git log -10 --oneline
git diff HEAD~5

3. Check dependency changes
git diff HEAD~5 pnpm-lock.yaml package.json

4. Run tests locally in isolated worktree
git worktree add /tmp/test-worktree
cd /tmp/test-worktree
pnpm install && pnpm typecheck

5. Bisect if needed
git bisect start
git bisect bad HEAD
git bisect good HEAD~10
```

### Issue: Proposed Improvement Too Vague

**Symptom:**
"Improve error handling" without specifics

**Solution:**
```markdown
## Specificity Requirements

❌ VAGUE: "Improve error handling"
✅ SPECIFIC:
- File: packages/auth/src/session.ts:45
- Current: throw new Error('Invalid session')
- Change to:
  ```typescript
  throw new AuthError('Invalid session', {
    code: 'INVALID_SESSION',
    sessionId: session.id,
    userId: session.userId
  })
  ```
- Add: Type-safe error codes enum
- Add: Error handling in caller (apps/webapp/app/actions/auth.ts)
- Test: Add test case for invalid session handling
```

### Issue: Reviewer and Orchestrator Disagree

**Symptom:**
Fundamentally different assessments of session quality

**Escalation:**
```markdown
# Disagreement Escalation - {TIMESTAMP}

## Point of Disagreement
{what we disagree about}

## Orchestrator's Position
{their view with evidence}

## Reviewer's Position
{my view with evidence}

## Impact if Orchestrator Correct
{consequences}

## Impact if Reviewer Correct
{consequences}

## Recommendation
**Escalate to User** for decision

## Tests to Resolve
{experiments that would prove one side right}
```

---

**End of Extended Guide**

For quick reference, see `.claude/agents/reviewer.md`
