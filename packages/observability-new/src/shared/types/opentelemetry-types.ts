/**
 * OpenTelemetry-specific types
 */

export interface OpenTelemetryConfig {
  serviceName: string;
  serviceVersion?: string;
  endpoint?: string;
  headers?: Record<string, string>;
  exportIntervalMillis?: number;
  exportTimeoutMillis?: number;
  maxExportBatchSize?: number;
  maxQueueSize?: number;
  scheduledDelayMillis?: number;
  
  // Resource attributes
  resourceAttributes?: Record<string, string | number | boolean>;
  
  // Instrumentation options
  instrumentations?: string[];
  
  // Sampling
  samplingRatio?: number;
  samplingStrategy?: 'always_on' | 'always_off' | 'trace_id_ratio' | 'parent_based';
}

export interface OpenTelemetryOptions {
  // Exporter options
  exporterType?: 'otlp' | 'jaeger' | 'zipkin' | 'console';
  protocol?: 'grpc' | 'http/protobuf' | 'http/json';
  compression?: 'gzip' | 'none';
  
  // Propagation
  propagators?: ('tracecontext' | 'baggage' | 'b3' | 'jaeger' | 'xray' | 'ottrace')[];
  
  // Metrics
  metricsEnabled?: boolean;
  metricExportInterval?: number;
  
  // Logs
  logsEnabled?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
}