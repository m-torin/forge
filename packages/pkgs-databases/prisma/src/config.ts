import type { AdapterOptions, ClientOptions, DatabaseProvider, RuntimeConfig } from './types';

/**
 * Configuration utility for Prisma 6 driver adapters
 * Provides centralized configuration management for different database providers
 */
export class PrismaAdapterConfig {
  private static instance: PrismaAdapterConfig;
  private adapters: Map<DatabaseProvider, any> = new Map();

  private constructor() {}

  static getInstance(): PrismaAdapterConfig {
    if (!PrismaAdapterConfig.instance) {
      PrismaAdapterConfig.instance = new PrismaAdapterConfig();
    }
    return PrismaAdapterConfig.instance;
  }

  /**
   * Register an adapter for a specific database provider
   */
  registerAdapter(provider: DatabaseProvider, adapterClass: any): void {
    this.adapters.set(provider, adapterClass);
  }

  /**
   * Get the adapter class for a database provider
   */
  getAdapter(provider: DatabaseProvider): any {
    return this.adapters.get(provider);
  }

  /**
   * Get all available adapters
   */
  getAvailableAdapters(): DatabaseProvider[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Validate adapter configuration for a provider
   */
  validateConfig(provider: DatabaseProvider, options: AdapterOptions): boolean {
    switch (provider) {
      case 'postgresql':
        return 'connectionString' in options && !!options.connectionString;

      case 'sqlite':
        return 'url' in options && !!options.url;

      case 'd1':
        return (
          'CLOUDFLARE_D1_TOKEN' in options &&
          'CLOUDFLARE_ACCOUNT_ID' in options &&
          'CLOUDFLARE_DATABASE_ID' in options
        );

      default:
        return false;
    }
  }

  /**
   * Get required dependencies for a provider
   */
  getRequiredDependencies(provider: DatabaseProvider): string[] {
    switch (provider) {
      case 'postgresql':
        return ['@prisma/adapter-pg'];

      case 'sqlite':
        return ['@prisma/adapter-better-sqlite3'];

      case 'd1':
        return ['@prisma/adapter-d1'];

      default:
        return [];
    }
  }

  /**
   * Create client options with adapter
   */
  createClientOptions(adapterInstance: any, options: Partial<ClientOptions> = {}): ClientOptions {
    return {
      adapter: adapterInstance,
      log: options.log || ['error', 'warn'],
      ...options,
    };
  }
}

/**
 * Environment configuration utilities
 */
export class EnvironmentConfig {
  /**
   * Detect current runtime environment
   */
  static detectRuntime(): RuntimeConfig['runtime'] {
    if (typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis) return 'vercel-edge';
    return 'nodejs';
  }

  /**
   * Detect current environment
   */
  static detectEnvironment(): RuntimeConfig['environment'] {
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === 'production') return 'production';
    if (nodeEnv === 'test') return 'test';
    return 'development';
  }

  /**
   * Get runtime configuration
   */
  static getRuntimeConfig(): RuntimeConfig {
    return {
      runtime: this.detectRuntime(),
      environment: this.detectEnvironment(),
    };
  }
}

// Export convenience function
export function createAdapterConfig(): PrismaAdapterConfig {
  return PrismaAdapterConfig.getInstance();
}
