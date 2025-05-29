# Building a Complex Scraping Application with Upstash Workflow, Next.js 15, and Cloudflare Workers

## Upstash Workflow Context Methods

The workflow context object provides several methods for orchestrating your workflow:

### context.run(name, fn)

Execute a step in your workflow. Each step is individually retryable and tracked.

```typescript
const result = await context.run('step-name', async () => {
  // Step logic here
  return data;
});
```

### context.sleep(name, seconds)

Pause workflow execution for a specified duration (in seconds).

```typescript
await context.sleep('wait-before-retry', 60); // Wait 1 minute
```

### context.sleepUntil(name, timestamp)

Pause workflow execution until a specific timestamp.

```typescript
await context.sleepUntil('wait-until-tomorrow', new Date(Date.now() + 86400000));
```

### context.call(name, options)

Make HTTP requests that don't count toward function execution time (up to 2 hours).

```typescript
const response = await context.call('api-request', {
  url: 'https://api.example.com/data',
  method: 'POST',
  headers: { Authorization: 'Bearer token' },
  body: { key: 'value' },
});
```

### context.waitForEvent(name, eventId, options)

Wait for external events before proceeding.

```typescript
const { eventData, timeout } = await context.waitForEvent(
  'user-approval', // Description of event
  'approval-123', // Unique event ID
  { timeout: 3600 } // Timeout in seconds (1 hour)
);

// Check if event timed out
if (timeout) {
  // Handle timeout scenario
  throw new Error('Approval timeout exceeded');
}

// Use the event data
const { approved, approvedBy } = eventData;
```

**Important**: Maximum timeout value equals your QStash plan's "Max Delay":

- Free tier: 7 days
- Pay as you go: 1 year
- Pro tier: Unlimited

### context.notify(stepName, eventId, eventData)

Send events from within a workflow to other waiting workflows.

```typescript
const { notifyResponse } = await context.notify(
  'notify-completion', // Step name
  'process-complete-123', // Event ID
  { status: 'done', processedItems: 100 } // Event data
);
```

### context.cancel(workflowRunId)

Cancel another running workflow.

```typescript
await context.cancel('other-workflow-run-id');
```

### Context Properties

The context object also provides access to important workflow information:

```typescript
// Unique identifier for the current workflow run
context.workflowRunId;

// The request payload passed to the workflow
context.requestPayload;

// HTTP headers from the initial request
context.headers;

// Environment variables (when configured)
context.env;

// QStash client for advanced operations
context.qstashClient;
```

## Architecture overview

The architecture leverages a serverless-first approach combining Upstash Workflow for orchestration,
Next.js 15 App Router for the frontend and API layer, and Cloudflare Workers for edge computing.
This creates a highly scalable, fault-tolerant scraping system with global distribution
capabilities.

Upstash Workflow is built on top of QStash, Upstash's messaging and scheduling solution, providing
durable and reliable serverless function orchestration. This edge-first architecture ensures
low-latency execution close to users while maintaining the benefits of serverless patterns including
automatic scaling and pay-per-use pricing.

### Core Components and Interactions

**1. Upstash Workflow Engine**: Acts as the central orchestrator built on QStash, providing:

- **Step-based execution**: Each step is an individual HTTP request with automatic retries
- **At-least-once delivery guarantees**: Failed requests are logged in Dead Letter Queue
- **State persistence**: Complete workflow state maintained by QStash until completion
- **Long-running support**: HTTP calls via `context.call` can run up to 2 hours

**2. Next.js 15 App Router**: Provides the API endpoints and UI layer with server actions for
workflow triggers, streaming responses for real-time updates, and error boundaries for graceful
failure handling.

**3. Cloudflare Workers**: Enables edge execution with Durable Objects for state persistence,
Worker-to-Worker communication for distributed tasks, and global rate limiting across edge
locations.

**4. Data Layer**: Upstash Redis for workflow state storage and caching, QStash for message queuing
and event coordination, and Cloudflare KV/D1 for edge-based data persistence.

## Prerequisites

Before starting, ensure you have:

