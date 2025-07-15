/**
 * Grafana Monitoring Service Provider
 * Integrates with the enhanced monitoring service for RUM, metrics, traces, and logs
 * Disabled by default - must be explicitly enabled in configuration
 */

import {
  GrafanaBusinessMetric,
  GrafanaHealthCheck,
  GrafanaLogEntry,
  GrafanaMetric,
  GrafanaProviderConfig,
  GrafanaRUMEvent,
  GrafanaTrace,
} from '../types/grafana-types.js';
import {
  Breadcrumb,
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../types/types.js';

export class GrafanaMonitoringProvider implements ObservabilityProvider {
  public readonly name = 'grafana-monitoring';

  protected config: GrafanaProviderConfig | null = null;
  private initialized = false;
  private metricsBuffer: GrafanaMetric[] = [];
  private logsBuffer: GrafanaLogEntry[] = [];
  private tracesBuffer: GrafanaTrace[] = [];
  private rumBuffer: GrafanaRUMEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  async initialize(config: ObservabilityProviderConfig): Promise<void> {
    // Extract Grafana-specific config
    const grafanaConfig = config as GrafanaProviderConfig;

    // Default to disabled unless explicitly enabled
    if (!grafanaConfig.enabled || !grafanaConfig.monitoring?.enabled) {
      console.debug('[GrafanaMonitoring] Provider disabled in configuration');
      return;
    }

    this.config = {
      enabled: true,
      monitoring: {
        enabled: true,
        endpoints: {
          ...grafanaConfig.monitoring.endpoints,
          grafana: grafanaConfig.monitoring.endpoints?.grafana || 'http://localhost:3000',
          prometheus: grafanaConfig.monitoring.endpoints?.prometheus || 'http://localhost:9090',
          loki: grafanaConfig.monitoring.endpoints?.loki || 'http://localhost:3100',
          otelGrpc: grafanaConfig.monitoring.endpoints?.otelGrpc || 'http://localhost:4317',
          otelHttp: grafanaConfig.monitoring.endpoints?.otelHttp || 'http://localhost:4318',
          rum: grafanaConfig.monitoring.endpoints?.rum || 'http://localhost:12347',
        },
        service: {
          ...grafanaConfig.monitoring.service,
          name: grafanaConfig.monitoring.service?.name || 'unknown-service',
          version: grafanaConfig.monitoring.service?.version || '1.0.0',
          environment: grafanaConfig.monitoring.service?.environment || 'development',
        },
        features: {
          ...grafanaConfig.monitoring.features,
          rum: grafanaConfig.monitoring.features?.rum || false,
          traces: grafanaConfig.monitoring.features?.traces || false,
          metrics: grafanaConfig.monitoring.features?.metrics ?? true,
          logs: grafanaConfig.monitoring.features?.logs ?? true,
          healthChecks: grafanaConfig.monitoring.features?.healthChecks || false,
        },
        sampling: {
          traces: 0.1,
          metrics: 1.0,
          logs: 'info',
          ...grafanaConfig.monitoring.sampling,
        },
        customMetrics: {
          enabled: false,
          prefix: grafanaConfig.monitoring.service?.name || 'app',
          ...grafanaConfig.monitoring.customMetrics,
        },
        dashboard: {
          autoProvision: false,
          ...grafanaConfig.monitoring.dashboard,
        },
        alerts: {
          enabled: false,
          errorThreshold: 0.05,
          responseTimeThreshold: 2000,
          ...grafanaConfig.monitoring.alerts,
        },
      },
      endpoints: {
        prometheus: {
          url: grafanaConfig.monitoring.endpoints?.prometheus || 'http://localhost:9090',
          timeout: 5000,
          retries: 3,
        },
        loki: {
          url: grafanaConfig.monitoring.endpoints?.loki || 'http://localhost:3100',
          timeout: 5000,
          retries: 3,
        },
        otel: {
          url: grafanaConfig.monitoring.endpoints?.otelHttp || 'http://localhost:4318',
          timeout: 10000,
          retries: 3,
        },
        rum: {
          url: grafanaConfig.monitoring.endpoints?.rum || 'http://localhost:12347',
          timeout: 5000,
          retries: 2,
        },
        ...grafanaConfig.endpoints,
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        resetTimeout: 30000,
        ...grafanaConfig.circuitBreaker,
      },
      retry: {
        attempts: 3,
        backoff: 'exponential',
        delay: 1000,
        ...grafanaConfig.retry,
      },
      batching: {
        enabled: true,
        maxBatchSize: 100,
        flushInterval: 5000,
        ...grafanaConfig.batching,
      },
    };

    this.initialized = true;
    this.startFlushTimer();

    console.debug('[GrafanaMonitoring] Provider initialized', {
      service: this.config.monitoring.service,
      features: this.config.monitoring.features,
      endpoints: Object.keys(this.config.endpoints),
    });
  }

  /**
   * Safely get the config, throwing an error if not initialized
   */
  private getConfig(): GrafanaProviderConfig {
    if (!this.config) {
      throw new Error('GrafanaMonitoringProvider not initialized - call initialize() first');
    }
    return this.config;
  }

  async captureException(error: Error, context?: ObservabilityContext): Promise<void> {
    if (!this.isEnabled()) return;

    const logEntry: GrafanaLogEntry = {
      timestamp: Date.now(),
      level: 'error',
      message: (error as Error)?.message || 'Unknown error',
      service: this.getConfig().monitoring.service.name,
      labels: {
        error_type: error.name,
        environment: this.getConfig().monitoring.service.environment,
        ...context?.tags,
      },
      context: {
        stack: error.stack,
        ...context,
      },
      traceId: context?.traceId,
      spanId: context?.spanId,
    };

    await this.logError(logEntry);

    // Also track as RUM error if enabled
    if (this.getConfig().monitoring.features.rum && typeof window !== 'undefined') {
      const rumEvent: GrafanaRUMEvent = {
        type: 'error',
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
        userId: context?.userId,
        error: {
          message: (error as Error)?.message || 'Unknown error',
          stack: error.stack,
          type: error.name,
        },
        properties: context,
      };

      await this.trackRUMEvent(rumEvent);
    }
  }

  async captureMessage(
    message: string,
    level: 'error' | 'info' | 'warning',
    context?: ObservabilityContext,
  ): Promise<void> {
    if (!this.isEnabled()) return;

    const logEntry: GrafanaLogEntry = {
      timestamp: Date.now(),
      level: level === 'warning' ? 'warn' : level,
      message,
      service: this.getConfig().monitoring.service.name,
      labels: {
        environment: this.getConfig().monitoring.service.environment,
        ...context?.tags,
      },
      context,
      traceId: context?.traceId,
      spanId: context?.spanId,
    };

    await this.logMessage(logEntry);
  }

  async log(level: string, message: string, metadata?: any): Promise<void> {
    if (!this.isEnabled() || !this.getConfig().monitoring.features.logs) return;

    const logEntry: GrafanaLogEntry = {
      timestamp: Date.now(),
      level: this.normalizeLogLevel(level),
      message,
      service: this.getConfig().monitoring.service.name,
      labels: {
        environment: this.getConfig().monitoring.service.environment,
      },
      context: metadata,
    };

    await this.logMessage(logEntry);
  }

  // Custom methods for Grafana integration
  async trackMetric(metric: Omit<GrafanaMetric, 'timestamp'>): Promise<void> {
    if (!this.isEnabled() || !this.getConfig().monitoring.features.metrics) return;

    const fullMetric: GrafanaMetric = {
      ...metric,
      timestamp: Date.now(),
      labels: {
        service: this.getConfig().monitoring.service.name,
        environment: this.getConfig().monitoring.service.environment,
        ...metric.labels,
      },
    };

    if (this.getConfig().batching?.enabled) {
      this.metricsBuffer.push(fullMetric);
    } else {
      await this.sendMetric(fullMetric);
    }
  }

  async trackBusinessMetric(
    metric: Omit<GrafanaBusinessMetric, 'timestamp' | 'service'>,
  ): Promise<void> {
    if (!this.isEnabled() || !this.getConfig().monitoring.customMetrics?.enabled) return;

    const businessMetric: GrafanaBusinessMetric = {
      ...metric,
      timestamp: Date.now(),
      service: this.getConfig().monitoring.service.name,
    };

    await this.sendBusinessMetric(businessMetric);
  }

  async startSpan(name: string, parentSpan?: any): Promise<any> {
    if (!this.isEnabled() || !this.getConfig().monitoring.features.traces) return null;

    const span = {
      traceId: parentSpan?.traceId || this.generateTraceId(),
      spanId: this.generateSpanId(),
      parentSpanId: parentSpan?.spanId,
      operationName: name,
      startTime: Date.now(),
      tags: {
        service: this.getConfig().monitoring.service.name,
        environment: this.getConfig().monitoring.service.environment,
      },
      end: () => this.endSpan(span),
    };

    return span;
  }

  async trackRUMEvent(event: Omit<GrafanaRUMEvent, 'timestamp'>): Promise<void> {
    if (
      !this.isEnabled() ||
      !this.getConfig().monitoring.features.rum ||
      typeof window === 'undefined'
    )
      return;

    const fullEvent: GrafanaRUMEvent = {
      ...event,
      timestamp: Date.now(),
    };

    if (this.getConfig().batching?.enabled) {
      this.rumBuffer.push(fullEvent);
    } else {
      await this.sendRUMEvent(fullEvent);
    }
  }

  async reportHealthCheck(health: Omit<GrafanaHealthCheck, 'timestamp'>): Promise<void> {
    if (!this.isEnabled() || !this.getConfig().monitoring.features.healthChecks) return;

    const fullHealth: GrafanaHealthCheck = {
      ...health,
      timestamp: Date.now(),
    };

    await this.sendHealthCheck(fullHealth);
  }

  // Optional ObservabilityProvider methods
  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.isEnabled()) return;

    // Convert breadcrumb to RUM event if RUM is enabled
    if (this.getConfig().monitoring.features.rum && typeof window !== 'undefined') {
      this.trackRUMEvent({
        type: 'custom',
        sessionId: this.getSessionId(),
        properties: {
          breadcrumb: {
            category: breadcrumb.category,
            message: breadcrumb.message,
            level: breadcrumb.level,
            data: breadcrumb.data,
          },
        },
      });
    }
  }

  setUser(user: { id: string; email?: string; username?: string; [key: string]: any }): void {
    if (!this.isEnabled()) return;

    // Track user context in RUM if enabled
    if (this.getConfig().monitoring.features.rum && typeof window !== 'undefined') {
      this.trackRUMEvent({
        type: 'custom',
        sessionId: this.getSessionId(),
        userId: user.id,
        properties: {
          userContext: user,
        },
      });
    }
  }

  // Private methods
  private isEnabled(): boolean {
    return (
      this.initialized && this.config?.enabled === true && this.config?.monitoring?.enabled === true
    );
  }

  private async logError(log: GrafanaLogEntry): Promise<void> {
    if (this.getConfig().batching?.enabled) {
      this.logsBuffer.push(log);
    } else {
      await this.sendLog(log);
    }
  }

  private async logMessage(log: GrafanaLogEntry): Promise<void> {
    if (this.getConfig().batching?.enabled) {
      this.logsBuffer.push(log);
    } else {
      await this.sendLog(log);
    }
  }

  private async endSpan(span: any): Promise<void> {
    if (!span) return;

    const trace: GrafanaTrace = {
      traceId: span.traceId,
      spanId: span.spanId,
      parentSpanId: span.parentSpanId,
      operationName: span.operationName,
      startTime: span.startTime,
      duration: Date.now() - span.startTime,
      tags: span.tags,
      status: span.status || { code: 0 },
    };

    if (this.getConfig().batching?.enabled) {
      this.tracesBuffer.push(trace);
    } else {
      await this.sendTrace(trace);
    }
  }

  private startFlushTimer(): void {
    if (!this.config?.batching?.enabled) return;

    this.flushTimer = setInterval(() => this.flushBuffers(), this.config.batching.flushInterval);
  }

  private async flushBuffers(): Promise<void> {
    if (!this.isEnabled()) return;

    const promises: Promise<void>[] = [];

    if (this.metricsBuffer.length > 0) {
      const metrics = this.metricsBuffer.splice(0);
      promises.push(this.sendMetricsBatch(metrics));
    }

    if (this.logsBuffer.length > 0) {
      const logs = this.logsBuffer.splice(0);
      promises.push(this.sendLogsBatch(logs));
    }

    if (this.tracesBuffer.length > 0) {
      const traces = this.tracesBuffer.splice(0);
      promises.push(this.sendTracesBatch(traces));
    }

    if (this.rumBuffer.length > 0) {
      const rumEvents = this.rumBuffer.splice(0);
      promises.push(this.sendRUMEventsBatch(rumEvents));
    }

    await Promise.allSettled(promises);
  }

  private async sendMetric(metric: GrafanaMetric): Promise<void> {
    try {
      const response = await fetch(`${this.getConfig().endpoints.prometheus.url}/api/v1/write`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-protobuf',
          'X-Prometheus-Remote-Write-Version': '0.1.0',
        },
        body: this.serializeMetric(metric),
      });

      if (!response.ok) {
        throw new Error(`Prometheus write failed: ${response.status}`);
      }
    } catch (error: any) {
      throw new Error(`[GrafanaMonitoring] Failed to send metric: ${error}`);
    }
  }

  private async sendLog(log: GrafanaLogEntry): Promise<void> {
    try {
      const response = await fetch(`${this.getConfig().endpoints.loki.url}/loki/api/v1/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streams: [
            {
              stream: log.labels || {},
              values: [[String(log.timestamp * 1000000), JSON.stringify(log)]],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Loki push failed: ${response.status}`);
      }
    } catch (error: any) {
      throw new Error(`[GrafanaMonitoring] Failed to send log: ${error}`);
    }
  }

  private async sendTrace(trace: GrafanaTrace): Promise<void> {
    try {
      const response = await fetch(`${this.getConfig().endpoints.otel.url}/v1/traces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceSpans: [
            {
              resource: {
                attributes: [
                  {
                    key: 'service.name',
                    value: { stringValue: this.getConfig().monitoring.service.name },
                  },
                  {
                    key: 'service.version',
                    value: { stringValue: this.getConfig().monitoring.service.version },
                  },
                ],
              },
              instrumentationLibrarySpans: [
                {
                  spans: [trace],
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OTEL trace export failed: ${response.status}`);
      }
    } catch (error: any) {
      throw new Error(`[GrafanaMonitoring] Failed to send trace: ${error}`);
    }
  }

  private async sendRUMEvent(event: GrafanaRUMEvent): Promise<void> {
    try {
      const response = await fetch(`${this.getConfig().endpoints.rum.url}/collect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`RUM collection failed: ${response.status}`);
      }
    } catch (error: any) {
      throw new Error(`[GrafanaMonitoring] Failed to send RUM event: ${error}`);
    }
  }

  private async sendHealthCheck(health: GrafanaHealthCheck): Promise<void> {
    // Send as both metric and log
    await Promise.allSettled([
      this.trackMetric({
        name: 'service_health',
        value: health.status === 'healthy' ? 1 : 0,
        type: 'gauge',
        labels: {
          service: health.service,
          status: health.status,
        },
      }),
      this.log('info', `Health check: ${health.status}`, health),
    ]);
  }

  private async sendBusinessMetric(metric: GrafanaBusinessMetric): Promise<void> {
    await this.trackMetric({
      name: `business_${metric.name}`,
      value: metric.value,
      type: 'gauge',
      labels: {
        category: metric.category,
        ...metric.labels,
      },
    });
  }

  private async sendMetricsBatch(metrics: GrafanaMetric[]): Promise<void> {
    // Implementation for batch metric sending
    for (const metric of metrics) {
      await this.sendMetric(metric);
    }
  }

  private async sendLogsBatch(logs: GrafanaLogEntry[]): Promise<void> {
    try {
      const streams = logs.reduce(
        (acc, log: any) => {
          const streamKey = JSON.stringify(log.labels || {});
          if (!acc[streamKey]) {
            acc[streamKey] = {
              stream: log.labels || {},
              values: [],
            };
          }
          acc[streamKey].values.push([String(log.timestamp * 1000000), JSON.stringify(log)]);
          return acc;
        },
        {} as Record<string, any>,
      );

      const response = await fetch(`${this.getConfig().endpoints.loki.url}/loki/api/v1/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streams: Object.values(streams),
        }),
      });

      if (!response.ok) {
        throw new Error(`Loki batch push failed: ${response.status}`);
      }
    } catch (error: any) {
      throw new Error(`[GrafanaMonitoring] Failed to send logs batch: ${error}`);
    }
  }

  private async sendTracesBatch(traces: GrafanaTrace[]): Promise<void> {
    // Implementation for batch trace sending
    for (const trace of traces) {
      await this.sendTrace(trace);
    }
  }

  private async sendRUMEventsBatch(events: GrafanaRUMEvent[]): Promise<void> {
    try {
      const response = await fetch(`${this.getConfig().endpoints.rum.url}/collect/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        throw new Error(`RUM batch collection failed: ${response.status}`);
      }
    } catch (error: any) {
      throw new Error(`[GrafanaMonitoring] Failed to send RUM events batch: ${error}`);
    }
  }

  private serializeMetric(metric: GrafanaMetric): Uint8Array {
    // Simplified metric serialization - in production, use proper protobuf
    const textFormat = `${metric.name}{${Object.entries(metric.labels || {})
      .map(([k, v]: any) => `${k}="${v}"`)
      .join(',')}} ${metric.value} ${metric.timestamp}\n`;

    return new TextEncoder().encode(textFormat);
  }

  private normalizeLogLevel(level: string): GrafanaLogEntry['level'] {
    const normalizedLevel = level.toLowerCase();
    if (['debug', 'info', 'warn', 'error', 'fatal'].includes(normalizedLevel)) {
      return normalizedLevel as GrafanaLogEntry['level'];
    }
    return 'info';
  }

  private generateTraceId(): string {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  private generateSpanId(): string {
    return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  protected getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';

    let sessionId = sessionStorage.getItem('grafana-session-id');
    if (!sessionId) {
      sessionId = this.generateTraceId();
      sessionStorage.setItem('grafana-session-id', sessionId);
    }
    return sessionId;
  }
}
