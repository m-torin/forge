/**
 * Grafana Monitoring Service Integration Examples
 *
 * Comprehensive guide showing how to configure and use Grafana monitoring integration
 * with the @repo/observability package. This example demonstrates production-ready
 * monitoring setups for Next.js applications.
 *
 * IMPORTANT: Grafana monitoring is DISABLED by default and must be explicitly enabled.
 *
 * Features Demonstrated:
 * - Basic and advanced Grafana configuration
 * - Environment-specific setups (development, staging, production)
 * - Real User Monitoring (RUM) integration
 * - Custom metrics and business intelligence tracking
 * - API route monitoring
 * - Health checks and alerting
 * - Performance monitoring with traces
 *
 * Prerequisites:
 * - Grafana instance (self-hosted or cloud)
 * - Prometheus and Loki endpoints configured
 * - @repo/observability package installed
 * - Environment variables configured
 *
 * Environment: Next.js Server-Side and Client-Side
 *
 * @see https://grafana.com/docs/
 */

import { getRawEnv } from '../env';
import { ObservabilityConfig } from '../src/shared/types/types.js';

// ============================================================================
// 1. BASIC CONFIGURATION (DISABLED BY DEFAULT)
// ============================================================================

/**
 * Example: Observability without Grafana monitoring (default behavior)
 */
export const basicConfig: ObservabilityConfig = {
  providers: {
    console: { enabled: true },
    sentry: { dsn: 'your-sentry-dsn' },
    // grafanaMonitoring is NOT included - monitoring is disabled
  },
};

/**
 * Example: Explicitly enabling Grafana monitoring (opt-in)
 */
export const withGrafanaMonitoringConfig: ObservabilityConfig = {
  // Grafana monitoring configuration at the root level
  grafanaMonitoring: {
    enabled: true, // MUST be explicitly enabled
    endpoints: {
      grafana: 'https://grafana.your-domain.com',
      prometheus: 'https://grafana.your-domain.com:9090',
      loki: 'https://grafana.your-domain.com:3100',
      otelHttp: 'https://grafana.your-domain.com:4318',
      rum: 'https://grafana.your-domain.com:12347',
    },
    service: {
      name: 'my-app',
      version: '1.0.0',
      environment: 'production',
    },
    features: {
      rum: true, // Enable Real User Monitoring
      traces: true, // Enable distributed tracing
      metrics: true, // Enable custom metrics
      logs: true, // Enable structured logging
      healthChecks: true, // Enable health monitoring
    },
  },
  providers: {
    console: { enabled: true },
    sentry: { dsn: 'your-sentry-dsn' },
    // Add the Grafana provider
    grafanaMonitoring: {
      enabled: true, // Provider must also be enabled
      monitoring: {
        enabled: true,
        endpoints: {
          // Uses Railway service discovery by default
          grafana: getRawEnv().GRAFANA_URL || 'http://localhost:3000',
          prometheus: getRawEnv().PROMETHEUS_URL || 'http://localhost:9090',
          loki: getRawEnv().LOKI_URL || 'http://localhost:3100',
          otelHttp: getRawEnv().OTEL_HTTP_URL || 'http://localhost:4318',
          rum: getRawEnv().RUM_URL || 'http://localhost:12347',
        },
        service: {
          name: getRawEnv().SERVICE_NAME || 'unknown-service',
          version: getRawEnv().SERVICE_VERSION || '1.0.0',
          environment: getRawEnv().NODE_ENV || 'development',
        },
        features: {
          rum: getRawEnv().ENABLE_RUM === 'true',
          traces: getRawEnv().ENABLE_TRACES === 'true',
          metrics: true,
          logs: true,
          healthChecks: true,
        },
        sampling: {
          traces: 0.1, // 10% sampling for traces
          metrics: 1.0, // 100% metrics collection
          logs: 'info', // Info level and above
        },
        customMetrics: {
          enabled: true,
          prefix: 'myapp',
        },
        dashboard: {
          autoProvision: false, // Don't auto-create dashboards
        },
        alerts: {
          enabled: true,
          errorThreshold: 0.05, // 5% error rate threshold
          responseTimeThreshold: 2000, // 2 second response time threshold
        },
      },
    },
  },
};

// ============================================================================
// 2. ENVIRONMENT-SPECIFIC CONFIGURATIONS
// ============================================================================

/**
 * Development configuration - local monitoring service
 */
