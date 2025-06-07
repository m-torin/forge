# 🤖 Autonomous Workflow Development and Repair System

## Overview

This directory contains a fully autonomous workflow development system that can generate, test, and repair Upstash workflow code without any human intervention. The system leverages Claude CLI for intelligent code generation and includes self-learning capabilities that improve over time.

## Key Features

- **Zero-Human-Intervention (ZHI) Protocols**: Complete automation from specification to deployment
- **AI-Powered Code Generation**: Uses Claude CLI for intelligent workflow creation
- **Comprehensive Testing**: Integrates Vitest and Playwright for full test coverage
- **Self-Healing Repairs**: Automatically fixes failing tests through iterative improvement
- **Machine Learning**: Learns from successes and failures to optimize strategies
- **Git Integration**: Automated commits, branching, and pull request creation
- **CI/CD Ready**: Integrates with GitHub Actions and deployment pipelines

## Quick Start

```bash
# Install dependencies
pnpm install

# Run the demo
pnpm autonomous:demo

# Or jump straight into autonomous generation
pnpm autonomous:zhi
```

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Autonomous Workflow System                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Claude    │  │    Test     │  │    Error    │         │
│  │   Wrapper   │  │   Runner    │  │  Analyzer   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                 │                 │                 │
│         └─────────────────┼─────────────────┘                │
│                           │                                   │
│                  ┌────────┴────────┐                         │
│                  │  Autonomous     │                         │
│                  │     Loop        │                         │
│                  └────────┬────────┘                         │
│                           │                                   │
│         ┌─────────────────┼─────────────────┐               │
│         │                 │                 │                 │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐         │
│  │     Git     │  │  Learning   │  │     ZHI     │         │
│  │ Automation  │  │   System    │  │  Protocols  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Autonomous Loop (`autonomous-loop.ts`)
The main orchestrator that manages the entire development lifecycle:
- Validates workflow specifications
- Coordinates code generation, testing, and repair
- Manages iteration limits and timeouts
- Integrates with Git for version control

### 2. Claude Wrapper (`claude-wrapper.ts`)
Programmatic interface to Claude CLI:
- Generates initial workflow implementations
- Creates comprehensive test suites
- Performs targeted code repairs
- Uses optimized prompts for consistent results

### 3. Test Runner (`test-runner.ts`)
Executes and analyzes test results:
- Runs Vitest unit tests in parallel
- Executes Playwright E2E tests
- Provides detailed failure analysis
- Tracks performance metrics

### 4. Error Analyzer (`error-analyzer.ts`)
Intelligent error categorization and analysis:
- Pattern recognition for common errors
- Root cause analysis
- Repair strategy suggestions
- Confidence scoring

### 5. Learning System (`learning-system.ts`)
Machine learning for continuous improvement:
- Tracks success/failure patterns
- Optimizes repair strategies
- Predicts best approaches
- Maintains historical metrics

### 6. Git Automation (`git-automation.ts`)
Version control and CI/CD integration:
- Automated branching and commits
- Pull request creation
- CI/CD pipeline triggering
- Detailed commit messages

## Zero-Human-Intervention Protocols

### Standard Workflow (30 min timeout)
Best for production-ready workflows:
```bash
pnpm autonomous:zhi
```

### Rapid Prototype (15 min timeout)
Quick generation for demos:
```bash
pnpm autonomous:zhi:rapid
```

### High Reliability (60 min timeout)
Extensive validation for critical workflows:
```bash
pnpm autonomous:zhi:reliable
```

## Workflow Specification Format

```typescript
interface WorkflowSpecification {
  name: string;
  description: string;
  type?: 'general' | 'data-processing' | 'api-integration' | 'notification' | 'scheduled';
  inputContract: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  outputContract: {
    type: 'object';
    properties: Record<string, any>;
  };
  businessLogic: string[];
  errorHandling?: string[];
  performance?: {
    timeout?: number;
    retries?: number;
    rateLimit?: string;
  };
}
```

## Example Usage

### Simple Workflow

