#!/usr/bin/env bash
#
# archive-old-sessions.sh
#
# Archives old session memory files to keep .claude/memory/ clean
# Organizes archives by YYYY-MM for easy retrieval
#
# Usage:
#   ./archive-old-sessions.sh [--days N] [--dry-run]
#
# Options:
#   --days N      Archive files older than N days (default: 30)
#   --dry-run     Show what would be archived without moving files
#

set -euo pipefail

# Configuration
MEMORY_DIR=".claude/memory"
ARCHIVE_BASE="$MEMORY_DIR/archive"
DEFAULT_DAYS=30
DRY_RUN=false
DAYS_OLD=$DEFAULT_DAYS

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --days)
      DAYS_OLD="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--days N] [--dry-run]"
      exit 1
      ;;
  esac
done

# Verify we're in repo root
if [[ ! -d "$MEMORY_DIR" ]]; then
  echo "❌ Error: $MEMORY_DIR not found. Run from repo root."
  exit 1
fi

# Print configuration
echo "📦 Archive Configuration"
echo "   Memory dir: $MEMORY_DIR"
echo "   Archive to: $ARCHIVE_BASE"
echo "   Days old: $DAYS_OLD"
echo "   Dry run: $DRY_RUN"
echo ""

# File patterns to archive
# These are session-specific files that should be archived after a certain age
ARCHIVE_PATTERNS=(
  "session-report-*.md"
  "audit-*.md"
  "agent-improvements-*.md"
  "discoveries-*.md"
  "fullservice-session-*.md"
  "checkpoint-*.md"
  "verification-results-*.md"
  "workflow-improvements-*.md"
  "guardrail-improvements-*.md"
  "orchestrator-review-*.md"
  "coordination-violations.md"
)

# Files to NEVER archive (core memory files)
PRESERVE_FILES=(
  "README.md"
  "quick-context.md"
  "full-context.md"
  "context-index.md"
  "future-session-guidance.md"
  "*-learnings.md"
  "*.json"
  "*.log"
  "*-template.md"
)

# Function to check if file should be preserved
should_preserve() {
  local file="$1"
  local basename=$(basename "$file")

  for pattern in "${PRESERVE_FILES[@]}"; do
    if [[ "$basename" == $pattern ]]; then
      return 0  # Should preserve
    fi
  done

  return 1  # Should not preserve
}

# Function to get file modification date in YYYY-MM format
get_file_month() {
  local file="$1"

  # macOS uses different stat syntax than Linux
  if [[ "$OSTYPE" == "darwin"* ]]; then
    stat -f "%Sm" -t "%Y-%m" "$file"
  else
    stat -c "%y" "$file" | cut -d'-' -f1-2
  fi
}

# Function to archive a file
archive_file() {
  local file="$1"
  local month
  month=$(get_file_month "$file")
  local archive_dir="$ARCHIVE_BASE/$month"
  local basename=$(basename "$file")

  if [[ "$DRY_RUN" == true ]]; then
    echo "   [DRY RUN] Would archive: $basename → $archive_dir/"
  else
    # Create archive directory if it doesn't exist
    mkdir -p "$archive_dir"

    # Move file to archive
    mv "$file" "$archive_dir/"
    echo "   ✅ Archived: $basename → $archive_dir/"
  fi
}

# Main archival logic
echo "🔍 Finding files to archive (older than $DAYS_OLD days)..."
echo ""

archived_count=0
preserved_count=0

# Find files matching archive patterns
for pattern in "${ARCHIVE_PATTERNS[@]}"; do
  while IFS= read -r -d '' file; do
    # Skip if file should be preserved
    if should_preserve "$file"; then
      ((preserved_count++))
      continue
    fi

    # Check file age (macOS compatible)
    if [[ "$OSTYPE" == "darwin"* ]]; then
      file_age=$(( ($(date +%s) - $(stat -f "%m" "$file")) / 86400 ))
    else
      file_age=$(( ($(date +%s) - $(stat -c "%Y" "$file")) / 86400 ))
    fi

    # Archive if older than threshold
    if [[ $file_age -gt $DAYS_OLD ]]; then
      archive_file "$file"
      ((archived_count++))
    fi
  done < <(find "$MEMORY_DIR" -maxdepth 1 -type f -name "$pattern" -print0 2>/dev/null || true)
done

# Summary
echo ""
echo "📊 Archive Summary"
echo "   Files archived: $archived_count"
echo "   Files preserved: $preserved_count"

if [[ "$DRY_RUN" == true ]]; then
  echo ""
  echo "💡 This was a dry run. Run without --dry-run to actually archive files."
fi

echo ""
echo "✅ Archive complete"

# Update context-index.md with archived months
if [[ $archived_count -gt 0 && "$DRY_RUN" == false ]]; then
  echo ""
  echo "💡 Tip: Update $MEMORY_DIR/context-index.md to reference archived months"
fi
