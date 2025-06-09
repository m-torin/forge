// Self-learning system with pattern recognition and strategy optimization
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  type ErrorAnalysis,
  type ErrorCategory,
  type LearningEvent,
  type RepairAttempt,
  type RepairStrategy,
  type WorkflowSpecification,
} from '../types';

interface StrategyPerformance {
  averageIterations: number;
  averageTime: number;
  confidence: number;
  failureCount: number;
  strategy: string;
  successCount: number;
}

interface ErrorPattern {
  category: ErrorCategory;
  confidence: number;
  frequency: number;
  lastSeen: Date;
  pattern: string;
  successfulFixes: string[];
}

export class LearningSystem {
  private learningDataPath = join(process.cwd(), 'data/autonomous-learning');
  private strategiesPath = join(this.learningDataPath, 'strategies.json');
  private patternsPath = join(this.learningDataPath, 'patterns.json');
  private eventsPath = join(this.learningDataPath, 'events.json');

  private strategies = new Map<string, StrategyPerformance>();
  private patterns = new Map<string, ErrorPattern>();
  private events: LearningEvent[] = [];

  private readonly MIN_CONFIDENCE_THRESHOLD = 0.7;
  private readonly PATTERN_DETECTION_THRESHOLD = 3;
  private readonly STRATEGY_UPDATE_THRESHOLD = 5;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Ensure learning data directory exists
    if (!existsSync(this.learningDataPath)) {
      mkdirSync(this.learningDataPath, { recursive: true });
    }

    // Load existing learning data
    this.loadStrategies();
    this.loadPatterns();
    this.loadEvents();

