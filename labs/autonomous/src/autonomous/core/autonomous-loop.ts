import {
  type AutonomousConfig,
  type ErrorCategory,
  type RepairAttempt,
  type WorkflowSpecification,
} from '../types';

import { ClaudeAIWrapper } from './claude-ai-wrapper';
// Core autonomous development loop orchestrator
import { ClaudeWrapper } from './claude-wrapper';
import { ErrorAnalyzer } from './error-analyzer';
import { GitAutomation } from './git-automation';
import { LearningSystem } from './learning-system';
import { TestRunner } from './test-runner';

export class AutonomousLoop {
  private claudeWrapper: ClaudeWrapper | ClaudeAIWrapper;
  private testRunner: TestRunner;
  private errorAnalyzer: ErrorAnalyzer;
  private gitAutomation: GitAutomation;
  private learningSystem: LearningSystem;
  private config: AutonomousConfig;
  private learningData: RepairAttempt[] = [];

  constructor(config?: Partial<AutonomousConfig>) {
    this.config = {
      commitOnSuccess: process.env.ENABLE_GIT_OPERATIONS === 'true',
      enableLearning: true,
      generateReports: true,
      maxIterations: 10,
      useCICD: process.env.ENABLE_CI_CD_INTEGRATION === 'true',
      ...config,
    };

    // Use AI SDK wrapper for demo mode (no Claude CLI required)
    const useAISDK = process.env.USE_AI_SDK !== 'false';
    this.claudeWrapper = useAISDK ? new ClaudeAIWrapper() : new ClaudeWrapper();

    this.testRunner = new TestRunner();
    this.errorAnalyzer = new ErrorAnalyzer();
    this.gitAutomation = new GitAutomation();
    this.learningSystem = new LearningSystem();
  }

  async processWorkflow(specification: WorkflowSpecification): Promise<boolean> {
    console.log(`🚀 Starting autonomous development for workflow: ${specification.name}`);

    // Validate specification completeness
    const validation = await this.validateSpecification(specification);
    if (!validation.isValid) {
      throw new Error(`Incomplete workflow specification: ${validation.errors.join(', ')}`);
    }

    // Create feature branch
    if (this.config.commitOnSuccess) {
      await this.gitAutomation.createFeatureBranch(specification.name);
    }

    let iteration = 0;
    let allTestsPassed = false;

    while (iteration < this.config.maxIterations && !allTestsPassed) {
      console.log(`\n📍 Iteration ${iteration + 1}/${this.config.maxIterations}`);

      try {
        // Generate or repair code
        const codeGenerated =
          iteration === 0
            ? await this.generateInitialCode(specification)
            : await this.repairCode(specification, this.learningData);

        if (!codeGenerated) {
          console.error('❌ Code generation/repair failed');
          break;
        }

        // Run comprehensive tests
        const testResult = await this.testRunner.runAllTests(specification);

        if (testResult.allPassed) {
          console.log('✅ All tests passed!');
          allTestsPassed = true;

          // Learn from success
          if (this.config.enableLearning) {
            await this.learningSystem.recordSuccess(specification, iteration, this.learningData);
          }

          // Commit success
          if (this.config.commitOnSuccess) {
            await this.gitAutomation.commitSuccess(specification, iteration);
          }
        } else {
          console.log('❌ Tests failed, analyzing...');

          // Analyze failures
          const errorAnalysis = await this.errorAnalyzer.analyzeFailures(testResult);

          // Record learning data
          this.recordLearningData(specification, errorAnalysis, iteration);

          // Learn from failure
          if (this.config.enableLearning) {
            await this.learningSystem.learnFromError(errorAnalysis);
          }

          // Commit iteration progress
          if (this.config.commitOnSuccess) {
            await this.gitAutomation.commitIteration(specification, iteration, errorAnalysis);
          }
        }
      } catch (error) {
        console.error(`💥 Iteration ${iteration + 1} failed:`, error);
        this.recordFailure(specification, error, iteration);
      }

      iteration++;
    }

    // Generate final report
    if (this.config.generateReports) {
      if (allTestsPassed) {
        await this.generateSuccessReport(specification, iteration);
      } else {
        await this.gitAutomation.createFailureReport(specification, this.learningData);
      }
    }

    // Create pull request if successful
    if (allTestsPassed && this.config.commitOnSuccess && this.config.useCICD) {
      await this.gitAutomation.createAutonomousPR(specification, {
        fixesApplied: this.learningData.map((d) => d.errorAnalysis.suggestedStrategy),
        iterations: iteration,
        success: true,
        successRate: 100,
        testPassRate: 100,
        totalTime: Date.now(),
      });
    }

    return allTestsPassed;
  }

