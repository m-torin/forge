import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

import { createWorkflowMonitor } from '@repo/orchestration';

export async function GET() {
  const health = {
    environment: process.env.NODE_ENV,
    services: {
      qstash: 'unknown',
      redis: 'unknown',
    },
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  };

  try {
    // Check Redis connection
    const redis = Redis.fromEnv();
    await redis.ping();
    health.services.redis = 'connected';
  } catch {
    health.services.redis = 'error';
    health.status = 'degraded';
  }

  try {
    // Check QStash connection
    const monitor = createWorkflowMonitor();
    await monitor.listActiveWorkflows(1);
    health.services.qstash = 'connected';
  } catch {
    health.services.qstash = 'error';
    health.status = 'degraded';
  }

  return NextResponse.json(health, {
    status: health.status === 'ok' ? 200 : 503,
  });
}

export async function POST() {
  try {
    // Simulate a more complex health check
    await new Promise((resolve) => setTimeout(resolve, 100));

    return NextResponse.json({
      message: 'POST health check passed',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        message: 'Health check failed',
        status: 'error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
