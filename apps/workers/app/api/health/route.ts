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
  } catch (error) {
    health.services.redis = 'error';
    health.status = 'degraded';
  }

  try {
    // Check QStash connection
    const monitor = createWorkflowMonitor();
    await monitor.listActiveWorkflows(1);
    health.services.qstash = 'connected';
  } catch (error) {
    health.services.qstash = 'error';
    health.status = 'degraded';
  }

  return NextResponse.json(health, {
    status: health.status === 'ok' ? 200 : 503,
  });
}
