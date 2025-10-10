# /fullservice Session Report - {{YYYY-MM-DDTHH:MM:SSZ}}

**Session ID**: fullservice-{{YYYYMMDD-HHMMSS}}
**Duration**: ~{{N}} minutes
**Status**: ✅ COMPLETED | 🔄 IN PROGRESS | ❌ FAILED | ⏸️ BLOCKED

---

## Executive Summary

{{Brief summary of what was accomplished, core achievements, and key outcomes}}

**Core Achievements**:
- {{Achievement 1}}
- {{Achievement 2}}
- {{Achievement 3}}

---

## Delegation Quality Metrics

### Delegation Scorecard

| Metric | Actual | Target | Status | Grade |
|--------|--------|--------|--------|-------|
| **Task() delegations** | {{N}} | ≥3 | ✅/❌ | {{score}} |
| **Specialists involved** | {{N}} | ≥2 | ✅/❌ | {{score}} |
| **Orchestrator code edits** | {{N}} | ≤2 | ✅/❌ | {{score}} |
| **Main session edits** | {{N}} | 0 | ✅/❌ | {{score}} |
| **Worktree isolation** | {{Yes/No}} | Yes | ✅/❌ | {{score}} |
| **Files changed** | {{N}} | - | - | - |
| **Lines changed** | {{N}} | - | - | - |
| **Delegation Score** | {{0-100}} | ≥80 | ✅/❌ | - |

**Overall Delegation Grade**: {{A/B/C/D/F}}

### Delegation Flow

```
Main Session
    ↓ Task(orchestrator) - {{timestamp}}
Orchestrator
    ├─ Task({{specialist1}}) - {{timestamp}} - {{brief description}}
    ├─ Task({{specialist2}}) - {{timestamp}} - {{brief description}}
    └─ Task({{specialist3}}) - {{timestamp}} - {{brief description}}
```

### Specialist Involvement

| Specialist | Tasks Delegated | Files Edited | Status | Quality |
|------------|----------------|--------------|--------|---------|
| {{agent-name}} | {{N}} | {{list}} | ✅/❌ | {{A-F}} |

### Delegation Violations (If Any)

**Orchestrator Implementation Violations**: {{N}}
- {{File path}} - {{Description of what orchestrator did instead of delegating}}

**Main Session Bypasses**: {{N}}
- {{File path}} - {{Description of what main session did instead of delegating}}

---

## Session Phases

### 1. SETUP {{✅/🔄/❌}} ({{N}} minutes)

**Actions**:
- Created isolated worktree: `{{path}}`
- Installed {{N}} dependencies
- Generated Prisma clients and Zod schemas
- Built required packages

**Validation**:
- Worktree toplevel: {{✅/❌}} {{path}}
- Root files present: {{✅/❌}} turbo.json, pnpm-workspace.yaml, package.json
- Bootstrap complete: {{✅/❌}} All steps successful

**Key Learning**: {{Any insights from setup phase}}

---

### 2. AUDIT {{✅/🔄/❌}} ({{N}} minutes)

**Method**: {{Description of how audit was performed}}

**Findings**:
1. **{{Issue Title}}** (Priority {{1/2/3}})
   - Error: {{Description}}
   - Cause: {{Root cause}}
   - Impact: {{Business/technical impact}}

2. **{{Issue Title}}** (Priority {{1/2/3}})
   - {{Details}}

**Artifacts Created**:
- `{{filename}}` ({{description}})

---

### 3. BUILD {{✅/🔄/❌}} ({{N}} minutes)

**Changes Made**:

1. **{{Change Description}}** {{✅/❌}}
   ```bash
   {{command}}
   ```
   - Verification: {{How it was verified}}
   - Specialist: {{Which specialist did this or should have done this}}

2. **{{Change Description}}** {{✅/❌}}
   - {{Details}}
   - Specialist: {{agent-name}}

