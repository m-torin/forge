import Docker from 'dockerode';
import { z } from 'zod';
import { execaCommand } from 'execa';
import { readFile, writeFile, ensureDir, copy } from 'fs-extra';
import { resolve, join } from 'path';
import { dump as yamlDump } from 'yaml';
import type { MonitoringConfig, ServiceStatus } from './types.js';

export const MonitoringDockerConfigSchema = z.object({
  projectName: z.string().default('monitoring'),
  composeFile: z.string().default('docker-compose.yaml'),
  configPath: z.string().default('./config'),
  dataPath: z.string().default('./monitoring-data'),
  services: z
    .array(z.string())
    .default([
      'prometheus',
      'grafana',
      'loki',
      'promtail',
      'alertmanager',
      'node-exporter',
      'cadvisor',
      'blackbox-exporter',
    ]),
  profiles: z
    .object({
      postgres: z.boolean().default(false),
      redis: z.boolean().default(false),
    })
    .default({}),
});

export type MonitoringDockerConfig = z.infer<typeof MonitoringDockerConfigSchema>;

export class MonitoringDockerManager {
  private docker: Docker;
  private config: MonitoringDockerConfig;
  private servicePath: string;

  constructor(config: Partial<MonitoringDockerConfig> = {}) {
    this.docker = new Docker();
    this.config = MonitoringDockerConfigSchema.parse(config);
    this.servicePath = resolve(process.cwd());
  }

  async setup(): Promise<void> {
    console.log('🔧 Setting up monitoring stack...');

    // Create directories
    await this.createDirectories();

    // Generate configuration files
    await this.generateConfigurations();

    // Create environment file
    await this.createEnvironmentFile();

    console.log('✅ Monitoring setup completed');
  }

  private async createDirectories(): Promise<void> {
    const dirs = [
      'config/prometheus',
      'config/grafana/provisioning/datasources',
      'config/grafana/provisioning/dashboards',
      'config/grafana/dashboards',
      'config/loki',
      'config/promtail',
      'config/alertmanager',
      'config/blackbox',
      'monitoring-data',
    ];

    for (const dir of dirs) {
      await ensureDir(join(this.servicePath, dir));
    }
  }