    // Initialize default strategies if empty
    if (this.strategies.size === 0) {
      this.initializeDefaultStrategies();
    }
  }

  private loadStrategies(): void {
    if (existsSync(this.strategiesPath)) {
      try {
        const data = JSON.parse(readFileSync(this.strategiesPath, 'utf-8'));
        this.strategies = new Map(Object.entries(data));
      } catch (error) {
        console.warn('Failed to load strategies:', error);
      }
    }
  }

  private loadPatterns(): void {
    if (existsSync(this.patternsPath)) {
      try {
        const data = JSON.parse(readFileSync(this.patternsPath, 'utf-8'));
        this.patterns = new Map(
          Object.entries(data).map(([k, v]: [string, any]) => [
            k,
            { ...v, lastSeen: new Date(v.lastSeen) },
          ]),
        );
      } catch (error) {
        console.warn('Failed to load patterns:', error);
      }
    }
  }

  private loadEvents(): void {
    if (existsSync(this.eventsPath)) {
      try {
        const data = JSON.parse(readFileSync(this.eventsPath, 'utf-8'));
        this.events = data.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
      } catch (error) {
        console.warn('Failed to load events:', error);
      }
    }
  }

  private saveStrategies(): void {
    const data = Object.fromEntries(this.strategies);
    writeFileSync(this.strategiesPath, JSON.stringify(data, null, 2));
  }

  private savePatterns(): void {
    const data = Object.fromEntries(this.patterns);
    writeFileSync(this.patternsPath, JSON.stringify(data, null, 2));
  }

  private saveEvents(): void {
    // Keep only last 1000 events to prevent unbounded growth
    const recentEvents = this.events.slice(-1000);
    writeFileSync(this.eventsPath, JSON.stringify(recentEvents, null, 2));
  }

  private initializeDefaultStrategies(): void {
    const defaultStrategies: [string, StrategyPerformance][] = [
      [
        'syntax-first',
        {
          confidence: 0.8,
          averageIterations: 0,
          averageTime: 0,
          failureCount: 0,
          strategy: 'syntax-first',
          successCount: 0,
        },
      ],
      [
        'type-focused',
        {
          confidence: 0.75,
          averageIterations: 0,
          averageTime: 0,
          failureCount: 0,
          strategy: 'type-focused',
          successCount: 0,
        },
      ],
      [
        'contract-alignment',
        {
          confidence: 0.85,
          averageIterations: 0,
          averageTime: 0,
          failureCount: 0,
          strategy: 'contract-alignment',
          successCount: 0,
        },
      ],
      [
        'incremental-fix',
        {
          confidence: 0.7,
          averageIterations: 0,
          averageTime: 0,
          failureCount: 0,
          strategy: 'incremental-fix',
          successCount: 0,
        },
      ],
    ];

    this.strategies = new Map(defaultStrategies);
    this.saveStrategies();
  }

  async recordSuccess(
    spec: WorkflowSpecification,
    iterations: number,
    attempts: RepairAttempt[],
  ): Promise<void> {
    const event: LearningEvent = {
      confidence: 1.0,
      codeComplexity: this.calculateComplexity(spec),
      errorCategories: [],
      iterations,
      repairStrategy: 'initial-generation',
      success: true,
      timestamp: new Date(),
      timeToFix: this.calculateTotalTime(attempts),
      workflowType: spec.type || 'general',
    };

    // If there were repair attempts, analyze them
    if (attempts.length > 0) {
      const allCategories = new Set<ErrorCategory>();
      attempts.forEach((a) => a.errorAnalysis.categories.forEach((c) => allCategories.add(c)));
      event.errorCategories = Array.from(allCategories);
      event.repairStrategy = attempts[attempts.length - 1].repairStrategy;
    }

    this.events.push(event);
    this.updateStrategies(event);
    this.saveEvents();

    console.log('📊 Recorded successful workflow completion');
  }

  async learnFromError(errorAnalysis: ErrorAnalysis): Promise<void> {
    // Update error patterns
    errorAnalysis.errors.forEach((error) => {
      const patternKey = this.extractPatternKey(error);
      const pattern = this.patterns.get(patternKey) || {
        confidence: 0.5,
        category: errorAnalysis.categories[0] || 'unknown',
        frequency: 0,
        lastSeen: new Date(),
        pattern: patternKey,
        successfulFixes: [],
      };

      pattern.frequency++;
      pattern.lastSeen = new Date();
      pattern.confidence = Math.min(0.95, pattern.confidence + 0.05);

      this.patterns.set(patternKey, pattern);
    });

    this.detectNewPatterns();
    this.savePatterns();
  }

  async getPredictedStrategy(context: {
    workflowType: string;
    complexity: string;
  }): Promise<RepairStrategy> {
    // Find best strategy based on historical performance
    let bestStrategy = 'contract-alignment'; // Default
    let bestScore = 0;

    for (const [name, perf] of this.strategies.entries()) {
      const score = this.calculateStrategyScore(perf, context);
      if (score > bestScore) {
        bestScore = score;
        bestStrategy = name;
      }
    }

    const strategyData = this.strategies.get(bestStrategy)!;

    return {
      confidence: strategyData.confidence,
      considerations: this.getStrategyConsiderations(bestStrategy, context),
      name: bestStrategy,
      pattern: this.getStrategyPattern(bestStrategy),
      riskLevel: this.calculateRiskLevel(strategyData),
      successRate: this.calculateSuccessRate(strategyData),
    };
  }

  async getRepairStrategy(errorAnalysis: ErrorAnalysis): Promise<RepairStrategy> {
    // Analyze error patterns to determine best repair strategy
    const categoryScores = new Map<string, number>();

    // Score strategies based on error categories
    errorAnalysis.categories.forEach((category) => {
      const strategies = this.getStrategiesForCategory(category);
      strategies.forEach(({ score, strategy }) => {
        categoryScores.set(strategy, (categoryScores.get(strategy) || 0) + score);
      });
    });

    // Find highest scoring strategy
    let bestStrategy = 'incremental-fix';
    let bestScore = 0;

    for (const [strategy, score] of categoryScores.entries()) {
      if (score > bestScore) {
        bestScore = score;
        bestStrategy = strategy;
      }
    }

    const strategyData =
      this.strategies.get(bestStrategy) || this.strategies.get('incremental-fix')!;

    return {
      confidence: strategyData.confidence * errorAnalysis.confidence,
      considerations: this.getRepairConsiderations(errorAnalysis),
      name: bestStrategy,
      pattern: this.getStrategyPattern(bestStrategy),
      riskLevel: this.calculateRiskLevel(strategyData),
      successRate: this.calculateSuccessRate(strategyData),
    };
  }

  async generateInsights(spec: WorkflowSpecification, attempts: RepairAttempt[]): Promise<string> {
    const insights: string[] = [];

    // Analyze success patterns
    if (attempts.length === 0) {
      insights.push('- First-time success! Workflow generated correctly on initial attempt.');
    } else {
      insights.push(`- Required ${attempts.length} repair iterations to achieve success.`);

      // Most common errors
      const errorFreq = this.calculateErrorFrequency(attempts);
      const topError = Array.from(errorFreq.entries()).sort((a, b) => b[1] - a[1])[0];
      if (topError) {
        insights.push(`- Most common error: ${topError[0]} (${topError[1]} occurrences)`);
      }

      // Strategy effectiveness
      const strategies = attempts.map((a) => a.repairStrategy);
      const uniqueStrategies = Array.from(new Set(strategies));
      insights.push(`- Strategies used: ${uniqueStrategies.join(', ')}`);
    }

    // Learning progress
    const learningRate = this.calculateLearningRate();
    insights.push(
      `- System learning rate: ${(learningRate * 100).toFixed(1)}% improvement over last 100 workflows`,
    );

    // Recommendations
    const recommendations = this.generateRecommendations(spec, attempts);
    if (recommendations.length > 0) {
      insights.push('\n## Recommendations for similar workflows:');
      recommendations.forEach((rec) => insights.push(`- ${rec}`));
    }

    return insights.join('\n');
  }

  private calculateStrategyScore(perf: StrategyPerformance, context: any): number {
    const successRate = this.calculateSuccessRate(perf);
    const efficiencyScore = perf.averageIterations > 0 ? 1 / perf.averageIterations : 0.5;
    const confidenceScore = perf.confidence;

    // Weight factors based on context
    let weights = { confidence: 0.2, efficiency: 0.3, success: 0.5 };

    if (context.complexity === 'high') {
      weights = { confidence: 0.2, efficiency: 0.1, success: 0.7 };
    }

    return (
      successRate * weights.success +
      efficiencyScore * weights.efficiency +
      confidenceScore * weights.confidence
    );
  }

  private calculateSuccessRate(perf: StrategyPerformance): number {
    const total = perf.successCount + perf.failureCount;
    return total > 0 ? perf.successCount / total : 0.5;
  }

  private calculateRiskLevel(perf: StrategyPerformance): 'low' | 'medium' | 'high' {
    const successRate = this.calculateSuccessRate(perf);
    const confidence = perf.confidence;

    const riskScore = (1 - successRate) * (1 - confidence);

    if (riskScore < 0.2) return 'low';
    if (riskScore < 0.5) return 'medium';
    return 'high';
  }

  private getStrategyPattern(strategy: string): string {
    const patterns: Record<string, string> = {
      'type-focused': 'Resolve all TypeScript type errors systematically',
      'contract-alignment': 'Ensure implementation matches input/output contracts exactly',
      'incremental-fix': 'Address errors one category at a time',
      'performance-optimization': 'Focus on timeout and performance issues',
      'syntax-first': 'Fix syntax and import errors before addressing logic',
      'test-driven': 'Fix test assertions to match correct behavior',
    };

    return patterns[strategy] || 'Standard incremental repair approach';
  }

  private getStrategyConsiderations(strategy: string, context: any): string[] {
    const considerations: string[] = [];

    if (context.complexity === 'high') {
      considerations.push('Break down complex operations into smaller steps');
      considerations.push('Add comprehensive error handling');
    }

    switch (strategy) {
      case 'syntax-first':
        considerations.push('Ensure all imports are correct');
        considerations.push('Check for missing dependencies');
        break;
      case 'type-focused':
        considerations.push('Align types with contracts');
        considerations.push('Use proper type assertions');
        break;
      case 'contract-alignment':
        considerations.push('Validate input/output schemas');
        considerations.push('Ensure contract compliance');
        break;
    }

    return considerations;
  }

  private getRepairConsiderations(errorAnalysis: ErrorAnalysis): string[] {
    const considerations: string[] = [];

    if (errorAnalysis.categories.includes('type-error')) {
      considerations.push('Check type definitions against contracts');
    }

    if (errorAnalysis.categories.includes('logic-error')) {
      considerations.push('Review business logic flow');
    }

    if (errorAnalysis.rootCauses && errorAnalysis.rootCauses.length > 0) {
      considerations.push(`Address root causes: ${errorAnalysis.rootCauses[0]}`);
    }

    return considerations;
  }

  private getStrategiesForCategory(category: ErrorCategory): { strategy: string; score: number }[] {
    const categoryStrategies: Record<ErrorCategory, { strategy: string; score: number }[]> = {
      'type-error': [
        { score: 0.9, strategy: 'type-focused' },
        { score: 0.7, strategy: 'contract-alignment' },
      ],
      'async-error': [{ score: 0.8, strategy: 'type-focused' }],
      'contract-violation': [{ score: 1.0, strategy: 'contract-alignment' }],
      'import-error': [{ score: 0.9, strategy: 'syntax-first' }],
      'logic-error': [
        { score: 0.8, strategy: 'incremental-fix' },
        { score: 0.6, strategy: 'test-driven' },
      ],
      'network-error': [{ score: 0.7, strategy: 'incremental-fix' }],
      'performance-issue': [{ score: 1.0, strategy: 'performance-optimization' }],
      'reference-error': [{ score: 0.8, strategy: 'syntax-first' }],
      'syntax-error': [{ score: 1.0, strategy: 'syntax-first' }],
    };

    return categoryStrategies[category] || [{ score: 0.5, strategy: 'incremental-fix' }];
  }

  private updateStrategies(event: LearningEvent): void {
    const strategy = this.strategies.get(event.repairStrategy) || {
      confidence: 0.5,
      averageIterations: 0,
      averageTime: 0,
      failureCount: 0,
      strategy: event.repairStrategy,
      successCount: 0,
    };

    if (event.success) {
      strategy.successCount++;
      strategy.confidence = Math.min(0.95, strategy.confidence + 0.02);
    } else {
      strategy.failureCount++;
      strategy.confidence = Math.max(0.1, strategy.confidence - 0.05);
    }

    // Update averages
    const totalEvents = strategy.successCount + strategy.failureCount;
    strategy.averageIterations =
      (strategy.averageIterations * (totalEvents - 1) + event.iterations) / totalEvents;
    strategy.averageTime =
      (strategy.averageTime * (totalEvents - 1) + event.timeToFix) / totalEvents;

    this.strategies.set(event.repairStrategy, strategy);

    // Save if threshold reached
    if (totalEvents % this.STRATEGY_UPDATE_THRESHOLD === 0) {
      this.saveStrategies();
    }
  }

  private detectNewPatterns(): void {
    // Group patterns by similarity
    const patternGroups = new Map<string, ErrorPattern[]>();

    for (const [key, pattern] of this.patterns.entries()) {
      const group = this.getPatternGroup(pattern);
      if (!patternGroups.has(group)) {
        patternGroups.set(group, []);
      }
      patternGroups.get(group)!.push(pattern);
    }

    // Identify emerging patterns
    for (const [group, patterns] of patternGroups.entries()) {
      if (patterns.length >= this.PATTERN_DETECTION_THRESHOLD) {
        const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;

        if (avgConfidence >= this.MIN_CONFIDENCE_THRESHOLD) {
          console.log(
            `🔍 New pattern detected: ${group} (confidence: ${(avgConfidence * 100).toFixed(1)}%)`,
          );

          // Create meta-pattern
          this.createMetaPattern(group, patterns);
        }
      }
    }
  }

  private getPatternGroup(pattern: ErrorPattern): string {
    // Simple grouping by error category and pattern prefix
    const prefix = pattern.pattern.split(':')[0];
    return `${pattern.category}:${prefix}`;
  }

  private createMetaPattern(group: string, patterns: ErrorPattern[]): void {
    // Aggregate successful fixes
    const allFixes = new Set<string>();
    patterns.forEach((p) => p.successfulFixes.forEach((f) => allFixes.add(f)));

    const metaPattern: ErrorPattern = {
      confidence: patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length,
      category: patterns[0].category,
      frequency: patterns.reduce((sum, p) => sum + p.frequency, 0),
      lastSeen: new Date(),
      pattern: `META:${group}`,
      successfulFixes: Array.from(allFixes),
    };

    this.patterns.set(metaPattern.pattern, metaPattern);
  }

  private extractPatternKey(error: any): string {
    // Extract key features from error for pattern matching
    const message = (error instanceof Error ? error.message : String(error)) || '';
    const category = error.category || 'unknown';

    // Remove specific identifiers to generalize pattern
    const generalizedMessage = message
      .replace(/['"`].*?['"`]/g, '<string>')
      .replace(/\d+/g, '<number>')
      .replace(/\b[A-Z][a-zA-Z]*\b/g, '<Type>');

    return `${category}:${generalizedMessage.substring(0, 50)}`;
  }

  private calculateTotalTime(attempts: RepairAttempt[]): number {
    if (attempts.length === 0) return 0;

    const first = attempts[0].timestamp;
    const last = attempts[attempts.length - 1].timestamp;

    return last.getTime() - first.getTime();
  }

  private calculateComplexity(spec: WorkflowSpecification): number {
    // Simple complexity metric
    const factors = {
      businessLogicSteps: spec.businessLogic.length,
      errorHandlers: spec.errorHandling?.length || 0,
      inputProperties: Object.keys(spec.inputContract.properties || {}).length,
      outputProperties: Object.keys(spec.outputContract.properties || {}).length,
    };

    return (
      factors.businessLogicSteps * 2 +
      factors.inputProperties +
      factors.outputProperties +
      factors.errorHandlers * 1.5
    );
  }

  private calculateErrorFrequency(attempts: RepairAttempt[]): Map<string, number> {
    const frequency = new Map<string, number>();

    attempts.forEach((attempt) => {
      attempt.errorAnalysis.categories.forEach((category) => {
        frequency.set(category, (frequency.get(category) || 0) + 1);
      });
    });

    return frequency;
  }

  private calculateLearningRate(): number {
    // Calculate improvement over last 100 workflows
    const recentEvents = this.events.slice(-100);
    if (recentEvents.length < 20) return 0;

    const firstHalf = recentEvents.slice(0, recentEvents.length / 2);
    const secondHalf = recentEvents.slice(recentEvents.length / 2);

    const firstHalfSuccess = firstHalf.filter((e) => e.success).length / firstHalf.length;
    const secondHalfSuccess = secondHalf.filter((e) => e.success).length / secondHalf.length;

    return Math.max(0, secondHalfSuccess - firstHalfSuccess);
  }

  private generateRecommendations(
    spec: WorkflowSpecification,
    attempts: RepairAttempt[],
  ): string[] {
    const recommendations: string[] = [];

    // Based on error patterns
    if (attempts.some((a) => a.errorAnalysis.categories.includes('contract-violation'))) {
      recommendations.push('Consider validating contracts before implementation');
    }

    if (attempts.some((a) => a.errorAnalysis.categories.includes('performance-issue'))) {
      recommendations.push('Add performance requirements to specification');
    }

    // Based on complexity
    const complexity = this.calculateComplexity(spec);
    if (complexity > 30) {
      recommendations.push('Break down complex workflows into smaller sub-workflows');
    }

    return recommendations;
  }

  // Public method for analytics
  getSystemMetrics(): any {
    const totalEvents = this.events.length;
    const successfulEvents = this.events.filter((e) => e.success).length;

    return {
      averageIterations:
        this.events.reduce((sum, e) => sum + e.iterations, 0) / Math.max(totalEvents, 1),
      knownPatterns: this.patterns.size,
      learningRate: this.calculateLearningRate(),
      strategies: Array.from(this.strategies.entries()).map(([name, perf]) => ({
        confidence: perf.confidence,
        name,
        successRate: this.calculateSuccessRate(perf),
      })),
      successRate: totalEvents > 0 ? successfulEvents / totalEvents : 0,
      totalWorkflows: totalEvents,
    };
  }
}
