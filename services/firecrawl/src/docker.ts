import Docker from 'dockerode';
import { z } from 'zod';
import { execaCommand } from 'execa';
import { readFile, writeFile } from 'fs/promises';
import { resolve, join } from 'path';

export const DockerServiceConfigSchema = z.object({
  projectName: z.string().default('firecrawl'),
  composeFile: z.string().default('docker-compose.yaml'),
  envFile: z.string().optional(),
  services: z.array(z.string()).default(['api', 'worker', 'redis', 'playwright-service']),
  ports: z
    .object({
      api: z.number().default(3002),
      redis: z.number().default(6379),
      playwright: z.number().default(3000),
    })
    .default({}),
});

export const ServiceStatusSchema = z.object({
  name: z.string(),
  status: z.enum(['running', 'stopped', 'starting', 'error', 'unknown']),
  health: z.enum(['healthy', 'unhealthy', 'starting', 'unknown']).optional(),
  ports: z.array(z.string()).optional(),
  uptime: z.string().optional(),
  image: z.string().optional(),
});

export type DockerServiceConfig = z.infer<typeof DockerServiceConfigSchema>;
export type ServiceStatus = z.infer<typeof ServiceStatusSchema>;

export class FirecrawlDockerManager {
  private docker: Docker;
  private config: DockerServiceConfig;
  private repoPath: string;

  constructor(config: Partial<DockerServiceConfig> = {}) {
    this.docker = new Docker();
    this.config = DockerServiceConfigSchema.parse(config);
    this.repoPath = resolve(process.cwd(), '../firecrawl-repo');
  }

  async setupEnvironment(): Promise<void> {
    const envPath = join(this.repoPath, '.env');
    const envContent = `
# Firecrawl Configuration
USE_DB_AUTHENTICATION=false
REDIS_URL=redis://redis:6379
REDIS_RATE_LIMIT_URL=redis://redis:6379
PLAYWRIGHT_MICROSERVICE_URL=http://playwright-service:3000/scrape

# API Keys (optional)
OPENAI_API_KEY=${process.env.OPENAI_API_KEY || ''}
ANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY || ''}

# Logging
LOGGING_LEVEL=info

# Rate Limiting
BULL_AUTH_KEY=your_secret_key_here

# Ports
PORT=${this.config.ports.api}
INTERNAL_PORT=${this.config.ports.api}

# Security
TEST_API_KEY=test_key_for_development

# Monitoring (optional)
POSTHOG_API_KEY=${process.env.POSTHOG_API_KEY || ''}
POSTHOG_HOST=${process.env.POSTHOG_HOST || ''}

# Search APIs (optional)
SERPER_API_KEY=${process.env.SERPER_API_KEY || ''}
SEARCHAPI_API_KEY=${process.env.SEARCHAPI_API_KEY || ''}

# Proxy (optional)
PROXY_SERVER=${process.env.PROXY_SERVER || ''}
PROXY_USERNAME=${process.env.PROXY_USERNAME || ''}
PROXY_PASSWORD=${process.env.PROXY_PASSWORD || ''}
`.trim();

    await writeFile(envPath, envContent);
    console.log('✅ Environment file created at: ', envPath),
  }

  async start(): Promise<void> {
    try {
      console.log('🔄 Starting Firecrawl services...');

      const { stdout } = await execaCommand(`docker compose -f ${this.config.composeFile} up -d`, {
        cwd: this.repoPath,
      });

      console.log('✅ Firecrawl services started successfully');
      console.log(stdout);

      // Wait for services to be ready
      await this.waitForHealthy();
    } catch (error) {
      console.error('❌ Failed to start Firecrawl services:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      console.log('🔄 Stopping Firecrawl services...');

      const { stdout } = await execaCommand(`docker compose -f ${this.config.composeFile} down`, {
        cwd: this.repoPath,
      });

      console.log('✅ Firecrawl services stopped successfully');
      console.log(stdout);
    } catch (error) {
      console.error('❌ Failed to stop Firecrawl services:', error);
      throw error;
    }
  }

  async restart(): Promise<void> {
    await this.stop();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s
    await this.start();
  }

  async getStatus(): Promise<ServiceStatus[]> {
    try {
      const { stdout } = await execaCommand(
        `docker compose -f ${this.config.composeFile} ps --format json`,
        { cwd: this.repoPath },
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
        ports: service.Publishers
          ? service.Publishers.map((p: any) => `${p.PublishedPort}:${p.TargetPort}`)
          : [],
        uptime: service.RunningFor,
        image: service.Image,
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
        { cwd: this.repoPath },
      );

      return stdout;
    } catch (error) {
      console.error('❌ Failed to get logs:', error);
      throw error;
    }
  }

  async pullImages(): Promise<void> {
    try {
      console.log('🔄 Pulling latest Docker images...');

      const { stdout } = await execaCommand(`docker compose -f ${this.config.composeFile} pull`, {
        cwd: this.repoPath,
      });

      console.log('✅ Images pulled successfully');
      console.log(stdout);
    } catch (error) {
      console.error('❌ Failed to pull images:', error);
      throw error;
    }
  }

  async build(): Promise<void> {
    try {
      console.log('🔄 Building Firecrawl services...');

      const { stdout } = await execaCommand(`docker compose -f ${this.config.composeFile} build`, {
        cwd: this.repoPath,
      });

      console.log('✅ Services built successfully');
      console.log(stdout);
    } catch (error) {
      console.error('❌ Failed to build services:', error);
      throw error;
    }
  }

  async isHealthy(): Promise<boolean> {
    const status = await this.getStatus();
    const apiService = status.find((s) => s.name === 'api');

    if (!apiService || apiService.status !== 'running') {
      return false;
    }

    // Check if API is responding
    try {
      const axios = (await import('axios')).default;
      const response = await axios.get(`http://localhost:${this.config.ports.api}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async waitForHealthy(timeoutMs: number = 60000): Promise<void> {
    const startTime = Date.now();

    console.log('⏳ Waiting for services to be healthy...');

    while (Date.now() - startTime < timeoutMs) {
      if (await this.isHealthy()) {
        console.log('✅ All services are healthy');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error('Timeout waiting for services to be healthy');
  }

  async getApiUrl(): Promise<string> {
    return `http://localhost:${this.config.ports.api}`;
  }

  async getRedisUrl(): Promise<string> {
    return `redis://localhost:${this.config.ports.redis}`;
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

  async cleanup(): Promise<void> {
    try {
      console.log('🔄 Cleaning up Firecrawl resources...');

      // Stop and remove containers, networks, volumes
      await execaCommand(`docker compose -f ${this.config.composeFile} down -v --remove-orphans`, {
        cwd: this.repoPath,
      });

      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Failed to cleanup:', error);
      throw error;
    }
  }
}

export function createFirecrawlDockerManager(
  config?: Partial<DockerServiceConfig>,
): FirecrawlDockerManager {
  return new FirecrawlDockerManager(config);
}
