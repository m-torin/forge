#!/usr/bin/env tsx

import { readFileSync } from 'fs';

import { AutonomousWorkflowSystem } from '../src/autonomous';
import { type WorkflowSpecification } from '../src/autonomous/types';
// Using console colors instead of chalk for simplicity
const chalk = {
  cyan: { bold: (str: string) => `\x1b[36m\x1b[1m${str}\x1b[0m` },
  gray: (str: string) => `\x1b[90m${str}\x1b[0m`,
  green: (str: string) => `\x1b[32m${str}\x1b[0m`,
  red: (str: string) => `\x1b[31m${str}\x1b[0m`,
  yellow: (str: string) => `\x1b[33m${str}\x1b[0m`,
};

async function testAutonomousSystem() {
  console.log(chalk.cyan.bold('🤖 Testing Autonomous Workflow Development System\n'));

  // Load the workflow specification
  const specPath = process.argv[2] || 'test-workflow-spec.json';
  const protocol = process.argv[3] || 'standard-workflow';

  let spec: WorkflowSpecification;
  try {
    const specContent = readFileSync(specPath, 'utf-8');
    spec = JSON.parse(specContent);
    console.log(chalk.green(`✅ Loaded workflow specification: ${spec.name}`));
    console.log(chalk.gray(`   Description: ${spec.description}`));
    console.log(chalk.gray(`   Type: ${spec.type || 'general'}`));
    console.log(chalk.gray(`   Business Logic Steps: ${spec.businessLogic.length}`));
  } catch (error) {
    console.error(chalk.red(`❌ Failed to load specification from ${specPath}:`), error.message);
    process.exit(1);
  }

  // Create the autonomous system
  const system = new AutonomousWorkflowSystem({
    commitOnSuccess: false, // Disable Git operations for demo
    enableLearning: true,
    generateReports: true,
    maxIterations: 10,
    useCICD: false, // Disable CI/CD for demo
  });

  console.log(chalk.yellow(`\n⏳ Starting autonomous development with protocol: ${protocol}\n`));

  try {
    // Show available protocols
    const protocols = system.getAvailableProtocols();
    console.log(chalk.cyan('Available protocols:'));
    protocols.forEach((p) => console.log(`  - ${p}`));
    console.log();

    // Execute the autonomous protocol
    const startTime = Date.now();
    const session = await system.executeZHIProtocol(spec, protocol);
    const duration = Date.now() - startTime;

    // Display results
    console.log(chalk.cyan.bold('\n📊 Execution Summary:\n'));
    console.log(`Session ID: ${chalk.gray(session.id)}`);
    console.log(
      `Status: ${session.status === 'succeeded' ? chalk.green(session.status) : chalk.red(session.status)}`,
    );
    console.log(`Duration: ${chalk.yellow(Math.round(duration / 1000) + ' seconds')}`);
    console.log(`Iterations: ${chalk.yellow(session.iterations.toString())}`);
    console.log(`Commits: ${chalk.yellow(session.commits.length.toString())}`);

    // Show execution logs
    console.log(chalk.cyan.bold('\n📜 Execution Log:\n'));
    const recentLogs = session.logs.slice(-20); // Show last 20 log entries
    recentLogs.forEach((log) => {
      if (log.includes('✅') || log.includes('Success')) {
        console.log(chalk.green(log));
      } else if (log.includes('❌') || log.includes('Failed')) {
        console.log(chalk.red(log));
      } else if (log.includes('⚠️')) {
        console.log(chalk.yellow(log));
      } else if (log.includes('📍')) {
        console.log(chalk.cyan(log));
      } else {
        console.log(chalk.gray(log));
      }
    });

    // Show metrics if available
    console.log(chalk.cyan.bold('\n📈 System Metrics:\n'));
    const metrics = await system.getSystemMetrics();
    console.log(`Total Workflows: ${metrics.totalWorkflows}`);
    console.log(`Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`);
    console.log(`Average Iterations: ${metrics.averageIterations.toFixed(1)}`);
    console.log(`Known Patterns: ${metrics.knownPatterns}`);
    console.log(`Learning Rate: ${(metrics.learningRate * 100).toFixed(1)}% improvement`);

    // Show generated files (simulated since we disabled Git)
    if (session.status === 'succeeded') {
      console.log(chalk.cyan.bold('\n📁 Generated Files (simulated):\n'));
      console.log(chalk.green(`  ✓ src/workflows/${spec.name}.ts`));
      console.log(chalk.green(`  ✓ tests/unit/${spec.name}.test.ts`));
      console.log(chalk.green(`  ✓ tests/e2e/${spec.name}.e2e.ts`));
    }

    process.exit(session.status === 'succeeded' ? 0 : 1);
  } catch (error) {
    console.error(chalk.red('\n❌ Fatal Error:'), error.message);
    console.error(chalk.gray(error.stack));
    process.exit(1);
  }
}

// Run the test
testAutonomousSystem().catch((error) => {
  console.error(chalk.red('Unhandled error:'), error);
  process.exit(1);
});