1. **Upstash Account**: Sign up at [console.upstash.com](https://console.upstash.com)
2. **QStash API Key**: Get from your [QStash dashboard](https://console.upstash.com/qstash)
3. **Node.js**: Version 18+ and npm/pnpm/bun installed
4. **Next.js Knowledge**: Basic understanding of Next.js App Router

## Implementation Guide

### Step 1: Project Setup and Configuration

```bash
# Initialize Next.js 15 project
npx create-next-app@latest scraping-app --typescript --app --tailwind

# Install dependencies
npm install @upstash/workflow @upstash/redis @upstash/qstash
npm install @opennextjs/cloudflare zod

# Development dependencies
npm install -D @cloudflare/workers-types wrangler
```

**Note**: In October 2024, Upstash released the new `@upstash/workflow` SDK. If you were using
`@upstash/qstash` for workflows, refer to the
[migration guide](https://upstash.com/docs/workflow/migration).

### Step 2: Environment Configuration

Create a `.env.local` file in your project root and add your QStash token:

```bash
touch .env.local
```

For local development, you have two options:

#### Option 1: Local QStash Server (Recommended for Development)

Run the local QStash server:

```bash
npx @upstash/qstash-cli dev
```

Once running, add these values to your `.env.local`:

```env
QSTASH_URL="http://127.0.0.1:8080"
QSTASH_TOKEN=<LOCAL_QSTASH_TOKEN>
```

**Benefits**: No billing impact, isolated testing environment  
**Limitation**: Runs won't appear in Upstash Console

#### Option 2: Local Tunnel (Production-like Testing)

Set up a local tunnel (e.g., ngrok, localtunnel) and add to `.env.local`:

```env
QSTASH_TOKEN=your_production_qstash_token
QSTASH_CURRENT_SIGNING_KEY=your_signing_key
QSTASH_NEXT_SIGNING_KEY=your_next_signing_key
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
UPSTASH_WORKFLOW_URL=https://your-tunnel-url.ngrok.io
```

**Benefits**: Real QStash integration, logs visible in Upstash Console  
**Note**: Uses production QStash and affects billing

### Step 3: Upstash Workflow Core Implementation

```typescript
// app/api/workflow/route.ts
import { serve } from '@upstash/workflow/nextjs';
import { Redis } from '@upstash/redis';

interface ScrapingPayload {
  urls: string[];
  selectors: Record<string, string>;
  config: {
    maxConcurrency: number;
    retryAttempts: number;
    rateLimitPerMinute: number;
    enableDeduplication: boolean;
    cacheResults: boolean;
    waitForApproval?: boolean;
    scheduleCron?: string;
  };
}

export const { POST } = serve<ScrapingPayload>(
  async (context) => {
    const { urls, selectors, config } = context.requestPayload;
    const redis = Redis.fromEnv();

    // Step 1: Initialize scraping session
    const sessionId = await context.run('init-session', async () => {
      const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await redis.hset(`session:${id}`, {
        status: 'initializing',
        totalUrls: urls.length,
        createdAt: Date.now(),
      });
      return id;
    });

    // Step 2: Validate and deduplicate URLs
    const validUrls = await context.run('validate-urls', async () => {
      const uniqueUrls = [...new Set(urls)];
      const validated = uniqueUrls.filter((url) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });

      if (config.enableDeduplication) {
        const deduped = [];
        for (const url of validated) {
          const exists = await redis.exists(`scraped:${hashUrl(url)}`);
          if (!exists) deduped.push(url);
        }
        return deduped;
      }

      return validated;
    });

    // Step 3: Fan-out scraping with controlled concurrency
    const batches = chunkArray(validUrls, config.maxConcurrency);
    const allResults = [];

    // Optional: Wait for external approval before proceeding
    if (config.waitForApproval) {
      await context.run('request-approval', async () => {
        await sendApprovalNotification({
          sessionId,
          urlCount: validUrls.length,
          workflowRunId: context.workflowRunId,
        });
      });

      // Wait for approval event (1 hour timeout)
      const approvalEvent = await context.waitForEvent('scraping-approval', sessionId, {
        timeout: 3600,
      });

      if (!approvalEvent?.approved) {
        throw new Error('Scraping was not approved');
      }
    }

    for (const [batchIndex, batch] of batches.entries()) {
      const batchResults = await Promise.all(
        batch.map((url, urlIndex) =>
          context.run(`scrape-${batchIndex}-${urlIndex}`, async () => {
            // Apply rate limiting
            const domain = new URL(url).hostname;
            await applyRateLimit(redis, domain, config.rateLimitPerMinute);

            // Execute scraping with retry logic
            for (let attempt = 0; attempt < config.retryAttempts; attempt++) {
              try {
                // Use context.call for HTTP requests (doesn't count toward function execution time)
                const result = await context.call(`scrape-attempt-${attempt}`, {
                  url: 'https://api.scrapfly.io/scrape',
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${process.env.SCRAPFLY_API_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: {
                    url,
                    render_js: true,
                    format: 'json',
                  },
                  timeout: 30000,
                });

                if (result.status === 200) {
                  const extracted = extractWithSelectors(result.body, selectors);

                  // Cache successful results
                  if (config.cacheResults) {
                    await redis.setex(`scraped:${hashUrl(url)}`, 3600, JSON.stringify(extracted));
                  }

                  return { url, data: extracted, success: true };
                }
              } catch (error) {
                if (attempt === config.retryAttempts - 1) {
                  return { url, error: error.message, success: false };
                }
                // Use context.sleep for delays between retries
                await context.sleep(`retry-${attempt}`, Math.pow(2, attempt));
              }
            }
          })
        )
      );

      allResults.push(...batchResults);

      // Update session progress
      await context.run(`update-progress-${batchIndex}`, async () => {
        await redis.hset(`session:${sessionId}`, {
          progress: Math.round(((batchIndex + 1) / batches.length) * 100),
          processedUrls: allResults.length,
        });
      });
    }

    // Step 4: Aggregate and store final results
    const finalResult = await context.run('finalize-results', async () => {
      const successful = allResults.filter((r) => r.success);
      const failed = allResults.filter((r) => !r.success);

      await redis.hset(`session:${sessionId}`, {
        status: 'completed',
        successCount: successful.length,
        failureCount: failed.length,
        completedAt: Date.now(),
      });

      return {
        sessionId,
        results: successful,
        errors: failed,
        summary: {
          total: urls.length,
          processed: allResults.length,
          successful: successful.length,
          failed: failed.length,
          deduplicated: urls.length - validUrls.length,
        },
      };
    });

    return finalResult;
  },
  {
    retries: 2,
    verbose: true,
    flowControl: {
      key: 'main-scraping-workflow',
      rate: 10,
      period: '1m',
      parallelism: 5,
    },
    failureFunction: async ({ context, failStatus, failResponse }) => {
      const redis = Redis.fromEnv();
      await redis.lpush(
        'failed-workflows',
        JSON.stringify({
          workflowRunId: context.workflowRunId,
          failStatus,
          failResponse,
          timestamp: Date.now(),
        })
      );
    },
  }
);
```

### Step 4: Running and Testing Workflows

Start your Next.js development server:

```bash
npm run dev
```

Trigger your workflow with a POST request:

```bash
curl -X POST http://localhost:3000/api/workflow

# Response: {"workflowRunId":"wfr_xxxxxx"}
```

**Note for Pages Router**: If using Next.js Pages Router, always send the `content-type: text/plain`
header:

```bash
curl -X POST http://localhost:3000/api/workflow \
  -H "Content-Type: text/plain"
```

Track workflow execution:

- **Local QStash Server**: Check console logs
- **Local Tunnel**: View in [QStash Dashboard](https://console.upstash.com/qstash)

```typescript
// app/api/workflow/scheduled/route.ts
import { serve } from '@upstash/workflow/nextjs';

// Scheduled scraping workflow (runs via cron)
export const { POST } = serve<{ source: string }>(async (context) => {
  const { source } = context.requestPayload;

  // Fetch configuration for scheduled scraping
  const config = await context.run('fetch-schedule-config', async () => {
    return await getScheduledScrapingConfig(source);
  });

  // Execute scraping with configured targets
  const results = await context.run('scheduled-scrape', async () => {
    return await executeScheduledScraping(config);
  });

  // Send summary report
  await context.run('send-report', async () => {
    await sendScrapingSummaryEmail({
      results,
      scheduledTime: new Date().toISOString(),
      nextRun: calculateNextRun(config.cron),
    });
  });

  return { processed: results.length, source };
});

// Long-running workflow with extended delays
export const { POST: processDataset } = serve<{
  datasetUrl: string;
  processingStages: string[];
}>(async (context) => {
  const { datasetUrl, processingStages } = context.requestPayload;

  // Download large dataset (can run up to 2 hours)
  const dataset = await context.call('download-dataset', {
    url: datasetUrl,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.DATASET_API_KEY}`,
    },
  });

  // Process in stages with delays
  const results = [];
  for (const [index, stage] of processingStages.entries()) {
    const stageResult = await context.run(`process-stage-${stage}`, async () => {
      return await processDataStage(dataset, stage);
    });

    results.push(stageResult);

    // Long delay between stages (e.g., wait for external system readiness)
    if (index < processingStages.length - 1) {
      await context.sleepUntil(`wait-for-${stage}`, new Date(Date.now() + 86400000)); // 24 hours
    }
  }

  return { stages: results, completedAt: new Date().toISOString() };
});

