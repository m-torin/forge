# Orchestrator Unique Sections Documentation

## Overview

The orchestrator agent has a fundamentally different role than specialist agents, requiring unique sections that should NOT be standardized across other agents.

## Unique Sections in Orchestrator

### 1. "YOU ARE AN ENGINEERING MANAGER, NOT AN ENGINEER"

**Purpose**: Establishes the orchestrator's role as coordinator, not implementer
**Why Unique**: Specialists ARE engineers; orchestrator is management
**Should NOT be standardized**: This is orchestrator-specific role definition

### 2. "What You CAN Do (Coordination)" / "What You CANNOT Do (Implementation)"

**Purpose**: Explicitly defines orchestrator boundaries
**Why Unique**: Specialists have different boundaries (they DO implement)
**Should NOT be standardized**: Each specialist has different implementation permissions

### 3. "Exception: Memory Checkpoints"

**Purpose**: Allows orchestrator to edit specific memory files directly
**Why Unique**: Specialists don't need this exception - they can edit their domain files
**Should NOT be standardized**: Orchestrator-specific permission

### 4. "When to Delegate (Decision Matrix)"

**Purpose**: Provides delegation decision framework
**Why Unique**: Specialists don't delegate - they receive delegation
**Should NOT be standardized**: Only orchestrator needs delegation logic

### 5. "The 'Quick Fix' Trap"

**Purpose**: Prevents orchestrator from doing implementation work
**Why Unique**: Specialists SHOULD do quick fixes in their domain
**Should NOT be standardized**: Different mindset for specialists

### 6. "Delegation Workflow"

**Purpose**: Step-by-step delegation process
**Why Unique**: Only orchestrator delegates
**Should NOT be standardized**: Specialists don't delegate

### 7. "Decision Verification Protocol"

**Purpose**: Self-verification for medium+ decisions
**Why Unique**: Orchestrator makes coordination decisions; specialists make implementation decisions
**Should NOT be standardized**: Different decision types

### 8. "Startup Routine" (Steps 0-6)

**Purpose**: Orchestrator-specific initialization
**Why Unique**:

- Step 0: Role verification (orchestrator-specific)
- Step 0.5: Worktree validation (orchestrator creates worktrees)
- Step 3: Create Worktree (orchestrator responsibility)
- Step 3.5: Set Git Working Directory (orchestrator responsibility)
  **Should NOT be standardized**: Specialists don't create worktrees

### 9. "Working in the Worktree"

**Purpose**: Path handling for orchestrator
**Why Unique**: Orchestrator manages worktree creation and paths
**Should NOT be standardized**: Specialists work within existing worktrees

### 10. "Agent Coordination Matrix"

**Purpose**: Maps all agents and their relationships
**Why Unique**: Only orchestrator needs to know all agent relationships
**Should NOT be standardized**: Specialists only need to know their own domain

### 11. "Conflict Resolution"

**Purpose**: Resolution hierarchy for agent conflicts
**Why Unique**: Orchestrator is the conflict resolver
**Should NOT be standardized**: Specialists don't resolve conflicts

### 12. "Delegation Rules"

**Purpose**: Rules for when and how to delegate
**Why Unique**: Only orchestrator delegates
**Should NOT be standardized**: Specialists receive delegation

### 13. "Automatic Delegation Triggers"

**Purpose**: Automated delegation conditions
**Why Unique**: Orchestrator-specific automation
**Should NOT be standardized**: Specialists don't auto-delegate

### 14. "Phase-Aware Delegation"

**Purpose**: Delegation patterns for each /fullservice phase
**Why Unique**: Orchestrator manages the 9-stage loop
**Should NOT be standardized**: Specialists don't manage phases

### 15. "AUDIT-FUNCTIONS Phase"

**Purpose**: Specific orchestrator workflow for function verification
**Why Unique**: Orchestrator coordinates parallel specialist verification
**Should NOT be standardized**: Specialists don't coordinate audits

### 16. "Stateful Continuation Pattern"

**Purpose**: Multi-session workflow management
**Why Unique**: Orchestrator manages session state and continuation
**Should NOT be standardized**: Specialists work within single sessions

### 17. "Framework Entrypoints Policy"

**Purpose**: Policy for Next.js imports in packages
**Why Unique**: Orchestrator enforces contamination policies
**Should NOT be standardized**: Specialists follow policies, don't set them

## Sections That SHOULD Be Standardized

The orchestrator also has these sections that could be standardized:

- Mission (but with different content)
- Resources (same format, different links)
- Escalation (but different escalation targets)

## Recommendation

Keep orchestrator.md as-is. It serves a fundamentally different role and its unique sections are necessary for its coordination responsibilities. Focus standardization efforts on the 17 specialist agents.
