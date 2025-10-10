# Scripts Directory (Node 22+ Native)

All scripts use modern ESM and Node 22+ features for optimal performance.

## 📊 Overview

Scripts are organized into two categories:

### Claude-Specific Scripts (`.claude/scripts/`)
Automation for Claude Code workflows: agent validation, command specs, delegation discipline, and worktree safety.

**Current Scripts:**
- `validate-claude.mjs` - Claude automation validators (agents, commands, delegation, worktree)
- `archive-old-sessions.sh` - Memory cleanup utility

### Repository-Wide Scripts (`/scripts/`)
Quality gates and utilities for all developers and CI/CD pipelines.

**Current Scripts:**
- `validate.mjs` - Architectural quality gates (contamination, coverage)
- `detect-scope.mjs` - Auto-detect affected package scope
- `git-hooks.sh` - Git pre-commit hook setup

---

## 🔍 Claude Automation Validators

### `validate-claude.mjs`

Claude-specific automation checks for agent coordination and workflow safety.

**Usage:**
```bash
node .claude/scripts/validate-claude.mjs <command>

# Or via package scripts:
pnpm validate:agents       # Validate agent frontmatter
pnpm validate:delegation   # Check coordination discipline
pnpm validate:worktree     # Verify fullservice safety
```

### **Commands:**

| Command | Description | Exit Code |
|---------|-------------|-----------|
| `agents` | Validate agent frontmatter | 0=pass, 1=fail |
| `commands` | Lint command specs | 0=pass, 1=fail |
| `delegation` | Check coordination discipline | 0=pass, 1=fail |
| `worktree` | Verify fullservice safety | 0=pass, 1=fail |
| `all` | Run all Claude validators in parallel | 0=pass, 1=fail |

### **Examples:**

```bash
# Run all Claude checks (parallel execution)
node .claude/scripts/validate-claude.mjs all

# Run specific check
node .claude/scripts/validate-claude.mjs agents

# Via package scripts
pnpm validate:agents
pnpm validate:delegation
```

### **What Each Validator Checks:**

#### 1. **Agents** (`agents`)
- Validates agent frontmatter (name, description, model)
- Ensures name matches filename
- Checks model against valid list
- Requires description ≥10 characters

#### 2. **Commands** (`commands`)
- Lints command specs for permission patterns
- Detects forbidden patterns (`mkdir -p`, raw `git` calls)
- Ensures MCP tool usage

#### 3. **Delegation** (`delegation`)
- Validates orchestrator coordination discipline
- Checks for specialist owners in quick-context.md
- Verifies Task() delegations
- Detects if orchestrator did implementation work

#### 4. **Worktree** (`worktree`)
- Prevents /fullservice from contaminating main branch
- Checks for commits during fullservice sessions
- Warns if not in worktree directory

---

## 🏗️ Repository Quality Gates

### `validate.mjs` (in `/scripts/`)

Architectural quality gates enforced for all developers and CI/CD.

**Usage:**
```bash
node scripts/validate.mjs <command>

# Or via package scripts:
pnpm validate:contamination # Check stage boundaries
pnpm validate:coverage      # Check test coverage
```

### **Commands:**

| Command | Description | Exit Code |
|---------|-------------|-----------|
| `contamination` | Enforce stage boundaries | 0=pass, 1=fail |
| `coverage` | Check test coverage | 0=pass, 1=fail |
| `all` | Run both validators in parallel | 0=pass, 1=fail |

### **Examples:**

```bash
# Run all repository checks
node scripts/validate.mjs all

# Run specific check
node scripts/validate.mjs contamination

# Check coverage for specific scope
node scripts/validate.mjs coverage --scope @repo/ai

# Via package scripts
pnpm validate:contamination
pnpm validate:coverage
```

### **What Each Validator Checks:**

#### 1. **Contamination** (`contamination`)
- **9 stage boundary checks:**
  1. Packages → Next.js imports ❌
  2. Packages → `@/` imports ❌
  3. Packages → Deep imports ❌
  4. Apps → Package internals ❌
  5. Client → Node core modules ❌
  6. Edge → Node core/Prisma ❌
  7. Data → UI imports ❌
  8. Infra → App imports ❌

#### 2. **Coverage** (`coverage`)
- Enforces test coverage thresholds
- Default: 50% line coverage
- Exceptions: Config packages (30%), analytics (40%)
- Auto-generates coverage if missing

---

## 🔧 Utility Scripts

### `detect-scope.mjs` (in `/scripts/`)

Auto-detects which package/app is affected by file changes.

**Usage:**
```bash
node scripts/detect-scope.mjs "packages/ai/src/index.ts"
# Output: @repo/ai

node scripts/detect-scope.mjs "apps/webapp/src/app/page.tsx"
# Output: webapp

node scripts/detect-scope.mjs "unknown/path/file.ts"
# Output: . (fallback)
```

**Used by:**
- Pre-commit hooks (scope detection for targeted linting/testing)
- CI pipelines (affected package detection)

---

### `git-hooks.sh` (in `/scripts/`)

Installs pre-commit hooks with parallel execution for faster checks.

**Usage:**
```bash
scripts/git-hooks.sh

# Or via package script:
pnpm hooks:setup
```

**What it installs:**
Pre-commit hook that runs in parallel:
1. **Quality gates** (parallel):
   - `pnpm lint --filter $SCOPE`
   - `pnpm typecheck --filter $SCOPE`
   - `pnpm vitest --filter $SCOPE --run`

2. **Validators** (parallel):
   - `node scripts/validate.mjs contamination`
   - `node scripts/validate.mjs coverage --scope $SCOPE`

