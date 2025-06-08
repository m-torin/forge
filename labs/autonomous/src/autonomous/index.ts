// Main entry point for the autonomous workflow development system
import { AutonomousLoop } from './core/autonomous-loop';
import { ZeroHumanInterventionProtocol } from './protocols/zero-human-intervention';
import { WorkflowSpecification, AutonomousConfig } from './types';

// Export all core components
export { AutonomousLoop } from './core/autonomous-loop';
export { ClaudeWrapper } from './core/claude-wrapper';
export { TestRunner } from './core/test-runner';
export { ErrorAnalyzer } from './core/error-analyzer';
export { GitAutomation } from './core/git-automation';
export { LearningSystem } from './core/learning-system';
export { ZeroHumanInterventionProtocol } from './protocols/zero-human-intervention';

// Export types
export * from './types';

// Main autonomous system class
export class AutonomousWorkflowSystem {
  private autonomousLoop: AutonomousLoop;
  private zhiProtocol: ZeroHumanInterventionProtocol;

  constructor(config?: Partial<AutonomousConfig>) {
    this.autonomousLoop = new AutonomousLoop(config);
    this.zhiProtocol = new ZeroHumanInterventionProtocol();
  }

  /**
   * Process a workflow specification with full autonomy
   */
  async processWorkflow(specification: WorkflowSpecification): Promise<boolean> {
    return this.autonomousLoop.processWorkflow(specification);
  }

  /**
   * Execute a zero-human-intervention protocol
   */
  async executeZHIProtocol(specification: WorkflowSpecification, protocolName?: string) {
    return this.zhiProtocol.executeProtocol(specification, protocolName);
  }

  /**
   * Get available ZHI protocols
   */
  getAvailableProtocols(): string[] {
    return this.zhiProtocol.getAvailableProtocols();
  }

  /**
   * Get system metrics and learning insights
   */
  async getSystemMetrics() {
    const learningSystem = new (await import('./core/learning-system')).LearningSystem();
    return learningSystem.getSystemMetrics();
  }
}

// CLI interface for standalone execution
if (require.main === module) {
  const main = async () => {
    console.log('🤖 Autonomous Workflow Development System');
    console.log('========================================\n');

    // Example workflow specification
    const exampleSpec: WorkflowSpecification = {
      name: 'example-workflow',
      description: 'Example autonomous workflow',
      inputContract: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
        required: ['message'],
      },
      outputContract: {
        type: 'object',
        properties: {
          result: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
      businessLogic: ['Validate input message', 'Process message', 'Return result with timestamp'],
      errorHandling: ['Retry on failure', 'Log errors'],
    };

    const system = new AutonomousWorkflowSystem();

    // Check command line arguments
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'process':
        console.log('Processing workflow with standard autonomous loop...');
        const success = await system.processWorkflow(exampleSpec);
        console.log(`\nResult: ${success ? '✅ Success' : '❌ Failed'}`);
        break;

      case 'zhi':
        const protocol = args[1] || 'standard-workflow';
        console.log(`Executing ZHI protocol: ${protocol}`);
        const session = await system.executeZHIProtocol(exampleSpec, protocol);
        console.log(`\nSession ID: ${session.id}`);
        console.log(`Status: ${session.status}`);
        console.log(`Iterations: ${session.iterations}`);
        break;

      case 'protocols':
        console.log('Available ZHI Protocols:');
        const protocols = system.getAvailableProtocols();
        protocols.forEach((p) => console.log(`  - ${p}`));
        break;

      case 'metrics':
        console.log('System Metrics:');
        const metrics = await system.getSystemMetrics();
        console.log(JSON.stringify(metrics, null, 2));
        break;

      default:
        console.log('Usage:');
        console.log('  tsx src/autonomous/index.ts process     - Process workflow');
        console.log('  tsx src/autonomous/index.ts zhi [protocol] - Execute ZHI protocol');
        console.log('  tsx src/autonomous/index.ts protocols   - List available protocols');
        console.log('  tsx src/autonomous/index.ts metrics     - Show system metrics');
        break;
    }

    process.exit(0);
  };

  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
