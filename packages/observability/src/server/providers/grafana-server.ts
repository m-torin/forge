/**
 * Grafana Monitoring Server Provider
 * Server-side integration with metrics, traces, and logs
 */

import { GrafanaMonitoringProvider } from '../../shared/providers/grafana-monitoring-provider';
import { GrafanaBusinessMetric, GrafanaHealthCheck } from '../../shared/types/grafana-types.js';

export class GrafanaServerProvider extends GrafanaMonitoringProvider {
  private healthCheckInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;
  private processMetrics: Map<string, number> = new Map();

  async initialize(config: any): Promise<void> {
    await super.initialize(config);

    if (!this.isServerEnabled()) return;

    // Initialize server-specific monitoring
    this.initializeSystemMetrics();
    this.initializeHealthChecks();
    this.initializeProcessMonitoring();

    console.debug('[GrafanaServer] Server-side monitoring initialized');
  }

  private isServerEnabled(): boolean {
    return this.config?.enabled === true && this.config?.monitoring?.enabled === true;
  }

  private initializeSystemMetrics(): void {
    if (!this.isServerEnabled() || !this.config?.monitoring?.features?.metrics) return;

    this.metricsInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 30000); // Collect every 30 seconds
  }

  private initializeHealthChecks(): void {
    if (!this.isServerEnabled() || !this.config?.monitoring?.features?.healthChecks) return;

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Health check every minute
  }

  private initializeProcessMonitoring(): void {
    if (!this.isServerEnabled()) return;

    // Monitor process events
    process.on('uncaughtException', (error: any) => {
      this.captureException(error, {
        level: 'fatal',
        tags: { error_type: 'uncaught_exception' },
      });
    });

    process.on('unhandledRejection', (reason, promise: any) => {
      const error = new Error(`Unhandled Rejection: ${reason}`);
      this.captureException(error, {
        level: 'error',
        tags: { error_type: 'unhandled_rejection' },
        extra: { promise: String(promise) },
      });
    });

    // Track process exit
    process.on('exit', (code: any) => {
      this.log('info', `Process exiting with code: ${code}`, {
        exit_code: code,
        uptime: process.uptime(),
      });
    });

    // Track SIGTERM and SIGINT
    process.on('SIGTERM', () => {
      this.log('info', 'Received SIGTERM signal', { signal: 'SIGTERM' });
    });

    process.on('SIGINT', () => {
      this.log('info', 'Received SIGINT signal', { signal: 'SIGINT' });
    });
  }

  private async collectSystemMetrics(): Promise<void> {
    if (!this.isServerEnabled()) return;

    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage(this.processMetrics.get('lastCpuUsage') as any);

      // Store current CPU usage for next calculation
      this.processMetrics.set('lastCpuUsage', process.cpuUsage() as any);

      // Memory metrics
      await this.trackMetric({
        name: 'process_memory_heap_used_bytes',
        value: memUsage.heapUsed,
        type: 'gauge',
      });

      await this.trackMetric({
        name: 'process_memory_heap_total_bytes',
        value: memUsage.heapTotal,
        type: 'gauge',
      });

      await this.trackMetric({
        name: 'process_memory_external_bytes',
        value: memUsage.external,
        type: 'gauge',
      });

      await this.trackMetric({
        name: 'process_memory_rss_bytes',
        value: memUsage.rss,
        type: 'gauge',
      });

      // CPU metrics
      await this.trackMetric({
        name: 'process_cpu_user_seconds_total',
        value: cpuUsage.user / 1000000, // Convert microseconds to seconds
        type: 'counter',
      });

      await this.trackMetric({
        name: 'process_cpu_system_seconds_total',
        value: cpuUsage.system / 1000000,
        type: 'counter',
      });

      // Process uptime
      await this.trackMetric({
        name: 'process_uptime_seconds',
        value: process.uptime(),
        type: 'gauge',
      });

      // Event loop lag
      const start = process.hrtime.bigint();
      setImmediate(() => {
        const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to milliseconds
        this.trackMetric({
          name: 'nodejs_eventloop_lag_milliseconds',
          value: lag,
          type: 'gauge',
        });
      });
    } catch (error) {
      throw new Error(`[GrafanaServer] Failed to collect system metrics: ${error}`);
    }
  }

  private async performHealthCheck(): Promise<void> {
    if (!this.isServerEnabled()) return;

    const startTime = Date.now();

    try {
      // Basic health check
      const memUsage = process.memoryUsage();
      const uptime = process.uptime();
      const responseTime = Date.now() - startTime;

      const health: Omit<GrafanaHealthCheck, 'timestamp'> = {
        service: this.config?.monitoring.service.name || 'unknown-service',
        status: 'healthy',
        responseTime,
        details: {
          version: this.config?.monitoring.service.version || '1.0.0',
          memory: {
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            rss: memUsage.rss,
          },
          dependencies: await this.checkDependencies(),
          metrics: {
            uptime,
          },
        },
      };

      // Determine health status
      if (responseTime > 5000) {
        health.status = 'degraded';
      }

      if (memUsage.heapUsed / memUsage.heapTotal > 0.9) {
        health.status = 'degraded';
      }

      await this.reportHealthCheck(health);
    } catch (_error) {
      const health: Omit<GrafanaHealthCheck, 'timestamp'> = {
        service: this.config?.monitoring.service.name || 'unknown-service',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        details: {
          version: this.config?.monitoring.service.version || '1.0.0',
          metrics: {
            errorCount: 1,
          },
        },
      };

      await this.reportHealthCheck(health);
    }
  }

  private async checkDependencies(): Promise<
    Array<{ name: string; status: 'healthy' | 'unhealthy'; responseTime?: number }>
  > {
    const dependencies: Array<{
      name: string;
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
    }> = [];

    // Check monitoring service endpoints
    if (this.config?.endpoints) {
      for (const [name, endpoint] of Object.entries(this.config.endpoints)) {
        const startTime = Date.now();
        try {
          const response = await fetch(`${endpoint.url}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined,
          });

          dependencies.push({
            name,
            status: response.ok ? 'healthy' : 'unhealthy',
            responseTime: Date.now() - startTime,
          });
        } catch {
          dependencies.push({
            name,
            status: 'unhealthy' as const,
            responseTime: Date.now() - startTime,
          });
        }
      }
    }

    return dependencies;
  }

  // Public methods for server-specific tracking
  public async trackRequestMetrics(request: {
    method: string;
    path: string;
    statusCode: number;
    duration: number;
    userAgent?: string;
  }): Promise<void> {
    if (!this.isServerEnabled()) return;

    // Track request count
    await this.trackMetric({
      name: 'http_requests_total',
      value: 1,
      type: 'counter',
      labels: {
        method: request.method,
        status_code: String(request.statusCode),
        path: this.normalizePath(request.path),
      },
    });

    // Track request duration
    await this.trackMetric({
      name: 'http_request_duration_milliseconds',
      value: request.duration,
      type: 'histogram',
      labels: {
        method: request.method,
        path: this.normalizePath(request.path),
      },
    });

    // Log request details
    await this.log('info', `${request.method} ${request.path} ${request.statusCode}`, {
      method: request.method,
      path: request.path,
      status_code: request.statusCode,
      duration_ms: request.duration,
      user_agent: request.userAgent,
    });
  }

  public async trackDatabaseQuery(query: {
    operation: string;
    table?: string;
    duration: number;
    success: boolean;
    error?: string;
  }): Promise<void> {
    if (!this.isServerEnabled()) return;

    await this.trackMetric({
      name: 'database_queries_total',
      value: 1,
      type: 'counter',
      labels: {
        operation: query.operation,
        table: query.table || 'unknown',
        success: String(query.success),
      },
    });

    await this.trackMetric({
      name: 'database_query_duration_milliseconds',
      value: query.duration,
      type: 'histogram',
      labels: {
        operation: query.operation,
        table: query.table || 'unknown',
      },
    });

    if (!query.success && query.error) {
      await this.log('error', `Database query failed: ${query.error}`, {
        operation: query.operation,
        table: query.table,
        duration_ms: query.duration,
        error: query.error,
      });
    }
  }

  public async trackCacheOperation(operation: {
    type: 'hit' | 'miss' | 'set' | 'delete';
    key: string;
    duration?: number;
  }): Promise<void> {
    if (!this.isServerEnabled()) return;

    await this.trackMetric({
      name: 'cache_operations_total',
      value: 1,
      type: 'counter',
      labels: {
        operation: operation.type,
      },
    });

    if (operation.duration) {
      await this.trackMetric({
        name: 'cache_operation_duration_milliseconds',
        value: operation.duration,
        type: 'histogram',
        labels: {
          operation: operation.type,
        },
      });
    }
  }

  public async trackJobExecution(job: {
    name: string;
    duration: number;
    success: boolean;
    error?: string;
  }): Promise<void> {
    if (!this.isServerEnabled()) return;

    await this.trackMetric({
      name: 'job_executions_total',
      value: 1,
      type: 'counter',
      labels: {
        job_name: job.name,
        success: String(job.success),
      },
    });

    await this.trackMetric({
      name: 'job_duration_milliseconds',
      value: job.duration,
      type: 'histogram',
      labels: {
        job_name: job.name,
      },
    });

    if (!job.success && job.error) {
      await this.captureException(new Error(job.error), {
        tags: {
          job_name: job.name,
          error_type: 'job_execution_failed',
        },
      });
    }
  }

  public async trackBusinessMetrics(metrics: {
    userRegistrations?: number;
    activeUsers?: number;
    revenue?: number;
    orders?: number;
    customMetrics?: Record<string, number>;
  }): Promise<void> {
    if (!this.isServerEnabled()) return;

    for (const [name, value] of Object.entries(metrics)) {
      if (typeof value === 'number') {
        await this.trackBusinessMetric({
          name,
          value,
          category: this.getBusinessMetricCategory(name),
        });
      }
    }
  }

  private normalizePath(path: string): string {
    // Replace dynamic segments with placeholders
    return path
      .replace(/\/\d+/g, '/:id')
      .replace(/\/[a-f0-9-]{36}/g, '/:uuid')
      .replace(/\/[a-f0-9]{24}/g, '/:objectid');
  }

  private getBusinessMetricCategory(metricName: string): GrafanaBusinessMetric['category'] {
    if (metricName.includes('revenue') || metricName.includes('payment')) {
      return 'revenue';
    }
    if (metricName.includes('user') || metricName.includes('registration')) {
      return 'users';
    }
    if (metricName.includes('response') || metricName.includes('latency')) {
      return 'performance';
    }
    if (metricName.includes('engagement') || metricName.includes('session')) {
      return 'engagement';
    }
    return 'custom';
  }

  // Cleanup method
  public destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }
}