// AI-powered data extraction example
export const { POST: aiExtraction } = serve<{
  content: string;
  extractionPrompt: string;
}>(async (context) => {
  const { content, extractionPrompt } = context.requestPayload;

  // Use AI to extract structured data (doesn't count toward execution time)
  const { body: aiResponse } = await context.call('ai-extraction', {
    url: 'https://api.openai.com/v1/chat/completions',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that extracts structured data from text.',
        },
        {
          role: 'user',
          content: `${extractionPrompt}\n\nContent: ${content}`,
        },
      ],
    },
  });

  const extractedData = aiResponse.choices[0].message.content;

  // Validate and store extracted data
  await context.run('validate-ai-extraction', async () => {
    const parsed = JSON.parse(extractedData);
    await redis.hset(`ai-extracted:${Date.now()}`, parsed);
    return parsed;
  });

  return { extracted: extractedData };
});
```

### Step 5: Advanced Workflow Patterns

```typescript
// app/api/scraping/route.ts
export { POST } from "@/app/api/workflow/route";

// app/api/notify/route.ts
import { Client } from "@upstash/qstash";

export async function POST(request: Request) {
  const { eventId, eventData } = await request.json();

  const client = new Client({ token: process.env.QSTASH_TOKEN! });

  // Notify waiting workflows
  await client.publishJSON({
    url: `${process.env.UPSTASH_WORKFLOW_URL}/notify`,
    body: {
      eventId,
      eventData
    }
  });

  return Response.json({ success: true });
}

// app/api/workflow/triggers/route.ts
import { Client } from "@upstash/workflow";

