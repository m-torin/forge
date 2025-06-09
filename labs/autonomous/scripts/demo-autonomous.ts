#!/usr/bin/env tsx

// Demo script for the autonomous workflow development system
import { AutonomousWorkflowSystem } from '../src/autonomous';
import { type WorkflowSpecification } from '../src/autonomous/types';

// Using console colors instead of chalk for simplicity
const chalk = {
  blue: (str: string) => `\x1b[34m${str}\x1b[0m`,
  cyan: Object.assign((str: string) => `\x1b[36m${str}\x1b[0m`, {
    bold: (str: string) => `\x1b[36m\x1b[1m${str}\x1b[0m`,
  }),
  gray: (str: string) => `\x1b[90m${str}\x1b[0m`,
  green: (str: string) => `\x1b[32m${str}\x1b[0m`,
  red: (str: string) => `\x1b[31m${str}\x1b[0m`,
  yellow: (str: string) => `\x1b[33m${str}\x1b[0m`,
};

// Example workflow specifications
const workflowExamples: Record<string, WorkflowSpecification> = {
  'customer-onboarding': {
    name: 'customer-onboarding',
    type: 'notification',
    businessLogic: [
      'Create user profile with default settings',
      'Send welcome email immediately',
      'Wait 1 day',
      'Send getting started guide',
      'Wait 3 days',
      'Check if user has logged in',
      'If not logged in, send reminder email',
      'If logged in, send feature tips email',
      'Wait 7 days',
      'Send feedback survey',
      'Mark onboarding as complete',
    ],
    description: 'Automated customer onboarding workflow with email sequences',
    errorHandling: [
      'Retry email sending up to 3 times with exponential backoff',
      'Log failed email attempts to monitoring system',
      'Continue workflow even if individual emails fail',
      'Send daily summary of failed onboardings to ops team',
    ],
    inputContract: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        plan: { type: 'string', enum: ['free', 'pro', 'enterprise'] },
        userId: { type: 'string' },
      },
      required: ['userId', 'email', 'name', 'plan'],
    },
    outputContract: {
      type: 'object',
      properties: {
        nextActions: { type: 'array', items: { type: 'string' } },
        onboardingSteps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              completed: { type: 'boolean' },
              step: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
        success: { type: 'boolean' },
      },
    },
    performance: {
      retries: 3,
      timeout: 14 * 24 * 60 * 60 * 1000, // 14 days
    },
  },

  'data-pipeline': {
    name: 'data-pipeline',
    type: 'data-processing',
    businessLogic: [
      'Validate source URL accessibility',
      'Download data file with progress tracking',
      'Parse file based on format',
      'Validate data schema',
      'Clean and normalize data',
      'Apply business rules and transformations',
      'Calculate aggregations and summaries',
      'Store processed data in database',
      'Generate summary report',
      'Send completion notification',
    ],
    description: 'ETL pipeline for processing sales data',
    errorHandling: [
      'Implement checkpoint/restart capability',
      'Handle partial file downloads',
      'Skip invalid records and log to error file',
      'Alert on >10% failure rate',
      'Automatic rollback on critical errors',
    ],
    inputContract: {
      type: 'object',
      properties: {
        dateRange: {
          type: 'object',
          properties: {
            end: { type: 'string', format: 'date' },
            start: { type: 'string', format: 'date' },
          },
        },
        format: { type: 'string', enum: ['csv', 'json', 'xml'] },
        sourceUrl: { type: 'string', format: 'uri' },
      },
      required: ['sourceUrl', 'format'],
    },
    outputContract: {
      type: 'object',
      properties: {
        outputLocation: { type: 'string' },
        recordsFailed: { type: 'number' },
        recordsProcessed: { type: 'number' },
        summary: {
          type: 'object',
          properties: {
            processingTime: { type: 'number' },
            topProducts: { type: 'array', items: { type: 'string' } },
            totalRevenue: { type: 'number' },
          },
        },
      },
    },
    performance: {
      rateLimit: '1000 records/second',
      retries: 2,
      timeout: 3600000, // 1 hour
    },
  },

  'api-integration': {
    name: 'api-integration',
    type: 'api-integration',
    businessLogic: [
      'Authenticate with CRM API',
      'Authenticate with email marketing API',
      'Fetch entities from CRM based on sync type',
      'Transform CRM data to email platform format',
      'Batch entities for efficient API calls',
      'Upsert entities to email platform',
      'Handle rate limiting with backoff',
      'Verify sync completeness',
      'Update sync metadata',
      'Generate sync report',
    ],
    description: 'Sync data between CRM and email marketing platform',
    errorHandling: [
      'Implement OAuth token refresh',
      'Handle API rate limits gracefully',
      'Retry failed API calls with exponential backoff',
      'Log all API errors with request/response details',
      'Fallback to batch processing on streaming API failure',
    ],
    inputContract: {
      type: 'object',
      properties: {
        entityTypes: {
          type: 'array',
          items: { type: 'string', enum: ['contacts', 'companies', 'deals'] },
        },
        lastSyncTimestamp: { type: 'string', format: 'date-time' },
        syncType: { type: 'string', enum: ['full', 'incremental'] },
      },
      required: ['syncType', 'entityTypes'],
    },
    outputContract: {
      type: 'object',
      properties: {
        errors: { type: 'array', items: { type: 'object' } },
        nextSyncTimestamp: { type: 'string', format: 'date-time' },
        syncedEntities: {
          type: 'object',
          properties: {
            companies: { type: 'number' },
            contacts: { type: 'number' },
            deals: { type: 'number' },
          },
        },
      },
    },
  },
};

