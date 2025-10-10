#!/usr/bin/env node
/**
 * Quick Health Check Script
 *
 * Performs a fast health check of all services
 * Useful for CI/CD pipelines and quick status verification
 */

const SERVICES = [
  { name: 'webapp', port: 3200 },
  { name: 'ai-chatbot', port: 3100 },
  { name: 'email', port: 3500 },
  { name: 'studio', port: 3600 },
  { name: 'storybook', port: 3700 },
  { name: 'docs', port: 3800 },
];

/**
 * @typedef {Object} HealthResult
 * @property {string} service - Service name
 * @property {string} url - Service URL
 * @property {'healthy'|'unhealthy'} status - Health status
 * @property {number} [responseTime] - Response time in milliseconds
 */

/**
 * Quick health check for a single service
 * @param {{ name: string; port: number }} service - Service to check
 * @returns {Promise<HealthResult>}
 */
async function checkHealth(service) {
  const environment = process.env.NODE_ENV === 'development' ? 'development' : 'production';

  let url;
  if (environment === 'development') {
    url = `http://localhost:${service.port}`;
  } else {
    // Check for explicit environment variable
    const envVar = `NEXT_PUBLIC_${service.name.toUpperCase().replace('-', '_')}_URL`;
    url = process.env[envVar] || `https://${service.name}.vercel.app`;
  }

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${url}/api/health`, {
      method: 'HEAD',
      signal: controller.signal,
    });

    const responseTime = Date.now() - startTime;

    return {
      service: service.name,
      url,
      status: response.ok ? 'healthy' : 'unhealthy',
      responseTime,
    };
  } catch (error) {
    return {
      service: service.name,
      url,
      status: 'unhealthy',
    };
  }
}

/**
 * Run health checks for all services
 */
async function main() {
  console.log('🔍 Running health checks...');

  const results = await Promise.all(SERVICES.map(service => checkHealth(service)));

  console.log('\nHealth Check Results:');
  console.log('-'.repeat(50));

  let allHealthy = true;
  for (const result of results) {
    const status = result.status === 'healthy' ? '✅' : '❌';
    const responseTime = result.responseTime ? ` (${result.responseTime}ms)` : '';
    console.log(`${status} ${result.service}${responseTime}`);
    console.log(`   ${result.url}`);

    if (result.status === 'unhealthy') {
      allHealthy = false;
    }
  }

  console.log('-'.repeat(50));
  console.log(
    `Overall Status: ${allHealthy ? '✅ All services healthy' : '❌ Some services unhealthy'}`,
  );

  process.exit(allHealthy ? 0 : 1);
}

// Run main function
main();
