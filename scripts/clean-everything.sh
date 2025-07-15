#!/bin/zsh

# Ensure we're running in zsh
if [ -z "$ZSH_VERSION" ]; then
  echo "Error: This script must be run with zsh, not bash or sh" >&2
  exit 1
fi

# Enable necessary zsh options
setopt LOCAL_OPTIONS # Keep option changes local to this script
setopt KSH_ARRAYS    # Use ksh-style arrays
setopt SH_WORD_SPLIT # Split words on unquoted parameter expansions
setopt EXTENDED_GLOB # Enable extended globbing
setopt PROMPT_SUBST  # Enable prompt substitution for parameter expansion
setopt noglob        # Prevent globbing issues in zsh

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
  echo -e "\n${BLUE}════════════════════════════════════════════${NC}"
  echo -e "${BLUE}   $1${NC}"
  echo -e "${BLUE}════════════════════════════════════════════${NC}\n"
}

# Function to print success messages
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to print progress messages
print_progress() {
  echo -e "${YELLOW}⟳ $1${NC}"
}

# Function to print error messages
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Function to count items matching a pattern
# Args: $1 = pattern, $2 = case_sensitive (true/false), $3 = item_type (file/directory/any)
count_items() {
  local pattern="$1"
  local case_sensitive="${2:-true}"
  local item_type="${3:-any}"

  local find_cmd="find ."

  # Add type filter if specified
  if [[ "$item_type" == "file" ]]; then
    find_cmd="$find_cmd -type f"
  elif [[ "$item_type" == "directory" ]]; then
    find_cmd="$find_cmd -type d"
  fi

  # Add name filter with case sensitivity
  if [[ "$case_sensitive" == "true" ]]; then
    find_cmd="$find_cmd -name \"$pattern\""
  else
    find_cmd="$find_cmd -iname \"$pattern\""
  fi

  # Execute and count
  eval "$find_cmd | wc -l"
}

# Function to scan and report items for a pattern group
# Args: $1 = pattern_array, $2 = description, $3 = case_sensitive (true/false), $4 = item_type
scan_patterns() {
  local pattern_array="$1"
  local description="$2"
  local case_sensitive="${3:-true}"
  local item_type="${4:-any}"

  echo -e "\nFound $description:"

  # Check if the array exists and has elements
  if [[ -z "${pattern_array}" ]]; then
    echo -e "${YELLOW}  ▸ No patterns defined${NC}"
    return 0
  fi

  # Loop through each pattern using a simpler approach
  local patterns
  eval "patterns=(\${$pattern_array[@]})"
  for pattern in "${patterns[@]}"; do
    count=$(count_items "$pattern" "$case_sensitive" "$item_type")
    [ $count -gt 0 ] && echo -e "${YELLOW}  ▸ ${count} ${pattern} items${NC}"
  done
}

# Function to build find command for multiple patterns
# Args: $1 = pattern_array, $2 = case_sensitive (true/false), $3 = item_type, $4 = exclusion_path
build_find_command() {
  local pattern_array="$1"
  local case_sensitive="${2:-true}"
  local item_type="${3:-any}"
  local exclusion_path="${4:-}"

  # Check if the array exists and has elements
  if [[ -z "${pattern_array}" ]]; then
    print_error "No patterns defined for $1"
    # Return a safe default that won't match anything
    echo "find . -name \"__NO_PATTERNS_DEFINED__\""
    return 1
  fi

  # Loop through patterns using eval approach
  local patterns
  eval "patterns=(\${$pattern_array[@]})"

  # Generate the find command with multiple -o -name patterns
  local find_cmd="find . -type $item_type "

  # Add exclusion path if provided
  [[ -n "$exclusion_path" ]] && find_cmd="$find_cmd -not -path \"$exclusion_path\" "

  # Add case-insensitive option if needed
  local name_option="-name"
  [[ "$case_sensitive" == "false" ]] && name_option="-iname"

  # Start with an expression group
  find_cmd="$find_cmd \\( "

  # Add each pattern with -o between them
  local first=true
  for pattern in "${patterns[@]}"; do
    if [[ "$first" == "true" ]]; then
      find_cmd="$find_cmd $name_option \"$pattern\""
      first=false
    else
      find_cmd="$find_cmd -o $name_option \"$pattern\""
    fi
  done

  # Close the expression group
  find_cmd="$find_cmd \\)"

  echo "$find_cmd"
}

