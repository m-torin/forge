# Workflows App

A high-performance workflow execution system built with Next.js 15, React 19, and QStash. Designed
for development mode with real-time monitoring and detailed tracking.

## Features

### 🚀 Core Capabilities

- **Auto-discovery**: Automatically finds and loads workflows from the `/workflows` directory
- **Real-time monitoring**: WebSocket-based live updates of workflow execution
- **QStash integration**: Distributed workflow execution with Upstash QStash
- **High performance**: In-memory store optimized for development mode
- **Type-safe**: Full TypeScript support with comprehensive type definitions

### 🛠 Technology Stack

- **Next.js 15** with experimental features (PPR, React Compiler)
- **React 19** with concurrent features
- **Mantine UI v8** for modern interface components
- **QStash** for distributed job processing
- **WebSocket** for real-time communication
- **TypeScript** with strict type checking

### 📊 Monitoring & Analytics

- Real-time execution tracking
- Performance metrics and analytics
- Success/failure rate monitoring
- Resource usage tracking
- Detailed execution history

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Configure your environment variables:

```env
# QStash Configuration
QSTASH_TOKEN=your-qstash-token
QSTASH_CURRENT_SIGNING_KEY=your-signing-key
QSTASH_NEXT_SIGNING_KEY=your-next-signing-key

# WebSocket Configuration
WS_PORT=3101
NEXT_PUBLIC_WS_URL=ws://localhost:3101

# Development Configuration
NODE_ENV=development
LOG_LEVEL=debug
```

### 3. Start Development Server

```bash
pnpm dev
```

This starts:

- **Next.js app** on http://localhost:3100
- **WebSocket server** on ws://localhost:3101

## Creating Workflows

### Basic Workflow Structure

Create a workflow file in `/workflows/examples/my-workflow/workflow.ts`:

```typescript
interface MyWorkflowInput {
  name: string;
  value: number;
}

interface MyWorkflowOutput {
  result: string;
  timestamp: Date;
}

export default {
  id: 'my-workflow',
  name: 'My Custom Workflow',
  description: 'A simple example workflow',
  version: '1.0.0',
  category: 'examples',
  tags: ['example', 'simple'],
  author: 'Your Name',
  timeout: 30000, // 30 seconds
  retries: 2,
  concurrency: 5,

  // Optional input/output schemas for validation
  inputSchema: {
    type: 'object',
    required: ['name', 'value'],
    properties: {
      name: { type: 'string', minLength: 1 },
      value: { type: 'number', minimum: 0 },
    },
  },

  outputSchema: {
    type: 'object',
    required: ['result', 'timestamp'],
    properties: {
      result: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time' },
    },
  },

  async handler(input: MyWorkflowInput): Promise<MyWorkflowOutput> {
    console.log(`Processing workflow for: ${input.name}`);

    // Your workflow logic here
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      result: `Processed ${input.name} with value ${input.value}`,
      timestamp: new Date(),
    };
  },
};
```

### Workflow Discovery

The system automatically discovers workflows using these patterns:

- `/workflows/**/workflow.ts`
- `/workflows/**/definition.ts`
- `/workflows/**/index.ts`

Workflows are organized by directory structure and automatically categorized.

## Example Workflows

The app includes three example workflows:

### 1. Simple Payment Processing

- **Location**: `/workflows/examples/simple-payment/workflow.ts`
- **Purpose**: Simulate payment processing with Stripe-like API
- **Features**: 85% success rate, fee calculation, error handling

### 2. Email Campaign Sender

- **Location**: `/workflows/examples/email-campaign/workflow.ts`
- **Purpose**: Send marketing emails in batches
- **Features**: Batch processing, delivery tracking, cost calculation

### 3. AI Content Generation

- **Location**: `/workflows/examples/ai-content-generation/workflow.ts`
- **Purpose**: Generate content for various purposes (blog posts, social media, etc.)
- **Features**: Multiple content types, sentiment analysis, alternative versions

## API Endpoints

### Workflows

- `GET /api/workflows` - List all workflows
- `POST /api/workflows` - Execute a workflow
- `GET /api/workflows?category=payments` - Filter by category
- `GET /api/workflows?search=email` - Search workflows

### Executions

- `GET /api/executions` - List workflow executions
- `GET /api/executions?workflowId=payment` - Filter by workflow
- `GET /api/executions?status=running` - Filter by status

### Health

- `GET /api/health` - System health check and metrics

## Real-time Monitoring

### WebSocket Events

Connect to `ws://localhost:3101/ws` to receive real-time events:

```typescript
import { useWebSocket } from '@/lib'

function MyComponent() {
  const ws = useWebSocket()

  useEffect(() => {
    const unsubscribe = ws.subscribe('workflow-completed', (event) => {
      console.log('Workflow completed:', event)
    })

    return unsubscribe
  }, [ws])

  return <div>Monitoring workflows...</div>
}
```

### Event Types

- `workflow-started` - Workflow execution began
- `workflow-completed` - Workflow finished successfully
- `workflow-failed` - Workflow encountered an error
- `step-started` - Individual step began
- `step-completed` - Individual step finished
- `metrics-updated` - System metrics updated

## Architecture

### Core Components

1. **Workflow Registry** (`/lib/workflows/registry.ts`)

   - Auto-discovers and loads workflows
   - File watching for hot reload in development
   - Metadata extraction and validation

2. **Workflow Service** (`/lib/workflows/service.ts`)

   - High-level workflow management API
   - Execution orchestration
   - Analytics and monitoring

3. **QStash Client** (`/lib/qstash/client.ts`)

   - Distributed job execution
   - Retry and timeout handling
   - Webhook processing

4. **Memory Store** (`/lib/storage/memory-store.ts`)

   - High-performance in-memory execution tracking
   - Metrics and analytics
   - Cleanup and retention policies

5. **WebSocket Server** (`/lib/realtime/websocket-server.ts`)
   - Real-time event broadcasting
   - Client subscription management
   - Health monitoring

### Data Flow

1. **Workflow Discovery**: Registry scans `/workflows` directory
2. **Execution Request**: Client triggers workflow via API or UI
3. **QStash Queuing**: Job queued for distributed processing
4. **Real-time Updates**: WebSocket broadcasts execution events
5. **Result Storage**: Execution results stored in memory store
6. **Analytics**: Metrics updated and broadcast to connected clients

## Development Features

### Hot Reload

- Workflows automatically reload when files change
- No server restart required for workflow updates
- Real-time discovery of new workflows

### Debug Mode

- Detailed logging with configurable levels
- Execution tracing and performance metrics
- Error context and stack traces

### Performance Optimization

- In-memory storage for fast access
- Efficient WebSocket event handling
- Minimal overhead monitoring

## Configuration

### Environment Variables

```env
# QStash (Required for distributed execution)
QSTASH_TOKEN=your-token
QSTASH_CURRENT_SIGNING_KEY=your-key
QSTASH_NEXT_SIGNING_KEY=your-next-key

# WebSocket Server
WS_PORT=3101
NEXT_PUBLIC_WS_URL=ws://localhost:3101

# Performance Tuning
MAX_CONCURRENT_WORKFLOWS=10
WORKFLOW_TIMEOUT=300000
METRICS_RETENTION_DAYS=7

# Development
NODE_ENV=development
LOG_LEVEL=debug
NEXT_PUBLIC_APP_NAME=Workflows
```

### Customization

The system is highly configurable:

- Adjust timeout and retry policies per workflow
- Configure memory store retention policies
- Customize WebSocket event filtering
- Set performance monitoring intervals

## Deployment

While optimized for development, the app can be deployed to production:

1. **Vercel/Netlify**: Standard Next.js deployment
2. **Docker**: Container-ready with health checks
3. **Kubernetes**: Horizontal scaling with WebSocket considerations
4. **Edge**: CloudFlare Workers or Vercel Edge Functions

### Production Considerations

- Replace memory store with Redis for persistence
- Use external WebSocket service for scaling
- Implement proper error monitoring
- Add authentication and authorization
- Configure rate limiting and quotas

## Troubleshooting

### Common Issues

1. **Workflows not loading**

   - Check file naming conventions (`workflow.ts`, `definition.ts`, `index.ts`)
   - Verify export default structure
   - Check console for discovery errors

2. **WebSocket connection failed**

   - Verify `WS_PORT` environment variable
   - Check firewall settings
   - Ensure WebSocket server is running

3. **QStash execution failed**
   - Verify QStash token and signing keys
   - Check webhook URL accessibility
   - Review QStash dashboard for errors

### Debug Commands

```bash
# Check workflow discovery
curl http://localhost:3100/api/workflows

# Health check
curl http://localhost:3100/api/health

# View execution history
curl http://localhost:3100/api/executions

# Test WebSocket connection
wscat -c ws://localhost:3101/ws
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add workflows in `/workflows/examples/`
4. Update documentation
5. Submit a pull request

### Workflow Guidelines

- Follow TypeScript interfaces
- Include comprehensive error handling
- Add appropriate tags and categories
- Document input/output schemas
- Include realistic examples

## License

MIT License - see LICENSE file for details.