  private async generateConfigurations(): Promise<void> {
    // Prometheus configuration
    const prometheusConfig = {
      global: {
        scrape_interval: '15s',
        evaluation_interval: '15s',
      },
      rule_files: ['/etc/prometheus/rules/*.yml'],
      alerting: {
        alertmanagers: [
          {
            static_configs: [
              {
                targets: ['alertmanager:9093'],
              },
            ],
          },
        ],
      },
      scrape_configs: [
        {
          job_name: 'prometheus',
          static_configs: [{ targets: ['localhost:9090'] }],
        },
        {
          job_name: 'node-exporter',
          static_configs: [{ targets: ['node-exporter:9100'] }],
        },
        {
          job_name: 'cadvisor',
          static_configs: [{ targets: ['cadvisor:8080'] }],
        },
        {
          job_name: 'grafana',
          static_configs: [{ targets: ['grafana:3000'] }],
        },
        {
          job_name: 'loki',
          static_configs: [{ targets: ['loki:3100'] }],
        },
        {
          job_name: 'alertmanager',
          static_configs: [{ targets: ['alertmanager:9093'] }],
        },
        {
          job_name: 'blackbox',
          static_configs: [{ targets: ['blackbox-exporter:9115'] }],
        },
      ],
    };

    await writeFile(
      join(this.servicePath, 'config/prometheus/prometheus.yml'),
      yamlDump(prometheusConfig),
    );

    // Loki configuration
    const lokiConfig = {
      auth_enabled: false,
      server: {
        http_listen_port: 3100,
        grpc_listen_port: 9096,
      },
      common: {
        path_prefix: '/loki',
        storage: {
          filesystem: {
            chunks_directory: '/loki/chunks',
            rules_directory: '/loki/rules',
          },
        },
        replication_factor: 1,
        ring: {
          instance_addr: '127.0.0.1',
          kvstore: {
            store: 'inmemory',
          },
        },
      },
      query_range: {
        results_cache: {
          cache: {
            embedded_cache: {
              enabled: true,
              max_size_mb: 100,
            },
          },
        },
      },
      schema_config: {
        configs: [
          {
            from: '2020-10-24',
            store: 'boltdb-shipper',
            object_store: 'filesystem',
            schema: 'v11',
            index: {
              prefix: 'index_',
              period: '24h',
            },
          },
        ],
      },
      ruler: {
        alertmanager_url: 'http://alertmanager:9093',
      },
      limits_config: {
        reject_old_samples: true,
        reject_old_samples_max_age: '168h',
        retention_period: '30d',
      },
      chunk_store_config: {
        max_look_back_period: '30d',
      },
      table_manager: {
        retention_deletes_enabled: true,
        retention_period: '30d',
      },
      compactor: {
        working_directory: '/loki/compactor',
        shared_store: 'filesystem',
        compaction_interval: '10m',
        retention_enabled: true,
        retention_delete_delay: '2h',
        retention_delete_worker_count: 150,
      },
    };

    await writeFile(join(this.servicePath, 'config/loki/loki.yml'), yamlDump(lokiConfig));

    // Promtail configuration
    const promtailConfig = {
      server: {
        http_listen_port: 9080,
        grpc_listen_port: 0,
      },
      positions: {
        filename: '/tmp/positions.yaml',
      },
      clients: [
        {
          url: 'http://loki:3100/loki/api/v1/push',
        },
      ],
      scrape_configs: [
        {
          job_name: 'containers',
          static_configs: [
            {
              targets: ['localhost'],
              labels: {
                job: 'containerlogs',
                __path__: '/var/lib/docker/containers/*/*log',
              },
            },
          ],
          pipeline_stages: [
            {
              json: {
                expressions: {
                  output: 'log',
                  stream: 'stream',
                  attrs: '',
                },
              },
            },
            {
              json: {
                expressions: {
                  tag: 'attrs.tag',
                },
                source: 'attrs',
              },
            },
            {
              regex: {
                expression:
                  '^(?P<container_name>(?:[^|]*/){2})(?P<container_id>[^|]*)/(?P<filename>[^|]*)$',
                source: 'filename',
              },
            },
            {
              timestamp: {
                source: 'time',
                format: 'RFC3339Nano',
              },
            },
            {
              labels: {
                stream: '',
                container_name: '',
                filename: '',
              },
            },
            {
              output: {
                source: 'output',
              },
            },
          ],
        },
        {
          job_name: 'system',
          static_configs: [
            {
              targets: ['localhost'],
              labels: {
                job: 'varlogs',
                __path__: '/var/log/*log',
              },
            },
          ],
        },
      ],
    };

    await writeFile(
      join(this.servicePath, 'config/promtail/promtail.yml'),
      yamlDump(promtailConfig),
    );

    // Grafana datasource provisioning
    const datasourcesConfig = {
      apiVersion: 1,
      datasources: [
        {
          name: 'Prometheus',
          type: 'prometheus',
          access: 'proxy',
          url: 'http://prometheus:9090',
          isDefault: true,
          editable: true,
        },
        {
          name: 'Loki',
          type: 'loki',
          access: 'proxy',
          url: 'http://loki:3100',
          editable: true,
        },
      ],
    };

    await writeFile(
      join(this.servicePath, 'config/grafana/provisioning/datasources/datasources.yml'),
      yamlDump(datasourcesConfig),
    );

    // Grafana dashboard provisioning
    const dashboardsConfig = {
      apiVersion: 1,
      providers: [
        {
          name: 'default',
          orgId: 1,
          folder: '',
          type: 'file',
          disableDeletion: false,
          updateIntervalSeconds: 10,
          allowUiUpdates: true,
          options: {
            path: '/var/lib/grafana/dashboards',
          },
        },
      ],
    };

    await writeFile(
      join(this.servicePath, 'config/grafana/provisioning/dashboards/dashboards.yml'),
      yamlDump(dashboardsConfig),
    );

    // AlertManager configuration
    const alertmanagerConfig = {
      global: {
        smtp_smarthost: 'localhost:587',
        smtp_from: 'alertmanager@example.org',
      },
      route: {
        group_by: ['alertname'],
        group_wait: '10s',
        group_interval: '10s',
        repeat_interval: '1h',
        receiver: 'web.hook',
      },
      receivers: [
        {
          name: 'web.hook',
          webhook_configs: [
            {
              url: 'http://127.0.0.1:5001/',
            },
          ],
        },
      ],
      inhibit_rules: [
        {
          source_match: {
            severity: 'critical',
          },
          target_match: {
            severity: 'warning',
          },
          equal: ['alertname', 'dev', 'instance'],
        },
      ],
    };

    await writeFile(
      join(this.servicePath, 'config/alertmanager/alertmanager.yml'),
      yamlDump(alertmanagerConfig),
    );

    // Blackbox exporter configuration
    const blackboxConfig = {
      modules: {
        http_2xx: {
          prober: 'http',
          http: {
            preferred_ip_protocol: 'ip4',
          },
        },
        http_post_2xx: {
          prober: 'http',
          http: {
            method: 'POST',
            preferred_ip_protocol: 'ip4',
          },
        },
        tcp_connect: {
          prober: 'tcp',
        },
        pop3s_banner: {
          prober: 'tcp',
          tcp: {
            query_response: [{ expect: '^+OK' }],
            tls: true,
            tls_config: {
              insecure_skip_verify: false,
            },
          },
        },
        grpc: {
          prober: 'grpc',
          grpc: {
            service: 'service',
          },
        },
        grpc_plain: {
          prober: 'grpc',
          grpc: {
            service: 'service',
            tls: false,
          },
        },
      },
    };

    await writeFile(
      join(this.servicePath, 'config/blackbox/blackbox.yml'),
      yamlDump(blackboxConfig),
    );

    console.log('✅ Configuration files generated');
  }

