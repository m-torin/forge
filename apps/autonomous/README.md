# Autonomous Workflow Development System

This application implements a fully autonomous workflow development and repair system using Claude CLI for self-healing Upstash code generation.

## Overview

The Autonomous Workflow Development System uses AI-powered code generation to create, test, and deploy Upstash Workflow functions with zero human intervention. It features self-healing capabilities, continuous learning, and comprehensive testing integration.

## Key Features

- **Zero-Human-Intervention (ZHI) Protocols**: Three autonomous development protocols for different use cases
- **AI-Powered Code Generation**: Uses Claude CLI programmatically for intelligent code creation
- **Self-Healing Capabilities**: Automatically detects and repairs errors through iterative improvement
- **Continuous Learning**: Learns from each workflow to improve future generation strategies
- **Comprehensive Testing**: Integrates Vitest and Playwright for thorough validation
- **Git Automation**: Automated version control, branching, and pull request creation

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm
- Claude CLI installed and configured
- Git configured with appropriate permissions

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Running the System

```bash
# Run the demo
pnpm autonomous:demo

# Test with a workflow specification
pnpm autonomous:test test-workflow-spec.json

# Execute a ZHI protocol
pnpm autonomous:zhi

# Start the web interface
pnpm dev
```

## Workflow Specification Format

Create a JSON file with your workflow specification:

```json
{
  "name": "workflow-name",
  "description": "Workflow description",
  "type": "notification|data-processing|api-integration",
  "inputContract": {
    "type": "object",
    "properties": { ... },
    "required": [ ... ]
  },
  "outputContract": {
    "type": "object",
    "properties": { ... }
  },
  "businessLogic": [
    "Step 1 description",
    "Step 2 description",
    ...
  ],
  "errorHandling": [
    "Error handling strategy 1",
    "Error handling strategy 2",
    ...
  ],
  "performance": {
    "timeout": 30000,
    "retries": 3
  }
}
```

## Available Protocols

### 1. Standard Workflow Development
- Complete autonomous development cycle
- Comprehensive testing and validation
- Git operations and PR creation
- 30-minute timeout

### 2. Rapid Prototype
- Quick MVP generation
- Relaxed validation
- Basic testing only
- 15-minute timeout

### 3. High Reliability
- Extensive validation and testing
- Security scanning
- Performance benchmarks
- Quality gates
- 60-minute timeout

## Architecture

```
src/autonomous/
├── core/
│   ├── autonomous-loop.ts      # Main orchestrator
│   ├── claude-wrapper.ts       # Claude CLI integration
│   ├── test-runner.ts          # Test execution
│   ├── error-analyzer.ts       # Error categorization
│   ├── git-automation.ts       # Version control
│   └── learning-system.ts      # ML and pattern recognition
├── protocols/
│   └── zero-human-intervention.ts  # ZHI protocol implementations
├── features/
│   ├── code-generator.ts       # AI-powered generation
│   ├── test-generator.ts       # Test creation
│   └── repair-engine.ts        # Self-healing logic
├── types/
│   └── index.ts               # TypeScript definitions
└── index.ts                   # Entry point
```

## Environment Variables

```env
# Claude CLI Configuration
CLAUDE_MODEL=claude-3-opus-20240229
CLAUDE_MAX_TOKENS=8192
CLAUDE_TEMPERATURE=0.2

# Upstash Configuration
UPSTASH_WORKFLOW_URL=
UPSTASH_WORKFLOW_TOKEN=
QSTASH_URL=
QSTASH_TOKEN=

# Git Configuration
GITHUB_TOKEN=
GIT_AUTHOR_NAME=Autonomous System
GIT_AUTHOR_EMAIL=autonomous@example.com

# Feature Flags
ENABLE_AUTONOMOUS_LEARNING=true
ENABLE_GIT_OPERATIONS=false
ENABLE_CI_CD_INTEGRATION=false
```

## Development

```bash
# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build
pnpm build
```

## Safety and Security

- Git operations are disabled by default (enable via `ENABLE_GIT_OPERATIONS`)
- All generated code goes through security scanning in high-reliability mode
- Comprehensive error handling and rollback capabilities
- Audit logs for all autonomous operations

## Research Paper

This implementation is based on the research paper:
"Autonomous Workflow Development and Repair System Using Claude CLI for Self-Healing Upstash Code Generation"

Key contributions:
- Zero-human-intervention development protocols
- Self-healing code generation strategies
- Continuous learning from development patterns
- Integration of AI with traditional software engineering practices

## License

MIT