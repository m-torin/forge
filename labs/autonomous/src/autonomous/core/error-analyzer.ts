// Advanced error analysis engine with pattern recognition and root cause analysis
import { TestResult, ErrorAnalysis, ErrorCategory, TestFailure } from '../types';
import { AIManager } from '@repo/ai';

export class ErrorAnalyzer {
  private aiManager: AIManager | null = null;

  // Comprehensive error patterns with priorities and fix strategies
  private errorPatterns = new Map<
    RegExp,
    { category: ErrorCategory; priority: number; confidence: number }
  >([
    // TypeScript errors
    [/TypeError.*is not a function/, { category: 'type-error', priority: 1, confidence: 0.95 }],
    [
      /ReferenceError.*is not defined/,
      { category: 'reference-error', priority: 1, confidence: 0.98 },
    ],
    [/SyntaxError/, { category: 'syntax-error', priority: 1, confidence: 1.0 }],
    [
      /Type '.*' is not assignable to type/,
      { category: 'type-error', priority: 2, confidence: 0.95 },
    ],
    [
      /Property '.*' does not exist on type/,
      { category: 'type-error', priority: 2, confidence: 0.95 },
    ],
    [/Cannot find module/, { category: 'import-error', priority: 1, confidence: 0.98 }],
    [/Cannot find name/, { category: 'reference-error', priority: 1, confidence: 0.95 }],

    // Contract violations
    [
      /Expected.*but got|Expected.*Received/,
      { category: 'contract-violation', priority: 2, confidence: 0.9 },
    ],
    [/Schema validation failed/, { category: 'contract-violation', priority: 1, confidence: 0.95 }],
    [
      /Invalid input|Invalid output/,
      { category: 'contract-violation', priority: 1, confidence: 0.9 },
    ],

    // Logic errors
    [/Assertion failed|AssertionError/, { category: 'logic-error', priority: 3, confidence: 0.85 }],
    [/Test failed/, { category: 'logic-error', priority: 3, confidence: 0.8 }],
    [/Expected behavior not found/, { category: 'logic-error', priority: 3, confidence: 0.85 }],

    // Performance issues
    [
      /Timeout|TimedOut|exceeded.*timeout/,
      { category: 'performance-issue', priority: 4, confidence: 0.95 },
    ],
    [
      /Performance budget exceeded/,
      { category: 'performance-issue', priority: 4, confidence: 0.9 },
    ],
    [/Slow test detected/, { category: 'performance-issue', priority: 5, confidence: 0.85 }],

    // Network/Infrastructure
    [
      /Network|fetch|ECONNREFUSED|ETIMEDOUT/,
      { category: 'network-error', priority: 3, confidence: 0.9 },
    ],
    [
      /Connection refused|Connection timeout/,
      { category: 'network-error', priority: 3, confidence: 0.95 },
    ],

    // Async/Promise errors
    [/UnhandledPromiseRejection/, { category: 'async-error', priority: 2, confidence: 0.95 }],
    [/Promise rejected/, { category: 'async-error', priority: 2, confidence: 0.9 }],
    [/await is only valid in async/, { category: 'async-error', priority: 1, confidence: 1.0 }],
  ]);

  // Repair strategies mapped to error categories
  private repairStrategies = new Map<ErrorCategory, string>([
    [
      'syntax-error',
      'Fix syntax issues: Check for missing brackets, semicolons, or invalid syntax',
    ],
    [
      'type-error',
      'Update TypeScript types: Ensure type definitions match usage and add type assertions where needed',
    ],
    [
      'reference-error',
      'Add missing declarations: Import required modules or define missing variables',
    ],
    ['import-error', 'Fix imports: Check module paths and ensure dependencies are installed'],
    [
      'contract-violation',
      'Align with contracts: Update implementation to match input/output specifications',
    ],
    ['logic-error', 'Fix business logic: Review step execution order and conditional logic'],
    [
      'performance-issue',
      'Optimize performance: Add caching, reduce complexity, or increase timeouts',
    ],
    ['network-error', 'Add error handling: Implement retry logic and proper error boundaries'],
    [
      'async-error',
      'Fix async/await: Ensure proper promise handling and async function declarations',
    ],
  ]);

  constructor() {
    this.initializeAI();
  }

  private async initializeAI(): Promise<void> {
    try {
      this.aiManager = new AIManager();
    } catch (error) {
      console.warn('⚠️ AI Manager not available for enhanced error analysis');
    }
  }