  private async createEnvironmentFile(): Promise<void> {
    const envContent = `
# Monitoring Stack Configuration
COMPOSE_PROJECT_NAME=${this.config.projectName}

# Service Ports
GRAFANA_PORT=3000
PROMETHEUS_PORT=9090
LOKI_PORT=3100
PROMTAIL_PORT=9080
ALERTMANAGER_PORT=9093
NODE_EXPORTER_PORT=9100
CADVISOR_PORT=8080
BLACKBOX_PORT=9115

# Optional Database Exporters
POSTGRES_EXPORTER_PORT=9187
REDIS_EXPORTER_PORT=9121

# Grafana Configuration
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin

# Data Retention
PROMETHEUS_RETENTION=30d
LOKI_RETENTION=30d

# Database connections (if using exporters)
POSTGRES_CONNECTION_STRING=postgresql://user:password@localhost:5432/postgres?sslmode=disable
REDIS_URL=redis://localhost:6379

# External URLs (for production)
GRAFANA_ROOT_URL=http://localhost:3000
PROMETHEUS_EXTERNAL_URL=http://localhost:9090
ALERTMANAGER_EXTERNAL_URL=http://localhost:9093
`.trim();

    await writeFile(join(this.servicePath, '.env'), envContent);
    console.log('✅ Environment file created');
  }

