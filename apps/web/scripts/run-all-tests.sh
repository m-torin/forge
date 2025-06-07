#!/bin/bash

# Enhanced Test Execution Script with Smart Running and Analytics
# This script integrates the smart test runner, performance benchmarking, and analytics

set -e  # Exit on error

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
SMART_MODE=true
PERFORMANCE_TESTS=false
GENERATE_ANALYTICS=true
GENERATE_REPORT=true
BASE_BRANCH="main"
ENVIRONMENT="${NODE_ENV:-test}"
MAX_DURATION=""
ONLY_FAILED=false
INCLUDE_FLAKY=false
VERBOSE=false
DRY_RUN=false

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${BLUE}🔄 $1${NC}"
}

# Show help
show_help() {
    cat << EOF
Enhanced Test Execution Script

USAGE:
    ./scripts/run-all-tests.sh [OPTIONS]

OPTIONS:
    --smart                 Use smart test runner (default: true)
    --no-smart             Disable smart test runner, run all tests
    --performance          Include performance benchmarks
    --no-analytics         Skip analytics generation
    --no-report           Skip report generation
    --base-branch BRANCH   Base branch for change detection (default: main)
    --environment ENV      Test environment (default: \$NODE_ENV or test)
    --max-duration MS      Maximum test execution time in milliseconds
    --only-failed         Run only previously failed tests
    --include-flaky       Include flaky tests in execution
    --verbose             Verbose output
    --dry-run            Show what would be executed without running
    --help               Show this help message

EXAMPLES:
    ./scripts/run-all-tests.sh                                    # Smart test execution
    ./scripts/run-all-tests.sh --no-smart --performance          # Full test suite with performance
    ./scripts/run-all-tests.sh --only-failed --verbose           # Run failed tests with verbose output
    ./scripts/run-all-tests.sh --max-duration 300000             # Run tests for max 5 minutes
    ./scripts/run-all-tests.sh --base-branch develop --dry-run   # Show execution plan for develop branch

WORKFLOWS:
    CI Mode:    ./scripts/run-all-tests.sh --base-branch main --max-duration 600000
    Quick:      ./scripts/run-all-tests.sh --max-duration 180000 --no-analytics
    Full:       ./scripts/run-all-tests.sh --no-smart --performance
    Debug:      ./scripts/run-all-tests.sh --only-failed --verbose
EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --smart)
                SMART_MODE=true
                shift
                ;;
            --no-smart)
                SMART_MODE=false
                shift
                ;;
            --performance)
                PERFORMANCE_TESTS=true
                shift
                ;;
            --no-analytics)
                GENERATE_ANALYTICS=false
                shift
                ;;
            --no-report)
                GENERATE_REPORT=false
                shift
                ;;
            --base-branch)
                BASE_BRANCH="$2"
                shift 2
                ;;
            --environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --max-duration)
                MAX_DURATION="$2"
                shift 2
                ;;
            --only-failed)
                ONLY_FAILED=true
                shift
                ;;
            --include-flaky)
                INCLUDE_FLAKY=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    cd "$PROJECT_ROOT"
    
    # Check if node_modules exists
    if [[ ! -d "node_modules" ]]; then
        log_warning "node_modules not found, running npm install..."
        npm install
    fi
    
    # Check if required directories exist
    mkdir -p .test-cache
    mkdir -p test-results/{reports,analytics,performance}
    mkdir -p .performance-baselines
    
    # Check if browser dependencies are installed
    if ! npx playwright --version > /dev/null 2>&1; then
        log_warning "Playwright not found, installing..."
        npx playwright install
    fi
    
    log_success "Prerequisites checked"
}

# Run smart test execution
run_smart_tests() {
    log_step "Running smart test execution..."
    
    local cmd="npm run test:smart"
    local args=""
    
    if [[ "$ONLY_FAILED" == "true" ]]; then
        cmd="npm run test:smart:failed"
    elif [[ "$INCLUDE_FLAKY" == "true" ]]; then
        cmd="npm run test:smart:flaky"
    elif [[ -n "$MAX_DURATION" ]]; then
        cmd="npm run test:smart:fast"
    fi
    
    # Add additional arguments
    if [[ "$BASE_BRANCH" != "main" ]]; then
        args="$args --base-branch $BASE_BRANCH"
    fi
    
    if [[ -n "$MAX_DURATION" ]]; then
        args="$args --max-duration $MAX_DURATION"
    fi
    
    if [[ "$VERBOSE" == "true" ]]; then
        args="$args --verbose"
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        args="$args --dry-run"
    fi
    
    # Execute command
    if [[ -n "$args" ]]; then
        log_info "Command: $cmd -- $args"
        if [[ "$DRY_RUN" != "true" ]]; then
            $cmd -- $args
        fi
    else
        log_info "Command: $cmd"
        if [[ "$DRY_RUN" != "true" ]]; then
            $cmd
        fi
    fi
}

