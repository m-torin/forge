import { serve } from '@upstash/workflow/nextjs';
import { Client } from '@upstash/qstash';
import { NextRequest } from 'next/server';

// Simple test workflow for debugging
export const { POST } = serve(
  async (context) => {
    console.log('[TEST-BASIC] Workflow started');
    console.log('[TEST-BASIC] Context:', {
      workflowRunId: context.workflowRunId,
      url: context.url,
      env: {
        QSTASH_URL: process.env.QSTASH_URL,
        QSTASH_TOKEN: process.env.QSTASH_TOKEN ? 'SET' : 'NOT SET',
        NODE_ENV: process.env.NODE_ENV,
      },
    });

    // Step 1: Simple log
    const step1Result = await context.run('simple-log', async () => {
      console.log('[TEST-BASIC] Running simple-log step');
      return { 
        message: 'Step 1 completed', 
        timestamp: new Date().toISOString() 
      };
    });

    console.log('[TEST-BASIC] Step 1 result:', step1Result);

    // Step 2: Another simple step
    const step2Result = await context.run('another-step', async () => {
      console.log('[TEST-BASIC] Running another-step');
      return { 
        message: 'Step 2 completed', 
        timestamp: new Date().toISOString(),
        previousStep: step1Result 
      };
    });

    console.log('[TEST-BASIC] Step 2 result:', step2Result);

    return {
      success: true,
      steps: [step1Result, step2Result],
      completedAt: new Date().toISOString(),
    };
  },
  {
    // Explicitly configure for local development
    receiver: undefined, // Skip signature verification
    qstashClient: new Client({
      baseUrl: process.env.QSTASH_URL || 'http://localhost:8080',
      token: process.env.QSTASH_TOKEN || 'eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=',
    }),
    verbose: true,
  }
);

// GET endpoint for testing
export async function GET() {
  return Response.json({
    message: 'Test basic workflow endpoint',
    env: {
      QSTASH_URL: process.env.QSTASH_URL || 'Not set',
      NODE_ENV: process.env.NODE_ENV,
    },
  });
}