**Deferred Work**:
- {{Item 1}} ({{reason}})
- {{Item 2}} ({{reason}})

---

### 4. VALIDATE {{✅/🔄/❌}} ({{N}} minutes)

**Tests Run**:

1. **Contamination Checks** {{✅/❌}}
   ```bash
   node scripts/validate.mjs contamination
   Result: {{N}}/{{N}} checks passed
   ```

2. **Typecheck** {{✅/❌}}
   ```bash
   pnpm typecheck --filter {{scope}}
   Result: {{PASSED/FAILED}}
   ```

3. **Lint** {{✅/❌}}
   ```bash
   pnpm lint --filter {{scope}}
   Result: {{PASSED/FAILED}}
   ```

**Quality Gates**:
- Contamination: {{✅/❌}} Passed
- Typecheck: {{✅/❌}} Passed
- Lint: {{✅/❌}} Passed

---

### 5. DISCOVER {{✅/🔄/❌}} ({{N}} minutes)

**New Issues Found**: {{N}} (session-introduced)
**Pre-Existing Issues Documented**: {{N}}

**Artifacts Created**:
- `{{filename}}` ({{description}})

**Success Criteria Met**:
- [{{x/ }}] {{Criterion 1}}
- [{{x/ }}] {{Criterion 2}}
- [{{x/ }}] {{Criterion 3}}

---

### 6. REFLECT {{✅/🔄/❌}} ({{N}} minutes)

**Reflection Questions Answered**:

1. **Agent Performance Analysis**
   - {{Analysis of which agents excelled or struggled and why}}

2. **Guardrail Effectiveness**
   - {{Analysis of what checks caught or missed}}

