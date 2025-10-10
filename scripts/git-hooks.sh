#!/bin/bash
# DEPRECATED: Git Hooks Setup Script
#
# ⚠️  This script is deprecated and replaced by Husky.
#
# Git hooks are now managed by Husky and automatically installed
# when you run `pnpm install` (via the "prepare" script).
#
# Hook location: .husky/pre-commit (version controlled)
#
# To reinstall hooks manually: pnpm scripts:hooks:setup
# (which now runs `husky` instead of this script)

set -euo pipefail

echo "⚠️  DEPRECATED: This script is no longer used."
echo ""
echo "   Git hooks are now managed by Husky and auto-install on 'pnpm install'"
echo "   Hook location: .husky/pre-commit (version controlled)"
echo ""
echo "   To reinstall: pnpm scripts:hooks:setup"
echo ""
exit 1

# OLD IMPLEMENTATION BELOW (kept for reference)
# ============================================

ROOT_DIR=$(git rev-parse --show-toplevel)
HOOKS_DIR="$ROOT_DIR/.git/hooks"

mkdir -p "$HOOKS_DIR"

cat > "$HOOKS_DIR/pre-commit" << 'HOOK'
#!/bin/bash
set -euo pipefail

echo "🚀 Running pre-commit checks (parallel mode)..."

# Collect changed files
CHANGED_PATHS=$(git diff --cached --name-only | tr '\n' ',')
export CLAUDE_FILE_PATHS="$CHANGED_PATHS"

# Detect scope
SCOPE=$(node scripts/detect-scope.mjs "$CHANGED_PATHS" || echo ".")
echo "🔎 Scope detected: $SCOPE"

# Start quality gates in parallel
echo "🔧 Running quality gates in parallel..."
pnpm lint --filter "$SCOPE" &
LINT_PID=$!

pnpm typecheck --filter "$SCOPE" &
TYPE_PID=$!

pnpm vitest --filter "$SCOPE" --run &
TEST_PID=$!

# Wait for quality gates
wait $LINT_PID || { echo "❌ Lint failed"; exit 1; }
wait $TYPE_PID || { echo "❌ Typecheck failed"; exit 1; }
wait $TEST_PID || { echo "❌ Tests failed"; exit 1; }

echo "✅ Quality gates passed"

# Run validators in parallel
echo "🔍 Running validators in parallel..."
node scripts/validate.mjs contamination &
CONTAM_PID=$!

node scripts/validate.mjs coverage --scope "$SCOPE" &
COV_PID=$!

# Wait for validators
wait $CONTAM_PID || { echo "❌ Contamination check failed"; exit 1; }
wait $COV_PID || { echo "❌ Coverage check failed"; exit 1; }

echo "✅ All validators passed"
echo "✅ Pre-commit checks complete"

HOOK

chmod +x "$HOOKS_DIR/pre-commit"

echo "✅ Git hooks installed (Node 22+ optimized with parallel execution)"
echo "   Location: $HOOKS_DIR/pre-commit"
