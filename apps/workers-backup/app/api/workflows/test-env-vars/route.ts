import { NextResponse } from 'next/server';

// Test endpoint to check what environment variables the workflow SDK expects
export async function GET() {
  // Check all relevant environment variables
  const envCheck = {
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY ? 'SET' : 'NOT SET',
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY ? 'SET' : 'NOT SET',
    QSTASH_TOKEN: process.env.QSTASH_TOKEN ? 'SET' : 'NOT SET',
    // QStash specific
    QSTASH_URL: process.env.QSTASH_URL,

    SKIP_WORKFLOW_DEDUPLICATION: process.env.SKIP_WORKFLOW_DEDUPLICATION,
    // Workflow specific
    UPSTASH_WORKFLOW_URL: process.env.UPSTASH_WORKFLOW_URL,
    WORKFLOW_DEV_MODE: process.env.WORKFLOW_DEV_MODE,

    // Node environment
    NODE_ENV: process.env.NODE_ENV,

    // Additional checks
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
  };

  // Try to import workflow SDK and check its requirements
  let sdkInfo = {};
  try {
    const workflow = await import('@upstash/workflow');
    sdkInfo = {
      hasServe: !!workflow.serve,
      version: workflow.version || 'unknown',
    };
  } catch (error) {
    sdkInfo = { error: error instanceof Error ? error.message : 'Failed to import' };
  }

  return NextResponse.json({
    environment: envCheck,
    recommendations: getRecommendations(envCheck),
    sdkInfo,
  });
}

function getRecommendations(env: any) {
  const recommendations = [];

  if (!env.QSTASH_TOKEN) {
    recommendations.push('Set QSTASH_TOKEN from QStash CLI output');
  }

  if (!env.UPSTASH_WORKFLOW_URL && env.NODE_ENV === 'development') {
    recommendations.push('Set UPSTASH_WORKFLOW_URL=http://localhost:3400 for local development');
  }

  if (env.VERCEL && !env.QSTASH_URL) {
    recommendations.push('Remove QSTASH_URL in production (Vercel deployment)');
  }

  return recommendations;
}
