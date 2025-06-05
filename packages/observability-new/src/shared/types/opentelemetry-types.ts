/**
 * OpenTelemetry-specific types
 */

export interface OpenTelemetryConfig {
  endpoint?: string;
  exportIntervalMillis?: number;
  exportTimeoutMillis?: number;
  headers?: Record<string, string>;
  maxExportBatchSize?: number;
  maxQueueSize?: number;
  scheduledDelayMillis?: number;
  serviceName: string;
  serviceVersion?: string;

  // Resource attributes
  resourceAttributes?: Record<string, string | number | boolean>;

  // Instrumentation options
  instrumentations?: string[];

  // Sampling
  samplingRatio?: number;
  samplingStrategy?: 'always_on' | 'always_off' | 'trace_id_ratio' | 'parent_based';
}

export interface OpenTelemetryOptions {
  compression?: 'gzip' | 'none';
  // Exporter options
  exporterType?: 'otlp' | 'jaeger' | 'zipkin' | 'console';
  protocol?: 'grpc' | 'http/protobuf' | 'http/json';

  // Propagation
  propagators?: ('tracecontext' | 'baggage' | 'b3' | 'jaeger' | 'xray' | 'ottrace')[];

  metricExportInterval?: number;
  // Metrics
  metricsEnabled?: boolean;

  logLevel?: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
  // Logs
  logsEnabled?: boolean;
}
