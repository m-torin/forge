#!/usr/bin/env tsx
/**
 * Multi-Zone Deployment Validation Script
 *
 * Validates that all backstage services are properly configured and reachable
 * Supports validation across development, preview, and production environments
 */

import { performance } from 'perf_hooks';

// Service configuration
interface ServiceConfig {
  name: string;
  port: number;
  healthEndpoints: string[];
  requiredEnvVars: string[];
  optionalEnvVars: string[];
}

const BACKSTAGE_SERVICES: ServiceConfig[] = [
  {
    name: 'backstage',
    port: 3300,
    healthEndpoints: ['/api/health', '/health', '/api/status'],
    requiredEnvVars: ['NEXT_PUBLIC_NODE_ENV'],
    optionalEnvVars: [
      'NEXT_PUBLIC_BACKSTAGE_CMS_URL',
      'NEXT_PUBLIC_BACKSTAGE_AUTHMGMT_URL',
      'NEXT_PUBLIC_BACKSTAGE_WORKFLOWS_URL',
    ],
  },
  {
    name: 'backstage-cms',
    port: 3301,
    healthEndpoints: ['/api/health', '/health', '/api/status'],
    requiredEnvVars: ['NEXT_PUBLIC_NODE_ENV'],
    optionalEnvVars: [
      'DATABASE_URL',
      'POSTGRES_URL',
      'SERVICE_API_KEY',
      'NEXT_PUBLIC_BACKSTAGE_MAIN_URL',
    ],
  },
  {
    name: 'backstage-authmgmt',
    port: 3302,
    healthEndpoints: ['/api/health', '/health', '/api/status'],
    requiredEnvVars: ['NEXT_PUBLIC_NODE_ENV'],
    optionalEnvVars: [
      'SERVICE_API_KEY',
      'NEXT_PUBLIC_BACKSTAGE_MAIN_URL',
      'NEXT_PUBLIC_BACKSTAGE_CMS_URL',
    ],
  },
  {
    name: 'backstage-workflows',
    port: 3303,
    healthEndpoints: ['/api/health', '/health', '/api/status'],
    requiredEnvVars: ['NEXT_PUBLIC_NODE_ENV'],
    optionalEnvVars: [
      'QSTASH_TOKEN',
      'QSTASH_URL',
      'DATABASE_URL',
      'POSTGRES_URL',
      'SERVICE_API_KEY',
    ],
  },
];

interface ValidationResult {
  serviceName: string;
  url: string;
  isHealthy: boolean;
  responseTime?: number;
  healthEndpoint?: string;
  error?: string;
  envVarsStatus: {
    missing: string[];
    present: string[];
    optional: string[];
  };
}

interface DeploymentValidationReport {
  environment: 'development' | 'preview' | 'production';
  timestamp: string;
  overallStatus: 'healthy' | 'partial' | 'unhealthy';
  services: ValidationResult[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    avgResponseTime: number;
  };
}

/**
 * Detects the current environment
 */
function detectEnvironment(): 'development' | 'preview' | 'production' {
  const vercelEnv = process.env.VERCEL_ENV;
  const nodeEnv = process.env.NODE_ENV;

  if (vercelEnv === 'production') return 'production';
  if (vercelEnv === 'preview') return 'preview';
  if (nodeEnv === 'development' || !vercelEnv) return 'development';

  return 'development';
}

/**
 * Constructs service URL based on environment
 */
function getServiceUrl(
  service: ServiceConfig,
  environment: 'development' | 'preview' | 'production',
): string {
  if (environment === 'development') {
    return `http://localhost:${service.port}`;
  }

  // Check for explicit environment variables first
  const envVar = `NEXT_PUBLIC_${service.name.toUpperCase().replace('-', '_')}_URL`;
  const explicitUrl = process.env[envVar];
  if (explicitUrl) {
    return explicitUrl;
  }

  // For production
  if (environment === 'production') {
    return `https://${service.name}.vercel.app`;
  }

  // For preview - try to construct from VERCEL_URL
  const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercelUrl) {
    // Try to replace the app name in the URL
    if (vercelUrl.includes('backstage')) {
      const serviceUrl = vercelUrl.replace(/backstage(?!-)/, service.name);
      return `https://${serviceUrl}`;
    }
  }

  // Fallback to preview domain
  return `https://${service.name}-preview.vercel.app`;
}

/**
 * Validates service health by trying multiple endpoints
 */
async function validateServiceHealth(
  service: ServiceConfig,
  baseUrl: string,
  timeout = 10000,
): Promise<Pick<ValidationResult, 'isHealthy' | 'responseTime' | 'healthEndpoint' | 'error'>> {
  for (const endpoint of service.healthEndpoints) {
    try {
      const startTime = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = performance.now() - startTime;

      if (response.ok) {
        return {
          isHealthy: true,
          responseTime,
          healthEndpoint: endpoint,
        };
      }
    } catch (error) {
      // Continue to next endpoint
      continue;
    }
  }

  return {
    isHealthy: false,
    error: `No healthy endpoints found among: ${service.healthEndpoints.join(', ')}`,
  };
}

/**
 * Validates environment variables for a service
 */
