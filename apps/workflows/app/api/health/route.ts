import { workflowService } from '@/lib';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const health = await workflowService.healthCheck();
    const metrics = await workflowService.getMetrics();

    const response = {
      issues: health.issues,
      metrics: {
        averageResponseTime: 0,
        errorRate: 0,
        totalRequests: 0, // Would be tracked with middleware
      },
      services: {
        providers: health.services.providers ? 'connected' : 'disconnected',
        redis: 'not-configured', // Would be implemented with actual Redis
        registry: health.services.registry ? 'running' : 'stopped',
        store: health.services.store ? 'healthy' : 'unhealthy',
        websocket: health.services.websocket ? 'running' : 'stopped',
      },
      status: health.healthy ? 'healthy' : 'degraded',
      store: metrics.store,
      system: metrics.system,
      timestamp: new Date(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };

    const status = health.healthy ? 200 : 503;

    return NextResponse.json(response, { status });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Health check failed',
        status: 'unhealthy',
        timestamp: new Date(),
      },
      { status: 503 },
    );
  }
}
