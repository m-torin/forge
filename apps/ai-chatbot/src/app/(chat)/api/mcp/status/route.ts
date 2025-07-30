/**
 * MCP Status API Endpoint
 * Provides real-time MCP connection status and feature information
 */

import { auth } from '#/app/(auth)/auth';
import { getMcpConnectionStatusWithFlags } from '#/lib/mcp/feature-flags';
import { logError, logInfo } from '@repo/observability';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get user session for context
    const session = await auth();

    // Create feature flag context
    const context = {
      user: session?.user ? { id: session.user.id } : undefined,
      userType: session?.user?.type || 'regular',
      environment: process.env.NODE_ENV,
    };

    logInfo('MCP status request', {
      operation: 'mcp_status_request',
      metadata: {
        userId: session?.user?.id,
        userType: context.userType,
        hasSession: !!session,
        userAgent: request.headers.get('user-agent'),
      },
    });

    // Get MCP connection status with feature flag awareness
    const status = getMcpConnectionStatusWithFlags(context);

    logInfo('MCP status retrieved', {
      operation: 'mcp_status_success',
      metadata: {
        userId: session?.user?.id,
        status: status.status,
        clientType: status.clientType,
        featuresEnabled: Object.keys(status.features).filter(
          key => status.features[key as keyof typeof status.features],
        ),
        capabilities: status.metadata.capabilities,
        healthy: status.health.healthy,
      },
    });

    // Return status with appropriate cache headers
    const response = NextResponse.json(status);

    // Set cache headers for real-time updates
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    logError('Failed to get MCP status', {
      operation: 'mcp_status_error',
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        hasSession: false, // Don't try to access session in error handler
      },
      error: error instanceof Error ? error : new Error(String(error)),
    });

    // Return error status with fallback information
    const fallbackStatus = {
      status: 'disconnected' as const,
      clientType: 'mock' as const,
      health: {
        healthy: false,
        connections: 0,
        issues: ['Status check failed'],
      },
      features: {
        enhanced: false,
        errorHandling: false,
        streamLifecycle: false,
        healthMonitoring: false,
        gracefulDegradation: true,
        demo: false,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        capabilities: [],
        environment: process.env.NODE_ENV || 'unknown',
      },
    };

    return NextResponse.json(fallbackStatus, { status: 500 });
  }
}

/**
 * Health check endpoint for monitoring
 */
export async function HEAD(_request: NextRequest) {
  try {
    const session = await auth();
    const context = {
      user: session?.user ? { id: session.user.id } : undefined,
      userType: session?.user?.type || 'regular',
      environment: process.env.NODE_ENV,
    };

    const status = getMcpConnectionStatusWithFlags(context);

    // Return appropriate status code based on health
    if (status.health.healthy) {
      return new Response(null, { status: 200 });
    } else if (status.status === 'degraded') {
      return new Response(null, { status: 206 }); // Partial Content
    } else {
      return new Response(null, { status: 503 }); // Service Unavailable
    }
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
}
