// Centralized analytics and monitoring mocks for all tests in the monorepo
import { vi } from 'vitest';

// Mock PostHog Node
vi.mock('posthog-node', () => ({
  PostHog: vi.fn().mockImplementation(() => ({
    capture: vi.fn(),
    identify: vi.fn(),
    alias: vi.fn(),
    groupIdentify: vi.fn(),
    shutdown: vi.fn().mockResolvedValue(undefined),
    isFeatureEnabled: vi.fn().mockResolvedValue(false),
    getFeatureFlag: vi.fn().mockResolvedValue(null),
    getFeatureFlagPayload: vi.fn().mockResolvedValue(null),
    reloadFeatureFlags: vi.fn().mockResolvedValue(undefined),
    getAllFlags: vi.fn().mockResolvedValue({}),
    getPersonProperties: vi.fn().mockResolvedValue({}),
    getGroupProperties: vi.fn().mockResolvedValue({}),
  })),
}));

// Mock PostHog JS (Client-side)
vi.mock('posthog-js', () => ({
  default: {
    __loaded: true,
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    alias: vi.fn(),
    get_distinct_id: vi.fn(() => 'test-distinct-id'),
    isFeatureEnabled: vi.fn(() => false),
    getFeatureFlag: vi.fn(() => null),
    getFeatureFlagPayload: vi.fn(() => null),
    onFeatureFlags: vi.fn(),
    reloadFeatureFlags: vi.fn(),
    opt_out_capturing: vi.fn(),
    opt_in_capturing: vi.fn(),
    has_opted_out_capturing: vi.fn(() => false),
    get_property: vi.fn(),
    set_config: vi.fn(),
    get_config: vi.fn(),
    debug: vi.fn(),
    register: vi.fn(),
    register_once: vi.fn(),
    unregister: vi.fn(),
    get_session_id: vi.fn(() => 'test-session-id'),
    get_session_replay_url: vi.fn(),
    people: {
      set: vi.fn(),
      set_once: vi.fn(),
    },
  },
  // Named exports
  PostHog: vi.fn().mockImplementation(() => ({
    capture: vi.fn(),
    identify: vi.fn(),
    alias: vi.fn(),
  })),
}));

// Mock Sentry Next.js
vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  configureScope: vi.fn(callback => {
    callback({
      setUser: vi.fn(),
      setTag: vi.fn(),
      setContext: vi.fn(),
      clear: vi.fn(),
    });
  }),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  captureEvent: vi.fn(),
  addBreadcrumb: vi.fn(),
  setUser: vi.fn(),
  setContext: vi.fn(),
  setTag: vi.fn(),
  setTags: vi.fn(),
  setExtra: vi.fn(),
  setExtras: vi.fn(),
  withScope: vi.fn(callback => {
    callback({
      setUser: vi.fn(),
      setTag: vi.fn(),
      setContext: vi.fn(),
      clear: vi.fn(),
    });
  }),
  startTransaction: vi.fn(() => ({
    finish: vi.fn(),
    setStatus: vi.fn(),
    setTag: vi.fn(),
    setData: vi.fn(),
    startChild: vi.fn(() => ({
      finish: vi.fn(),
    })),
  })),
  getCurrentHub: vi.fn(() => ({
    getClient: vi.fn(),
    getScope: vi.fn(),
  })),
  // Integrations
  BrowserTracing: vi.fn(),
  Replay: vi.fn(),
  // Error boundary
  ErrorBoundary: ({ children, 'data-testid': testId, ...props }: any) => {
    // Conditionally import React only if available
    let React: any;
    try {
      React = require('react');
    } catch {
      return children;
    }
    return React.createElement(
      'div',
      {
        ...props,
        'data-testid': testId || 'sentry-error-boundary',
      },
      children,
    );
  },
  withErrorBoundary: (component: any) => component,
  showReportDialog: vi.fn(),
  // Performance
  withProfiler: (component: any) => component,
  Profiler: ({ children, 'data-testid': testId, ...props }: any) => {
    // Conditionally import React only if available
    let React: any;
    try {
      React = require('react');
    } catch {
      return children;
    }
    return React.createElement(
      'div',
      {
        ...props,
        'data-testid': testId || 'sentry-profiler',
      },
      children,
    );
  },
  // Types
  Severity: {
    Fatal: 'fatal',
    Error: 'error',
    Warning: 'warning',
    Info: 'info',
    Debug: 'debug',
  },
}));

