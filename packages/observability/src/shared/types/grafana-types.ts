/**
 * Grafana Monitoring Service Integration Types
 * For connecting to the enhanced monitoring service with RUM, metrics, and traces
 */

export interface GrafanaMonitoringConfig {
  enabled: boolean;
  endpoints: {
    grafana: string;
    prometheus: string;
    loki: string;
    otelGrpc: string;
    otelHttp: string;
    rum: string;
  };
  auth?: {
    username?: string;
    password?: string;
    apiKey?: string;
  };
  service: {
    name: string;
    version: string;
    environment: string;
    namespace?: string;
  };
  features: {
    rum: boolean;
    traces: boolean;
    metrics: boolean;
    logs: boolean;
    healthChecks: boolean;
  };
  sampling?: {
    traces: number; // 0.0 to 1.0
    metrics: number;
    logs: 'debug' | 'info' | 'warn' | 'error';
  };
  customMetrics?: {
    enabled: boolean;
    prefix?: string;
    labels?: Record<string, string>;
  };
  dashboard?: {
    autoProvision: boolean;
    customDashboards?: string[];
  };
  alerts?: {
    enabled: boolean;
    errorThreshold: number;
    responseTimeThreshold: number;
    customRules?: AlertRule[];
  };
}

export interface AlertRule {
  name: string;
  query: string;
  condition: string;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  channels?: string[];
}

export interface GrafanaMetric {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp?: number;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
}

export interface GrafanaLogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  service: string;
  labels?: Record<string, string>;
  context?: Record<string, any>;
  traceId?: string;
  spanId?: string;
}

export interface GrafanaTrace {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  duration: number;
  tags?: Record<string, any>;
  logs?: Array<{
    timestamp: number;
    fields: Record<string, any>;
  }>;
  status?: {
    code: number;
    message?: string;
  };
}

export interface GrafanaRUMEvent {
  type: 'page_view' | 'user_action' | 'error' | 'performance' | 'custom';
  timestamp: number;
  sessionId: string;
  userId?: string;
  page?: string;
  action?: string;
  error?: {
    message: string;
    stack?: string;
    type?: string;
  };
  performance?: {
    navigationTiming?: Record<string, number>;
    vitals?: Record<string, number>;
    custom?: Record<string, string | number>;
  };
  properties?: Record<string, any>;
}

export interface GrafanaHealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: number;
  responseTime?: number;
  details?: {
    version?: string;
    dependencies?: Array<{
      name: string;
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
    }>;
    metrics?: Record<string, number>;
    memory?: {
      heapUsed: number;
      heapTotal: number;
      rss: number;
    };
  };
}

export interface GrafanaBusinessMetric {
  name: string;
  value: number;
  timestamp: number;
  service: string;
  category: 'revenue' | 'users' | 'performance' | 'engagement' | 'custom';
  labels?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface GrafanaEndpointConfig {
  url: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  auth?: {
    type: 'basic' | 'bearer' | 'api_key';
    credentials: string | { username: string; password: string };
  };
}

export interface GrafanaProviderConfig {
  enabled: boolean;
  monitoring: GrafanaMonitoringConfig;
  endpoints: Record<string, GrafanaEndpointConfig>;
  circuitBreaker?: {
    enabled: boolean;
    failureThreshold: number;
    resetTimeout: number;
  };
  retry?: {
    attempts: number;
    backoff: 'linear' | 'exponential';
    delay: number;
  };
  batching?: {
    enabled: boolean;
    maxBatchSize: number;
    flushInterval: number;
  };
  compression?: {
    enabled: boolean;
    algorithm: 'gzip' | 'deflate';
  };
}
