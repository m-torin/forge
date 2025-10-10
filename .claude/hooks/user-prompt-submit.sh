#!/bin/bash
# User Prompt Submit Hook
#
# This hook runs when the user submits a prompt to Claude Code.
# It performs safety checks to ensure autonomous workflows don't
# contaminate the main repository.

set -e

# Run worktree guard to detect /fullservice violations
node .claude/scripts/validate-claude.mjs worktree || {
  echo ""
  echo "⚠️  Worktree violation detected - review above output"
  echo ""
  # Don't block the prompt - just warn
  # exit 1
}

# Add additional hook logic here as needed

exit 0