// Mock Google Analytics
vi.mock('react-ga4', () => ({
  initialize: vi.fn(),
  send: vi.fn(),
  event: vi.fn(),
  set: vi.fn(),
  gtag: vi.fn(),
}));

// Mock Segment Analytics
vi.mock('@segment/analytics-next', () => ({
  AnalyticsBrowser: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockReturnValue({
      identify: vi.fn(),
      track: vi.fn(),
      page: vi.fn(),
      group: vi.fn(),
      alias: vi.fn(),
      reset: vi.fn(),
      ready: vi.fn(callback => callback()),
    }),
  })),
}));

// Mock Mintlify Analytics
vi.mock('@mintlify/previewing', () => ({
  trackEvent: vi.fn(),
  trackPageView: vi.fn(),
  identify: vi.fn(),
}));

vi.mock('@mintlify/link-rot', () => ({
  checkLinks: vi.fn().mockResolvedValue({ brokenLinks: [] }),
}));

vi.mock('@mintlify/common', () => ({
  parseConfig: vi.fn().mockReturnValue({}),
  validateConfig: vi.fn().mockReturnValue({ valid: true, errors: [] }),
}));

// Mock OpenTelemetry
vi.mock('@opentelemetry/api', () => ({
  trace: {
    getTracer: vi.fn(() => ({
      startSpan: vi.fn(() => ({
        end: vi.fn(),
        setAttribute: vi.fn(),
        setAttributes: vi.fn(),
        addEvent: vi.fn(),
        setStatus: vi.fn(),
        updateName: vi.fn(),
        recordException: vi.fn(),
      })),
      startActiveSpan: vi.fn((name, callback) => {
        const span = {
          end: vi.fn(),
          setAttribute: vi.fn(),
          setAttributes: vi.fn(),
          addEvent: vi.fn(),
          setStatus: vi.fn(),
          updateName: vi.fn(),
          recordException: vi.fn(),
        };
        return callback(span);
      }),
    })),
    getActiveSpan: vi.fn(),
    setSpan: vi.fn(),
  },
  metrics: {
    getMeter: vi.fn(() => ({
      createCounter: vi.fn(() => ({ add: vi.fn() })),
      createUpDownCounter: vi.fn(() => ({ add: vi.fn() })),
      createHistogram: vi.fn(() => ({ record: vi.fn() })),
      createObservableCounter: vi.fn(),
      createObservableUpDownCounter: vi.fn(),
      createObservableGauge: vi.fn(),
    })),
  },
  context: {
    active: vi.fn(),
    with: vi.fn((ctx, callback) => callback()),
  },
  propagation: {
    inject: vi.fn(),
    extract: vi.fn(),
  },
  SpanStatusCode: {
    OK: 0,
    ERROR: 1,
  },
  SpanKind: {
    INTERNAL: 0,
    SERVER: 1,
    CLIENT: 2,
    PRODUCER: 3,
    CONSUMER: 4,
  },
}));

// Export helper functions
const mockAnalyticsEvent = (eventName: string, properties: any = {}) => ({
  event: eventName,
  properties: {
    timestamp: new Date().toISOString(),
    ...properties,
  },
  context: {
    library: { name: 'mock-analytics', version: '1.0.0' },
  },
});

const mockSentryError = (message: string, extra: any = {}) => ({
  message,
  name: 'Error',
  stack: `Error: ${message}
    at mockFunction (test.js:1:1)`,
  extra,
});

const mockFeatureFlag = (flagName: string, enabled = false, payload: any = null) => ({
  flag: flagName,
  enabled,
  payload,
});

const resetAnalyticsMonitoringMocks = () => {
  vi.clearAllMocks();
};
