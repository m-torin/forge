import { z } from 'zod';

// Monitoring Stack Configuration
export const MonitoringConfigSchema = z.object({
  projectName: z.string().default('monitoring'),
  dataPath: z.string().default('./monitoring-data'),
  ports: z
    .object({
      grafana: z.number().default(3000),
      prometheus: z.number().default(9090),
      loki: z.number().default(3100),
      promtail: z.number().default(9080),
      alertmanager: z.number().default(9093),
      nodeExporter: z.number().default(9100),
    })
    .default({}),
  retention: z
    .object({
      prometheus: z.string().default('30d'),
      loki: z.string().default('30d'),
    })
    .default({}),
});

// Grafana Configuration
export const GrafanaConfigSchema = z.object({
  adminUser: z.string().default('admin'),
  adminPassword: z.string().default('admin'),
  enableSignup: z.boolean().default(false),
  enableAnonymous: z.boolean().default(false),
  datasources: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        url: z.string(),
        access: z.string().default('proxy'),
        isDefault: z.boolean().default(false),
      }),
    )
    .default([]),
  dashboards: z.array(z.string()).default([]),
});

// Prometheus Configuration
export const PrometheusConfigSchema = z.object({
  scrapeInterval: z.string().default('15s'),
  evaluationInterval: z.string().default('15s'),
  retention: z.string().default('30d'),
  scrapeConfigs: z
    .array(
      z.object({
        jobName: z.string(),
        staticConfigs: z.array(
          z.object({
            targets: z.array(z.string()),
            labels: z.record(z.string()).optional(),
          }),
        ),
        scrapeInterval: z.string().optional(),
        metricsPath: z.string().optional().default('/metrics'),
      }),
    )
    .default([]),
  rules: z.array(z.string()).default([]),
});

// Loki Configuration
export const LokiConfigSchema = z.object({
  retention: z.string().default('30d'),
  chunkStoreConfig: z
    .object({
      maxLookBackPeriod: z.string().default('30d'),
    })
    .default({}),
  tableManager: z
    .object({
      retentionDeletesEnabled: z.boolean().default(true),
      retentionPeriod: z.string().default('30d'),
    })
    .default({}),
});

// Promtail Configuration
export const PromtailConfigSchema = z.object({
  serverConfig: z
    .object({
      httpListenPort: z.number().default(9080),
      grpcListenPort: z.number().default(9081),
    })
    .default({}),
  positions: z
    .object({
      filename: z.string().default('/tmp/positions.yaml'),
    })
    .default({}),
  clients: z
    .array(
      z.object({
        url: z.string(),
      }),
    )
    .default([]),
  scrapeConfigs: z
    .array(
      z.object({
        jobName: z.string(),
        staticConfigs: z.array(
          z.object({
            targets: z.array(z.string()),
            labels: z.record(z.string()),
          }),
        ),
        pipelineStages: z.array(z.any()).optional(),
      }),
    )
    .default([]),
});

// Service Status
export const ServiceStatusSchema = z.object({
  name: z.string(),
  status: z.enum(['running', 'stopped', 'starting', 'error', 'unknown']),
  health: z.enum(['healthy', 'unhealthy', 'starting', 'unknown']).optional(),
  uptime: z.string().optional(),
  url: z.string().optional(),
  version: z.string().optional(),
});

// Metrics
export const MetricsSchema = z.object({
  timestamp: z.string(),
  metrics: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['counter', 'gauge', 'histogram', 'summary']),
      value: z.number(),
      labels: z.record(z.string()).optional(),
      help: z.string().optional(),
    }),
  ),
});

// Log Entry
export const LogEntrySchema = z.object({
  timestamp: z.string(),
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
  message: z.string(),
  service: z.string(),
  labels: z.record(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

// Alert Configuration
export const AlertConfigSchema = z.object({
  name: z.string(),
  expr: z.string(),
  for: z.string().default('5m'),
  labels: z.record(z.string()).default({}),
  annotations: z.record(z.string()).default({}),
});

// Dashboard Configuration
export const DashboardConfigSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  panels: z.array(
    z.object({
      title: z.string(),
      type: z.enum(['graph', 'stat', 'table', 'logs', 'gauge']),
      targets: z.array(
        z.object({
          expr: z.string(),
          legendFormat: z.string().optional(),
          datasource: z.string(),
        }),
      ),
      gridPos: z.object({
        x: z.number(),
        y: z.number(),
        w: z.number(),
        h: z.number(),
      }),
    }),
  ),
});

// Health Response
export const HealthResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.string(),
  services: z.record(ServiceStatusSchema),
  version: z.string(),
  uptime: z.number(),
});

// Export types
export type MonitoringConfig = z.infer<typeof MonitoringConfigSchema>;
export type GrafanaConfig = z.infer<typeof GrafanaConfigSchema>;
export type PrometheusConfig = z.infer<typeof PrometheusConfigSchema>;
export type LokiConfig = z.infer<typeof LokiConfigSchema>;
export type PromtailConfig = z.infer<typeof PromtailConfigSchema>;
export type ServiceStatus = z.infer<typeof ServiceStatusSchema>;
export type Metrics = z.infer<typeof MetricsSchema>;
export type LogEntry = z.infer<typeof LogEntrySchema>;
export type AlertConfig = z.infer<typeof AlertConfigSchema>;
export type DashboardConfig = z.infer<typeof DashboardConfigSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Error classes
export class MonitoringError extends Error {
  constructor(
    message: string,
    public service: string,
    public code?: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'MonitoringError';
  }
}

export class GrafanaError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any,
  ) {
    super(message);
    this.name = 'GrafanaError';
  }
}

export class PrometheusError extends Error {
  constructor(
    message: string,
    public query?: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'PrometheusError';
  }
}

export class LokiError extends Error {
  constructor(
    message: string,
    public query?: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'LokiError';
  }
}
