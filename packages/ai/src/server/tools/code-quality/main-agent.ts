/**
 * Main Agent for Code Quality Analysis
 *
 * Provides improved user experience with:
 * - Real-time progress indicators
 * - Better error messages with recovery suggestions
 * - Support for large codebases (10k+ files)
 * - Graceful degradation when sub-agents fail
 * - Resource monitoring and optimization
 */

import { logError, logInfo, logWarn } from '@repo/observability';
import { agentRouter, createTaskRequest, type ProgressUpdate } from './agent-router';
import type { CodeQualityConfig, CodeQualitySession } from './types';

interface MainAgentOptions {
  maxFileCount?: number;
  batchSize?: number;
  memoryThresholdMB?: number;
  enableProgressReporting?: boolean;
  gracefulDegradation?: boolean;
  autoRetry?: boolean;
}

interface AnalysisPhase {
  name: string;
  description: string;
  estimatedMinutes: number;
  criticalForSuccess: boolean;
  dependencies?: string[];
}

interface RecoveryStrategy {
  phase: string;
  error: string;
  suggestions: string[];
  canContinue: boolean;
  fallbackAction?: () => Promise<any>;
}

export class MainAgent {
  private options: Required<MainAgentOptions>;
  private currentSession: CodeQualitySession | null = null;
  private progressHistory: ProgressUpdate[] = [];
  private phaseResults: Map<string, any> = new Map();
  private phases: AnalysisPhase[] = [];

  constructor(options: MainAgentOptions = {}) {
    this.options = {
      maxFileCount: options.maxFileCount ?? 10000,
      batchSize: options.batchSize ?? 100,
      memoryThresholdMB: options.memoryThresholdMB ?? 1500,
      enableProgressReporting: options.enableProgressReporting ?? true,
      gracefulDegradation: options.gracefulDegradation ?? true,
      autoRetry: options.autoRetry ?? true,
    };

    this.initializePhases();
    this.setupProgressTracking();
  }

  private initializePhases(): void {
    this.phases = [
      {
        name: 'context-setup',
        description: 'Setting up analysis context and environment',
        estimatedMinutes: 2,
        criticalForSuccess: true,
      },
      {
        name: 'worktree-creation',
        description: 'Creating isolated worktree for safe analysis',
        estimatedMinutes: 3,
        criticalForSuccess: true,
      },
      {
        name: 'file-discovery',
        description: 'Discovering and prioritizing files for analysis',
        estimatedMinutes: 4,
        criticalForSuccess: true,
      },
      {
        name: 'code-analysis',
        description: 'Analyzing code quality and detecting issues',
        estimatedMinutes: 15,
        criticalForSuccess: true,
        dependencies: ['file-discovery'],
      },
      {
        name: 'pattern-detection',
        description: 'Detecting architectural patterns and anti-patterns',
        estimatedMinutes: 6,
        criticalForSuccess: false,
        dependencies: ['code-analysis'],
      },
      {
        name: 'word-removal',
        description: 'Removing generic words and improving naming',
        estimatedMinutes: 8,
        criticalForSuccess: false,
        dependencies: ['code-analysis'],
      },
      {
        name: 'mock-centralization',
        description: 'Centralizing duplicate mocks',
        estimatedMinutes: 5,
        criticalForSuccess: false,
      },
      {
        name: 'dependency-modernization',
        description: 'Analyzing and modernizing dependencies',
        estimatedMinutes: 12,
        criticalForSuccess: false,
      },
      {
        name: 'vercel-optimization',
        description: 'Applying Vercel-specific optimizations',
        estimatedMinutes: 6,
        criticalForSuccess: false,
      },
      {
        name: 'report-generation',
        description: 'Generating comprehensive analysis report',
        estimatedMinutes: 3,
        criticalForSuccess: true,
        dependencies: ['code-analysis'],
      },
      {
        name: 'pr-creation',
        description: 'Creating pull request with improvements',
        estimatedMinutes: 4,
        criticalForSuccess: false,
        dependencies: ['report-generation'],
      },
    ];
  }

  private setupProgressTracking(): void {
    if (this.options.enableProgressReporting) {
      agentRouter.onProgress((update: ProgressUpdate) => {
        this.progressHistory.push(update);
        this.displayProgress(update);
      });
    }
  }