  async analyzeFailures(testResult: TestResult): Promise<ErrorAnalysis> {
    console.log('🔍 Analyzing test failures...');

    // Collect all failures from both test frameworks
    const allFailures = [...testResult.vitest.failures, ...testResult.playwright.failures];

    if (allFailures.length === 0) {
      return this.createSuccessAnalysis();
    }

    // Extract and categorize errors
    const errors = this.extractErrors(allFailures);
    const categories = this.categorizeErrors(errors);

    // Perform root cause analysis
    const rootCauses = await this.performRootCauseAnalysis(errors, allFailures);

    // Generate repair strategy
    const suggestedStrategy = await this.generateRepairStrategy(categories, rootCauses);

    // Calculate confidence
    const confidence = this.calculateConfidence(errors, categories);

    // Use AI for enhanced analysis if available
    let aiInsights = null;
    if (this.aiManager) {
      aiInsights = await this.getAIInsights(errors, testResult);
    }

    return {
      errors,
      categories: Array.from(new Set(categories)),
      suggestedStrategy,
      testFailures: allFailures.map((failure) => this.normalizeTestFailure(failure)),
      confidence,
      rootCauses,
      aiInsights,
      repairComplexity: this.estimateRepairComplexity(categories, rootCauses),
      estimatedFixTime: this.estimateFixTime(categories),
    };
  }

  private extractErrors(failures: TestFailure[]): Array<{
    message: string;
    file: string;
    line: number;
    category?: ErrorCategory;
    confidence?: number;
  }> {
    return failures.map((failure) => {
      const errorInfo = this.parseErrorDetails(failure);
      return {
        message: failure.error || failure.message || 'Unknown error',
        file: errorInfo.file,
        line: errorInfo.line,
        category: errorInfo.category,
        confidence: errorInfo.confidence,
      };
    });
  }

  private parseErrorDetails(failure: TestFailure): {
    file: string;
    line: number;
    category?: ErrorCategory;
    confidence?: number;
  } {
    const stack = failure.stack || '';
    const error = failure.error || '';

    // Extract file and line from stack trace
    const fileMatch = stack.match(/at\s+.*?\s+\((.*?):(\d+):(\d+)\)/);
    const file = fileMatch ? fileMatch[1] : 'unknown';
    const line = fileMatch ? parseInt(fileMatch[2], 10) : 0;

    // Determine category and confidence
    let category: ErrorCategory | undefined;
    let confidence = 0;

    for (const [pattern, info] of this.errorPatterns.entries()) {
      if (pattern.test(error)) {
        category = info.category;
        confidence = info.confidence;
        break;
      }
    }

    return { file, line, category, confidence };
  }

  private categorizeErrors(errors: any[]): ErrorCategory[] {
    const categories = new Set<ErrorCategory>();

    for (const error of errors) {
      if (error.category) {
        categories.add(error.category);
        continue;
      }

      // Fallback pattern matching
      for (const [pattern, info] of this.errorPatterns.entries()) {
        if (pattern.test(error.message)) {
          categories.add(info.category);
          break;
        }
      }
    }

    // Default category if no patterns match
    if (categories.size === 0) {
      categories.add('logic-error');
    }

    return Array.from(categories);
  }

  private async performRootCauseAnalysis(
    errors: any[],
    failures: TestFailure[],
  ): Promise<string[]> {
    const rootCauses: string[] = [];

    // Analyze error patterns
    const errorGroups = this.groupErrorsByPattern(errors);

    for (const [pattern, group] of errorGroups.entries()) {
      if (group.length >= 2) {
        rootCauses.push(`Pattern detected: ${pattern} (${group.length} occurrences)`);
      }
    }

    // Check for common root causes
    if (errors.some((e) => e.message.includes('Cannot find module'))) {
      rootCauses.push('Missing dependencies or incorrect import paths');
    }

    if (errors.some((e) => e.message.includes('is not assignable to type'))) {
      rootCauses.push('Type mismatches between implementation and contracts');
    }

    if (errors.some((e) => e.message.includes('timeout'))) {
      rootCauses.push('Operations taking too long, consider optimization or timeout adjustment');
    }

    // Analyze test failure patterns
    const failuresByFile = this.groupFailuresByFile(failures);
    for (const [file, fileFailures] of failuresByFile.entries()) {
      if (fileFailures.length > 3) {
        rootCauses.push(`Multiple failures in ${file} (${fileFailures.length} tests failing)`);
      }
    }

    return rootCauses;
  }

  private groupErrorsByPattern(errors: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>();

    for (const error of errors) {
      // Extract error type from message
      const typeMatch = error.message.match(/^(\w+Error|TS\d+):/);
      const errorType = typeMatch ? typeMatch[1] : 'UnknownError';

      if (!groups.has(errorType)) {
        groups.set(errorType, []);
      }
      groups.get(errorType)!.push(error);
    }

    return groups;
  }

  private groupFailuresByFile(failures: TestFailure[]): Map<string, TestFailure[]> {
    const groups = new Map<string, TestFailure[]>();

    for (const failure of failures) {
      const file = this.extractFileFromFailure(failure);
      if (!groups.has(file)) {
        groups.set(file, []);
      }
      groups.get(file)!.push(failure);
    }

    return groups;
  }

  private extractFileFromFailure(failure: TestFailure): string {
    if (failure.stack) {
      const match = failure.stack.match(/at\s+.*?\s+\((.*?):\d+:\d+\)/);
      if (match) return match[1];
    }
    return 'unknown';
  }