export async function POST(request: Request) {
  const body = await request.json();

  const client = new Client({ token: process.env.QSTASH_TOKEN! });

  // Trigger with optional custom workflow run ID
  const { workflowRunId } = await client.trigger({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/workflow`,
    body,
    headers: {
      "X-Custom-Header": "value"
    },
    workflowRunId: body.customId || undefined, // Optional custom ID
    retries: 3 // Retries for initial request
  });

  return Response.json({ workflowRunId });
}

// Schedule a workflow with cron
export async function PUT(request: Request) {
  const { cron, workflowData } = await request.json();

  const client = new Client({ token: process.env.QSTASH_TOKEN! });

  // Create scheduled workflow
  const schedule = await client.schedules.create({
    destination: `${process.env.NEXT_PUBLIC_APP_URL}/api/workflow/scheduled`,
    cron,
    body: JSON.stringify(workflowData),
    headers: {
      "Content-Type": "application/json"
    }
  });

  return Response.json({ scheduleId: schedule.scheduleId });
}

// app/hooks/useWorkflowStatus.ts
import { Client } from "@upstash/workflow";
import { useEffect, useState } from "react";

interface WorkflowStatus {
  state: "RUN_STARTED" | "RUN_SUCCESS" | "RUN_FAILED" | "RUN_CANCELED";
  steps: Array<{
    stepName: string;
    stepType: string;
    startedAt: number;
    completedAt?: number;
    status: string;
  }>;
  createdAt: number;
  completedAt?: number;
}

export function useWorkflowStatus(workflowRunId: string) {
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = new Client({ token: process.env.NEXT_PUBLIC_QSTASH_TOKEN! });

    const pollStatus = async () => {
      try {
        const { runs } = await client.logs({
          workflowRunId,
          count: 1
        });

        if (runs.length > 0) {
          setStatus(runs[0]);

          // Stop polling if workflow is complete
          if (["RUN_SUCCESS", "RUN_FAILED", "RUN_CANCELED"].includes(runs[0].state)) {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error("Failed to fetch workflow status:", error);
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(pollStatus, 2000);
    pollStatus(); // Initial fetch

    return () => clearInterval(interval);
  }, [workflowRunId]);

  return { status, loading };
}

// app/workflows/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { triggerScraping } from './actions';

export default function WorkflowsPage() {
  const [state, formAction] = useFormState(triggerScraping, null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (state?.sessionId) {
      const eventSource = new EventSource(`/api/scraping/status/${state.sessionId}`);

      eventSource.onmessage = (event) => {
        setStatus(JSON.parse(event.data));
      };

      return () => eventSource.close();
    }
  }, [state?.sessionId]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Scraping Workflows</h1>

      <form action={formAction} className="space-y-4">
        <textarea
          name="urls"
          placeholder="Enter URLs (one per line)"
          className="w-full h-32 p-2 border rounded"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="maxConcurrency"
            placeholder="Max Concurrency"
            defaultValue={5}
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="rateLimitPerMinute"
            placeholder="Rate Limit/Min"
            defaultValue={60}
            className="p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Start Scraping
        </button>
      </form>

      {status && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Status</h2>
          <div className="space-y-2">
            <p>Session: {state.sessionId}</p>
            <p>Status: {status.status}</p>
            <p>Progress: {status.progress}%</p>
            <p>Processed: {status.processedUrls} / {status.totalUrls}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 6: Next.js 15 App Router Integration

```typescript
// workers/scraper-worker.ts
import { DurableObject } from 'cloudflare:workers';

export class ScraperDurableObject extends DurableObject {
  private activeConnections: Set<WebSocket> = new Set();

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    switch (url.pathname) {
      case '/execute':
        return this.handleExecute(request);
      case '/status':
        return this.handleStatus();
      case '/ws':
        return this.handleWebSocket(request);
      default:
        return new Response('Not found', { status: 404 });
    }
  }

  private async handleExecute(request: Request) {
    const data = await request.json();
    const { urls, selectors } = data;

    // Store workflow state
    await this.ctx.storage.put('workflow', {
      id: crypto.randomUUID(),
      urls,
      selectors,
      status: 'running',
      createdAt: Date.now(),
    });

    // Schedule execution
    await this.ctx.storage.setAlarm(Date.now() + 1000);

    return new Response('Workflow started', { status: 202 });
  }

  async alarm() {
    const workflow = await this.ctx.storage.get('workflow');
    if (!workflow || workflow.status !== 'running') return;

    // Execute scraping logic
    try {
      const results = await this.executeScraping(workflow);

      await this.ctx.storage.put('workflow', {
        ...workflow,
        status: 'completed',
        results,
        completedAt: Date.now(),
      });

      // Notify connected clients
      this.broadcast({
        type: 'workflow-complete',
        data: results,
      });
    } catch (error) {
      await this.ctx.storage.put('workflow', {
        ...workflow,
        status: 'failed',
        error: error.message,
      });

      this.broadcast({
        type: 'workflow-failed',
        error: error.message,
      });
    }
  }

  private broadcast(message: any) {
    const data = JSON.stringify(message);
    this.activeConnections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }
}

// workers/index.ts
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Rate limiting check
    const { success } = await env.RATE_LIMITER.limit({
      key: request.headers.get('CF-Connecting-IP') || 'unknown',
    });

    if (!success) {
      return new Response('Rate limit exceeded', {
        status: 429,
        headers: { 'Retry-After': '60' },
      });
    }

    // Route to appropriate handler
    if (url.pathname.startsWith('/scraper')) {
      const id = env.SCRAPER_DO.idFromName(url.searchParams.get('id') || 'default');
      const scraperDO = env.SCRAPER_DO.get(id);
      return scraperDO.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  },
};
```

### Step 7: Cloudflare Workers Implementation

```typescript
// types/workflow.types.ts
import { z } from 'zod';

// Workflow payload validation with Zod
export const ScrapingConfigSchema = z.object({
  urls: z.array(z.string().url()),
  selectors: z.record(z.string()),
  config: z
    .object({
      maxConcurrency: z.number().min(1).max(20).default(5),
      retryAttempts: z.number().min(1).max(5).default(3),
      rateLimitPerMinute: z.number().min(1).max(100).default(60),
      enableDeduplication: z.boolean().default(true),
      cacheResults: z.boolean().default(true),
    })
    .default({}),
});

export type ScrapingConfig = z.infer<typeof ScrapingConfigSchema>;

// Validate payload in workflow
export const { POST } = serve<ScrapingConfig>(async (context) => {
  // Validate the payload
  const validatedPayload = ScrapingConfigSchema.parse(context.requestPayload);
  const { urls, selectors, config } = validatedPayload;
  // ... rest of workflow implementation
});

// Type-safe workflow context
export interface WorkflowStepContext<T = unknown> {
  run<R>(name: string, fn: () => Promise<R>): Promise<R>;
  call<R>(name: string, options: CallOptions): Promise<CallResponse<R>>;
  sleep(name: string, duration: number): Promise<void>;
  sleepUntil(name: string, timestamp: Date): Promise<void>;
  waitForEvent<E>(name: string, eventId: string, options?: WaitOptions): Promise<E>;
}

// Generic workflow builder
export function createTypedWorkflow<TInput, TOutput>() {
  return {
    serve: (
      handler: (context: WorkflowStepContext<TInput>) => Promise<TOutput>,
      options?: WorkflowOptions
    ) => serve<TInput>(handler, options),
  };
}

// Error handling with discriminated unions
export type ScrapingResult<T> =
  | { success: true; data: T; url: string }
  | { success: false; error: string; url: string; retryable: boolean };

// Type guards
export const isSuccessResult = <T>(
  result: ScrapingResult<T>
): result is Extract<ScrapingResult<T>, { success: true }> => {
  return result.success === true;
};
```

### Step 8: TypeScript Implementation Patterns

```toml
# wrangler.toml
name = "scraping-workflow"
main = "src/index.ts"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[env.production]
vars = {
  ENVIRONMENT = "production",
  LOG_LEVEL = "info"
}

[env.production.secrets]
QSTASH_TOKEN = "your-token"
REDIS_REST_URL = "your-url"
REDIS_REST_TOKEN = "your-token"

[[env.production.durable_objects.bindings]]
name = "SCRAPER_DO"
class_name = "ScraperDurableObject"
script_name = "scraper-worker"

[[env.production.rate_limiting]]
name = "RATE_LIMITER"
simple = { limit = 100, period = 60 }

[[env.production.kv_namespaces]]
binding = "CACHE"
id = "your-kv-id"

[env.production.triggers]
crons = ["0 */6 * * *"]
```

## Scheduling Repeated Workflow Runs

Upstash Workflow supports scheduling workflows to run periodically using cron expressions through
QStash's scheduling features. This is perfect for recurring tasks like data backups, reports, or
periodic scraping jobs.

### Basic Scheduled Workflow

```typescript
// app/api/workflow/daily-backup/route.ts
import { serve } from '@upstash/workflow/nextjs';
import { createBackup, uploadBackup, notifyAdmin } from '@/lib/backup-utils';

export const { POST } = serve(
  async (context) => {
    // Create backup with timestamp
    const backup = await context.run('create-backup', async () => {
      return await createBackup({
        timestamp: new Date().toISOString(),
        type: 'daily',
      });
    });

    // Upload to cloud storage
    await context.run('upload-backup', async () => {
      await uploadBackup(backup);
    });

    // Send completion notification
    await context.run('notify-completion', async () => {
      await notifyAdmin({
        backupId: backup.id,
        size: backup.size,
        completedAt: new Date().toISOString(),
      });
    });

    return { success: true, backupId: backup.id };
  },
  {
    failureFunction: async ({ context, failStatus, failResponse }) => {
      // Immediately get notified for failed backups
      await sendFailureAlert({
        workflowRunId: context.workflowRunId,
        error: failStatus,
        timestamp: new Date().toISOString(),
      });
    },
  }
);
```

### Setting Up Schedules via QStash Dashboard

1. Navigate to **Schedules** in your QStash dashboard
2. Click **Create Schedule**
3. Enter your workflow endpoint URL (e.g., `https://your-app.com/api/workflow/daily-backup`)
4. Add a CRON expression:
   - Daily at midnight: `0 0 * * *`
   - Every 15 minutes: `*/15 * * * *`
   - Weekly on Sundays: `0 0 * * 0`
   - Monthly on the 1st: `0 0 1 * *`
5. Click **Schedule**

### Programmatic Schedule Creation

```typescript
// app/api/schedules/create/route.ts
import { Client } from '@upstash/qstash';

const qstashClient = new Client({ token: process.env.QSTASH_TOKEN! });

export async function POST(request: Request) {
  const { destination, cron, body } = await request.json();

  // Create a schedule programmatically
  const schedule = await qstashClient.schedules.create({
    destination,
    cron,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    retries: 3,
  });

  return Response.json({
    success: true,
    scheduleId: schedule.scheduleId,
  });
}
```

### Per-User Scheduled Workflows

A powerful pattern is creating user-specific schedules, such as weekly summary reports:

```typescript
// app/api/sign-up/route.ts
import { signUp } from '@/lib/auth';
import { Client } from '@upstash/qstash';

const client = new Client({ token: process.env.QSTASH_TOKEN! });

export async function POST(request: Request) {
  const userData = await request.json();

  // Register the user
  const user = await signUp(userData);

  // Calculate first summary date (7 days from signup)
  const firstSummaryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Create cron expression for weekly summaries
  // Run at the same time each week as the signup time
  const minutes = firstSummaryDate.getMinutes();
  const hours = firstSummaryDate.getHours();
  const dayOfWeek = firstSummaryDate.getDay();
  const cron = `${minutes} ${hours} * * ${dayOfWeek}`;

  // Schedule weekly summary with unique ID (idempotent)
  await client.schedules.create({
    scheduleId: `user-summary-${user.id}`, // Unique ID prevents duplicates
    destination: `${process.env.NEXT_PUBLIC_APP_URL}/api/workflow/weekly-summary`,
    body: JSON.stringify({
      userId: user.id,
      email: user.email,
      preferences: user.preferences,
    }),
    cron,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return Response.json({
    success: true,
    message: 'User registered and weekly summary scheduled',
  });
}

// app/api/workflow/weekly-summary/route.ts
import { serve } from '@upstash/workflow/nextjs';
import { getUserData, generateSummary } from '@/lib/user-utils';
import { sendEmail } from '@/lib/email-utils';

interface WeeklySummaryPayload {
  userId: string;
  email: string;
  preferences: any;
}

export const { POST } = serve<WeeklySummaryPayload>(async (context) => {
  const { userId, email, preferences } = context.requestPayload;

  // Fetch latest user data
  const userData = await context.run('fetch-user-data', async () => {
    return await getUserData(userId);
  });

  // Check if user is still active
  if (!userData.isActive) {
    // Cancel this schedule if user is inactive
    await context.run('cancel-schedule', async () => {
      const client = new Client({ token: process.env.QSTASH_TOKEN! });
      await client.schedules.delete(`user-summary-${userId}`);
    });

    return { status: 'cancelled', reason: 'User inactive' };
  }

  // Generate personalized summary
  const summary = await context.run('generate-summary', async () => {
    return await generateSummary({
      userId,
      period: 'week',
      includeMetrics: preferences.includeMetrics,
      format: preferences.summaryFormat || 'html',
    });
  });

  // Send summary email
  await context.run('send-email', async () => {
    await sendEmail({
      to: email,
      subject: 'Your Weekly Summary',
      html: summary.html,
      attachments: summary.attachments,
    });
  });

  // Track engagement
  await context.run('track-engagement', async () => {
    await trackEmailSent({
      userId,
      type: 'weekly-summary',
      timestamp: Date.now(),
    });
  });

  return {
    success: true,
    userId,
    summaryId: summary.id,
  };
});
```

### Scheduled Scraping Workflow

```typescript
// app/api/workflow/scheduled-scraping/route.ts
import { serve } from '@upstash/workflow/nextjs';
import { Redis } from '@upstash/redis';

interface ScheduledScrapingPayload {
  sources: Array<{
    name: string;
    url: string;
    selectors: Record<string, string>;
  }>;
  notificationEmail?: string;
}

export const { POST } = serve<ScheduledScrapingPayload>(async (context) => {
  const { sources, notificationEmail } = context.requestPayload;
  const redis = Redis.fromEnv();

  const results = [];

  // Scrape each source
  for (const [index, source] of sources.entries()) {
    const result = await context.run(`scrape-${source.name}`, async () => {
      try {
        const data = await scrapeUrl(source.url, source.selectors);

        // Store in Redis with timestamp
        await redis.hset(`scraped:${source.name}:latest`, {
          data: JSON.stringify(data),
          timestamp: Date.now(),
          url: source.url,
        });

        // Keep history (last 30 days)
        await redis.zadd(`scraped:${source.name}:history`, Date.now(), JSON.stringify(data));

        return {
          source: source.name,
          success: true,
          dataPoints: Object.keys(data).length,
        };
      } catch (error) {
        return {
          source: source.name,
          success: false,
          error: error.message,
        };
      }
    });

    results.push(result);

    // Add delay between sources
    if (index < sources.length - 1) {
      await context.sleep(`delay-${index}`, 5);
    }
  }

  // Generate summary report
  const summary = await context.run('generate-summary', async () => {
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    return {
      totalSources: sources.length,
      successful: successful.length,
      failed: failed.length,
      details: results,
      timestamp: new Date().toISOString(),
    };
  });

  // Send notification if configured
  if (notificationEmail) {
    await context.run('send-notification', async () => {
      await sendScrapingSummaryEmail({
        to: notificationEmail,
        summary,
        nextRun: calculateNextCronRun(),
      });
    });
  }

  return summary;
});

// Create hourly scraping schedule
export async function createHourlyScrapingSchedule() {
  const client = new Client({ token: process.env.QSTASH_TOKEN! });

  await client.schedules.create({
    scheduleId: 'hourly-price-scraping',
    destination: `${process.env.NEXT_PUBLIC_APP_URL}/api/workflow/scheduled-scraping`,
    cron: '0 * * * *', // Every hour
    body: JSON.stringify({
      sources: [
        {
          name: 'competitor-1',
          url: 'https://competitor1.com/pricing',
          selectors: {
            price: '.price-tag',
            availability: '.stock-status',
          },
        },
        {
          name: 'competitor-2',
          url: 'https://competitor2.com/products',
          selectors: {
            price: '[data-price]',
            availability: '.availability',
          },
        },
      ],
      notificationEmail: 'alerts@company.com',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
```

### Managing Schedules

```typescript
// app/api/schedules/manage/route.ts
import { Client } from '@upstash/qstash';

const client = new Client({ token: process.env.QSTASH_TOKEN! });

// List all schedules
export async function GET() {
  const schedules = await client.schedules.list();
  return Response.json({ schedules });
}

// Update a schedule
export async function PUT(request: Request) {
  const { scheduleId, updates } = await request.json();

  // Delete and recreate (QStash doesn't support direct updates)
  await client.schedules.delete(scheduleId);

  const newSchedule = await client.schedules.create({
    scheduleId,
    ...updates,
  });

  return Response.json({
    success: true,
    schedule: newSchedule,
  });
}

// Delete a schedule
export async function DELETE(request: Request) {
  const { scheduleId } = await request.json();

  await client.schedules.delete(scheduleId);

  return Response.json({
    success: true,
    message: `Schedule ${scheduleId} deleted`,
  });
}
```

### Best Practices for Scheduled Workflows

1. **Unique Schedule IDs**: Always use unique, deterministic IDs to ensure idempotency
2. **Error Handling**: Implement robust failure functions for critical scheduled tasks
3. **Monitoring**: Track schedule execution history and success rates
4. **Cleanup**: Remove schedules for deleted users or completed campaigns
5. **Time Zones**: Consider user time zones when creating user-specific schedules
6. **Rate Limiting**: Respect external API limits in scheduled scraping workflows

### Common CRON Patterns

```typescript
// Useful CRON expressions for workflows
const CRON_PATTERNS = {
  everyMinute: '* * * * *',
  everyHour: '0 * * * *',
  everyDayMidnight: '0 0 * * *',
  everyDayNoon: '0 12 * * *',
  everyMonday: '0 0 * * 1',
  everyWeekday: '0 0 * * 1-5',
  firstOfMonth: '0 0 1 * *',
  quarterly: '0 0 1 */3 *',

  // Custom patterns
  businessHours: '0 9-17 * * 1-5', // Every hour 9 AM - 5 PM weekdays
  twiceDaily: '0 9,17 * * *', // 9 AM and 5 PM
  everyThreeHours: '0 */3 * * *', // Every 3 hours
};
```

For more details on CRON expressions, see the
[QStash scheduling documentation](https://upstash.com/docs/qstash/features/schedules).

## Python SDK Support

Upstash Workflow also supports Python for FastAPI applications:

```python
from upstash_workflow import serve
from upstash_workflow.context import WorkflowContext

@serve
async def workflow(context: WorkflowContext):
    # Access request payload
    data = context.request_payload

    # Execute steps
    result = await context.run("step-name", lambda: process_data(data))

    # Sleep for delay
    await context.sleep("wait-step", 60)

    # Make HTTP calls
    response = await context.call("api-call", {
        "url": "https://api.example.com",
        "method": "POST",
        "body": {"key": "value"}
    })

    return {"status": "completed", "result": result}
```

### Step 9: Production Configuration

### 1. Failure Resilience and Recovery

Upstash Workflow automatically handles failures with built-in retries and state persistence. If your
platform experiences an outage, workflows resume from the last successful step.

### 2. Long-Running Executions

Use `context.call` for HTTP requests that can run up to 2 hours, bypassing serverless function
timeouts. These calls don't count toward your function's execution time.

### 3. Event-Driven Workflows

Use `context.waitForEvent` to pause workflow execution until external events occur. Perfect for
approval flows, webhooks, and asynchronous notifications.

### 4. Scheduled Jobs

Schedule workflows with cron expressions for recurring tasks like reports, data syncing, or periodic
scraping.

### 5. Long Delays

Use `context.sleep` for delays in seconds or `context.sleepUntil` for specific timestamps. Supports
delays of days, weeks, or months.

### 6. Parallel Execution

Start multiple independent tasks simultaneously to reduce overall execution time and improve
throughput.

### 7. Flow Control

Configure rate limiting and parallelism to prevent overwhelming external services or your own
infrastructure.

## Best Practices and Anti-Patterns

### Circuit Breaker and Rate Limiting Implementation

Sophisticated rate limiting strategies prove essential for maintaining compliance with target site
policies and preventing service disruption. Upstash Workflow's built-in retry mechanisms combine
with custom circuit breaker implementations to create resilient scraping systems that adapt to
varying target site response characteristics and availability patterns.

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold = 5,
    private recoveryTimeout = 60000,
    private successThreshold = 2
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return this.state;
  }
}

