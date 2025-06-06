import { withErrorHandler } from '@/lib/api-helpers';
import { type NextRequest } from 'next/server';

import {
  classifyWorkflowError,
  createWorkflowMonitor,
  getEnvironmentConfig,
  isRetryableError,
  WorkflowErrorType,
} from '@repo/orchestration';
import { devLog as logger } from '@repo/orchestration';

/**
 * Enhanced Observability API Route
 * Provides comprehensive monitoring, error analysis, and system health insights
 */

const monitor = createWorkflowMonitor();

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'health';

  switch (action) {
    case 'health':
      return await getSystemHealth();
    case 'metrics':
      return await getSystemMetrics(searchParams);
    case 'errors':
      return await getErrorAnalysis(searchParams);
    case 'environment':
      return await getEnvironmentInfo();
    default:
      return Response.json(
        {
          availableActions: ['health', 'metrics', 'errors', 'environment'],
          error: 'Unknown action',
        },
        { status: 400 },
      );
  }
}, 'Observability API');

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { action, ...params } = await request.json();

  switch (action) {
    case 'analyze-error':
      return await analyzeError(params);
    case 'system-diagnostics':
      return await runSystemDiagnostics(params);
    default:
      return Response.json({ error: 'Unknown action' }, { status: 400 });
  }
}, 'Observability API POST');

/**
 * Get comprehensive system health status
 */