  private async generateRepairStrategy(
    categories: ErrorCategory[],
    rootCauses: string[],
  ): Promise<string> {
    const strategies: string[] = [];

    // Add category-specific strategies
    const uniqueCategories = Array.from(new Set(categories));
    for (const category of uniqueCategories) {
      const strategy = this.repairStrategies.get(category);
      if (strategy) {
        strategies.push(strategy);
      }
    }

    // Add root cause specific strategies
    if (rootCauses.length > 0) {
      strategies.push('Address root causes: ' + rootCauses.join('; '));
    }

    // Prioritize strategies
    const prioritizedStrategies = this.prioritizeStrategies(strategies, categories);

    return prioritizedStrategies.join('; ') || 'Manual investigation required';
  }

  private prioritizeStrategies(strategies: string[], categories: ErrorCategory[]): string[] {
    // Get priority for each category
    const categoryPriorities = categories.map((cat) => {
      for (const [pattern, info] of this.errorPatterns.entries()) {
        if (info.category === cat) {
          return info.priority;
        }
      }
      return 99; // Default low priority
    });

    // Sort strategies by priority
    const minPriority = Math.min(...categoryPriorities);

    if (minPriority === 1) {
      // Critical errors - focus on syntax and imports first
      return strategies
        .filter((s) => s.includes('syntax') || s.includes('import') || s.includes('reference'))
        .concat(
          strategies.filter(
            (s) => !s.includes('syntax') && !s.includes('import') && !s.includes('reference'),
          ),
        );
    }

    return strategies;
  }

  private calculateConfidence(errors: any[], categories: ErrorCategory[]): number {
    if (errors.length === 0) return 1.0;

    // Calculate average confidence from error pattern matching
    const confidences = errors.map((e) => e.confidence || 0).filter((c) => c > 0);

    if (confidences.length === 0) return 0.5;

    const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;

    // Adjust based on category consistency
    const uniqueCategories = new Set(categories);
    const categoryConsistency = 1 - (uniqueCategories.size - 1) / Math.max(categories.length, 1);

    return avgConfidence * 0.7 + categoryConsistency * 0.3;
  }

  private async getAIInsights(errors: any[], testResult: TestResult): Promise<any> {
    if (!this.aiManager) return null;

    try {
      const context = {
        errors: errors.slice(0, 10), // Limit to first 10 errors
        testSummary: testResult.summary,
        performance: testResult.performanceMetrics,
      };

      const insights = await this.aiManager.analyze({
        type: 'test_failure_analysis',
        data: context,
        options: {
          includeFixSuggestions: true,
          analyzeDependencies: true,
          checkBestPractices: true,
        },
      });

      return insights;
    } catch (error) {
      console.warn('Failed to get AI insights:', error);
      return null;
    }
  }

  private estimateRepairComplexity(
    categories: ErrorCategory[],
    rootCauses: string[],
  ): 'low' | 'medium' | 'high' {
    // Simple heuristic based on error types and root causes
    const complexityScore =
      categories.filter((c) => c === 'syntax-error' || c === 'import-error').length * 1 +
      categories.filter((c) => c === 'type-error' || c === 'reference-error').length * 2 +
      categories.filter((c) => c === 'logic-error' || c === 'contract-violation').length * 3 +
      rootCauses.length * 2;

    if (complexityScore <= 5) return 'low';
    if (complexityScore <= 10) return 'medium';
    return 'high';
  }

  private estimateFixTime(categories: ErrorCategory[]): number {
    // Estimate in minutes based on error categories
    const timeMap = new Map<ErrorCategory, number>([
      ['syntax-error', 2],
      ['import-error', 3],
      ['reference-error', 3],
      ['type-error', 5],
      ['async-error', 5],
      ['contract-violation', 10],
      ['logic-error', 15],
      ['performance-issue', 20],
      ['network-error', 10],
    ]);

    let totalTime = 0;
    const uniqueCategories = Array.from(new Set(categories));

    for (const category of uniqueCategories) {
      totalTime += timeMap.get(category) || 10;
    }

    return totalTime;
  }

  private normalizeTestFailure(failure: TestFailure): TestFailure {
    return {
      testName: failure.testName || 'Unknown test',
      error: failure.error || failure.message || 'Unknown error',
      expected: failure.expected || 'Not specified',
      actual: failure.actual || 'Not specified',
      stack: failure.stack || '',
      duration: failure.duration,
      file: this.extractFileFromFailure(failure),
    };
  }

  private createSuccessAnalysis(): ErrorAnalysis {
    return {
      errors: [],
      categories: [],
      suggestedStrategy: 'All tests passing - no repairs needed',
      testFailures: [],
      confidence: 1.0,
      rootCauses: [],
      aiInsights: null,
      repairComplexity: 'low',
      estimatedFixTime: 0,
    };
  }

  // Public method to get repair history insights
  async getRepairHistoryInsights(workflowType: string): Promise<any> {
    // This would connect to the learning system to get historical repair data
    return {
      commonErrors: [],
      successfulStrategies: [],
      averageRepairTime: 0,
      successRate: 0,
    };
  }
}