# Function to remove items matching patterns
# Args: $1 = pattern_array, $2 = case_sensitive, $3 = item_type, $4 = exclusion_path, $5 = description
remove_items() {
  local pattern_array="$1"
  local case_sensitive="${2:-true}"
  local item_type="${3:-any}"
  local exclusion_path="${4:-}"
  local description="${5:-items}"

  print_progress "Removing $description..."

  # Get the find command with error handling
  local find_cmd=$(build_find_command "$pattern_array" "$case_sensitive" "$item_type" "$exclusion_path")
  local build_cmd_status=$?

  # Check if build_find_command succeeded
  if [[ $build_cmd_status -ne 0 ]]; then
    print_error "Failed to build find command for $description"
    return 1
  fi

  # Add pruning for directories
  if [[ "$item_type" == "directory" ]]; then
    find_cmd="$find_cmd -prune"
  fi

  # Add parallel processing
  find_cmd="$find_cmd -print0 | xargs -0 -P 4"

  # Add removal command based on type
  if [[ "$item_type" == "directory" ]]; then
    find_cmd="$find_cmd rm -rf"
  else
    find_cmd="$find_cmd rm -f"
  fi

  # Add error suppression
  find_cmd="$find_cmd 2>/dev/null || true"

  # Execute the command
  eval "$find_cmd"

  # Report success
  print_success "Removed $description"
}

# Error handling
set -e
trap 'print_error "An error occurred. Cleaning process failed."' ERR

# Start cleaning process
print_header "Starting Clean Process"

# Track what we deleted for summary
deleted_dirs=()
deleted_files=()

# Function to track deletions
track_deletion() {
  local item="$1"
  local type="$2"
  local parent=$(dirname "$item")
  local name=$(basename "$item")

  # Clean up the path (remove leading ./)
  parent=${parent#./}
  [[ "$parent" == "." ]] && parent=""

  # Only track top-level deletions (apps/*, packages/*, or root)
  if [[ -z "$parent" ]] || [[ "$parent" =~ ^apps/[^/]+$ ]] || [[ "$parent" =~ ^packages/[^/]+$ ]]; then
    if [[ "$type" == "dir" ]]; then
      if [[ -z "$parent" ]]; then
        deleted_dirs+=("$name")
      else
        deleted_dirs+=("$parent/$name")
      fi
    else
      if [[ -z "$parent" ]]; then
        deleted_files+=("$name")
      else
        deleted_files+=("$parent/$name")
      fi
    fi
  fi
}

print_progress "Removing build artifacts and caches..."

# Remove build/cache directories with a single find command
# Using -prune to avoid descending into directories we're deleting
find . -type d \( \
  -name "node_modules" -o \
  -name ".next" -o \
  -name "dist" -o \
  -name "build" -o \
  -name ".turbo" -o \
  -name "coverage" -o \
  -name ".cache" -o \
  -name ".eslintcache" -o \
  -name "storybook-static" -o \
  -name ".swc" -o \
  -name "generated" -o \
  -name ".strapi" -o \
  -name "tsconfig.tsbuildinfo" -o \
  -name "*cache*" -o \
  -name "test-results" -o \
  -name "playwright-report" -o \
  -name "html-report" \
  \) -prune -print0 2> /dev/null | while IFS= read -r -d '' dir; do
  track_deletion "$dir" "dir"
  rm -rf "$dir" 2> /dev/null || true
done

print_success "Build artifacts removed"

print_progress "Removing lock files and logs..."

# Remove lock files, logs, and test artifacts
find . -type f \( \
  -name "package-lock.json" -o \
  -name "yarn.lock" -o \
  -name ".yarnrc" -o \
  -name ".yarnrc.yml" -o \
  -name "pnpm-lock.yaml" -o \
  -name "*.log" -o \
  -name "*debug.log*" -o \
  -name "*error.log*" -o \
  -name "tsconfig.tsbuildinfo" -o \
  -name "*.lcov" -o \
  -name "coverage-final.json" -o \
  -name "*coverage*.json" -o \
  -name "*coverage*.xml" \
  \) -print0 2> /dev/null | while IFS= read -r -d '' file; do
  track_deletion "$file" "file"
  rm -f "$file" 2> /dev/null || true
done

print_success "Lock files, logs, and test artifacts removed"

# Clean pnpm-lock.yaml at root if not already removed
if [[ -f "pnpm-lock.yaml" ]]; then
  rm -f pnpm-lock.yaml
  deleted_files+=("pnpm-lock.yaml")
fi

# Print deletion summary
print_header "Deletion Summary"

if [[ ${#deleted_dirs[@]} -gt 0 ]] || [[ ${#deleted_files[@]} -gt 0 ]]; then
  echo -e "${YELLOW}Removed items:${NC}\n"

  # Display directories
  if [[ ${#deleted_dirs[@]} -gt 0 ]]; then
    echo -e "${GREEN}Directories:${NC}"
    for dir in "${deleted_dirs[@]}"; do
      echo -e "  ${YELLOW}▸${NC} $dir"
    done
  fi

  # Display files
  if [[ ${#deleted_files[@]} -gt 0 ]]; then
    echo -e "${GREEN}Files:${NC}"
    for file in "${deleted_files[@]}"; do
      echo -e "  ${YELLOW}▸${NC} $file"
    done
  fi
else
  echo -e "${YELLOW}No items were deleted${NC}"
fi

print_header "Clean Process Complete"
echo -e "${GREEN}You can now run 'pnpm install' to reinstall dependencies${NC}\n"