// Integration with workflow steps
export const { POST } = serve<{ targets: ScrapingTarget[] }>(async (context) => {
  const { targets } = context.requestPayload;
  const circuitBreakers = new Map<string, CircuitBreaker>();

  const results = await Promise.all(
    targets.map((target, index) =>
      context.run(`protected-scrape-${index}`, async () => {
        const domain = new URL(target.url).hostname;

        // Get or create circuit breaker for domain
        if (!circuitBreakers.has(domain)) {
          circuitBreakers.set(domain, new CircuitBreaker());
        }

        const breaker = circuitBreakers.get(domain)!;

        return await breaker.execute(async () => {
          return await scrapeWithRetries(target);
        });
      })
    )
  );

  return {
    results,
    circuitBreakerStates: Object.fromEntries(
      Array.from(circuitBreakers.entries()).map(([domain, breaker]) => [domain, breaker.getState()])
    ),
  };
});
```

### Anti-Patterns to Avoid

1. **Over-parallelization**: Don't create too many concurrent operations that overwhelm resources
2. **Synchronous Blocking**: Avoid blocking operations within workflow steps
3. **Large Payloads**: Don't pass massive data between steps; use references instead
4. **Tight Coupling**: Keep workflows loosely coupled for better maintainability
5. **Missing Timeouts**: Always set appropriate timeouts for external calls

## Troubleshooting Guide

### Common Issues and Solutions

**Workflow Timeouts**

- Increase step timeouts using `context.call` timeout parameter
- Break large operations into smaller steps
- Use `context.sleep` for intentional delays

**Rate Limiting Errors**

- Implement exponential backoff
- Use flow control parameters
- Distribute load across multiple workers

**Memory Issues**

- Stream large datasets instead of loading into memory
- Use chunking for batch operations
- Clear references between steps

**Debugging Strategies**

```typescript
// Enable verbose logging
export const { POST } = serve(handler, { verbose: true });

