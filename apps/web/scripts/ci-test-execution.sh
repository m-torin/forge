#!/bin/bash

# CI/CD Optimized Test Execution Script
# Designed for automated CI/CD pipelines with smart execution and reporting

set -e

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# CI Environment Variables
CI_ENVIRONMENT="${CI_ENVIRONMENT:-ci}"
BASE_BRANCH="${BASE_BRANCH:-main}"
BRANCH_NAME="${BRANCH_NAME:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')}"
COMMIT_HASH="${COMMIT_HASH:-$(git rev-parse HEAD 2>/dev/null || echo 'unknown')}"
BUILD_ID="${BUILD_ID:-$(date +%s)}"
PULL_REQUEST_ID="${PULL_REQUEST_ID:-}"

# CI-specific settings
MAX_EXECUTION_TIME="${MAX_EXECUTION_TIME:-600000}"  # 10 minutes default
PARALLEL_WORKERS="${PARALLEL_WORKERS:-2}"
ENABLE_PERFORMANCE_TESTS="${ENABLE_PERFORMANCE_TESTS:-false}"
ENABLE_NOTIFICATIONS="${ENABLE_NOTIFICATIONS:-true}"
FAILURE_THRESHOLD="${FAILURE_THRESHOLD:-5}"  # Max acceptable failures

# Output formatting
log_group_start() {
    echo "::group::$1"
}

log_group_end() {
    echo "::endgroup::"
}

log_info() {
    echo "::notice::$1"
}

log_warning() {
    echo "::warning::$1"
}

log_error() {
    echo "::error::$1"
}

log_debug() {
    echo "::debug::$1"
}

# Set outputs for CI systems
set_output() {
    if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
        echo "$1=$2" >> "$GITHUB_OUTPUT"
    else
        echo "OUTPUT: $1=$2"
    fi
}

# Export environment variables for test execution
setup_environment() {
    export NODE_ENV="$CI_ENVIRONMENT"
    export BASE_URL="http://localhost:3200"
    export CI=true
    export BRANCH_NAME="$BRANCH_NAME"
    export COMMIT_HASH="$COMMIT_HASH"
    export BUILD_ID="$BUILD_ID"
    export ENABLE_NOTIFICATIONS="$ENABLE_NOTIFICATIONS"
    
    # Performance testing settings
    if [[ "$ENABLE_PERFORMANCE_TESTS" == "true" ]]; then
        export ESTABLISH_BASELINE="${ESTABLISH_BASELINE:-false}"
        export CHECK_REGRESSION="${CHECK_REGRESSION:-true}"
    fi
    
    # Notification settings
    export SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
    export SLACK_CHANNEL="${SLACK_CHANNEL:-#test-results}"
    export EMAIL_RECIPIENTS="${EMAIL_RECIPIENTS:-}"
}

# Install dependencies and setup
setup_ci() {
    log_group_start "Setting up CI environment"
    
    cd "$PROJECT_ROOT"
    
    log_info "Installing dependencies..."
    npm ci --prefer-offline --no-audit
    
    log_info "Installing Playwright browsers..."
    npx playwright install --with-deps chromium firefox webkit
    
    # Create necessary directories
    mkdir -p .test-cache
    mkdir -p test-results/{reports,analytics,performance}
    mkdir -p .performance-baselines
    
    log_group_end
}

# Determine test execution strategy
determine_strategy() {
    log_group_start "Determining test execution strategy"
    
    local strategy="smart"
    local reason=""
    
    # Check if this is a main branch or release
    if [[ "$BRANCH_NAME" == "main" ]] || [[ "$BRANCH_NAME" == "master" ]] || [[ "$BRANCH_NAME" =~ ^release/ ]]; then
        strategy="full"
        reason="Main/Release branch detected"
    fi
    
    # Check if forced full execution
    if [[ "${FORCE_FULL_EXECUTION:-false}" == "true" ]]; then
        strategy="full"
        reason="Full execution forced via environment variable"
    fi
    
    # Check if this is a pull request with many changes
    if [[ -n "$PULL_REQUEST_ID" ]]; then
        local changed_files=$(git diff --name-only "$BASE_BRANCH...HEAD" | wc -l)
        if [[ $changed_files -gt 20 ]]; then
            strategy="full"
            reason="Large number of changed files ($changed_files)"
        fi
    fi
    
    log_info "Execution strategy: $strategy"
    log_info "Reason: $reason"
    
    set_output "test_strategy" "$strategy"
    set_output "strategy_reason" "$reason"
    
    echo "$strategy"
    
    log_group_end
}