async function runNonInteractiveDemo() {
  const system = new AutonomousWorkflowSystem();

  console.log(chalk.cyan.bold('\n🤖 Autonomous Workflow Development System Demo\n'));

  // Show available workflows
  console.log('Available workflow examples:');
  Object.entries(workflowExamples).forEach(([key, spec], index) => {
    console.log(
      `${chalk.yellow((index + 1).toString())}. ${chalk.green(key)} - ${spec.description}`,
    );
  });

  // Use the first workflow for demo
  const workflowKey = 'customer-onboarding';
  const spec = workflowExamples[workflowKey];

  console.log(chalk.cyan.bold(`\n🚀 Selected: ${spec.name}\n`));
  console.log(chalk.gray('Specification:'));
  console.log(JSON.stringify(spec, null, 2));

  // Show available protocols
  const protocols = system.getAvailableProtocols();
  console.log(chalk.cyan.bold('\n📋 Available Protocols:\n'));
  protocols.forEach((p) => {
    console.log(`  • ${chalk.green(p)}`);
  });

  const protocol = 'standard-workflow';
  console.log(chalk.yellow(`\n⏳ Starting autonomous development with ${protocol}...\n`));

  try {
    const startTime = Date.now();
    const session = await system.executeZHIProtocol(spec, protocol);
    const duration = Date.now() - startTime;

    console.log(chalk.cyan.bold('\n📋 Session Summary:\n'));
    console.log(`ID: ${chalk.gray(session.id)}`);
    console.log(
      `Status: ${session.status === 'succeeded' ? chalk.green(session.status) : chalk.red(session.status)}`,
    );
    console.log(`Iterations: ${chalk.yellow(session.iterations.toString())}`);
    console.log(`Duration: ${chalk.yellow(Math.round(duration / 1000) + 's')}`);
    console.log(`Commits: ${chalk.yellow(session.commits.length.toString())}`);

    if (session.pullRequest) {
      console.log(`PR: ${chalk.blue(session.pullRequest.url)}`);
    }

    console.log(chalk.cyan.bold('\n📜 Logs:\n'));
    session.logs.slice(-10).forEach((log) => {
      if (log.includes('✅')) {
        console.log(chalk.green(log));
      } else if (log.includes('❌')) {
        console.log(chalk.red(log));
      } else {
        console.log(chalk.gray(log));
      }
    });

    // Show metrics
    console.log(chalk.cyan.bold('\n📊 System Metrics:\n'));
    const metrics = await system.getSystemMetrics();
    console.log(JSON.stringify(metrics, null, 2));
  } catch (error) {
    console.error(
      chalk.red(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}`),
    );
  }
}

// Run the demo
if (require.main === module) {
  runNonInteractiveDemo().catch((error) => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}