async function getSystemHealth() {
  const health = {
    metrics: {} as Record<string, any>,
    services: {} as Record<string, any>,
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    timestamp: new Date().toISOString(),
  };

  try {
    // Check workflow monitoring service
    const activeWorkflows = await monitor.listActiveWorkflows(5);
    health.services.workflows = {
      activeCount: activeWorkflows.length,
      lastCheck: new Date().toISOString(),
      status: 'healthy',
    };
  } catch (error) {
    health.services.workflows = {
      error: String(error),
      lastCheck: new Date().toISOString(),
      status: 'unhealthy',
    };
    health.status = 'degraded';
  }

  // Check environment configuration
  try {
    const envConfig = getEnvironmentConfig();
    health.services.environment = {
      hasQstashToken: !!envConfig.qstashToken,
      hasQstashUrl: !!envConfig.qstashUrl,
      isDevelopment: envConfig.isDevelopment,
      status: envConfig.qstashToken ? 'healthy' : 'degraded',
    };

    if (!envConfig.qstashToken) {
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.environment = {
      error: String(error),
      status: 'unhealthy',
    };
    health.status = 'unhealthy';
  }

  return Response.json(health);
}

/**
 * Get detailed system metrics
 */
async function getSystemMetrics(searchParams: URLSearchParams) {
  const count = parseInt(searchParams.get('count') || '50');
  const timeRange = searchParams.get('timeRange') || '1h';

  try {
    // Get workflow metrics
    const allWorkflows = await monitor.listActiveWorkflows(count);
    const completed = allWorkflows.filter((w) =>
      ['RUN_CANCELED', 'RUN_FAILED', 'RUN_SUCCESS'].includes(w.state),
    );

    const metrics = {
      system: {
        environment: getEnvironmentConfig(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      timeRange,
      workflows: {
        active: allWorkflows.filter((w) => w.state === 'RUN_STARTED').length,
        canceled: completed.filter((w) => w.state === 'RUN_CANCELED').length,
        completed: completed.filter((w) => w.state === 'RUN_SUCCESS').length,
        failed: completed.filter((w) => w.state === 'RUN_FAILED').length,
        successRate:
          completed.length > 0
            ? (
                (completed.filter((w) => w.state === 'RUN_SUCCESS').length / completed.length) *
                100
              ).toFixed(2)
            : 'N/A',
        total: allWorkflows.length,
      },
    };

    return Response.json(metrics);
  } catch (error) {
    logger.error('Failed to get system metrics:', error);
    throw error;
  }
}

/**
 * Get error analysis and patterns
 */
async function getErrorAnalysis(searchParams: URLSearchParams) {
  const _count = parseInt(searchParams.get('count') || '100');

  try {
    // This would ideally pull from actual error logs
    // For now, we'll provide error classification examples
    const errorPatterns = {
      classification: {
        [WorkflowErrorType.NETWORK]: {
          count: 0,
          examples: ['Connection refused', 'DNS resolution failed'],
          percentage: 0,
          retryable: isRetryableError(WorkflowErrorType.NETWORK),
        },
        [WorkflowErrorType.RATE_LIMIT]: {
          count: 0,
          examples: ['Too many requests', 'Rate limit exceeded'],
          percentage: 0,
          retryable: isRetryableError(WorkflowErrorType.RATE_LIMIT),
        },
        [WorkflowErrorType.TIMEOUT]: {
          count: 0,
          examples: ['Request timeout', 'Gateway timeout'],
          percentage: 0,
          retryable: isRetryableError(WorkflowErrorType.TIMEOUT),
        },
        [WorkflowErrorType.VALIDATION]: {
          count: 0,
          examples: ['Invalid input', 'Missing required field'],
          percentage: 0,
          retryable: isRetryableError(WorkflowErrorType.VALIDATION),
        },
      },
      recommendations: [
        'Implement exponential backoff for network errors',
        'Add input validation to prevent validation errors',
        'Consider circuit breaker pattern for external APIs',
        'Monitor rate limit headers and implement backoff',
      ],
      timestamp: new Date().toISOString(),
    };

    return Response.json(errorPatterns);
  } catch (error) {
    logger.error('Failed to get error analysis:', error);
    throw error;
  }
}

/**
 * Get environment and configuration information
 */
async function getEnvironmentInfo() {
  const envConfig = getEnvironmentConfig();

  const environmentInfo = {
    ...envConfig,
    environment: process.env.NODE_ENV,
    // Mask sensitive information
    qstashToken: envConfig.qstashToken ? '***masked***' : null,
    runtime: {
      pid: process.pid,
      arch: process.arch,
      cwd: process.cwd(),
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
    },
    timestamp: new Date().toISOString(),
  };

  return Response.json(environmentInfo);
}

/**
 * Analyze a specific error
 */
async function analyzeError(params: { error: string; context?: any }) {
  const { context, error: errorStr } = params;

  try {
    // Create a mock error for classification
    const mockError = new Error(errorStr);
    const errorType = classifyWorkflowError(mockError);
    const retryable = isRetryableError(errorType);

    const analysis = {
      classification: {
        type: errorType,
        category: getErrorCategory(errorType),
        retryable,
      },
      context,
      original: errorStr,
      recommendations: getErrorRecommendations(errorType),
      timestamp: new Date().toISOString(),
    };

    return Response.json(analysis);
  } catch (error) {
    logger.error('Failed to analyze error:', error);
    throw error;
  }
}

/**
 * Run comprehensive system diagnostics
 */
async function runSystemDiagnostics(params: {
  includeWorkflows?: boolean;
  depth?: 'shallow' | 'deep';
}) {
  const { depth = 'shallow', includeWorkflows = true } = params;

  const diagnostics = {
    recommendations: [] as string[],
    services: {} as any,
    system: {} as any,
    timestamp: new Date().toISOString(),
  };

  // System diagnostics
  diagnostics.system = {
    cpuUsage: process.cpuUsage(),
    loadAverage: process.platform === 'linux' ? (await import('os')).loadavg() : null,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  };

  // Service diagnostics
  if (includeWorkflows) {
    try {
      const activeWorkflows = await monitor.listActiveWorkflows(10);
      diagnostics.services.workflows = {
        activeCount: activeWorkflows.length,
        recentStates: activeWorkflows.map((w) => w.state),
        status: 'healthy',
      };
    } catch (error) {
      diagnostics.services.workflows = {
        error: String(error),
        status: 'unhealthy',
      };
      diagnostics.recommendations.push('Check QStash connectivity and credentials');
    }
  }

  // Environment diagnostics
  const envConfig = getEnvironmentConfig();
  diagnostics.services.environment = {
    hasRequiredConfig: !!envConfig.qstashToken && !!envConfig.qstashUrl,
    isDevelopment: envConfig.isDevelopment,
  };

  if (!envConfig.qstashToken) {
    diagnostics.recommendations.push('Configure QSTASH_TOKEN environment variable');
  }

  if (depth === 'deep') {
    // Add more detailed diagnostics for deep mode
    diagnostics.system.detailed = {
      config: process.config,
      features: process.features,
      versions: process.versions,
    };
  }

  return Response.json(diagnostics);
}

/**
 * Helper functions
 */

function getErrorCategory(errorType: WorkflowErrorType): string {
  const categories: Partial<Record<WorkflowErrorType, string>> = {
    [WorkflowErrorType.AUTHENTICATION]: 'Security',
    [WorkflowErrorType.CONFIGURATION]: 'Setup',
    [WorkflowErrorType.CONFLICT]: 'State',
    [WorkflowErrorType.DATA_CORRUPTION]: 'Data',
    [WorkflowErrorType.EXTERNAL_API]: 'Integration',
    [WorkflowErrorType.INTERNAL]: 'Application',
    [WorkflowErrorType.NETWORK]: 'Infrastructure',
    [WorkflowErrorType.NOT_FOUND]: 'Resource',
    [WorkflowErrorType.PERMISSION]: 'Security',
    [WorkflowErrorType.RATE_LIMIT]: 'Throttling',
    [WorkflowErrorType.RESOURCE_EXHAUSTED]: 'Capacity',
    [WorkflowErrorType.TIMEOUT]: 'Performance',
    [WorkflowErrorType.UNAVAILABLE]: 'Infrastructure',
    [WorkflowErrorType.VALIDATION]: 'Input',
  };

  return categories[errorType] || 'Unknown';
}

function getErrorRecommendations(errorType: WorkflowErrorType): string[] {
  const recommendations: Partial<Record<WorkflowErrorType, string[]>> = {
    [WorkflowErrorType.AUTHENTICATION]: [
      'Check API credentials and tokens',
      'Implement token refresh mechanism',
      'Verify authentication configuration',
    ],
    [WorkflowErrorType.CONFIGURATION]: [
      'Verify environment variables and configuration',
      'Check configuration file syntax',
      'Review service dependencies',
    ],
    [WorkflowErrorType.CONFLICT]: [
      'Handle concurrent updates gracefully',
      'Implement optimistic locking',
      'Use idempotency keys for operations',
    ],
    [WorkflowErrorType.DATA_CORRUPTION]: [
      'Implement data validation at boundaries',
      'Add checksums for critical data',
      'Use transaction boundaries properly',
    ],
    [WorkflowErrorType.EXTERNAL_API]: [
      'Monitor third-party API status',
      'Implement fallback mechanisms',
      'Cache responses when appropriate',
    ],
    [WorkflowErrorType.NETWORK]: [
      'Implement exponential backoff retry strategy',
      'Check network connectivity and DNS resolution',
      'Consider using circuit breaker pattern',
    ],
    [WorkflowErrorType.NOT_FOUND]: [
      'Verify resource identifiers',
      'Handle missing resources gracefully',
      'Provide helpful error messages',
    ],
    [WorkflowErrorType.PERMISSION]: [
      'Review user permissions and roles',
      'Check API key scopes and permissions',
      'Verify resource access rights',
    ],
    [WorkflowErrorType.RATE_LIMIT]: [
      'Implement rate limiting awareness',
      'Use exponential backoff with jitter',
      'Monitor rate limit headers',
    ],
    [WorkflowErrorType.RESOURCE_EXHAUSTED]: [
      'Monitor resource usage',
      'Implement resource pooling',
      'Add circuit breakers for resource protection',
    ],
    [WorkflowErrorType.TIMEOUT]: [
      'Increase timeout values if appropriate',
      'Optimize slow operations',
      'Implement async processing for long-running tasks',
    ],
    [WorkflowErrorType.UNAVAILABLE]: [
      'Implement health checks',
      'Add service discovery',
      'Use load balancing',
    ],
    [WorkflowErrorType.VALIDATION]: [
      'Add input validation at API boundaries',
      'Provide clear error messages to users',
      'Implement schema validation',
    ],
  };

  return recommendations[errorType] || ['Review error context and logs for specific guidance'];
}