export const developmentConfig: ObservabilityConfig = {
  grafanaMonitoring: {
    enabled: true,
    endpoints: {
      grafana: 'http://localhost:3000',
      prometheus: 'http://localhost:9090',
      loki: 'http://localhost:3100',
      otelHttp: 'http://localhost:4318',
      rum: 'http://localhost:12347',
    },
    service: {
      name: 'my-app-dev',
      version: '1.0.0-dev',
      environment: 'development',
    },
    features: {
      rum: true,
      traces: true,
      metrics: true,
      logs: true,
      healthChecks: true,
    },
  },
  providers: {
    console: { enabled: true },
    grafanaMonitoring: {
      enabled: true,
      monitoring: {
        enabled: true,
        // Use localhost endpoints for development
        endpoints: {
          grafana: 'http://localhost:3000',
          prometheus: 'http://localhost:9090',
          loki: 'http://localhost:3100',
          otelHttp: 'http://localhost:4318',
          rum: 'http://localhost:12347',
        },
        service: {
          name: 'my-app-dev',
          version: '1.0.0-dev',
          environment: 'development',
        },
        features: {
          rum: true,
          traces: true,
          metrics: true,
          logs: true,
          healthChecks: true,
        },
        sampling: {
          traces: 1.0, // 100% sampling in development
          metrics: 1.0,
          logs: 'debug',
        },
      },
    },
  },
};

/**
 * Production configuration - Railway deployment
 */
export const productionConfig: ObservabilityConfig = {
  grafanaMonitoring: {
    enabled: true,
    endpoints: {
      grafana: 'https://grafana.your-domain.com',
      prometheus: 'https://grafana.your-domain.com:9090',
      loki: 'https://grafana.your-domain.com:3100',
      otelHttp: 'https://grafana.your-domain.com:4318',
      rum: 'https://grafana.your-domain.com:12347',
    },
    service: {
      name: 'my-app',
      version: '1.0.0',
      environment: 'production',
    },
    features: {
      rum: true,
      traces: true,
      metrics: true,
      logs: true,
      healthChecks: true,
    },
  },
  providers: {
    sentry: { dsn: getRawEnv().SENTRY_DSN },
    grafanaMonitoring: {
      enabled: true,
      monitoring: {
        enabled: true,
        endpoints: {
          grafana: getRawEnv().GRAFANA_URL || 'demo-value',
          prometheus: getRawEnv().PROMETHEUS_URL || 'demo-value',
          loki: getRawEnv().LOKI_URL || 'demo-value',
          otelHttp: getRawEnv().OTEL_HTTP_URL || 'demo-value',
          rum: getRawEnv().RUM_URL || 'demo-value',
        },
        service: {
          name: getRawEnv().SERVICE_NAME || 'demo-value',
          version: getRawEnv().SERVICE_VERSION || 'demo-value',
          environment: 'production',
        },
        features: {
          rum: true,
          traces: true,
          metrics: true,
          logs: true,
          healthChecks: true,
        },
        sampling: {
          traces: 0.1, // 10% sampling in production
          metrics: 1.0,
          logs: 'info',
        },
        customMetrics: {
          enabled: true,
          prefix: getRawEnv().SERVICE_NAME || 'demo-value',
        },
        alerts: {
          enabled: true,
          errorThreshold: 0.05,
          responseTimeThreshold: 2000,
        },
      },
    },
  },
};

// ============================================================================
// 3. USAGE EXAMPLES
// ============================================================================

/**
 * Server-side usage example
 */
export async function serverExample() {
  const { createServerObservability } = await import('@repo/observability/server/next');

  const observability = await createServerObservability(productionConfig);

  // Standard observability methods work as usual
  await observability.captureException(new Error('Server error'));
  await observability.log('info', 'Request processed', { userId: '123' });

  // Grafana-specific methods (if provider is enabled)
  const grafanaProvider = (observability as any).providers?.grafanaMonitoring;
  if (grafanaProvider) {
    // Track custom business metrics
    await grafanaProvider.trackBusinessMetric({
      name: 'user_registration',
      value: 1,
      category: 'users',
    });

    // Track database operations
    await grafanaProvider.trackDatabaseQuery({
      operation: 'SELECT',
      table: 'users',
      duration: 150,
      success: true,
    });

    // Track request metrics
    await grafanaProvider.trackRequestMetrics({
      method: 'GET',
      path: '/api/users',
      statusCode: 200,
      duration: 250,
    });

    // Report health status
    await grafanaProvider.reportHealthCheck({
      service: 'my-app',
      status: 'healthy',
      details: {
        version: '1.0.0',
        dependencies: [
          { name: 'database', status: 'healthy', responseTime: 50 },
          { name: 'redis', status: 'healthy', responseTime: 10 },
        ],
      },
    });
  }
}

/**
 * Client-side usage example
 */
