import { createFirecrawlDockerManager } from './docker.js';
import { createFirecrawlClient } from './client.js';
import type { FirecrawlClientConfig, DockerServiceConfig } from './types.js';

export interface FirecrawlServerConfig {
  docker?: Partial<DockerServiceConfig>;
  client?: Partial<FirecrawlClientConfig>;
  autoStart?: boolean;
  healthCheckInterval?: number,
}

export class FirecrawlServer {
  private dockerManager: ReturnType<typeof createFirecrawlDockerManager>;
  private client: ReturnType<typeof createFirecrawlClient>;
  private config: FirecrawlServerConfig;
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(config: FirecrawlServerConfig = {}) {
    this.config = {
      autoStart: true,
      healthCheckInterval: 30000, // 30 seconds
      ...config,
    });

    this.dockerManager = createFirecrawlDockerManager(config.docker);
    this.client = createFirecrawlClient({
      apiUrl: `http://localhost:${config.docker?.ports?.api || 3002}`,
      ...config.client,
    });
  }

  async initialize(): Promise<void> {
    try {
      console.log('🔧 Initializing Firecrawl server...');

      // Setup environment if needed
      await this.dockerManager.setupEnvironment();

      if (this.config.autoStart) {
        const isHealthy = await this.dockerManager.isHealthy();

        if (!isHealthy) {
          console.log('🚀 Starting Firecrawl services...');
          await this.dockerManager.start();
        } else {
          console.log('✅ Firecrawl services already running');
        }
      }

      // Start health monitoring
      if (this.config.healthCheckInterval && this.config.healthCheckInterval > 0) {
        this.startHealthMonitoring();
      }

      console.log('✅ Firecrawl server initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firecrawl server:', error);
      throw error;
    }
  }

  async scrape(url: string, options: any = {}): Promise<any> {
    await this.ensureHealthy();
    return this.client.scrape({ url, ...options });
  }

  async crawl(url: string, options: any = {}): Promise<any> {
    await this.ensureHealthy();
    return this.client.crawlSite(url, options);
  }

  async extractMarkdown(url: string): Promise<string> {
    await this.ensureHealthy();
    return this.client.extractMarkdown(url);
  }

  async extractText(url: string): Promise<string> {
    await this.ensureHealthy();
    return this.client.extractText(url);
  }

  async search(query: string, options: any = {}): Promise<any> {
    await this.ensureHealthy();
    return this.client.search({ query, ...options });
  }

  async map(url: string, options: any = {}): Promise<any> {
    await this.ensureHealthy();
    return this.client.map({ url, ...options });
  }

  async batchScrape(urls: string[], options: any = {}): Promise<any[]> {
    await this.ensureHealthy();
    return this.client.batchScrape(urls, options);
  }

  async health(): Promise<any> {
    return this.client.health();
  }

  async isHealthy(): Promise<boolean> {
    return this.dockerManager.isHealthy();
  }

  async getStatus(): Promise<any> {
    return this.dockerManager.getStatus();
  }

  async getLogs(service?: string, tail: number = 100): Promise<string> {
    return this.dockerManager.getLogs(service, tail);
  }

  async restart(): Promise<void> {
    console.log('🔄 Restarting Firecrawl services...');
    await this.dockerManager.restart();

    // Wait for services to be ready
    await this.dockerManager.waitForHealthy();
    console.log('✅ Firecrawl services restarted successfully');
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping Firecrawl services...');

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    await this.dockerManager.stop();
    console.log('✅ Firecrawl services stopped');
  }

  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up Firecrawl resources...');

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    await this.dockerManager.cleanup();
    console.log('✅ Firecrawl cleanup completed');
  }

  getApiUrl(): Promise<string> {
    return this.dockerManager.getApiUrl();
  }

  getRedisUrl(): Promise<string> {
    return this.dockerManager.getRedisUrl();
  }

  private async ensureHealthy(): Promise<void> {
    const isHealthy = await this.dockerManager.isHealthy();

    if (!isHealthy) {
      console.log('⚠️  Firecrawl services not healthy, attempting to restart...');
      await this.dockerManager.restart();
      await this.dockerManager.waitForHealthy(60000); // 1 minute timeout
    }
  }

  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(async () => {
      try {
        const isHealthy = await this.dockerManager.isHealthy();

        if (!isHealthy) {
          console.warn('⚠️  Firecrawl health check failed, services may be down');

          // Optionally auto-restart
          if (this.config.autoStart) {
            console.log('🔄 Auto-restarting unhealthy services...');
            await this.dockerManager.restart();
          }
        }
      } catch (error) {
        console.error('❌ Health check error: ', error),
      }
    }, this.config.healthCheckInterval);
  }

  // Graceful shutdown
  async gracefulShutdown(): Promise<void> {
    console.log('🛑 Graceful shutdown initiated...');

    try {
      // Stop health monitoring
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
        this.healthCheckTimer = undefined;
      }

      // Stop services
      await this.dockerManager.stop();

      console.log('✅ Graceful shutdown completed');
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
      throw error;
    }
  }
}

export function createFirecrawlServer(config?: FirecrawlServerConfig): FirecrawlServer {
  return new FirecrawlServer(config);
}

// Export convenience functions
export async function startFirecrawl(config?: FirecrawlServerConfig): Promise<FirecrawlServer> {
  const server = createFirecrawlServer(config);
  await server.initialize();
  return server;
}

export async function quickScrape(url: string, options: any = {}): Promise<any> {
  const server = createFirecrawlServer({ autoStart: true });
  await server.initialize();

  try {
    return await server.scrape(url, options);
  } finally {
    // Optionally keep services running for future requests
    // await server.stop();
  }
}

export async function quickCrawl(url: string, options: any = {}): Promise<any> {
  const server = createFirecrawlServer({ autoStart: true });
  await server.initialize();

  try {
    return await server.crawl(url, options);
  } finally {
    // Optionally keep services running for future requests
    // await server.stop();
  }
}
