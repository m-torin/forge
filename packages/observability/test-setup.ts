// Setup test environment manually instead of using @repo/qa import due to resolution issues
process.env.NODE_ENV = 'test';
process.env.CI = 'true';
process.env.SKIP_ENV_VALIDATION = 'true';

// Observability package specific environment
process.env.SENTRY_ENVIRONMENT = 'test';
process.env.SENTRY_DSN = 'https://test@test.ingest.sentry.io/test';
process.env.SENTRY_ORG = 'test-org';
process.env.SENTRY_PROJECT = 'test-project';
process.env.SENTRY_DEBUG = 'false';
process.env.SENTRY_TRACE_SAMPLE_RATE = '0.1';
process.env.SENTRY_PROFILE_SAMPLE_RATE = '0.1';
process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = 'test';
process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@test.ingest.sentry.io/test';
process.env.NEXT_PUBLIC_SENTRY_DEBUG = 'false';
process.env.NEXT_PUBLIC_SENTRY_TRACE_SAMPLE_RATE = '0.1';
process.env.NEXT_PUBLIC_SENTRY_PROFILE_SAMPLE_RATE = '0.1';
process.env.NODE_OPTIONS = '--max-old-space-size=8192';

// Feature flags for observability
process.env.OBSERVABILITY_CONSOLE_ENABLED = 'true';
process.env.OBSERVABILITY_SENTRY_ENABLED = 'false';
process.env.OBSERVABILITY_OTEL_ENABLED = 'false';
process.env.OBSERVABILITY_LOGTAIL_ENABLED = 'false';
process.env.OBSERVABILITY_GRAFANA_ENABLED = 'false';

// Log level
process.env.LOG_LEVEL = 'info';

// Client flags
process.env.NEXT_PUBLIC_NODE_ENV = 'test';
process.env.NEXT_PUBLIC_ENABLE_CLIENT_LOGGING = 'false';
