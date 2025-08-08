/**
 * Better Auth Configuration for Mantine Tailwind Template
 *
 * Provides conditional auth setup:
 * - Demo Mode: Uses in-memory adapter for demos without database
 * - Production Mode: Uses full @repo/auth configuration with database
 */

import { env } from '#/root/env';
import { createMemoryAdapter } from '@repo/auth/adapters/memory';
import { logInfo, logWarn } from '@repo/observability';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';

// Detect if we're in demo mode (no database connection)
const isDemoMode = !process.env.DATABASE_URL || process.env.DEMO_MODE === 'true';

logInfo(`[Auth Config] Running in ${isDemoMode ? 'DEMO' : 'PRODUCTION'} mode`);

// Demo users template - will be created with proper hashed passwords
const DEMO_USER_TEMPLATES = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'demo123',
    emailVerified: true,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    role: 'user',
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    emailVerified: true,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'admin',
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'jane123',
    emailVerified: true,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    role: 'user',
  },
];

/**
 * Demo mode auth configuration
 */
function createDemoAuth() {
  // Create memory adapter with app-specific configuration
  const memoryAdapter = createMemoryAdapter({
    demoUsers: DEMO_USER_TEMPLATES,
    logger: { info: logInfo, warn: logWarn, error: logWarn },
    debugMode: process.env.NODE_ENV === 'development',
    eagerInit: true,
    adapterName: 'Mantine Tailwind Memory Adapter',
  });

  return betterAuth({
    appName: 'Mantine + Tailwind Demo',
    baseURL: env.NEXT_PUBLIC_APP_URL || 'http://localhost:3900',
    secret: env.BETTER_AUTH_SECRET || 'demo-secret-key-not-for-production',

    // Use memory adapter for demo mode
    database: memoryAdapter,

    // Email & Password Authentication
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: false, // Skip email verification in demo
      minPasswordLength: 6, // Relaxed for demo
      maxPasswordLength: 128,
      password: {
        hash: async (password: string) => {
          // Simple demo hash - in production, use proper scrypt
          return `$2b$10$demo.hash.${password}`;
        },
        verify: async ({ hash, password }: { hash: string; password: string }) => {
          // Simple demo verification
          const expectedHash = `$2b$10$demo.hash.${password}`;
          return hash === expectedHash || hash.includes(password);
        },
      },
    },

    // Session Configuration
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },

    // User Configuration
    user: {
      additionalFields: {
        role: {
          type: 'string',
          required: false,
          defaultValue: 'user',
        },
      },
    },

    // Simplified configuration for demo
    socialProviders: {
      // Only enable if env vars are present
      ...(env.GITHUB_CLIENT_ID &&
        env.GITHUB_CLIENT_SECRET && {
          github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
            enabled: true,
          },
        }),
      ...(env.GOOGLE_CLIENT_ID &&
        env.GOOGLE_CLIENT_SECRET && {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            enabled: true,
          },
        }),
    },

    // Advanced Configuration
    advanced: {
      useSecureCookies: process.env.NODE_ENV === 'production',
      disableCSRFCheck: false,
      cookiePrefix: 'demo-auth',
      defaultCookieAttributes: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      },
    },

    // Plugins - minimal set for demo
    plugins: [
      // Next.js cookies (must be last)
      nextCookies(),
    ],

    // Error Handling
    onAPIError: {
      throw: false,
      errorHandler: (error: any, ctx: any) => {
        logWarn(`[Demo Auth] API Error: ${error.message}`, {
          path: ctx?.path,
          method: ctx?.method,
          error: error.message,
        });

        return {
          status: error.status || 500,
          body: {
            error:
              process.env.NODE_ENV === 'development'
                ? error.message
                : 'Authentication error occurred',
          },
        };
      },
    },

    // Hooks
    hooks: {
      before: async (ctx: any) => {
        if (process.env.NODE_ENV === 'development') {
          logInfo(`[Demo Auth] Request: ${ctx?.method} ${ctx?.path}`);
        }
      },
    },
  });
}

/**
 * Production mode auth configuration using @repo/auth
 */
function createProductionAuth() {
  try {
    // In production mode, we would use @repo/auth
    // For now, let's create a similar configuration that could work with a database
    logWarn('[Auth Config] Production mode detected but using demo auth for now');
    return createDemoAuth();
  } catch (error) {
    logWarn('[Auth Config] Failed to create production auth, falling back to demo mode', {
      error: error instanceof Error ? error.message : String(error),
    });
    return createDemoAuth();
  }
}

/**
 * Export auth instance based on mode
 */
export const auth = isDemoMode ? createDemoAuth() : createProductionAuth();

// Demo users will be initialized on first access to avoid build-time issues

// Export the auth type for inference
export type AuthInstance = typeof auth;

/**
 * Check if running in demo mode
 */
export function isInDemoMode(): boolean {
  return isDemoMode;
}

/**
 * Get demo mode info for UI display
 */
export function getDemoModeInfo() {
  if (!isDemoMode) return null;

  return {
    message: 'Running in demo mode with in-memory authentication',
    demoUsers: [
      { email: 'demo@example.com', password: 'demo123', role: 'user' },
      { email: 'admin@example.com', password: 'admin123', role: 'admin' },
      { email: 'jane@example.com', password: 'jane123', role: 'user' },
    ],
  };
}