// Use workflow client for inspection
import { Client } from '@upstash/workflow';

const client = new Client({ token: process.env.QSTASH_TOKEN! });

// Get workflow logs
const { runs } = await client.logs({
  workflowRunId: 'specific-run-id',
  count: 10,
});

// Monitor active workflows
const activeWorkflows = await client.list();

// Cancel a running workflow
await client.cancel({ ids: 'workflow-run-id' });

// Cancel multiple workflows
await client.cancel({ ids: ['run-id-1', 'run-id-2'] });

// Cancel workflows via REST API
const response = await fetch(`https://qstash.upstash.io/v2/workflows/runs/${runId}/cancel`, {
  method: 'DELETE',
  headers: {
    Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
  },
});
```

**Workflow Cancellation Patterns**

```typescript
// Implement cancellation handling in your workflow
export const { POST } = serve<{ data: any; cancelToken?: string }>(async (context) => {
  const { data, cancelToken } = context.requestPayload;

  // Store cancel token for external cancellation
  if (cancelToken) {
    await context.run('store-cancel-token', async () => {
      await redis.set(`cancel-token:${cancelToken}`, context.workflowRunId, {
        ex: 3600, // 1 hour expiry
      });
    });
  }

  // Long-running process with cancellation checks
  for (let i = 0; i < 100; i++) {
    // Check if workflow should be cancelled
    const shouldCancel = await context.run(`check-cancel-${i}`, async () => {
      return await redis.get(`cancel-request:${context.workflowRunId}`);
    });

    if (shouldCancel) {
      await context.run('handle-cancellation', async () => {
        await redis.del(`cancel-request:${context.workflowRunId}`);
        // Cleanup resources
      });
      return { status: 'cancelled', processedItems: i };
    }

    // Process item
    await context.run(`process-item-${i}`, async () => {
      await processItem(data[i]);
    });

    // Add delay between items
    if (i < 99) {
      await context.sleep(`item-delay-${i}`, 1);
    }
  }

  return { status: 'completed', processedItems: 100 };
});