3. **Workflow Assessment**
   - {{Analysis of what worked well or didn't work}}

4. **Knowledge Gaps**
   - {{Identification of missing knowledge or documentation}}

**Artifacts Created**:
- `agent-improvements-{{timestamp}}.md` ({{summary}})
- `guardrail-improvements-{{timestamp}}.md` ({{summary}})
- `workflow-improvements-{{timestamp}}.md` ({{summary}})

---

### 7. REVIEW {{✅/🔄/❌/⏭️}} ({{N}} minutes)

**Reviewer Agent**: {{spawned/not-spawned}}

**Session Execution Grade**: {{A/B/C/D/F}}

**Improvement Proposals**:
- Approved: {{N}}
- Rejected: {{N}}
- Modified: {{N}}

**Blind Spots Identified**: {{N}}

**Artifacts Created**:
- `review-{{timestamp}}.md` ({{summary}})

---

### 8. VERIFY {{✅/🔄/❌}} ({{N}} minutes)

**Verification Steps**:
1. {{Step 1}}
2. {{Step 2}}
3. {{Step 3}}

**Files Changed**:
- `{{file path}}` ({{change description}})

**Verification Result**: {{✅/❌}} {{summary}}

---

### 9. COMMIT {{✅/🔄/❌}} ({{N}} minutes)

**Commit Hash**: {{hash}}
**Branch**: {{branch-name}}
**Files**: {{N}} changed ({{N}} modified, {{N}} created, {{N}} deleted)

**Commit Message**:
```
{{commit message}}
```

---

## Metrics

### Time Breakdown
- Setup: {{N}} minutes
- AUDIT: {{N}} minutes
- BUILD: {{N}} minutes
- VALIDATE: {{N}} minutes
- DISCOVER: {{N}} minutes
- REFLECT: {{N}} minutes
- REVIEW: {{N}} minutes
- VERIFY: {{N}} minutes
- COMMIT: {{N}} minutes
- **Total**: ~{{N}} minutes

### Quality Metrics
- Contamination checks: {{N}}/{{N}} passed
- Typecheck (scoped): {{N}}/{{N}} passed
- Typecheck (full): {{N}}/{{N}} passed
- Lint: {{N}}/{{N}} passed
- Issues fixed: {{N}}/{{N}} ({{%}})
- Scope creep: {{N}} ({{%}})

### Knowledge Artifacts
- Memory documents: {{N}} created
- Total lines: ~{{N}} lines
- Improvement proposals: {{N}} total
  - Agent spec updates: {{N}}
  - New scripts: {{N}}
  - Workflow enhancements: {{N}}

---

## Improvement Proposals Summary

### High Priority (Implement Next Session)

1. **{{Proposal Title}}**
   - Script/File: `{{path}}`
   - Purpose: {{description}}
   - Owner: {{specialist}}

### Medium Priority

{{N}}. **{{Proposal Title}}**
   - {{Details}}

### Low Priority

{{N}}. **{{Proposal Title}}**
   - {{Details}}

---

## Next Session Recommendations

### Before Starting Next /fullservice

1. **{{Recommendation 1}}**
2. **{{Recommendation 2}}**

### During Next Session

1. **{{Recommendation 1}}**
2. **{{Recommendation 2}}**

---

## Merge Instructions

### Option 1: Squash Merge (Recommended for Clean History)

```bash
# From main branch
git merge --squash {{branch-name}}
git commit -m "{{commit message}}

See .claude/memory/session-report-{{timestamp}}.md for full details"
```

### Option 2: Preserve History (If Detailed Audit Trail Desired)

```bash
# From main branch
git merge {{branch-name}} --no-ff
```

### Cleanup After Merge

```bash
# Remove worktree
git worktree remove {{worktree-path}}

# Or force if needed
git worktree remove --force {{worktree-path}}

# Delete branch
git branch -d {{branch-name}}
```

---

## Session Evaluation

### What Went Well ✅
- {{Item 1}}
- {{Item 2}}

### What Could Be Improved ⚠️
- {{Item 1}}
- {{Item 2}}

### Key Learnings 💡
- {{Learning 1}}
- {{Learning 2}}

---

## Delegation Quality Assessment

### Scoring Methodology

**Delegation Score Calculation**:
```
Task Delegation (30 points):
  - ≥3 Task() calls: 30 pts
  - 2 Task() calls: 20 pts
  - 1 Task() call: 10 pts
  - 0 Task() calls: 0 pts

Specialist Involvement (25 points):
  - ≥3 specialists: 25 pts
  - 2 specialists: 20 pts
  - 1 specialist: 10 pts
  - 0 specialists: 0 pts

Orchestrator Discipline (25 points):
  - 0 code edits: 25 pts
  - 1-2 code edits: 15 pts
  - 3-5 code edits: 5 pts
  - >5 code edits: 0 pts

Main Session Discipline (20 points):
  - 0 edits: 20 pts
  - 1+ edits: 0 pts

Total: 0-100 points
```

**Quality Grade Scale**:
- A (90-100): Excellent delegation, proper coordination
- B (80-89): Good delegation, minor violations
- C (70-79): Acceptable delegation, some bypasses
- D (60-69): Poor delegation, frequent violations
- F (<60): Critical failure, systematic bypass

### This Session's Assessment

**Raw Scores**:
- Task Delegation: {{N}}/30 points
- Specialist Involvement: {{N}}/25 points
- Orchestrator Discipline: {{N}}/25 points
- Main Session Discipline: {{N}}/20 points

**Total Score**: {{N}}/100 points

**Quality Grade**: {{A/B/C/D/F}}

**Recommendation**: {{Action based on grade}}

---

## Conclusion

{{Summary statement about session success}}

- {{Key outcome 1}}
- {{Key outcome 2}}
- {{Key outcome 3}}

**Recommendation**: {{Final recommendation}}

---

**Session closed**: {{YYYY-MM-DDTHH:MM:SSZ}}
**Total duration**: ~{{N}} minutes
**Worktree**: {{Ready for merge/Needs cleanup/etc}}
**Status**: {{✅ COMPLETE/🔄 IN PROGRESS/❌ FAILED/⏸️ BLOCKED}}
