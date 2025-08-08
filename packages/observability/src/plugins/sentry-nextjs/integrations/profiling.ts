/**
 * Profiling integration helpers for Sentry Next.js
 */

/**
 * Profiling configuration options
 */
export interface ProfilingConfig {
  /**
   * Enable profiling
   * @default false
   */
  enabled?: boolean;

  /**
   * Profiling sample rate (0.0 to 1.0)
   * @default 0
   */
  profilesSampleRate?: number;

  /**
   * Enable automatic Document-Policy header injection
   * @default true
   */
  enableDocumentPolicy?: boolean;

  /**
   * Custom profiling configuration
   */
  options?: {
    /**
     * Profile sampling method
     */
    samplingMethod?: 'timer' | 'continuous';

    /**
     * Maximum profile duration in milliseconds
     */
    maxProfileDuration?: number;

    [key: string]: any;
  };
}

/**
 * Generate next.config.js headers for profiling
 */
export function generateProfilingHeaders(): string {
  return `async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Document-Policy",
            value: "js-profiling",
          },
        ],
      },
    ];
  }`;
}

/**
 * Generate profiling configuration for Next.js
 */
export function generateProfilingConfig(config: ProfilingConfig): string {
  const { enabled = false, profilesSampleRate = 0, enableDocumentPolicy = true } = config;

  if (!enabled) {
    return '// Profiling is disabled';
  }

  return `// Profiling configuration
{
  profilesSampleRate: ${profilesSampleRate},
  ${
    enableDocumentPolicy
      ? `// Document-Policy header should be added to next.config.js:
  // ${generateProfilingHeaders()}`
      : ''
  }
}`;
}

/**
 * Check if profiling is properly configured
 */
export function validateProfilingConfig(config: ProfilingConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (config.enabled && !config.profilesSampleRate) {
    errors.push('Profiling is enabled but profilesSampleRate is 0');
  }

  if (config.profilesSampleRate && config.profilesSampleRate > 0.1) {
    warnings.push('High profiling sample rate may impact performance');
  }

  if (config.enabled && !config.enableDocumentPolicy) {
    warnings.push('Document-Policy header is recommended for profiling');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get recommended profiling configuration based on environment
 */
export function getRecommendedProfilingConfig(
  env: 'development' | 'preview' | 'production',
): ProfilingConfig {
  switch (env) {
    case 'development':
      return {
        enabled: false, // Usually disabled in dev to avoid overhead
        profilesSampleRate: 0,
      };
    case 'preview':
      return {
        enabled: true,
        profilesSampleRate: 0.05, // 5% sampling
        enableDocumentPolicy: true,
      };
    case 'production':
      return {
        enabled: true,
        profilesSampleRate: 0.01, // 1% sampling
        enableDocumentPolicy: true,
        options: {
          samplingMethod: 'timer',
          maxProfileDuration: 30000, // 30 seconds
        },
      };
  }
}

/**
 * Profiling setup guide
 */
export const PROFILING_SETUP_GUIDE = `
# Profiling Setup Guide

## 1. Enable Profiling in Sentry Configuration

\`\`\`typescript
// sentry.server.config.ts
Sentry.init({
  // ... other config
  profilesSampleRate: 0.01, // 1% of transactions
  integrations: [
    Sentry.profilesIntegration(),
  ],
});
\`\`\`

## 2. Add Document-Policy Header to next.config.js

\`\`\`javascript
// next.config.js
module.exports = {
  ${generateProfilingHeaders()}
};
\`\`\`

## 3. Environment Variables

Set these environment variables:

\`\`\`bash
# Server-side profiling
SENTRY_PROFILES_SAMPLE_RATE=0.01

# Enable profiling integration
SENTRY_ENABLE_PROFILING=true
\`\`\`

## 4. Verify Profiling is Working

1. Check Sentry Performance tab for profile data
2. Look for flame graphs in transaction details
3. Monitor performance impact

## Performance Considerations

- Start with low sample rates (0.01 = 1%)
- Monitor CPU usage impact
- Increase gradually if needed
- Disable in development unless debugging

## Troubleshooting

- Ensure Document-Policy header is present
- Check browser console for profiling errors
- Verify Sentry SDK version supports profiling
- Check that transactions are being sampled
`;
