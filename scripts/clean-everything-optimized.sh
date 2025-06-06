#!/bin/zsh

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

# Track what we delete
deleted_items=()

# Function to delete and track
delete_and_track() {
  local path="$1"
  local type="$2"
  
  if [[ -e "$path" ]]; then
    rm -rf "$path" 2>/dev/null || true
    deleted_items+=("$type: $path")
  fi
}

# Start cleaning process
print_header "Starting Fast Clean Process"

print_progress "Removing build artifacts and caches..."

# Find and remove common build/cache directories at any level
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
  -name "tsconfig.tsbuildinfo" \
\) -prune -exec rm -rf {} + 2>/dev/null || true

# Remove lock files
find . -type f \( \
  -name "package-lock.json" -o \
  -name "yarn.lock" -o \
  -name "pnpm-lock.yaml" -o \
  -name "*.log" \
\) -exec rm -f {} + 2>/dev/null || true

# Now report what was deleted from top-level directories
print_header "Deletion Summary"

echo -e "${YELLOW}Checking top-level apps and packages...${NC}\n"

# Check apps
for app in apps/*/; do
  if [[ -d "$app" ]]; then
    app_name=$(basename "$app")
    deleted_from_app=()
    
    # Check for common directories that were deleted
    for dir in node_modules .next dist build .turbo coverage .cache storybook-static; do
      if [[ ! -d "$app$dir" ]] && [[ -z $(find "$app" -name "$dir" -type d 2>/dev/null | head -1) ]]; then
        deleted_from_app+=("$dir")
      fi
    done
    
    if [[ ${#deleted_from_app[@]} -gt 0 ]]; then
      echo -e "${GREEN}apps/$app_name:${NC} ${deleted_from_app[*]}"
    fi
  fi
done

# Check packages
for pkg in packages/*/; do
  if [[ -d "$pkg" ]]; then
    pkg_name=$(basename "$pkg")
    deleted_from_pkg=()
    
    # Check for common directories that were deleted
    for dir in node_modules dist build coverage .cache; do
      if [[ ! -d "$pkg$dir" ]] && [[ -z $(find "$pkg" -name "$dir" -type d 2>/dev/null | head -1) ]]; then
        deleted_from_pkg+=("$dir")
      fi
    done
    
    if [[ ${#deleted_from_pkg[@]} -gt 0 ]]; then
      echo -e "${GREEN}packages/$pkg_name:${NC} ${deleted_from_pkg[*]}"
    fi
  fi
done

# Root level deletions
root_deleted=()
for item in node_modules .next dist build .turbo coverage .cache pnpm-lock.yaml; do
  if [[ ! -e "$item" ]]; then
    root_deleted+=("$item")
  fi
done

if [[ ${#root_deleted[@]} -gt 0 ]]; then
  echo -e "\n${GREEN}root:${NC} ${root_deleted[*]}"
fi

print_header "Clean Process Complete"
echo -e "${GREEN}You can now run 'pnpm install' to reinstall dependencies${NC}\n"