# Execute smart test runner
execute_smart_tests() {
    log_group_start "Executing smart test runner"
    
    local start_time=$(date +%s)
    local exit_code=0
    
    log_info "Running smart test execution with max duration: ${MAX_EXECUTION_TIME}ms"
    
    # Build smart test command
    local cmd="npx tsx e2e/runners/cli.ts run"
    cmd="$cmd --base-branch $BASE_BRANCH"
    cmd="$cmd --max-duration $MAX_EXECUTION_TIME"
    cmd="$cmd --reporter junit"
    cmd="$cmd --output-dir test-results/ci"
    
    log_info "Command: $cmd"
    
    # Execute with timeout protection
    if timeout $((MAX_EXECUTION_TIME / 1000 + 60)) $cmd; then
        log_info "Smart test execution completed successfully"
    else
        exit_code=$?
        log_error "Smart test execution failed with exit code: $exit_code"
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    set_output "test_duration" "$duration"
    set_output "test_exit_code" "$exit_code"
    
    log_group_end
    return $exit_code
}

# Execute full test suite
execute_full_tests() {
    log_group_start "Executing full test suite"
    
    local start_time=$(date +%s)
    local exit_code=0
    
    log_info "Running full test suite"
    
    if npm run test:e2e -- --reporter=junit --output-dir=test-results/ci; then
        log_info "Full test execution completed successfully"
    else
        exit_code=$?
        log_error "Full test execution failed with exit code: $exit_code"
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    set_output "test_duration" "$duration"
    set_output "test_exit_code" "$exit_code"
    
    log_group_end
    return $exit_code
}

# Run performance tests
execute_performance_tests() {
    if [[ "$ENABLE_PERFORMANCE_TESTS" != "true" ]]; then
        return 0
    fi
    
    log_group_start "Executing performance tests"
    
    local perf_exit_code=0
    
    log_info "Running performance benchmarks"
    
    if npm run test:performance; then
        log_info "Performance tests completed successfully"
        
        # Check for regressions if baselines exist
        if [[ -d ".performance-baselines" ]] && [[ "$(ls -A .performance-baselines 2>/dev/null | wc -l)" -gt 0 ]]; then
            log_info "Checking for performance regressions"
            if npm run test:performance:regression; then
                log_info "No significant performance regressions detected"
            else
                perf_exit_code=$?
                log_warning "Performance regressions detected (exit code: $perf_exit_code)"
                set_output "performance_regressions" "true"
            fi
        fi
    else
        perf_exit_code=$?
        log_error "Performance tests failed with exit code: $perf_exit_code"
    fi
    
    set_output "performance_exit_code" "$perf_exit_code"
    
    log_group_end
    return $perf_exit_code
}

# Analyze test results
analyze_results() {
    log_group_start "Analyzing test results"
    
    local results_file="test-results/ci/results.json"
    local junit_file="test-results/ci/junit.xml"
    
    # Parse test results
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    local skipped_tests=0
    
    if [[ -f "$results_file" ]]; then
        # Would parse actual JSON results
        log_info "Parsing test results from $results_file"
    fi
    
    if [[ -f "$junit_file" ]]; then
        # Parse JUnit XML for basic stats
        total_tests=$(grep -o 'tests="[0-9]*"' "$junit_file" | head -1 | sed 's/tests="//;s/"//')
        failed_tests=$(grep -o 'failures="[0-9]*"' "$junit_file" | head -1 | sed 's/failures="//;s/"//')
        passed_tests=$((total_tests - failed_tests))
        
        log_info "Test Results: $passed_tests/$total_tests passed, $failed_tests failed"
    fi
    
    # Set outputs
    set_output "total_tests" "$total_tests"
    set_output "passed_tests" "$passed_tests"
    set_output "failed_tests" "$failed_tests"
    set_output "skipped_tests" "$skipped_tests"
    
    # Calculate pass rate
    if [[ $total_tests -gt 0 ]]; then
        local pass_rate=$((passed_tests * 100 / total_tests))
        set_output "pass_rate" "$pass_rate"
        
        log_info "Pass rate: ${pass_rate}%"
        
        # Check if pass rate meets threshold
        if [[ $pass_rate -lt 90 ]]; then
            log_warning "Pass rate below 90%: ${pass_rate}%"
            set_output "pass_rate_warning" "true"
        fi
    fi
    
    # Check failure threshold
    if [[ $failed_tests -gt $FAILURE_THRESHOLD ]]; then
        log_error "Failed tests ($failed_tests) exceed threshold ($FAILURE_THRESHOLD)"
        set_output "failure_threshold_exceeded" "true"
        return 1
    fi
    
    log_group_end
    return 0
}

