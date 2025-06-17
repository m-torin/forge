/**
 * OpenTelemetry-specific types
 */

import { ObservabilityProviderConfig } from './types';

export interface OpenTelemetryConfig extends ObservabilityProviderConfig {
  endpoint?: string;
  exportIntervalMillis?: number;
  exportTimeoutMillis?: number;
  headers?: Record<string, string>;
  // Instrumentation options
  instrumentations?: string[];
  maxExportBatchSize?: number;
  maxQueueSize?: number;
  // Resource attributes
  resourceAttributes?: Record<string, boolean | number | string>;
  // Sampling
  samplingRatio?: number;

  samplingStrategy?: 'always_off' | 'always_on' | 'parent_based' | 'trace_id_ratio';

  scheduledDelayMillis?: number;

  serviceName: string;
  serviceVersion?: string;
}

export interface OpenTelemetryOptions {
  compression?: 'gzip' | 'none';
  // Exporter options
  exporterType?: 'console' | 'jaeger' | 'otlp' | 'zipkin';
  logLevel?: 'debug' | 'error' | 'info' | 'verbose' | 'warn';

  // Logs
  logsEnabled?: boolean;

  metricExportInterval?: number;
  // Metrics
  metricsEnabled?: boolean;

  // Propagation
  propagators?: ('b3' | 'baggage' | 'jaeger' | 'ottrace' | 'tracecontext' | 'xray')[];
  protocol?: 'grpc' | 'http/json' | 'http/protobuf';
}

export interface VercelOTelConfig extends ObservabilityProviderConfig {
  endpoint?: string;
  environment?: string;
  headers?: Record<string, string>;
  instrumentations?: string[];
  propagateContextUrls?: (RegExp | string)[];
  protocol?: 'grpc' | 'http/json' | 'http/protobuf';
  resourceAttributes?: Record<string, boolean | number | string>;
  samplingRatio?: number;
  serviceName: string;
  serviceVersion?: string;
  // Vercel-specific options
  traceExporter?:
    | 'auto'
    | 'console'
    | 'otlp'
    | {
        headers?: Record<string, string>;
        url: string;
      };

  useVercelOTel?: boolean; // Default true for better edge compatibility
}