export async function clientExample() {
  const { createClientObservability } = await import('@repo/observability/client/next');

  const observability = await createClientObservability(withGrafanaMonitoringConfig);

  // Standard observability methods
  await observability.captureException(new Error('Client error'));

  // Access Grafana client provider for RUM
  const grafanaProvider = (observability as any).providers?.grafanaMonitoring;
  if (grafanaProvider && typeof window !== 'undefined') {
    // Track custom user events
    grafanaProvider.trackCustomEvent('button_click', {
      buttonId: 'signup',
      page: '/landing',
    });

    // Track user actions
    grafanaProvider.trackUserAction('form_submit', 'contact-form', {
      formId: 'contact',
      fields: ['name', 'email'],
    });

    // Track performance marks
    grafanaProvider.trackPerformanceMark('api_call_start', {
      endpoint: '/api/users',
    });
  }
}

/**
 * Next.js API route example
 */
export async function apiRouteExample(req: any, res: any) {
  const { createServerObservability } = await import('@repo/observability/server/next');

  const observability = await createServerObservability(productionConfig);
  const startTime = Date.now();

  try {
    // Your API logic here
    const result = await processApiNextRequest(req);

    const grafanaProvider = (observability as any).providers?.grafanaMonitoring;
    if (grafanaProvider) {
      // Track successful request
      await grafanaProvider.trackRequestMetrics({
        method: req.method,
        path: req.url,
        statusCode: 200,
        duration: Date.now() - startTime,
        userAgent: req.headers['user-agent'],
      });
    }

    res.status(200).json(result);
  } catch (error: any) {
    await observability.captureException(error as Error, {
      tags: { api_route: req.url },
    });

    const grafanaProvider = (observability as any).providers?.grafanaMonitoring;
    if (grafanaProvider) {
      // Track failed request
      await grafanaProvider.trackRequestMetrics({
        method: req.method,
        path: req.url,
        statusCode: 500,
        duration: Date.now() - startTime,
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}

// ============================================================================
// 4. CONFIGURATION UTILITIES
// ============================================================================

/**
 * Utility to create configuration based on environment
 */
export function createGrafanaObservabilityConfig(options: {
  serviceName: string;
  serviceVersion: string;
  environment: 'development' | 'staging' | 'production';
  enableGrafana?: boolean;
  grafanaEndpoints?: {
    grafana?: string;
    prometheus?: string;
    loki?: string;
    otelHttp?: string;
    rum?: string;
  };
}): ObservabilityConfig {
  const {
    serviceName,
    serviceVersion,
    environment,
    enableGrafana = false,
    grafanaEndpoints,
  } = options;

  const config: ObservabilityConfig = {
    providers: {
      console: { enabled: environment === 'development' },
    },
  };

  // Add Sentry for non-development environments
  if (environment !== 'development' && getRawEnv().SENTRY_DSN) {
    config.providers.sentry = { dsn: getRawEnv().SENTRY_DSN };
  }

  // Add Grafana monitoring if explicitly enabled
  if (enableGrafana) {
    config.grafanaMonitoring = {
      enabled: true,
      endpoints: grafanaEndpoints || {
        grafana: getRawEnv().GRAFANA_URL || 'http://localhost:3000',
        prometheus: getRawEnv().PROMETHEUS_URL || 'http://localhost:9090',
        loki: getRawEnv().LOKI_URL || 'http://localhost:3100',
        otelHttp: getRawEnv().OTEL_HTTP_URL || 'http://localhost:4318',
        rum: getRawEnv().RUM_URL || 'http://localhost:12347',
      },
      service: {
        name: serviceName,
        version: serviceVersion,
        environment,
      },
      features: {
        rum: true,
        traces: true,
        metrics: true,
        logs: true,
        healthChecks: true,
      },
    };

    config.providers.grafanaMonitoring = {
      enabled: true,
      monitoring: config.grafanaMonitoring,
    };
  }

  return config;
}

// ============================================================================
// 5. ENVIRONMENT VARIABLE EXAMPLES
// ============================================================================

/**
 * Required environment variables for Grafana monitoring
 * Add these to your .env.local or Railway environment variables
 */
export const environmentVariables = `
# Grafana Monitoring Configuration (optional - disabled by default)
ENABLE_GRAFANA_MONITORING=true
GRAFANA_URL=https://grafana.your-domain.com
PROMETHEUS_URL=https://grafana.your-domain.com:9090
LOKI_URL=https://grafana.your-domain.com:3100
OTEL_HTTP_URL=https://grafana.your-domain.com:4318
RUM_URL=https://grafana.your-domain.com:12347

# Service Configuration
SERVICE_NAME=my-app
SERVICE_VERSION=1.0.0

# Feature Flags
ENABLE_RUM=true
ENABLE_TRACES=true
ENABLE_METRICS=true
ENABLE_LOGS=true
ENABLE_HEALTH_CHECKS=true

# Sampling Configuration
TRACE_SAMPLING_RATE=0.1
METRIC_SAMPLING_RATE=1.0
LOG_LEVEL=info
`;

// Helper function stub
async function processApiNextRequest(_req: any): Promise<any> {
  // Placeholder for actual API logic
  return { success: true };
}
