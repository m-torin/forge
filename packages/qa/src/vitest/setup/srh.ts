// SRH (Serverless Redis HTTP) setup utilities
interface SRHConfig {
  url?: string;
  token?: string;
  redisUrl?: string;
  mode?: 'env' | 'file';
}

// Default SRH configuration
const defaultSRHConfig: SRHConfig = {
  url: 'http://localhost:8080',
  token: 'test-token',
  redisUrl: 'redis://localhost:6379',
  mode: 'env',
};

// SRH container management (for Docker-based testing)
class SRHContainer {
  private containerId: string | null = null;
  private config: SRHConfig;

  constructor(config: SRHConfig = {}) {
    this.config = { ...defaultSRHConfig, ...config };
  }

  async start(): Promise<void> {
    // Set environment variables for SRH-like testing
    // In a real setup, this would start the actual SRH Docker container
    process.env.UPSTASH_REDIS_REST_URL = this.config.url;
    process.env.UPSTASH_REDIS_REST_TOKEN = this.config.token;

    console.log('SRH environment configured (mock mode):', {
      url: this.config.url,
      token: this.config.token,
    });
  }

  async stop(): Promise<void> {
    // This would stop the SRH container
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    console.log('SRH environment cleaned up');
  }

  async healthCheck(): Promise<boolean> {
    // In mock mode, we don't actually have SRH running
    // So we'll just return false to indicate we should use mocks
    return false;
  }
}

// Global SRH setup
let globalSRHContainer: SRHContainer | null = null;

// Setup SRH for tests
const setupSRH = async (config?: SRHConfig): Promise<void> => {
  globalSRHContainer = new SRHContainer(config);
  await globalSRHContainer.start();

  // Wait for SRH to be ready (reduced timeout for CI)
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    if (await globalSRHContainer.healthCheck()) {
      console.log('SRH is ready');
      return;
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.warn('SRH health check failed after maximum attempts - continuing with mock');
};

// Cleanup SRH after tests
const cleanupSRH = async (): Promise<void> => {
  if (globalSRHContainer) {
    await globalSRHContainer.stop();
    globalSRHContainer = null;
  }
};

// SRH environment setup for tests
export const setupSRHEnvironment = (config?: SRHConfig): void => {
  const finalConfig = { ...defaultSRHConfig, ...config };

  process.env.UPSTASH_REDIS_REST_URL = finalConfig.url;
  process.env.UPSTASH_REDIS_REST_TOKEN = finalConfig.token;
  process.env.SRH_MODE = finalConfig.mode;
  process.env.SRH_CONNECTION_STRING = finalConfig.redisUrl;
};

// SRH environment cleanup
export const cleanupSRHEnvironment = (): void => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.SRH_MODE;
  delete process.env.SRH_CONNECTION_STRING;
};

// SRH test utilities
export const createSRHTestConfig = (overrides?: Partial<SRHConfig>): SRHConfig => ({
  ...defaultSRHConfig,
  ...overrides,
});

// SRH Docker Compose configuration generator
// This creates a complete Redis + SRH setup for local testing
export const generateSRHDockerCompose = (config?: SRHConfig): string => {
  const finalConfig = { ...defaultSRHConfig, ...config };

  return `# SRH (Serverless Redis HTTP) Docker Compose Configuration
# This sets up a local Redis server with SRH proxy for Upstash-compatible testing
#
# Usage:
#   1. Save this to docker-compose.yml
#   2. Run: docker-compose up -d
#   3. Connect using: http://localhost:8080 with token: ${finalConfig.token}
#
# Based on hiett/serverless-redis-http - HTTP-based Redis pooler
# Compatible with @upstash/redis SDK for local development and testing

version: "3"
services:
  redis:
    image: redis:6.2-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  serverless-redis-http:
    image: hiett/serverless-redis-http:latest
    ports:
      - "8080:80"
    environment:
      SRH_MODE: ${finalConfig.mode}
      SRH_TOKEN: ${finalConfig.token}
      SRH_CONNECTION_STRING: ${finalConfig.redisUrl}
      SRH_MAX_CONNECTIONS: 10
    depends_on:
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  redis_data:
`;
};

// SRH GitHub Actions configuration generator
export const generateSRHGitHubActions = (config?: SRHConfig): string => {
  const finalConfig = { ...defaultSRHConfig, ...config };

  return `name: Test with SRH
on:
  push:
  pull_request:

env:
  SRH_TOKEN: ${finalConfig.token}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      redis:
        image: redis:6.2-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      srh:
        image: hiett/serverless-redis-http:latest
        env:
          SRH_MODE: ${finalConfig.mode}
          SRH_TOKEN: \${{ env.SRH_TOKEN }}
          SRH_CONNECTION_STRING: redis://redis:6379
        ports:
          - 8080:80
        options: >-
          --health-cmd "curl -f http://localhost:80/ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with SRH
        run: npm test
        env:
          UPSTASH_REDIS_REST_URL: http://localhost:8080
          UPSTASH_REDIS_REST_TOKEN: \${{ env.SRH_TOKEN }}
`;
};

// SRH test setup with automatic cleanup
export const withSRH = (config?: SRHConfig) => {
  return {
    async setup() {
      await setupSRH(config);
    },

    async teardown() {
      await cleanupSRH();
    },
  };
};

// SRH test environment setup with automatic cleanup
export const withSRHEnvironment = (config?: SRHConfig) => {
  return {
    setup() {
      setupSRHEnvironment(config);
    },

    teardown() {
      cleanupSRHEnvironment();
    },
  };
};

// Default export for convenience
