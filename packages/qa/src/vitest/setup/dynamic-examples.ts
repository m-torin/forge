// Example dynamic environment setups for different app/package types
import {
  environmentPatterns,
  environmentTests,
  setupDynamicEnvironment,
  type DynamicEnvironmentConfig,
} from './package-environments';

/**
 * Example: Full-stack Next.js app (like webapp/ai-chatbot)
 */
export function setupFullStackApp() {
  return setupDynamicEnvironment({
    ...environmentPatterns.fullStack(),
    // Add app-specific overrides
    overrides: {
      NEXT_PUBLIC_APP_URL: 'http://localhost:3200',
      APP_NAME: 'webapp',
    },
    // Conditional environments based on feature flags
    conditional: [
      {
        condition: () => environmentTests.hasEnvVar('ENABLE_AI_FEATURES'),
        environment: 'ai',
      },
      {
        condition: () => environmentTests.hasPackage('@repo/scraping'),
        environment: 'scraping',
      },
    ],
  });
}

/**
 * Example: Backend service (like email service)
 */
export function setupBackendService() {
  return setupDynamicEnvironment({
    ...environmentPatterns.backend(),
    // Always include orchestration for workflow services
    environments: ['database', 'auth', 'orchestration', 'observability'],
    custom: {
      WORKFLOW_TIMEOUT: '300000',
      MAX_RETRY_ATTEMPTS: '3',
    },
  });
}

/**
 * Example: Package library testing
 */
export function setupPackageLibrary(packageName: string) {
  return setupDynamicEnvironment({
    environments: ['common'],
    custom: {
      PACKAGE_NAME: packageName,
      PACKAGE_VERSION: '1.0.0',
    },
    // Include environments based on package dependencies
    conditional: [
      {
        condition: () => environmentTests.hasPackage('react'),
        environment: { REACT_VERSION: '19.1.0' },
      },
      {
        condition: () => environmentTests.hasPackage('next'),
        environment: { NEXT_VERSION: '15.4.0' },
      },
    ],
  });
}

/**
 * Example: Testing-specific environment with custom test data
 */
export function setupTestEnvironment(options: {
  testSuite?: string;
  mockLevel?: 'minimal' | 'full';
  features?: string[];
}) {
  const config: DynamicEnvironmentConfig = {
    environments: ['common'],
    custom: {
      TEST_SUITE: options.testSuite || 'default',
      MOCK_LEVEL: options.mockLevel || 'full',
      TEST_TIMEOUT: '30000',
    },
  };

  // Add feature-specific environments
  if (options.features?.includes('database')) {
    config.environments!.push('database');
  }
  if (options.features?.includes('auth')) {
    config.environments!.push('auth');
  }
  if (options.features?.includes('payments')) {
    config.environments!.push('payments');
  }

  return setupDynamicEnvironment(config);
}

/**
 * Example: Multi-tenant environment testing
 */
export function setupMultiTenantEnvironment(tenantId: string) {
  return setupDynamicEnvironment({
    environments: ['database', 'auth', 'analytics'],
    custom: {
      TENANT_ID: tenantId,
      MULTI_TENANT_MODE: 'true',
    },
    overrides: {
      DATABASE_URL: `postgresql://test:test@localhost:5432/test_${tenantId}`,
    },
  });
}

/**
 * Example: Edge/serverless environment
 */
export function setupEdgeEnvironment() {
  return setupDynamicEnvironment({
    environments: ['common'],
    custom: {
      RUNTIME: 'edge',
      EDGE_REGION: 'iad1',
    },
    // Exclude Node.js specific variables
    exclude: [
      'DATABASE_URL', // Use connection pooling instead
      'REDIS_URL', // Use REST API instead
    ],
    conditional: [
      {
        condition: () => environmentTests.hasPackage('@vercel/edge'),
        environment: {
          VERCEL_EDGE_FUNCTIONS: 'true',
        },
      },
    ],
  });
}

/**
 * Example: Development vs Production environment switching
 */
export function setupEnvironmentByMode(mode: 'development' | 'test' | 'production') {
  const baseConfig: DynamicEnvironmentConfig = {
    environments: ['common'],
  };

  switch (mode) {
    case 'development':
      return setupDynamicEnvironment({
        ...baseConfig,
        environments: [...baseConfig.environments!, 'database', 'auth'],
        custom: {
          NODE_ENV: 'development',
          DEBUG: 'true',
          LOG_LEVEL: 'debug',
        },
      });

    case 'test':
      return setupDynamicEnvironment({
        ...baseConfig,
        custom: {
          NODE_ENV: 'test',
          CI: 'true',
          SKIP_ENV_VALIDATION: 'true',
          LOG_LEVEL: 'silent',
        },
      });

    case 'production':
      return setupDynamicEnvironment({
        ...baseConfig,
        environments: [...baseConfig.environments!, 'observability', 'security'],
        custom: {
          NODE_ENV: 'production',
          LOG_LEVEL: 'info',
        },
        exclude: ['DEBUG'],
      });

    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}

/**
 * Example: Feature flag driven environment
 */
export function setupFeatureFlagEnvironment(enabledFeatures: string[]) {
  const config: DynamicEnvironmentConfig = {
    environments: ['common', 'featureFlags'],
    conditional: [],
  };

  // Add environments based on enabled features
  enabledFeatures.forEach(feature => {
    config.conditional!.push({
      condition: () => true, // Always include if in enabled features
      environment: (() => {
        switch (feature) {
          case 'payments':
            return 'payments';
          case 'ai':
            return 'ai';
          case 'analytics':
            return 'analytics';
          case 'notifications':
            return 'notifications';
          default:
            return {};
        }
      })(),
    });
  });

  return setupDynamicEnvironment(config);
}

/**
 * Example: Integration test environment with external services
 */
export function setupIntegrationTestEnvironment() {
  return setupDynamicEnvironment({
    environments: ['database', 'auth', 'payments', 'email'],
    custom: {
      INTEGRATION_TEST: 'true',
      EXTERNAL_API_TIMEOUT: '10000',
      RETRY_ATTEMPTS: '3',
    },
    conditional: [
      {
        condition: () => environmentTests.hasEnvVar('STRIPE_TEST_MODE'),
        environment: {
          STRIPE_TEST_MODE: 'true',
          STRIPE_WEBHOOK_TOLERANCE: '600',
        },
      },
      {
        condition: () => environmentTests.hasEnvVar('EMAIL_TEST_MODE'),
        environment: {
          EMAIL_TEST_MODE: 'true',
          EMAIL_PROVIDER: 'test',
        },
      },
    ],
  });
}