  async start(profiles: string[] = []): Promise<void> {
    try {
      console.log('🚀 Starting monitoring stack...');

      let command = `docker compose -f ${this.config.composeFile} up -d`;

      if (profiles.length > 0) {
        command += ` --profile ${profiles.join(' --profile ')}`;
      }

      const { stdout } = await execaCommand(command, { cwd: this.servicePath });

      console.log('✅ Monitoring stack started successfully');
      console.log(stdout);

      // Wait for services to be ready
      await this.waitForHealthy();
    } catch (error) {
      console.error('❌ Failed to start monitoring stack:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      console.log('🛑 Stopping monitoring stack...');

      const { stdout } = await execaCommand(`docker compose -f ${this.config.composeFile} down`, {
        cwd: this.servicePath,
      });

      console.log('✅ Monitoring stack stopped successfully');
      console.log(stdout);
    } catch (error) {
      console.error('❌ Failed to stop monitoring stack:', error);
      throw error;
    }
  }

  async restart(): Promise<void> {
    await this.stop();
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3s
    await this.start();
  }

  async getStatus(): Promise<ServiceStatus[]> {
    try {
      const { stdout } = await execaCommand(
        `docker compose -f ${this.config.composeFile} ps --format json`,
        { cwd: this.servicePath },
      );

      const services = stdout
        .trim()
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line));

      return services.map((service) => ({
        name: service.Service,
        status: this.mapDockerStatus(service.State),
        health: service.Health ? this.mapDockerHealth(service.Health) : undefined,
        uptime: service.RunningFor,
        url: this.getServiceUrl(service.Service),
      }));
    } catch (error) {
      console.error('❌ Failed to get service status:', error);
      return [];
    }
  }

  async getLogs(service?: string, tail: number = 100): Promise<string> {
    try {
      const serviceArg = service ? service : '';
      const { stdout } = await execaCommand(
        `docker compose -f ${this.config.composeFile} logs --tail ${tail} ${serviceArg}`,
        { cwd: this.servicePath },
      );

      return stdout;
    } catch (error) {
      console.error('❌ Failed to get logs:', error);
      throw error;
    }
  }

  async isHealthy(): Promise<boolean> {
    const coreServices = ['prometheus', 'grafana', 'loki'];
    const status = await this.getStatus();

    for (const serviceName of coreServices) {
      const service = status.find((s) => s.name === serviceName);
      if (!service || service.status !== 'running') {
        return false;
      }
    }

    // Test connectivity to core services
    try {
      const axios = (await import('axios')).default;

      await Promise.all([
        axios.get('http://localhost:9090/-/healthy', { timeout: 5000 }),
        axios.get('http://localhost:3000/api/health', { timeout: 5000 }),
        axios.get('http://localhost:3100/ready', { timeout: 5000 }),
      ]);

      return true;
    } catch {
      return false;
    }
  }

  async waitForHealthy(timeoutMs: number = 120000): Promise<void> {
    const startTime = Date.now();

    console.log('⏳ Waiting for monitoring stack to be healthy...');

    while (Date.now() - startTime < timeoutMs) {
      if (await this.isHealthy()) {
        console.log('✅ All monitoring services are healthy');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    throw new Error('Timeout waiting for monitoring stack to be healthy');
  }

  async cleanup(): Promise<void> {
    try {
      console.log('🧹 Cleaning up monitoring resources...');

      await execaCommand(`docker compose -f ${this.config.composeFile} down -v --remove-orphans`, {
        cwd: this.servicePath,
      });

      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Failed to cleanup:', error);
      throw error;
    }
  }

  getServiceUrls(): Record<string, string> {
    return {
      grafana: 'http://localhost:3000',
      prometheus: 'http://localhost:9090',
      loki: 'http://localhost:3100',
      alertmanager: 'http://localhost:9093',
      'node-exporter': 'http://localhost:9100',
      cadvisor: 'http://localhost:8080',
      'blackbox-exporter': 'http://localhost:9115',
    });
  }

  private getServiceUrl(serviceName: string): string {
    const urls = this.getServiceUrls();
    return urls[serviceName] || '';
  }

  private mapDockerStatus(dockerStatus: string): ServiceStatus['status'] {
    switch (dockerStatus.toLowerCase()) {
      case 'running':
        return 'running';
      case 'exited':
      case 'dead':
        return 'stopped';
      case 'restarting':
      case 'created': return 'starting',
      default:
        return 'unknown';
    }
  }

  private mapDockerHealth(dockerHealth: string): ServiceStatus['health'] {
    switch (dockerHealth.toLowerCase()) {
      case 'healthy':
        return 'healthy';
      case 'unhealthy':
        return 'unhealthy';
      case 'starting': return 'starting',
      default:
        return 'unknown';
    }
  }
}

export function createMonitoringDockerManager(
  config?: Partial<MonitoringDockerConfig>,
): MonitoringDockerManager {
  return new MonitoringDockerManager(config);
}