**Performance:** ~2-3x faster than sequential execution

---

### `archive-old-sessions.sh`

Archives old memory files to keep `.claude/memory/` clean.

**Usage:**
```bash
# Archive files older than 30 days (default)
.claude/scripts/archive-old-sessions.sh

# Custom threshold
.claude/scripts/archive-old-sessions.sh --days 14

# Dry run (preview only)
.claude/scripts/archive-old-sessions.sh --dry-run

# Via package scripts
pnpm memory:archive              # 30 days
pnpm memory:archive:aggressive   # 14 days
pnpm memory:archive:dry-run      # Preview
```

**Archives to:** `.claude/memory/archive/YYYY-MM/`

**Never archives:**
- Core files (quick-context.md, full-context.md, *-learnings.md)
- Templates (*-template.md)

---

## 📦 Package Scripts

Convenience scripts added to `package.json`:

```json
{
  "scripts": {
    // Full validation (runs both repo and Claude validators)
    "validate": "node scripts/validate.mjs all && node .claude/scripts/validate-claude.mjs all",
    "validate:all": "node scripts/validate.mjs all && node .claude/scripts/validate-claude.mjs all",

    // Repository-wide quality gates (accessible to all developers)
    "validate:contamination": "node scripts/validate.mjs contamination",
    "validate:coverage": "node scripts/validate.mjs coverage",

    // Claude-specific automation validators
    "validate:agents": "node .claude/scripts/validate-claude.mjs agents",
    "validate:commands": "node .claude/scripts/validate-claude.mjs commands",
    "validate:delegation": "node .claude/scripts/validate-claude.mjs delegation",
    "validate:worktree": "node .claude/scripts/validate-claude.mjs worktree",

    // Utilities
    "hooks:setup": "scripts/git-hooks.sh",
    "memory:archive": ".claude/scripts/archive-old-sessions.sh --days 30"
  }
}
```

---

## ⚡ Node 22+ Features Used

- ✅ Native ESM modules
- ✅ `node:fs/promises` - Async file operations
- ✅ `node:fs glob()` - Native glob patterns
- ✅ `node:test` - Built-in test runner
- ✅ `node:perf_hooks` - High-resolution timing
- ✅ `Promise.allSettled()` - Parallel validation
- ✅ Top-level await

---

## 📊 Performance Benchmarks

| Operation | Sequential | Parallel (Node 22+) | Speedup |
|-----------|------------|---------------------|---------|
| All validators | ~3.5s | ~80ms | **43.75x** |
| Quality gates | ~2.0s | ~800ms | **2.5x** |
| Contamination check | ~800ms | ~400ms | **2x** |

---

## 🚀 Quick Start

### First Time Setup
```bash
# Install git hooks
pnpm hooks:setup

# Run all validators (repo + Claude)
pnpm validate
```

### Common Workflows

**Before committing:**
```bash
pnpm validate
# Pre-commit hook will run automatically on git commit
```

**Fix contamination violations:**
```bash
pnpm validate:contamination
# See .claude/docs/contamination-web.md for guidance
```

**Check specific package coverage:**
```bash
pnpm validate:coverage --scope @repo/ai
```

**Validate Claude automation:**
```bash
pnpm validate:agents
pnpm validate:delegation
```

---

## 🔍 Troubleshooting

### Validator Fails

**Agents validator:**
- Check frontmatter in `.claude/agents/*.md`
- Ensure name matches filename
- Use valid model names

**Contamination validator:**
- See `.claude/docs/contamination-web.md`
- Fix stage boundary violations before committing

**Coverage validator:**
- Add tests to increase coverage
- Or document exception in `scripts/validate.mjs` threshold map

**Delegation validator:**
- Ensure TodoWrite entries have specialist owners
- Check for Task() delegations in tool-audit.log

### Pre-commit Hook Issues

**Hook not running:**
```bash
pnpm hooks:setup  # Reinstall hooks
```

**Hook too slow:**
- Hooks already run in parallel mode
- Check if scope detection is working (`detect-scope.mjs`)

---

## 📚 Related Documentation

- `.claude/docs/contamination-web.md` - Stage boundary rules
- `CLAUDE.md` - Full development guidelines
- `.claude/agents/*.md` - Agent specifications
- `.claude/docs/agents-extended/*.md` - Extended agent guides

---

## 🤝 Contributing

### Adding New Repository Validators (in `/scripts/validate.mjs`)
1. Add validator function to `scripts/validate.mjs`
2. Add subcommand to CLI switch statement
3. Add to parallel execution in `validateAll()`
4. Update this README
5. Update pre-commit hook if needed

### Adding New Claude Validators (in `.claude/scripts/validate-claude.mjs`)
1. Add validator function to `.claude/scripts/validate-claude.mjs`
2. Add subcommand to CLI switch statement
3. Add to parallel execution in `validateAll()`
4. Update this README
5. Update `CLAUDE.md` references

---

## 📂 Script Organization

### Separation of Concerns

**`.claude/scripts/`** - Claude-specific automation:
- Agent coordination validation
- Command spec linting
- Delegation discipline
- Worktree safety (fullservice)
- Memory management

**`/scripts/`** - Repository-wide utilities:
- Architectural quality gates (contamination)
- Test coverage enforcement
- Scope detection
- Git hooks setup
- General development utilities

This separation ensures:
- Quality gates are accessible to all developers
- Claude automation is clearly isolated
- CI/CD can run architectural checks independently
- New contributors understand tool boundaries

---

**Last Updated:** 2025-10-09
**Node Version:** 22+
**Total Scripts:** 5 files (3 in `/scripts/`, 2 in `.claude/scripts/`)
