# Reviewer Unique Sections Documentation

## Overview

The reviewer agent serves as an external validator with a fundamentally different role than specialist agents. It has unique sections that should be preserved while adding standard sections for consistency.

## Unique Sections in Reviewer (Should Be Preserved)

### 1. "Core Mission"

**Purpose**: Defines reviewer as external validator, not implementer
**Why Unique**: Specialists implement; reviewer validates
**Should be preserved**: Core to reviewer's identity

### 2. "Review Process Overview"

**Purpose**: Step-by-step review methodology
**Why Unique**: Only reviewer does external validation
**Should be preserved**: Reviewer-specific workflow

### 3. "Independence Rules"

**Purpose**: Ensures reviewer remains objective and independent
**Why Unique**: Specialists work within the system; reviewer is external
**Should be preserved**: Critical for reviewer's effectiveness

### 4. "Review Deliverables"

**Purpose**: Specific outputs reviewer produces
**Why Unique**: Reviewer produces validation reports; specialists produce implementations
**Should be preserved**: Reviewer-specific outputs

### 5. "Session Analysis Review" (detailed subsections)

**Purpose**: Methodology for analyzing orchestrator sessions
**Why Unique**: Only reviewer analyzes orchestrator performance
**Should be preserved**: Reviewer-specific analysis framework

### 6. "Improvement Proposal Validation" (detailed subsections)

**Purpose**: Framework for validating improvement proposals
**Why Unique**: Only reviewer validates proposals
**Should be preserved**: Reviewer-specific validation process

### 7. "Blind Spot Analysis"

**Purpose**: Identifying gaps in orchestrator's analysis
**Why Unique**: Only reviewer identifies blind spots
**Should be preserved**: Core reviewer capability

### 8. "Counter-Proposal Generation"

**Purpose**: Creating alternative approaches when proposals are flawed
**Why Unique**: Only reviewer generates counter-proposals
**Should be preserved**: Reviewer-specific capability

### 9. "Quality Grading System"

**Purpose**: Standardized grading for session quality
**Why Unique**: Only reviewer grades sessions
**Should be preserved**: Reviewer-specific evaluation system

### 10. "Reviewer Tools & Techniques"

**Purpose**: Specific tools and methods for validation
**Why Unique**: Reviewer uses different tools than specialists
**Should be preserved**: Reviewer-specific tooling

## Sections That Should Be Standardized

The reviewer is missing these standard sections that should be added:

### 1. "Safety: Worktree Only"

**Why Add**: Reviewer may need to edit files during validation
**Standard Format**: Same as all specialists

### 2. "Memory Management"

**Why Add**: Reviewer should checkpoint validation learnings
**Standard Format**: Reviewer-specific fields but standard structure

## Sections That Should NOT Be Standardized

These reviewer sections are fundamentally different and should remain unique:

- **Mission**: "External validation" vs "Own domain"
- **Domain Boundaries**: Reviewer has no domain - it validates all domains
- **Stage/Layer Mapping**: Reviewer works across all stages
- **Default Tests**: Reviewer doesn't run tests - it validates test results
- **MCP Utils Integration**: Different tool set (no git tools, different forge tools)
- **Contamination Rules**: Reviewer doesn't implement - it validates contamination
- **Handoff Protocols**: Reviewer doesn't hand off - it reports findings
- **Performance Targets**: Reviewer has different metrics (validation quality, not implementation)
- **Common Tasks**: Reviewer-specific validation tasks
- **Escalation Paths**: Reviewer escalates to orchestrator, not other specialists

## Recommendation

**Add Standard Sections:**

1. Safety: Worktree Only (after frontmatter)
2. Memory Management (before Resources)

**Preserve Unique Sections:**

- All existing sections should be kept as-is
- They serve reviewer's unique validation role

**Result:**
Reviewer becomes a "hybrid" agent - mostly unique structure with minimal standard sections for consistency.