// External cancellation endpoint
export async function DELETE(request: Request) {
  const { cancelToken } = await request.json();

  // Look up workflow run ID from cancel token
  const workflowRunId = await redis.get(`cancel-token:${cancelToken}`);

  if (workflowRunId) {
    const client = new Client({ token: process.env.QSTASH_TOKEN! });

    // Cancel the workflow
    await client.cancel({ ids: workflowRunId as string });

    // Set cancellation flag for graceful shutdown
    await redis.set(`cancel-request:${workflowRunId}`, true, { ex: 300 });

    return Response.json({
      success: true,
      workflowRunId,
      message: 'Workflow cancellation requested',
    });
  }

  return Response.json(
    {
      success: false,
      message: 'Invalid cancel token',
    },
    { status: 404 }
  );
}
```

## Waiting for External Events

The event system in Upstash Workflow enables powerful asynchronous patterns where workflows can
pause execution and wait for external triggers. This is essential for approval flows, webhook
integrations, and cross-system coordination.

**Note**: This feature is not yet available in the Python SDK (`workflow-py`). Check the
[Upstash Workflow Roadmap](https://upstash.com/docs/workflow/roadmap) for updates.

### Event-Driven Workflow Example

```typescript
// app/api/workflow/approval-flow/route.ts
export const { POST } = serve<{
  orderId: string;
  amount: number;
  items: Array<{ id: string; name: string; price: number }>;
}>(async (context) => {
  const { orderId, amount, items } = context.requestPayload;

  // Process initial order validation
  const validation = await context.run('validate-order', async () => {
    return await validateOrder({ orderId, amount, items });
  });

  if (!validation.success) {
    return { status: 'rejected', reason: validation.error };
  }

  // For high-value orders, require manager approval
  if (amount > 1000) {
    // Send approval request
    await context.run('request-approval', async () => {
      await sendApprovalEmail({
        orderId,
        amount,
        items,
        approvalLink: `${process.env.NEXT_PUBLIC_APP_URL}/approve/${orderId}`,
      });
    });

    // Wait for manager approval (max 24 hours)
    const { eventData, timeout } = await context.waitForEvent(
      'manager-approval',
      `approval-${orderId}`,
      { timeout: 86400 } // 24 hours
    );

    if (timeout) {
      // Handle timeout - auto-escalate or reject
      await context.run('handle-approval-timeout', async () => {
        await sendEscalationEmail({ orderId, amount });
        await updateOrderStatus(orderId, 'approval-timeout');
      });

      return {
        status: 'timeout',
        message: 'Approval timeout - order escalated',
      };
    }

    // Check approval decision
    if (!eventData?.approved) {
      await context.run('handle-rejection', async () => {
        await updateOrderStatus(orderId, 'rejected');
        await sendRejectionEmail({ orderId, reason: eventData?.reason });
      });

      return {
        status: 'rejected',
        reason: eventData?.reason || 'Manager rejected order',
      };
    }
  }

  // Process approved order
  const result = await context.run('process-order', async () => {
    return await processOrder({ orderId, amount, items });
  });

  // Notify other systems
  await context.notify('notify-fulfillment', `order-ready-${orderId}`, {
    orderId,
    processedAt: Date.now(),
    fulfillmentData: result,
  });

  return { status: 'completed', orderId, result };
});