  private displayProgress(update: ProgressUpdate): void {
    const timestamp = new Date(update.timestamp).toLocaleTimeString();
    const progressBar = this.createProgressBar(update.progress);

    logInfo(`[${timestamp}] ${update.agentName}: ${progressBar} ${update.message}`);

    if (update.estimatedRemainingMinutes !== undefined && update.estimatedRemainingMinutes > 0) {
      logInfo(`   ⏱️  Estimated remaining: ${Math.ceil(update.estimatedRemainingMinutes)} minutes`);
    }
  }

  private createProgressBar(progress: number, width: number = 20): string {
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${progress.toFixed(0)}%`;
  }

  /**
   * Main analysis execution with enhanced error handling and progress tracking
   */
  public async executeAnalysis(
    userMessage: string,
    config: CodeQualityConfig = {},
  ): Promise<{
    success: boolean;
    results: Map<string, any>;
    errors: Array<{ phase: string; error: string; recovered: boolean }>;
    prUrl?: string;
    recommendations?: string[];
  }> {
    const startTime = Date.now();
    const errors: Array<{ phase: string; error: string; recovered: boolean }> = [];
    let prUrl: string | undefined;

    logInfo('🚀 Enhanced Code Quality Analysis Starting...');
    logInfo('='.repeat(60));

    this.displayAnalysisPlan();

    // Check system resources before starting
    await this.checkSystemResources();

    try {
      // Execute phases in order with proper error handling
      for (const phase of this.phases) {
        try {
          logInfo(`📋 Phase: ${phase.name}`);
          logInfo(`📝 ${phase.description}`);
          logInfo(`⏱️  Estimated time: ${phase.estimatedMinutes} minutes`);

          const result = await this.executePhase(phase, config, userMessage);
          this.phaseResults.set(phase.name, result);

          logInfo(`✅ Phase ${phase.name} completed successfully`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logError(`❌ Phase ${phase.name} failed: ${errorMessage}`);

          const recovery = await this.handlePhaseError(phase, errorMessage);
          errors.push({
            phase: phase.name,
            error: errorMessage,
            recovered: recovery.canContinue,
          });

          if (!recovery.canContinue && phase.criticalForSuccess) {
            logError(`🚨 Critical phase ${phase.name} failed - aborting analysis`);
            throw new Error(`Critical phase failure: ${phase.name} - ${errorMessage}`);
          }

          if (recovery.canContinue) {
            logWarn(`⚠️  Continuing with degraded functionality after ${phase.name} failure`);

            if (recovery.fallbackAction) {
              try {
                const fallbackResult = await recovery.fallbackAction();
                this.phaseResults.set(`${phase.name}-fallback`, fallbackResult);
                logInfo(`🔄 Fallback action for ${phase.name} completed`);
              } catch (fallbackError) {
                logWarn(`⚠️  Fallback action failed: ${fallbackError}`);
              }
            }
          }
        }

        // Memory check between phases
        if (this.isMemoryPressureHigh()) {
          logWarn('🧹 High memory usage detected - performing cleanup...');
          await this.performMemoryCleanup();
        }
      }

      // Extract PR URL if available
      const prResult = this.phaseResults.get('pr-creation');
      if (prResult && prResult.prUrl) {
        prUrl = prResult.prUrl;
      }

      const totalTime = Math.round((Date.now() - startTime) / 1000 / 60);
      logInfo(`\n✅ Analysis completed in ${totalTime} minutes`);

      return {
        success: errors.filter(e => !e.recovered).length === 0,
        results: this.phaseResults,
        errors,
        prUrl,
        recommendations: this.generateRecommendations(errors),
      };
    } catch (error) {
      logError('\n💥 Analysis failed with critical error:', { error });

      const recommendations = this.generateErrorRecoveryRecommendations(
        error instanceof Error ? error.message : String(error),
      );

      return {
        success: false,
        results: this.phaseResults,
        errors: [
          ...errors,
          {
            phase: 'critical-failure',
            error: error instanceof Error ? error.message : String(error),
            recovered: false,
          },
        ],
        recommendations,
      };
    }
  }

  private displayAnalysisPlan(): void {
    logInfo('\n📋 Analysis Plan:');
    logInfo('─'.repeat(60));

    let totalEstimatedTime = 0;
    this.phases.forEach((phase, index) => {
      const icon = phase.criticalForSuccess ? '🔴' : '🟡';
      const deps = phase.dependencies ? ` (depends on: ${phase.dependencies.join(', ')})` : '';
      logInfo(`${index + 1}. ${icon} ${phase.name} - ${phase.estimatedMinutes}min${deps}`);
      totalEstimatedTime += phase.estimatedMinutes;
    });

    logInfo('─'.repeat(60));
    logInfo(`📊 Total estimated time: ${totalEstimatedTime} minutes`);
    logInfo(`🔴 Critical phases: ${this.phases.filter(p => p.criticalForSuccess).length}`);
    logInfo(`🟡 Optional phases: ${this.phases.filter(p => !p.criticalForSuccess).length}`);
  }

  private async checkSystemResources(): Promise<void> {
    logInfo('\n🔍 System Resource Check:');

    const memoryUsage = process.memoryUsage();
    const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const memoryUtilization = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);

    logInfo(`   💾 Memory: ${memoryMB}MB used (${memoryUtilization}% utilization)`);

    if (memoryMB > this.options.memoryThresholdMB) {
      logWarn(
        `⚠️  High memory usage detected (${memoryMB}MB > ${this.options.memoryThresholdMB}MB threshold)`,
      );
      logWarn('🧹 Performing preemptive cleanup...');
      await this.performMemoryCleanup();
    }

    const resourceUsage = agentRouter.getResourceUsage();
    logInfo(`   🤖 Active agents: ${resourceUsage.activeTasks}`);
    logInfo(`   📊 Agent memory: ${resourceUsage.memoryUsageMB}MB`);

    logInfo('✅ Resource check completed\n');
  }

  private async executePhase(
    phase: AnalysisPhase,
    config: CodeQualityConfig,
    userMessage: string,
  ): Promise<any> {
    // Check dependencies
    if (phase.dependencies) {
      for (const dep of phase.dependencies) {
        if (!this.phaseResults.has(dep)) {
          throw new Error(`Dependency ${dep} not completed for phase ${phase.name}`);
        }
      }
    }

    // Create task request based on phase
    const task = this.createTaskForPhase(phase, config, userMessage);

    // Execute with router
    return await agentRouter.executeTask(task);
  }

  private createTaskForPhase(
    phase: AnalysisPhase,
    config: CodeQualityConfig,
    userMessage: string,
  ): any {
    const context = {
      config,
      userMessage,
      previousResults: Object.fromEntries(this.phaseResults),
      phase: phase.name,
    };

    switch (phase.name) {
      case 'context-setup':
        return createTaskRequest('detect_context', 'Setup analysis context', {
          priority: 'high',
          context,
        });

      case 'worktree-creation':
        return createTaskRequest('create_worktree', 'Create isolated worktree', {
          priority: 'high',
          context,
        });

      case 'file-discovery':
        return createTaskRequest('discover_files', 'Discover and prioritize files', {
          priority: 'high',
          context: {
            ...context,
            maxFiles: this.options.maxFileCount,
            batchSize: this.options.batchSize,
          },
        });

      case 'code-analysis':
        return createTaskRequest('analyze_code', 'Analyze code quality', {
          priority: 'high',
          timeoutMinutes: 25, // Longer timeout for analysis
          context,
        });

      case 'pattern-detection':
        return createTaskRequest('detect_patterns', 'Detect architectural patterns', {
          priority: 'medium',
          context,
        });

      case 'word-removal':
        return createTaskRequest('remove_words', 'Remove generic words', {
          priority: 'medium',
          context,
        });

      case 'mock-centralization':
        return createTaskRequest('centralize_mocks', 'Centralize duplicate mocks', {
          priority: 'low',
          context,
        });

      case 'dependency-modernization':
        return createTaskRequest('modernize_code', 'Modernize dependencies', {
          priority: 'medium',
          timeoutMinutes: 20,
          context,
        });

      case 'vercel-optimization':
        return createTaskRequest('vercel_optimization', 'Apply Vercel optimizations', {
          priority: 'low',
          context,
        });

      case 'report-generation':
        return createTaskRequest('generate_report', 'Generate analysis report', {
          priority: 'high',
          context,
        });

      case 'pr-creation':
        return createTaskRequest('create_pr', 'Create pull request', {
          priority: 'medium',
          context,
        });

      default:
        throw new Error(`Unknown phase: ${phase.name}`);
    }
  }

  private async handlePhaseError(
    phase: AnalysisPhase,
    errorMessage: string,
  ): Promise<RecoveryStrategy> {
    logWarn(`\n🔧 Analyzing error for phase ${phase.name}...`);

    // Define recovery strategies for different error types
    const strategies: RecoveryStrategy[] = [
      {
        phase: 'worktree-creation',
        error: 'worktree',
        suggestions: [
          'Ensure you have write permissions in the parent directory',
          'Check if Git is properly installed and accessible',
          'Verify the repository is in a clean state',
          'Try running: git worktree prune',
        ],
        canContinue: false, // Critical for safety
      },
      {
        phase: 'file-discovery',
        error: 'too many files',
        suggestions: [
          `Reduce maxFileCount below ${this.options.maxFileCount}`,
          'Add more specific include/exclude patterns',
          'Focus on specific directories with includePatterns config',
        ],
        canContinue: true,
        fallbackAction: async () => {
          logWarn('🔄 Falling back to analyzing only recently changed files...');
          return { limitToChangedFiles: true, maxFiles: 500 };
        },
      },
      {
        phase: 'code-analysis',
        error: 'timeout',
        suggestions: [
          'Increase timeout in config',
          'Reduce batch size for smaller chunks',
          'Focus analysis on specific file types',
        ],
        canContinue: true,
        fallbackAction: async () => {
          logWarn('🔄 Falling back to quick analysis mode...');
          return { analysisMode: 'quick', skipDeepAnalysis: true };
        },
      },
      {
        phase: 'dependency-modernization',
        error: 'compilation',
        suggestions: [
          'Review package.json for syntax errors',
          'Ensure all dependencies are properly installed',
          'Check for conflicting peer dependencies',
        ],
        canContinue: true,
        fallbackAction: async () => {
          logWarn('🔄 Skipping dependency updates due to compilation issues...');
          return { skipDependencyUpdates: true };
        },
      },
    ];

    // Find matching strategy
    const strategy = strategies.find(
      s =>
        phase.name.includes(s.phase) || errorMessage.toLowerCase().includes(s.error.toLowerCase()),
    );

    if (strategy) {
      logInfo('💡 Recovery suggestions:');
      strategy.suggestions.forEach((suggestion, index) => {
        logInfo(`   ${index + 1}. ${suggestion}`);
      });

      if (strategy.canContinue && this.options.gracefulDegradation) {
        logInfo(`✅ Phase ${phase.name} is non-critical - continuing with degraded functionality`);
      }

      return strategy;
    }

    // Default strategy for unknown errors
    const canContinue = !phase.criticalForSuccess && this.options.gracefulDegradation;

    return {
      phase: phase.name,
      error: errorMessage,
      suggestions: [
        'Check the error details above',
        'Ensure all prerequisites are met',
        'Try rerunning with increased timeout',
        'Report this issue if it persists',
      ],
      canContinue,
    };
  }

  private isMemoryPressureHigh(): boolean {
    const usage = process.memoryUsage();
    const memoryMB = Math.round(usage.heapUsed / 1024 / 1024);
    const utilization = (usage.heapUsed / usage.heapTotal) * 100;

    return memoryMB > this.options.memoryThresholdMB || utilization > 85;
  }

  private async performMemoryCleanup(): Promise<void> {
    const beforeMemory = process.memoryUsage();

    // Clear progress history (keep only recent)
    if (this.progressHistory.length > 50) {
      this.progressHistory = this.progressHistory.slice(-25);
    }

    // Clear old phase results (keep only essential)
    const essential = ['context-setup', 'file-discovery', 'code-analysis', 'report-generation'];
    for (const [key] of this.phaseResults) {
      if (!essential.includes(key) && !key.includes('fallback')) {
        this.phaseResults.delete(key);
      }
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const afterMemory = process.memoryUsage();
    const savedMB = Math.round((beforeMemory.heapUsed - afterMemory.heapUsed) / 1024 / 1024);

    if (savedMB > 0) {
      logInfo(`🧹 Memory cleanup freed ${savedMB}MB`);
    }
  }

  private generateRecommendations(
    errors: Array<{ phase: string; error: string; recovered: boolean }>,
  ): string[] {
    const recommendations: string[] = [];

    if (errors.length === 0) {
      recommendations.push('✅ Analysis completed without errors - excellent!');
      recommendations.push('📊 Review the generated report for insights');
      recommendations.push('🔄 Consider setting up automated quality checks');
      return recommendations;
    }

    const unrecoveredErrors = errors.filter(e => !e.recovered);
    const recoveredErrors = errors.filter(e => e.recovered);

    if (unrecoveredErrors.length > 0) {
      recommendations.push('🚨 Address critical errors for full analysis:');
      unrecoveredErrors.forEach(error => {
        recommendations.push(`   - ${error.phase}: ${error.error}`);
      });
    }

    if (recoveredErrors.length > 0) {
      recommendations.push('⚠️  Optional improvements that encountered issues:');
      recoveredErrors.forEach(error => {
        recommendations.push(`   - ${error.phase}: Consider manual review`);
      });
    }

    // General recommendations based on error patterns
    if (errors.some(e => e.error.includes('timeout'))) {
      recommendations.push('⏱️  Consider increasing timeout values for large codebases');
    }

    if (errors.some(e => e.error.includes('memory'))) {
      recommendations.push('💾 Consider running analysis in smaller batches');
    }

    if (errors.some(e => e.phase.includes('worktree'))) {
      recommendations.push('🔧 Check Git configuration and permissions');
    }

    return recommendations;
  }

  private generateErrorRecoveryRecommendations(errorMessage: string): string[] {
    const recommendations: string[] = [];

    recommendations.push('🚨 Critical analysis failure occurred');
    recommendations.push('🔧 Immediate actions to try:');

    if (errorMessage.includes('worktree')) {
      recommendations.push('   1. Check Git repository status and permissions');
      recommendations.push('   2. Run: git worktree prune');
      recommendations.push('   3. Ensure working directory is a valid Git repository');
    } else if (errorMessage.includes('memory')) {
      recommendations.push('   1. Close other memory-intensive applications');
      recommendations.push('   2. Reduce maxFileCount in configuration');
      recommendations.push('   3. Use smaller batch sizes');
    } else if (errorMessage.includes('timeout')) {
      recommendations.push('   1. Increase timeout values in configuration');
      recommendations.push('   2. Focus analysis on specific directories');
      recommendations.push('   3. Run analysis in smaller segments');
    } else {
      recommendations.push('   1. Check error logs for specific details');
      recommendations.push('   2. Verify all prerequisites are installed');
      recommendations.push('   3. Try rerunning with gracefulDegradation: true');
    }

    recommendations.push('📞 If issues persist, consider reporting the error');

    return recommendations;
  }

  /**
   * Get current analysis status and progress
   */
  public getStatus(): {
    currentPhase?: string;
    overallProgress: number;
    completedPhases: string[];
    failedPhases: string[];
    estimatedRemainingMinutes: number;
  } {
    const completedPhases = Array.from(this.phaseResults.keys());
    const failedPhases = this.progressHistory
      .filter(p => p.status === 'failed')
      .map(p => p.agentName);

    const totalPhases = this.phases.length;
    const overallProgress = (completedPhases.length / totalPhases) * 100;

    const remainingPhases = this.phases.slice(completedPhases.length);
    const estimatedRemainingMinutes = remainingPhases.reduce(
      (total, phase) => total + phase.estimatedMinutes,
      0,
    );

    return {
      currentPhase: remainingPhases[0]?.name,
      overallProgress,
      completedPhases,
      failedPhases,
      estimatedRemainingMinutes,
    };
  }

  /**
   * Cancel current analysis
   */
  public cancel(): void {
    logInfo('🛑 Cancelling analysis...');
    agentRouter.cancelAllTasks();
    this.phaseResults.clear();
    this.progressHistory = [];
    logInfo('✅ Analysis cancelled');
  }
}

// Export convenience function for easy usage
export async function runAnalysis(
  userMessage: string,
  config: CodeQualityConfig = {},
  options: MainAgentOptions = {},
): Promise<{
  success: boolean;
  results: Map<string, any>;
  errors: Array<{ phase: string; error: string; recovered: boolean }>;
  prUrl?: string;
  recommendations?: string[];
}> {
  const agent = new MainAgent(options);
  return await agent.executeAnalysis(userMessage, config);
}
