#!/bin/bash
#
# Script to check HTML files for correct nonce usage with Content-Security-Policy
# This helps ensure that your CSP implementation is working correctly with nonces
#
# Usage: ./check_nonce_usage.sh [directory]
# If no directory is provided, the script will check the current directory

set -e

DIR=${1:-.}
NONCE_PLACEHOLDER='%%NONCE%%'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Checking for CSP nonce usage in HTML files..."

# Find all HTML files
HTML_FILES=$(find "$DIR" -type f -name "*.html" -o -name "*.htm")

if [ -z "$HTML_FILES" ]; then
    echo -e "${YELLOW}No HTML files found in $DIR${NC}"
    exit 0
fi

echo "Found HTML files to check:"
echo "$HTML_FILES" | sed 's/^/  - /'
echo

# Check for script and style tags that should use nonces
check_file() {
    local file=$1
    local has_errors=0
    
    echo -e "Checking ${YELLOW}$file${NC}"
    
    # Count script tags
    local script_tags=$(grep -c '<script' "$file" || echo 0)
    local nonced_scripts=$(grep -c "nonce=\"$NONCE_PLACEHOLDER\"" "$file" || echo 0)
    local nonced_styles=$(grep -c "nonce=\"$NONCE_PLACEHOLDER\"" "$file" || echo 0)
    
    # Look for inline scripts without nonces
    local inline_scripts_without_nonce=$(grep -v "nonce=" "$file" | grep -c '<script>' || echo 0)
    
    echo "  - Total script tags: $script_tags"
    echo "  - Script tags with nonce: $nonced_scripts"
    
    if [ "$inline_scripts_without_nonce" -gt 0 ]; then
        echo -e "  - ${RED}Found $inline_scripts_without_nonce inline script(s) without nonce!${NC}"
        echo "    Lines:"
        grep -n '<script>' "$file" | grep -v "nonce=" | sed 's/^/      /'
        has_errors=1
    fi
    
    # Check for external scripts
    local external_scripts=$(grep '<script src=' "$file" | grep -v "nonce=" | wc -l)
    if [ "$external_scripts" -gt 0 ]; then
        echo -e "  - ${YELLOW}Found $external_scripts external script(s) without nonce${NC}"
        echo "    This may be fine if they are from whitelisted domains in your CSP"
        echo "    Lines:"
        grep -n '<script src=' "$file" | grep -v "nonce=" | sed 's/^/      /'
    fi
    
    # Check for inline styles
    local inline_styles=$(grep '<style>' "$file" | grep -v "nonce=" | wc -l)
    if [ "$inline_styles" -gt 0 ]; then
        echo -e "  - ${RED}Found $inline_styles inline style(s) without nonce!${NC}"
        echo "    Lines:"
        grep -n '<style>' "$file" | grep -v "nonce=" | sed 's/^/      /'
        has_errors=1
    fi
    
    if [ "$has_errors" -eq 0 ]; then
        echo -e "  ${GREEN}✓ No CSP nonce issues found${NC}"
    else
        echo -e "  ${RED}✗ Found CSP nonce issues that need to be fixed${NC}"
    fi
    echo
    
    return $has_errors
}

TOTAL_ERRORS=0

for file in $HTML_FILES; do
    check_file "$file"
    TOTAL_ERRORS=$((TOTAL_ERRORS + $?))
done

if [ "$TOTAL_ERRORS" -eq 0 ]; then
    echo -e "${GREEN}All files checked. No CSP nonce issues found!${NC}"
    exit 0
else
    echo -e "${RED}Finished with $TOTAL_ERRORS errors. Please fix the CSP nonce issues.${NC}"
    echo
    echo "To fix these issues:"
    echo "1. Add nonce to inline scripts: <script nonce=\"%%NONCE%%\">...</script>"
    echo "2. Add nonce to inline styles: <style nonce=\"%%NONCE%%\">...</style>"
    echo "3. For external scripts: <script nonce=\"%%NONCE%%\" src=\"...\"></script>"
    echo
    echo "Alternatively, add hashes for specific scripts to your CSP if they cannot use nonces."
    exit 1
fi