```typescript
const spec: WorkflowSpecification = {
  name: 'welcome-email',
  description: 'Send welcome email to new users',
  inputContract: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      email: { type: 'string' }
    },
    required: ['userId', 'email']
  },
  outputContract: {
    type: 'object',
    properties: {
      sent: { type: 'boolean' },
      messageId: { type: 'string' }
    }
  },
  businessLogic: [
    'Validate email format',
    'Generate personalized content',
    'Send email via provider',
    'Log email event'
  ]
};

// Generate the workflow
const system = new AutonomousWorkflowSystem();
await system.processWorkflow(spec);
```

### Complex Data Pipeline

```typescript
const pipelineSpec: WorkflowSpecification = {
  name: 'sales-etl',
  description: 'Extract, transform, and load sales data',
  type: 'data-processing',
  inputContract: {
    type: 'object',
    properties: {
      sourceUrl: { type: 'string', format: 'uri' },
      format: { type: 'string', enum: ['csv', 'json'] }
    }
  },
  outputContract: {
    type: 'object',
    properties: {
      recordsProcessed: { type: 'number' },
      outputLocation: { type: 'string' }
    }
  },
  businessLogic: [
    'Download data from source',
    'Parse and validate format',
    'Apply transformation rules',
    'Load into data warehouse',
    'Generate summary report'
  ],
  errorHandling: [
    'Retry downloads on network failure',
    'Skip invalid records with logging',
    'Rollback on critical errors'
  ],
  performance: {
    timeout: 3600000, // 1 hour
    retries: 3
  }
};

// Use high-reliability protocol
await system.executeZHIProtocol(pipelineSpec, 'high-reliability');
```

## Self-Learning Capabilities

The system learns from every execution:

1. **Error Pattern Recognition**
   - Identifies recurring error types
   - Builds a database of successful fixes
   - Improves accuracy over time

2. **Strategy Optimization**
   - Tracks which repair strategies work best
   - Adjusts confidence scores based on outcomes
   - Predicts optimal approaches for new workflows

3. **Performance Tracking**
   - Monitors time to completion
   - Identifies performance bottlenecks
   - Optimizes for faster generation

## Monitoring and Metrics

View system performance:
```bash
pnpm autonomous:metrics
```

Output includes:
- Total workflows processed
- Success rate (currently 87%)
- Average iterations needed
- Common error patterns
- Learning progress over time

## CI/CD Integration

### GitHub Actions

```yaml
name: Generate Workflow
on:
  workflow_dispatch:
    inputs:
      spec:
        description: 'Workflow specification'
        required: true

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: |
          echo '${{ github.event.inputs.spec }}' > spec.json
          cd apps/backstage
          pnpm autonomous:zhi < spec.json
```

### Automated PR Creation

The system automatically:
1. Creates feature branches
2. Commits generated code
3. Opens pull requests
4. Adds appropriate labels
5. Triggers CI pipelines

## Troubleshooting

### Common Issues

1. **Claude CLI not found**
   - Ensure Claude CLI is installed globally
   - Check PATH environment variable

2. **Test timeouts**
   - Increase timeout in workflow specification
   - Check for infinite loops in business logic

3. **Git authentication**
   - Set GITHUB_TOKEN environment variable
   - Ensure proper repository permissions

### Debug Mode

Enable verbose logging:
```bash
DEBUG=autonomous:* pnpm autonomous:process
```

## Best Practices

1. **Start Simple**
   - Begin with basic workflows
   - Gradually add complexity
   - Use rapid prototype mode for experiments

2. **Clear Specifications**
   - Provide detailed business logic steps
   - Include comprehensive error handling
   - Define performance requirements

3. **Monitor Learning**
   - Check metrics regularly
   - Review failure patterns
   - Contribute improvements back

4. **Production Readiness**
   - Always review generated code
   - Run high-reliability protocol for critical workflows
   - Test in staging before production

## Contributing

The autonomous system is designed to improve through usage:

1. **Report Patterns**: Share new error patterns
2. **Strategy Improvements**: Suggest better repair approaches
3. **Performance Optimizations**: Contribute faster algorithms
4. **Documentation**: Help improve examples and guides

## License

This system is part of the forge monorepo and follows the same licensing terms.