# Run traditional playwright tests
run_traditional_tests() {
    log_step "Running traditional test execution..."
    
    local cmd="npm run test:e2e"
    
    if [[ "$VERBOSE" == "true" ]]; then
        cmd="$cmd -- --reporter=list"
    fi
    
    log_info "Command: $cmd"
    
    if [[ "$DRY_RUN" != "true" ]]; then
        $cmd
    fi
}

# Run performance benchmarks
run_performance_tests() {
    log_step "Running performance benchmarks..."
    
    # Check if we should establish baselines
    if [[ ! -d ".performance-baselines" ]] || [[ "$(ls -A .performance-baselines 2>/dev/null | wc -l)" -eq 0 ]]; then
        log_info "No baselines found, establishing performance baselines..."
        if [[ "$DRY_RUN" != "true" ]]; then
            npm run test:performance:baseline
        else
            log_info "Would run: npm run test:performance:baseline"
        fi
    else
        log_info "Running performance regression tests..."
        if [[ "$DRY_RUN" != "true" ]]; then
            npm run test:performance:regression
        else
            log_info "Would run: npm run test:performance:regression"
        fi
    fi
    
    # Also run general performance tests
    log_info "Running general performance tests..."
    if [[ "$DRY_RUN" != "true" ]]; then
        npm run test:performance
    else
        log_info "Would run: npm run test:performance"
    fi
}

# Generate analytics dashboard
generate_analytics() {
    log_step "Generating analytics dashboard..."
    
    if [[ "$DRY_RUN" != "true" ]]; then
        npm run test:analytics:dashboard
    else
        log_info "Would run: npm run test:analytics:dashboard"
    fi
}

# Generate comprehensive report
generate_report() {
    log_step "Generating comprehensive test report..."
    
    if [[ "$DRY_RUN" != "true" ]]; then
        npm run test:report
    else
        log_info "Would run: npm run test:report"
    fi
}

# Cleanup old artifacts
cleanup_old_artifacts() {
    log_step "Cleaning up old test artifacts..."
    
    # Keep only last 10 days of results
    if [[ "$DRY_RUN" != "true" ]]; then
        find test-results -name "*.json" -mtime +10 -delete 2>/dev/null || true
        find test-results -name "*.html" -mtime +10 -delete 2>/dev/null || true
        find .test-cache -name "*.json" -mtime +30 -delete 2>/dev/null || true
    else
        log_info "Would cleanup old artifacts (>10 days)"
    fi
}

# Display execution summary
display_summary() {
    log_step "Execution Summary"
    
    echo ""
    echo "📊 Test Execution Complete"
    echo "=========================="
    echo "Environment: $ENVIRONMENT"
    echo "Base Branch: $BASE_BRANCH"
    echo "Smart Mode: $SMART_MODE"
    echo "Performance Tests: $PERFORMANCE_TESTS"
    echo "Analytics Generated: $GENERATE_ANALYTICS"
    echo "Report Generated: $GENERATE_REPORT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo ""
        log_warning "This was a dry run - no tests were actually executed"
    fi
    
    echo ""
    echo "📁 Generated Artifacts:"
    
    if [[ -f "test-results/latest.html" ]]; then
        echo "   📊 Latest Report: test-results/latest.html"
    fi
    
    if [[ -f "test-results/analytics/test-analytics-dashboard.html" ]]; then
        echo "   📈 Analytics Dashboard: test-results/analytics/test-analytics-dashboard.html"
    fi
    
    if [[ -d "test-results/performance" ]]; then
        echo "   ⚡ Performance Results: test-results/performance/"
    fi
    
    echo ""
    log_success "All tasks completed successfully!"
}

# Handle script interruption
handle_interrupt() {
    log_warning "Script interrupted by user"
    echo ""
    log_info "Cleaning up..."
    exit 130
}

# Main execution function
main() {
    # Set up interrupt handler
    trap handle_interrupt SIGINT SIGTERM
    
    log_info "Starting enhanced test execution..."
    echo "Environment: $ENVIRONMENT"
    echo "Base Branch: $BASE_BRANCH"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Execute tests based on mode
    if [[ "$SMART_MODE" == "true" ]]; then
        run_smart_tests
    else
        run_traditional_tests
    fi
    
    # Run performance tests if requested
    if [[ "$PERFORMANCE_TESTS" == "true" ]]; then
        run_performance_tests
    fi
    
    # Generate analytics if requested
    if [[ "$GENERATE_ANALYTICS" == "true" ]]; then
        generate_analytics
    fi
    
    # Generate report if requested
    if [[ "$GENERATE_REPORT" == "true" ]]; then
        generate_report
    fi
    
    # Cleanup old artifacts
    cleanup_old_artifacts
    
    # Display summary
    display_summary
}

# Parse arguments and run main function
parse_args "$@"
main