  private async generateInitialCode(spec: WorkflowSpecification): Promise<boolean> {
    console.log('🎨 Generating initial code...');

    // Get optimal strategy from learning system
    const strategy = await this.learningSystem.getPredictedStrategy({
      complexity: this.calculateComplexity(spec),
      workflowType: spec.type || 'general',
    });

    return await this.claudeWrapper.generateWorkflowCode(spec, strategy);
  }

  private async repairCode(
    spec: WorkflowSpecification,
    learningData: RepairAttempt[],
  ): Promise<boolean> {
    console.log('🔧 Attempting code repair...');
    const lastAttempt = learningData[learningData.length - 1];

    // Get repair strategy from learning system
    const strategy = await this.learningSystem.getRepairStrategy(lastAttempt.errorAnalysis);

    return await this.claudeWrapper.repairCode(spec, lastAttempt.errorAnalysis, strategy);
  }

  private async validateSpecification(
    spec: WorkflowSpecification,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!spec.name) errors.push('Missing workflow name');
    if (!spec.inputContract) errors.push('Missing input contract');
    if (!spec.outputContract) errors.push('Missing output contract');
    if (!spec.businessLogic || spec.businessLogic.length === 0)
      errors.push('Missing business logic');

    // Validate contract schemas
    if (spec.inputContract && !this.isValidSchema(spec.inputContract)) {
      errors.push('Invalid input contract schema');
    }

    if (spec.outputContract && !this.isValidSchema(spec.outputContract)) {
      errors.push('Invalid output contract schema');
    }

    return { isValid: errors.length === 0, errors };
  }

  private isValidSchema(schema: any): boolean {
    return (
      schema && typeof schema === 'object' && (schema.type || schema.properties || schema.$ref)
    );
  }

  private calculateComplexity(spec: WorkflowSpecification): 'low' | 'medium' | 'high' {
    const factors = {
      businessLogicSteps: spec.businessLogic.length,
      hasErrorHandling: spec.errorHandling && spec.errorHandling.length > 0,
      hasPerformanceReqs: spec.performance !== undefined,
      inputProperties: Object.keys(spec.inputContract.properties || {}).length,
      outputProperties: Object.keys(spec.outputContract.properties || {}).length,
    };

    const score =
      factors.businessLogicSteps * 2 +
      factors.inputProperties +
      factors.outputProperties +
      (factors.hasErrorHandling ? 3 : 0) +
      (factors.hasPerformanceReqs ? 2 : 0);

    if (score < 10) return 'low';
    if (score < 20) return 'medium';
    return 'high';
  }

  private recordLearningData(
    spec: WorkflowSpecification,
    errorAnalysis: any,
    iteration: number,
  ): void {
    this.learningData.push({
      complexity: this.calculateComplexity(spec),
      errorAnalysis,
      iteration,
      repairStrategy: errorAnalysis.suggestedStrategy,
      timestamp: new Date(),
      workflowName: spec.name,
    });
  }

  private recordFailure(spec: WorkflowSpecification, error: any, iteration: number): void {
    this.learningData.push({
      complexity: this.calculateComplexity(spec),
      errorAnalysis: {
        confidence: 0,
        categories: ['logic-error' as ErrorCategory],
        errors: [
          {
            confidence: 0,
            category: 'logic-error' as ErrorCategory,
            file: 'unknown',
            line: 0,
            message: error instanceof Error ? error.message : String(error),
          },
        ],
        suggestedStrategy: 'manual-intervention-required',
        testFailures: [],
      },
      iteration,
      repairStrategy: 'manual-intervention-required',
      timestamp: new Date(),
      workflowName: spec.name,
    });
  }

  private async generateSuccessReport(
    spec: WorkflowSpecification,
    iterations: number,
  ): Promise<void> {
    const report = `# Autonomous Development Success Report

## Workflow: ${spec.name}

**Status**: ✅ Successfully completed
**Iterations**: ${iterations}
**Timestamp**: ${new Date().toISOString()}

## Generated Files
- \`src/workflows/${spec.name}.ts\` - Main workflow implementation
- \`tests/unit/${spec.name}.test.ts\` - Unit tests
- \`tests/e2e/${spec.name}.e2e.ts\` - End-to-end tests

## Validation Results
- ✅ All TypeScript compilation successful
- ✅ All unit tests passing
- ✅ All E2E tests passing
- ✅ Contract compliance verified
- ✅ Performance requirements met

## Learning Insights
${await this.learningSystem.generateInsights(spec, this.learningData)}

## Next Steps
- Ready for production deployment
- Consider adding monitoring and observability
- Review generated documentation
`;

    await this.gitAutomation.createReport(spec.name, 'success', report);
  }

  // Public method to trigger CI/CD pipeline
  async triggerCICDPipeline(workflowName: string): Promise<void> {
    if (this.config.useCICD) {
      await this.gitAutomation.triggerGitHubAction('autonomous-deploy', {
        environment: 'production',
        workflow: workflowName,
      });
    }
  }
}