# Generate CI reports
generate_ci_reports() {
    log_group_start "Generating CI reports"
    
    # Generate comprehensive report
    log_info "Generating comprehensive test report"
    if npm run test:report; then
        log_info "Test report generated successfully"
        set_output "report_generated" "true"
        
        if [[ -f "test-results/reports/latest.html" ]]; then
            set_output "report_path" "test-results/reports/latest.html"
        fi
    else
        log_warning "Failed to generate test report"
    fi
    
    # Generate analytics dashboard
    log_info "Generating analytics dashboard"
    if npm run test:analytics:dashboard; then
        log_info "Analytics dashboard generated successfully"
        set_output "analytics_generated" "true"
        
        if [[ -f "test-results/analytics/test-analytics-dashboard.html" ]]; then
            set_output "analytics_path" "test-results/analytics/test-analytics-dashboard.html"
        fi
    else
        log_warning "Failed to generate analytics dashboard"
    fi
    
    log_group_end
}

# Upload artifacts for CI systems
upload_artifacts() {
    log_group_start "Preparing artifacts for upload"
    
    # Create artifacts directory
    mkdir -p ci-artifacts
    
    # Copy important files
    if [[ -d "test-results" ]]; then
        cp -r test-results ci-artifacts/
    fi
    
    if [[ -d ".test-cache" ]]; then
        cp -r .test-cache ci-artifacts/
    fi
    
    # Copy performance baselines if they exist
    if [[ -d ".performance-baselines" ]]; then
        cp -r .performance-baselines ci-artifacts/
    fi
    
    # Create summary file
    cat > ci-artifacts/summary.txt << EOF
Test Execution Summary
=====================

Branch: $BRANCH_NAME
Commit: $COMMIT_HASH
Build ID: $BUILD_ID
Environment: $CI_ENVIRONMENT
Strategy: $(cat .test-strategy 2>/dev/null || echo "unknown")

Results:
- Total Tests: $(cat .total-tests 2>/dev/null || echo "unknown")
- Passed: $(cat .passed-tests 2>/dev/null || echo "unknown")
- Failed: $(cat .failed-tests 2>/dev/null || echo "unknown")
- Pass Rate: $(cat .pass-rate 2>/dev/null || echo "unknown")%

Duration: $(cat .test-duration 2>/dev/null || echo "unknown") seconds

Generated: $(date)
EOF
    
    log_info "Artifacts prepared in ci-artifacts/ directory"
    
    set_output "artifacts_path" "ci-artifacts"
    
    log_group_end
}

# Handle failures and cleanup
handle_failure() {
    local exit_code=$1
    
    log_group_start "Handling test failure"
    
    log_error "Test execution failed with exit code: $exit_code"
    
    # Collect failure information
    if [[ -f "test-results/ci/junit.xml" ]]; then
        local failed_tests=$(grep -o '<failure' test-results/ci/junit.xml | wc -l)
        log_error "Number of failed tests: $failed_tests"
        
        # Extract first few failure messages
        if command -v xmllint > /dev/null; then
            log_info "Failed test details:"
            xmllint --xpath "//failure/@message" test-results/ci/junit.xml 2>/dev/null | head -3 | sed 's/message="//g;s/"//g' | while read -r msg; do
                log_error "  - $msg"
            done
        fi
    fi
    
    set_output "execution_failed" "true"
    set_output "final_exit_code" "$exit_code"
    
    log_group_end
}

# Main execution
main() {
    local final_exit_code=0
    
    log_info "Starting CI test execution"
    log_info "Branch: $BRANCH_NAME, Commit: ${COMMIT_HASH:0:8}, Build: $BUILD_ID"
    
    # Setup
    setup_environment
    setup_ci
    
    # Determine strategy
    local strategy=$(determine_strategy)
    echo "$strategy" > .test-strategy
    
    # Execute tests based on strategy
    if [[ "$strategy" == "smart" ]]; then
        if ! execute_smart_tests; then
            final_exit_code=$?
        fi
    else
        if ! execute_full_tests; then
            final_exit_code=$?
        fi
    fi
    
    # Run performance tests
    if ! execute_performance_tests; then
        local perf_code=$?
        if [[ $final_exit_code -eq 0 ]]; then
            final_exit_code=$perf_code
        fi
    fi
    
    # Analyze results
    if ! analyze_results; then
        local analysis_code=$?
        if [[ $final_exit_code -eq 0 ]]; then
            final_exit_code=$analysis_code
        fi
    fi
    
    # Generate reports (don't fail on report generation errors)
    generate_ci_reports || true
    
    # Prepare artifacts
    upload_artifacts || true
    
    # Handle failure if needed
    if [[ $final_exit_code -ne 0 ]]; then
        handle_failure $final_exit_code
    else
        log_info "All tests passed successfully!"
        set_output "execution_successful" "true"
        set_output "final_exit_code" "0"
    fi
    
    echo "$final_exit_code" > .final-exit-code
    exit $final_exit_code
}

# Execute main function
main "$@"