function validateEnvironmentVariables(service: ServiceConfig) {
  const missing: string[] = [];
  const present: string[] = [];
  const optional: string[] = [];

  // Check required environment variables
  for (const envVar of service.requiredEnvVars) {
    if (process.env[envVar]) {
      present.push(envVar);
    } else {
      missing.push(envVar);
    }
  }

  // Check optional environment variables
  for (const envVar of service.optionalEnvVars) {
    if (process.env[envVar]) {
      present.push(envVar);
    } else {
      optional.push(envVar);
    }
  }

  return { missing, present, optional };
}

/**
 * Validates a single service
 */
async function validateService(
  service: ServiceConfig,
  environment: 'development' | 'preview' | 'production',
): Promise<ValidationResult> {
  const url = getServiceUrl(service, environment);
  const envVarsStatus = validateEnvironmentVariables(service);

  console.log(`🔍 Validating ${service.name} at ${url}...`);

  const healthResult = await validateServiceHealth(service, url);

  return {
    serviceName: service.name,
    url,
    envVarsStatus,
    ...healthResult,
  };
}

/**
 * Runs comprehensive deployment validation
 */
async function validateDeployment(): Promise<DeploymentValidationReport> {
  const environment = detectEnvironment();
  console.log(`🚀 Starting multi-zone deployment validation for ${environment} environment`);

  const validationPromises = BACKSTAGE_SERVICES.map(service =>
    validateService(service, environment),
  );

  const services = await Promise.all(validationPromises);

  // Calculate summary statistics
  const healthy = services.filter(s => s.isHealthy).length;
  const unhealthy = services.length - healthy;
  const avgResponseTime =
    services.filter(s => s.responseTime).reduce((sum, s) => sum + (s.responseTime || 0), 0) /
    Math.max(1, healthy);

  const overallStatus: 'healthy' | 'partial' | 'unhealthy' =
    healthy === services.length ? 'healthy' : healthy > 0 ? 'partial' : 'unhealthy';

  return {
    environment,
    timestamp: new Date().toISOString(),
    overallStatus,
    services,
    summary: {
      total: services.length,
      healthy,
      unhealthy,
      avgResponseTime,
    },
  };
}

/**
 * Formats and displays the validation report
 */
function displayReport(report: DeploymentValidationReport) {
  console.log(
    '\
' + '='.repeat(60),
  );
  console.log(`📊 MULTI-ZONE DEPLOYMENT VALIDATION REPORT`);
  console.log('='.repeat(60));
  console.log(`Environment: ${report.environment}`);
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(
    `Overall Status: ${getStatusEmoji(report.overallStatus)} ${report.overallStatus.toUpperCase()}`,
  );
  console.log(`Services: ${report.summary.healthy}/${report.summary.total} healthy`);
  if (report.summary.avgResponseTime > 0) {
    console.log(`Average Response Time: ${report.summary.avgResponseTime.toFixed(2)}ms`);
  }
  console.log(
    '\
' + '-'.repeat(60),
  );

  for (const service of report.services) {
    const status = service.isHealthy ? '✅' : '❌';
    console.log(`${status} ${service.serviceName}`);
    console.log(`   URL: ${service.url}`);

    if (service.isHealthy) {
      console.log(`   Health: ${service.healthEndpoint} (${service.responseTime?.toFixed(2)}ms)`);
    } else {
      console.log(`   Error: ${service.error}`);
    }

    // Environment variables status
    if (service.envVarsStatus.missing.length > 0) {
      console.log(`   ⚠️  Missing required env vars: ${service.envVarsStatus.missing.join(', ')}`);
    }
    if (service.envVarsStatus.present.length > 0) {
      console.log(`   ✅ Present env vars: ${service.envVarsStatus.present.length} configured`);
    }
    if (service.envVarsStatus.optional.length > 0) {
      console.log(`   ℹ️  Optional env vars not set: ${service.envVarsStatus.optional.length}`);
    }
    console.log('');
  }

  console.log('-'.repeat(60));

  // Recommendations
  if (report.overallStatus !== 'healthy') {
    console.log(
      '\
🔧 RECOMMENDATIONS:',
    );

    const unhealthyServices = report.services.filter(s => !s.isHealthy);
    for (const service of unhealthyServices) {
      console.log(
        `• ${service.serviceName}: Check if service is running and accessible at ${service.url}`,
      );
      if (service.envVarsStatus.missing.length > 0) {
        console.log(
          `  - Set required environment variables: ${service.envVarsStatus.missing.join(', ')}`,
        );
      }
    }

    if (report.environment === 'development') {
      console.log('• For local development, ensure all services are started with `pnpm dev`');
    } else {
      console.log(
        '• For deployed environments, check Vercel deployment status and environment variables',
      );
    }
  }
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'healthy':
      return '🟢';
    case 'partial':
      return '🟡';
    case 'unhealthy':
      return '🔴';
    default:
      return '⚪';
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const report = await validateDeployment();
    displayReport(report);

    // Exit with appropriate code
    process.exit(report.overallStatus === 'healthy' ? 0 : 1);
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { DeploymentValidationReport, validateDeployment, validateService, ValidationResult };