// Approval endpoint (called by manager clicking approval link)
export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  const { approved, reason } = await request.json();

  const client = new Client({ token: process.env.QSTASH_TOKEN! });

  // Notify the waiting workflow
  await client.notify({
    eventId: `approval-${params.orderId}`,
    eventData: {
      approved,
      reason,
      approvedBy: request.headers.get('x-user-id'),
      approvedAt: Date.now(),
    },
  });

  return Response.json({
    success: true,
    message: approved ? 'Order approved' : 'Order rejected',
  });
}
```

### Multi-Step Event Coordination

```typescript
// Complex workflow coordinating multiple external events
export const { POST } = serve<{
  projectId: string;
  tasks: string[];
}>(async (context) => {
  const { projectId, tasks } = context.requestPayload;

  // Start all tasks in parallel
  await context.run('dispatch-tasks', async () => {
    for (const task of tasks) {
      await dispatchTaskToExternalSystem({
        projectId,
        taskId: task,
        callbackEventId: `task-complete-${projectId}-${task}`,
      });
    }
  });

  // Wait for all tasks to complete
  const results = [];
  for (const task of tasks) {
    const { eventData, timeout } = await context.waitForEvent(
      `waiting for task ${task}`,
      `task-complete-${projectId}-${task}`,
      { timeout: 3600 } // 1 hour per task
    );

    if (timeout) {
      results.push({
        taskId: task,
        status: 'timeout',
        error: 'Task execution timeout',
      });
    } else {
      results.push({
        taskId: task,
        status: 'completed',
        result: eventData,
      });
    }
  }

  // Aggregate results
  const summary = await context.run('aggregate-results', async () => {
    const successful = results.filter((r) => r.status === 'completed');
    const failed = results.filter((r) => r.status === 'timeout');

    return {
      total: tasks.length,
      successful: successful.length,
      failed: failed.length,
      results,
    };
  });

  // Notify project completion
  await context.notify('notify-project-complete', `project-complete-${projectId}`, summary);

  return summary;
});
```

### Event Patterns Best Practices

1. **Unique Event IDs**: Always use unique, deterministic event IDs
2. **Timeout Handling**: Always handle timeout scenarios gracefully
3. **Event Data Validation**: Validate event data before using it
4. **Idempotency**: Make event notifications idempotent
5. **Audit Trail**: Log all event notifications for debugging

### Advanced Event Patterns

```typescript
// Webhook receiver that notifies workflows
export async function POST(request: Request) {
  const webhook = await request.json();
  const signature = request.headers.get('x-webhook-signature');

  // Verify webhook signature
  if (!verifyWebhookSignature(webhook, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const client = new Client({ token: process.env.QSTASH_TOKEN! });

  // Map webhook events to workflow events
  switch (webhook.event) {
    case 'payment.succeeded':
      await client.notify({
        eventId: `payment-${webhook.paymentId}`,
        eventData: {
          status: 'succeeded',
          amount: webhook.amount,
          timestamp: webhook.timestamp,
        },
      });
      break;

    case 'shipment.delivered':
      await client.notify({
        eventId: `delivery-${webhook.orderId}`,
        eventData: {
          deliveredAt: webhook.timestamp,
          signature: webhook.signature,
          location: webhook.location,
        },
      });
      break;

    default:
      console.log(`Unhandled webhook event: ${webhook.event}`);
  }

  return Response.json({ received: true });
}

// Workflow waiting for multiple events with race condition
export const { POST } = serve<{ orderId: string }>(async (context) => {
  const { orderId } = context.requestPayload;

  // Start payment and shipping processes
  await context.run('initiate-order', async () => {
    await initiatePayment(orderId);
    await initiateShipping(orderId);
  });

  // Wait for either payment failure or both success events
  let paymentComplete = false;
  let shippingComplete = false;

  // Wait for payment
  const { eventData: paymentData, timeout: paymentTimeout } = await context.waitForEvent(
    'payment-completion',
    `payment-${orderId}`,
    { timeout: 600 } // 10 minutes
  );

  if (paymentTimeout || paymentData?.status !== 'succeeded') {
    // Cancel order on payment failure
    await context.run('cancel-order', async () => {
      await cancelOrder(orderId);
    });
    return { status: 'failed', reason: 'Payment failed or timed out' };
  }

  paymentComplete = true;

  // Wait for shipping
  const { eventData: shippingData, timeout: shippingTimeout } = await context.waitForEvent(
    'shipping-completion',
    `delivery-${orderId}`,
    { timeout: 604800 } // 7 days
  );

  if (shippingTimeout) {
    // Handle shipping timeout
    await context.run('shipping-timeout', async () => {
      await notifyShippingDelay(orderId);
    });
  }

  return {
    status: 'completed',
    payment: paymentData,
    shipping: shippingData || { status: 'delayed' },
  };
});
```

### Event-Driven Scraping Workflow

QStash's messaging capabilities enable sophisticated event-driven coordination patterns between
workflow instances and external systems. The `waitForEvent` method allows workflows to pause and
wait for external events before proceeding, creating powerful patterns for user confirmations,
webhook integrations, and cross-system coordination.

```typescript
export const { POST } = serve<{
  scrapingPlan: ScrapingPlan;
  requiresApproval: boolean;
}>(async (context) => {
  const { scrapingPlan, requiresApproval } = context.requestPayload;

  // Initialize scraping session
  const session = await context.run('create-scraping-session', async () => {
    return await createScrapingSession(scrapingPlan);
  });

  if (requiresApproval) {
    // Send approval request
    await context.run('request-approval', async () => {
      await sendApprovalRequest({
        sessionId: session.id,
        plan: scrapingPlan,
        workflowRunId: context.workflowRunId,
      });
    });

    // Wait for approval event (with timeout)
    const approvalResult = await context.waitForEvent(
      'approval-received',
      `approval-${context.workflowRunId}`,
      { timeout: 3600 } // 1 hour timeout
    );

    if (!approvalResult.approved) {
      throw new Error('Scraping plan was not approved');
    }
  }

  // Execute approved scraping plan
  const results = await executeScrapingPlan(context, scrapingPlan);

  return results;
});

// External notification endpoint
export async function POST(request: Request) {
  const { workflowRunId, approved, reason } = await request.json();

  const client = new Client({ token: process.env.QSTASH_TOKEN! });

  await client.notify({
    eventId: `approval-${workflowRunId}`,
    eventData: {
      approved,
      reason,
      timestamp: Date.now(),
    },
  });

  return Response.json({ success: true });
}
```

## Upstash Workflow Pricing and Limits

Upstash Workflow is built on QStash infrastructure. Key considerations:

- **Execution Duration**: Regular steps follow platform limits, but `context.call` can run up to 2
  hours
- **State Storage**: Workflow state is maintained until completion
- **Retries**: Default 3 retries per step with exponential backoff
- **Dead Letter Queue**: Failed workflows after all retries
- **Monitoring**: Built-in observability through dashboard and Logs API

## Conclusion

## Deployment Checklist

### Pre-deployment

- [ ] Environment variables configured in production
- [ ] Remove local development settings (QSTASH_URL for local server)
- [ ] QStash token and Redis credentials secured
- [ ] Workflow endpoints tested locally
- [ ] Rate limiting rules defined
- [ ] Error handling scenarios tested
- [ ] Monitoring alerts configured
- [ ] Dead Letter Queue monitoring setup
- [ ] CI/CD pipeline configured

### Deployment Steps

1. Set environment variables in your deployment platform (Vercel, AWS Amplify, etc.)
2. Build Next.js application: `npm run build`
3. Deploy to your platform:
   - **Vercel**: `vercel deploy` or git push
   - **Cloudflare Pages**: `npx wrangler pages deploy`
   - **AWS Amplify**: `amplify push`
4. Verify workflow endpoint accessibility:
   ```bash
   curl -X POST https://your-production-url/api/workflow
   ```
5. Monitor initial executions in QStash dashboard
6. Set up production alerts in Sentry or similar

### Post-deployment

- [ ] Verify workflow execution in Upstash/QStash dashboard
- [ ] Check error rates and performance metrics
- [ ] Test failure scenarios and DLQ handling
- [ ] Monitor resource usage via platform analytics
- [ ] Set up automated alerts for failures
- [ ] Verify rate limiting is working correctly
- [ ] Test workflow recovery mechanisms
- [ ] Document production URLs and endpoints

This comprehensive implementation guide provides a production-ready architecture for building
complex scraping applications with Upstash Workflow, Next.js 15, and Cloudflare Workers. The guide
covers all key features including failure resilience, long-running executions, event-driven
workflows, scheduled jobs, parallel processing, and comprehensive monitoring.

## Key Takeaways

1. **Upstash Workflow** provides durable, reliable serverless functions with automatic retries and
   state persistence
2. **Step-based execution** ensures resilience - failed steps retry without re-running successful
   ones
3. **Long-running support** via `context.call` enables operations up to 2 hours
4. **Event-driven capabilities** with `waitForEvent` enable complex approval flows
5. **Built-in observability** through dashboard and Logs API for production monitoring
6. **At-least-once delivery** guarantees with Dead Letter Queue for failed workflows

For the latest updates and features, check the
[Upstash Workflow Roadmap](https://upstash.com/docs/workflow/roadmap).

## Additional Resources

- [Upstash Workflow Documentation](https://upstash.com/docs/workflow/getstarted)
- [Next.js Quickstart Guide](https://upstash.com/docs/workflow/quickstarts/vercel-nextjs)
- [GitHub Example Repository](https://github.com/upstash/workflow-nextjs-example)
- [Deploy with Vercel Template](https://vercel.com/templates/next.js/upstash-workflow)
- [Upstash Workflow Roadmap](https://upstash.com/docs/workflow/roadmap)
- [Cloudflare Workers Framework Guide for Next.js](https://developers.cloudflare.com/workers/frameworks/framework-guides/nextjs/)
- [Upstash Workflow Quickstart for Cloudflare Workers](https://upstash.com/docs/workflow/quickstarts/cloudflare-workers)
- [Upstash Workflow Context Documentation](https://upstash.com/docs/workflow/basics/context)
- [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare)
- [Upstash Workflow Flow Control](https://upstash.com/docs/workflow/howto/flow-control)
- [Cloudflare Durable Objects Documentation](https://developers.cloudflare.com/durable-objects/)
- [Handle Failed Workflow Runs](https://upstash.com/docs/workflow/howto/failures)
- [Monitor Workflows](https://upstash.com/docs/workflow/howto/monitor)
- [Cancel Running Workflows](https://upstash.com/docs/workflow/howto/cancel)
- [Secure Workflow Endpoints](https://upstash.com/docs/workflow/howto/security)
- [Local Development Guide](https://upstash.com/docs/workflow/howto/local-development)
- [Workflow Caveats and Best Practices](https://upstash.com/docs/workflow/basics/caveats)
