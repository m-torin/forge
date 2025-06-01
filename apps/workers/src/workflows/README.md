# Workflow Definitions

This directory contains local workflow definitions for the workers app. Each workflow definition is
a self-contained module that:

1. Imports the actual workflow implementation from `@repo/orchestration`
2. Provides local metadata and configuration
3. Defines default payloads for testing
4. Includes input/output schemas for validation

## Structure

```
workflows/
├── basic/
│   └── definition.ts       # Basic workflow definition
├── kitchen-sink/
│   └── definition.ts       # Kitchen sink workflow definition
├── image-processing/
│   └── definition.ts       # Image processing workflow definition
├── index.ts               # Registry and helper functions
└── README.md             # This file
```

## Workflow Definition Format

Each workflow definition exports an object with the following structure:

```typescript
export const workflowDefinition = {
  // Unique identifier
  id: string,

  // Display name
  name: string,

  // Description
  description: string,

  // Version
  version: string,

  // The actual workflow handler from @repo/orchestration
  handler: WorkflowFunction,

  // UI/documentation metadata
  metadata: {
    category: string,
    tags: string[],
    icon: string,
    color: string,
    estimatedDuration: string,
    features: string[],
    limitations?: string[]
  },

  // Default payload for testing
  defaultPayload: WorkflowPayload,

  // Runtime configuration
  config: {
    retries: number,
    timeout: number,
    queueConcurrency: number,
    enableDeduplication: boolean
  },

  // Input validation schema
  inputSchema: JSONSchema,

  // Output schema (optional)
  outputSchema?: JSONSchema
}
```

## Available Workflows

### Basic Workflow (`basic-workflow`)

- **Category**: Examples
- **Description**: Demonstrates core Upstash Workflow patterns
- **Features**: Sequential processing, parallel execution, priority sorting, approval gates
- **Use Cases**: Task queues, background jobs, batch processing

### Kitchen Sink Workflow (`kitchen-sink-workflow`)

- **Category**: Examples
- **Description**: Comprehensive workflow demonstrating ALL features
- **Features**: All workflow methods, QStash features, advanced patterns
- **Modes**: Full demo, ETL, order processing, orchestration, AI pipeline
- **Use Cases**: Learning, testing, feature exploration

### Image Processing Workflow (`image-processing-workflow`)

- **Category**: Media
- **Description**: Process images with multiple resolutions and filters
- **Features**: Multi-resolution, filters, format conversion, thumbnails
- **Note**: Demo workflow - simulates processing without actual image manipulation
- **Use Cases**: Image optimization, thumbnail generation, filter effects

## Using Workflow Definitions

### Import a specific workflow:

```typescript
import { basicWorkflow } from '@/workflows';

// Access the workflow handler
const handler = basicWorkflow.handler;

// Use the default payload
const payload = basicWorkflow.defaultPayload;
```

### Get all workflows:

```typescript
import { workflowRegistry, listWorkflows } from '@/workflows';

// Get all workflow definitions
const workflows = Object.values(workflowRegistry);

// List workflow summaries
const list = listWorkflows();
```

### Get workflows by category or tag:

```typescript
import { getWorkflowsByCategory, getWorkflowsByTag } from '@/workflows';

// Get all example workflows
const examples = getWorkflowsByCategory('examples');

// Get all workflows with 'batch-processing' tag
const batchWorkflows = getWorkflowsByTag('batch-processing');
```

## Adding New Workflows

To add a new workflow:

1. Create a new directory: `workflows/your-workflow/`
2. Create `definition.ts` following the format above
3. Import the workflow handler from `@repo/orchestration`
4. Add metadata, default payload, and schemas
5. Export from `workflows/index.ts`

Example:

```typescript
// workflows/your-workflow/definition.ts
import { yourWorkflow, type YourWorkflowPayload } from '@repo/orchestration';

export const workflowDefinition = {
  id: 'your-workflow',
  name: 'Your Workflow Name',
  // ... rest of definition
};
```

## Integration with API Routes

The workflow definitions are designed to work seamlessly with the API routes:

```typescript
// app/api/workflows/your-workflow/route.ts
import { serve } from '@upstash/workflow/nextjs';
import { withEnhancedContext } from '@repo/orchestration';
import { workflowDefinition } from '@/workflows/your-workflow/definition';

export const { POST } = serve(withEnhancedContext(workflowDefinition.handler), {
  retries: workflowDefinition.config.retries,
  // ... other config
});
```

## Testing Workflows

Each workflow includes a default payload for testing:

```typescript
// Test with default payload
const result = await fetch('/api/workflows/basic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(basicWorkflow.defaultPayload),
});
```

## Best Practices

1. **Keep definitions focused**: Each definition should wrap a single workflow
2. **Provide good defaults**: Default payloads should demonstrate key features
3. **Document limitations**: Be clear about what's simulated vs real
4. **Use type safety**: Export types for workflow payloads and definitions
5. **Validate inputs**: Use JSON schemas for runtime validation
6. **Version carefully**: Update versions when breaking changes occur
