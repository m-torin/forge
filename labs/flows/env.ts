import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { logError } from '@repo/observability';

export const env = createEnv({
  server: {
    // Database
    PRISMA_DB_URL: z.string().url().optional(),
    PRISMA_DB_URL_NON_POOLING: z.string().url().optional(),
    DATABASE_URL: z.string().url().optional(),
    
    // Redis/Cache
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    REDIS_URL: z.string().url().optional(),
    CACHE_STORE: z.string().optional(),
    
    // Authentication
    NEXTAUTH_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().optional(),
    AUTH_SECRET: z.string().optional(),
    ENCRYPTION_SECRET: z.string().min(32).optional(),
    
    // GitHub Integration
    GITHUB_ID: z.string().optional(),
    GITHUB_SECRET: z.string().optional(),
    GITHUB_TOKEN: z.string().optional(),
    
    // AWS Integration
    AWS_REGION: z.string().default("us-east-1"),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_ACCOUNT_ID: z.string().optional(),
    
    // Vercel Integration
    VERCEL_AUTH_BEARER_TOKEN: z.string().optional(),
    VERCEL_PROJECT_ID: z.string().optional(),
    VERCEL_TEAM_ID: z.string().optional(),
    VERCEL_DOMAIN: z.string().optional(),
    
    // AI APIs
    OPENAI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    
    // Third-party APIs
    THIRD_PARTY_API_EXAMPLE_BACKEND: z.string().url().optional(),
    
    // Service Configuration
    SERVICE_NAME: z.string().default("flowbuilder"),
    SERVICE_VERSION: z.string().default("1.0.0"),
    DEBUG: z.enum(["true", "false"]).default("false"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    TIMEOUT_MS: z.string().transform((val) => parseInt(val, 10)).pipe(z.number()).default(30000),
    MAX_RETRIES: z.string().transform((val) => parseInt(val, 10)).pipe(z.number()).default(3),
    RETRY_BACKOFF: z.enum(["exponential", "linear"]).default("exponential"),
    
    // Cache Configuration
    CACHE_ENABLED: z.enum(["true", "false"]).default("true"),
    CACHE_TTL: z.string().transform((val) => parseInt(val, 10)).pipe(z.number()).default(300),
    
    // Rate Limiting
    RATE_LIMIT_ENABLED: z.enum(["true", "false"]).default("true"),
    RATE_LIMIT: z.string().transform((val) => parseInt(val, 10)).pipe(z.number()).default(100),
    RATE_LIMIT_WINDOW: z.string().transform((val) => parseInt(val, 10)).pipe(z.number()).default(60000),
    
    // Telemetry
    TELEMETRY_ENABLED: z.enum(["true", "false"]).default("false"),
    
    // Environment
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    CI: z.string().optional(),
    
    // Instance Configuration
    DEFAULT_INSTANCE_ID: z.string().default('default-instance'),
    DEMO_INSTANCE_ID: z.string().default('demo-instance'),
    DEMO_MODE: z.enum(["true", "false"]).default("false"),
    
  },
  client: {
    NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    // Database
    PRISMA_DB_URL: process.env.PRISMA_DB_URL,
    PRISMA_DB_URL_NON_POOLING: process.env.PRISMA_DB_URL_NON_POOLING,
    DATABASE_URL: process.env.DATABASE_URL,
    
    // Redis/Cache
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    REDIS_URL: process.env.REDIS_URL,
    CACHE_STORE: process.env.CACHE_STORE,
    
    // Authentication
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET,
    
    // GitHub Integration
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    
    // AWS Integration
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_ACCOUNT_ID: process.env.AWS_ACCOUNT_ID,
    
    // Vercel Integration
    VERCEL_AUTH_BEARER_TOKEN: process.env.VERCEL_AUTH_BEARER_TOKEN,
    VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
    VERCEL_TEAM_ID: process.env.VERCEL_TEAM_ID,
    VERCEL_DOMAIN: process.env.VERCEL_DOMAIN,
    
    // AI APIs
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    
    // Third-party APIs
    THIRD_PARTY_API_EXAMPLE_BACKEND: process.env.THIRD_PARTY_API_EXAMPLE_BACKEND,
    
    // Service Configuration
    SERVICE_NAME: process.env.SERVICE_NAME,
    SERVICE_VERSION: process.env.SERVICE_VERSION,
    DEBUG: process.env.DEBUG,
    LOG_LEVEL: process.env.LOG_LEVEL,
    TIMEOUT_MS: process.env.TIMEOUT_MS,
    MAX_RETRIES: process.env.MAX_RETRIES,
    RETRY_BACKOFF: process.env.RETRY_BACKOFF,
    
    // Cache Configuration
    CACHE_ENABLED: process.env.CACHE_ENABLED,
    CACHE_TTL: process.env.CACHE_TTL,
    
    // Rate Limiting
    RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED,
    RATE_LIMIT: process.env.RATE_LIMIT,
    RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,
    
    // Telemetry
    TELEMETRY_ENABLED: process.env.TELEMETRY_ENABLED,
    
    // Environment
    NODE_ENV: process.env.NODE_ENV,
    CI: process.env.CI,
    
    // Instance Configuration
    DEFAULT_INSTANCE_ID: process.env.DEFAULT_INSTANCE_ID,
    DEMO_INSTANCE_ID: process.env.DEMO_INSTANCE_ID,
    DEMO_MODE: process.env.DEMO_MODE,
    
    // Client-side variables
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  onValidationError: (error) => {
    logError("❌ Invalid environment variables", { error });
    throw new Error("Invalid environment variables");
  },
  onInvalidAccess: (variable) => {
    throw new Error(
      `❌ Attempted to access a server-side environment variable on the client: ${variable}`
    );
  },
});

// Demo constants - centralized to avoid circular dependencies
export const DEMO_CONSTANTS = {
  FLOW_ID: 'demo-flow-001',
  INSTANCE_ID: env.DEMO_INSTANCE_ID,
  STORAGE_KEY: 'flows-demo-data',
} as const;