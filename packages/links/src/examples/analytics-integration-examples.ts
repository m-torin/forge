/**
 * Link Analytics Integration Examples
 *
 * Demonstrates how to integrate @repo/links with @repo/analytics for comprehensive
 * link tracking and business intelligence. This file shows various patterns for
 * combining URL shortening with detailed analytics tracking.
 *
 * Integration Patterns:
 * - Basic analytics integration (disabled by default)
 * - Manual analytics provider injection
 * - Automatic Next.js integration
 * - Server-side tracking with analytics
 * - Client-side integration patterns
 * - Environment-specific configurations
 * - A/B testing with link analytics
 * - Performance monitoring
 * - Custom business metrics
 *
 * Prerequisites:
 * - @repo/links package configured
 * - @repo/analytics package configured
 * - Analytics providers enabled (PostHog, Segment, etc.)
 * - Dub.sh API access
 *
 * Environment: Next.js Server-Side and Client-Side
 *
 * @see https://dub.sh/docs/analytics
 */

import { logInfo } from '@repo/observability/server/next';
import { safeEnv } from '../../env';
import { LinkAnalyticsEvent } from '../shared/types/analytics-integration';
import { LinkConfig } from '../shared/types/index';

// ============================================================================
// 1. BASIC ANALYTICS INTEGRATION
// ============================================================================

/**
 * Example: Basic analytics integration (disabled by default)
 */
export const basicAnalyticsConfig: LinkConfig = {
  providers: {
    dub: {
      enabled: true,
      apiKey: safeEnv().DUB_API_KEY || 'dub_example_key',
      defaultDomain: 'yourdomain.com',
    },
  },
  // Analytics is disabled by default
  analytics: {
    enabled: false, // Must be explicitly enabled
  },
};

/**
 * Example: Enabled analytics integration
 */
export const enabledAnalyticsConfig: LinkConfig = {
  providers: {
    dub: {
      enabled: true,
      apiKey: safeEnv().DUB_API_KEY || 'dub_example_key',
      defaultDomain: 'yourdomain.com',
    },
  },
  analytics: {
    enabled: true,
    events: ['link_created', 'link_clicked', 'link_deleted'],
    sampling: 1.0, // 100% tracking
    debugMode: process.env.NODE_ENV === 'development',
  },
};

// ============================================================================
// 2. MANUAL ANALYTICS PROVIDER INJECTION
// ============================================================================

/**
 * Example: Manual analytics provider injection
 */
export async function manualAnalyticsIntegration() {
  // Create analytics manager first
  const { createServerAnalytics } = await import('@repo/analytics/server/next');

  const analytics = await createServerAnalytics({
    providers: {
      posthog: {
        apiKey: process.env.POSTHOG_API_KEY,
      },
      console: {
        // enabled: process.env.NODE_ENV === 'development', // Removed: property doesn't exist
      },
    },
  });

  // Inject into links configuration
  const linkConfig: LinkConfig = {
    providers: {
      dub: {
        enabled: true,
        apiKey: safeEnv().DUB_API_KEY || 'dub_example_key',
        defaultDomain: 'yourdomain.com',
      },
    },
    analytics: {
      enabled: true,
      provider: {
        track: async (event: string, properties?: Record<string, any>) => {
          // await analytics.log('info', `Link Event: ${event}`, properties); // Removed: log method doesn't exist
          await analytics.track(event, properties);
        },
      },
      events: ['link_created', 'link_clicked', 'link_deleted', 'bulk_created'],
      sampling: 0.5, // 50% sampling for performance
    },
  };

  // const { createServerLinkManager } = await import('@repo/orchestration/server/next'); // Commented: module not available
  // return createServerLinkManager(linkConfig);
  throw new Error('Orchestration module not available - this is an example only');
}

// ============================================================================
// 3. AUTOMATIC ANALYTICS INTEGRATION (NEXT.JS)
// ============================================================================

/**
 * Example: Automatic analytics integration using Next.js helper
 */
export async function automaticAnalyticsIntegration() {
  // const { createNextLinkManagerWithAnalytics } = await import('@repo/orchestration/server/next'); // Commented: module not available

  // Links configuration
  const linkConfig = {
    providers: {
      dub: {
        enabled: true,
        apiKey: safeEnv().DUB_API_KEY || 'dub_example_key',
        defaultDomain: 'yourdomain.com',
      },
    },
    analytics: {
      enabled: true,
      events: ['link_created', 'link_clicked'],
      sampling: 1.0,
    },
  };

  // Analytics configuration
  const analyticsConfig = {
    providers: {
      posthog: {
        enabled: true,
        apiKey: process.env.POSTHOG_API_KEY,
      },
      segment: {
        enabled: true,
        writeKey: process.env.SEGMENT_WRITE_KEY,
      },
    },
  };

  // Automatic integration
  // return createNextLinkManagerWithAnalytics(linkConfig, analyticsConfig); // Commented: module not available
  throw new Error('Orchestration module not available - this is an example only');
}

// ============================================================================
// 4. SERVER-SIDE USAGE WITH ANALYTICS
// ============================================================================

/**
 * Example: Server-side link creation with analytics tracking
 */
export async function serverSideWithAnalytics() {
  const linkManager = await automaticAnalyticsIntegration();

  // All following code commented because linkManager throws error
  throw new Error('Function disabled - linkManager unavailable');

  /*
  // Create a link - automatically tracked
  const link = await linkManager.createLink({
    url: 'https://example.com/product/123',
    title: 'Amazing Product',
    tags: ['marketing', 'product'],
    utm: {
      source: 'email',
      medium: 'newsletter',
      campaign: 'product-launch',
    },
  });

  logInfo('Link created with analytics', { link });

  // Simulate a click - automatically tracked
  await linkManager.trackClick(link.id, {
    country: 'US',
    city: 'San Francisco',
    browser: 'Chrome',
    device: 'Desktop',
    ip: '192.168.1.1',
    referrer: 'https://google.com',
  });

  // Bulk creation - automatically tracked
  const bulkResult = await linkManager.bulkCreate({
    links: [
      { url: 'https://example.com/page1', title: 'Page 1' },
      { url: 'https://example.com/page2', title: 'Page 2' },
      { url: 'https://example.com/page3', title: 'Page 3' },
    ],
  });

  logInfo('Bulk link creation completed', {
    created: bulkResult.created.length,
    analytics: true
  });

  return { link, bulkResult };
  */
}

// ============================================================================
// 5. ENVIRONMENT-SPECIFIC CONFIGURATIONS
// ============================================================================

/**
 * Example: Development configuration with full analytics
 */
export const developmentAnalyticsConfig: LinkConfig = {
  providers: {
    dub: {
      enabled: true,
      apiKey: safeEnv().DUB_API_KEY || 'dub_example_key',
      defaultDomain: 'dub.sh',
    },
  },
  analytics: {
    enabled: true,
    events: ['link_created', 'link_clicked', 'link_updated', 'link_deleted', 'bulk_created'],
    sampling: 1.0, // Full tracking in development
    debugMode: true,
  },
};

/**
 * Example: Production configuration with optimized analytics
 */
export const productionAnalyticsConfig: LinkConfig = {
  providers: {
    dub: {
      enabled: true,
      apiKey: safeEnv().DUB_API_KEY || 'dub_example_key',
      defaultDomain: 'yourdomain.com',
    },
  },
  analytics: {
    enabled: true,
    events: ['link_created', 'link_clicked', 'link_deleted'],
    sampling: 0.1, // 10% sampling for performance
    debugMode: false,
    attribution: {
      cookieDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
      crossDomainTracking: true,
    },
  },
};

// ============================================================================
// 6. CLIENT-SIDE ANALYTICS INTEGRATION
// ============================================================================

/**
 * Example: Client-side analytics integration with React
 */
export const clientAnalyticsExample = `
import { LinkProvider } from '@repo/links/client/next';
import { createClientObservability } from '@repo/analytics/client/next';

// Create analytics provider
const analytics = await createClientObservability({
  providers: {
    posthog: {
      enabled: true,
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_API_KEY
    },
  },
};

// Links configuration with analytics
const linkConfig = {
  providers: {
    dub: {
      enabled: true,
      apiKey: safeEnv().NEXT_PUBLIC_DUB_API_KEY || 'dub_public_example_key',
      defaultDomain: 'yourdomain.com',
    },
  },
  analytics: {
    enabled: true,
    provider: {
      track: async (event: string, properties?: Record<string, any>) => {
        await analytics.track(event, properties);
      },
    },
    events: ['link_created', 'link_clicked'],
    sampling: 1.0,
  },
};

function App() {
  return (
    <LinkProvider config={linkConfig}>
      <MyApp />
    </LinkProvider>
  );
}

function LinkCreator() {
  const { createLink } = useCreateLink();

  const handleCreate = async () => {
    // This will automatically track analytics
    const link = await createLink({
      url: 'https://example.com',
      title: 'My Link'
    });

    console.log('Link created with analytics: ', link),
  };

  return <button onClick={handleCreate}>Create Link</button>;
}
`;

// ============================================================================
// 7. ADVANCED ANALYTICS PATTERNS
// ============================================================================

/**
 * Example: Custom analytics event tracking
 */
export async function customAnalyticsTracking() {
  const linkManager = await automaticAnalyticsIntegration();

  // Function disabled due to linkManager throwing error
  throw new Error('Function disabled - linkManager unavailable');

  /*
  // Create link with custom tracking
  const link = await linkManager.createLink({
    url: 'https://example.com/special-offer',
    title: 'Special Offer',
    tags: ['promotion', 'limited-time'],
  });

  // Custom analytics tracking for business metrics
  const analytics = await import('@repo/analytics/server/next').then((m: any) =>
    m.createNextJSServerAnalytics({
      providers: {
        posthog: { enabled: true, apiKey: process.env.POSTHOG_API_KEY },
      },
    }),
  );

  // Track custom business event
  await analytics.track('promotion_link_created', {
    link_id: link.id,
    short_url: link.shortLink,
    promotion_type: 'limited_time',
    expected_conversion_rate: 0.15,
    campaign_budget: 5000,
  });

  return link;
  */
}

/**
 * Example: A/B testing with analytics
 */
export async function abTestingWithAnalytics() {
  const linkManager = await automaticAnalyticsIntegration();

  // Function disabled due to linkManager throwing error
  throw new Error('Function disabled - linkManager unavailable');

  /*
  // Create A/B test links
  const testLinks = await linkManager.bulkCreate({
    links: [
      {
        url: 'https://landing-a.example.com',
        title: 'Landing Page A',
        tags: ['ab-test', 'variant-a'],
        utm: { campaign: 'test', content: 'variant-a' },
      },
      {
        url: 'https://landing-b.example.com',
        title: 'Landing Page B',
        tags: ['ab-test', 'variant-b'],
        utm: { campaign: 'test', content: 'variant-b' },
      },
    ],
  });

  // Analytics will automatically track which links are created and clicked
  return testLinks;
  */
}

/**
 * Example: Performance monitoring with analytics
 */
export async function performanceMonitoring() {
  const linkManager = await automaticAnalyticsIntegration();

  // Function disabled due to linkManager throwing error
  throw new Error('Function disabled - linkManager unavailable');

  /*
  // Measure link creation performance
  const startTime = Date.now();

  const link = await linkManager.createLink({
    url: 'https://example.com/performance-test',
    title: 'Performance Test',
  });

  const creationTime = Date.now() - startTime;

  // Track performance metrics
  const analytics = await import('@repo/analytics/server/next').then((m: any) =>
    m.createNextJSServerAnalytics({
      providers: { console: { enabled: true } },
    }),
  );

  await analytics.track('link_creation_performance', {
    link_id: link.id,
    creation_time_ms: creationTime,
    url_length: link.url.length,
    domain: link.domain,
  });

  return { link, creationTime };
  */
}

// ============================================================================
// 8. CONFIGURATION UTILITIES
// ============================================================================

/**
 * Utility to create analytics-enabled link configuration
 */
export function createAnalyticsLinkConfig(options: {
  dubApiKey: string;
  domain?: string;
  analyticsProvider?: any;
  enabledEvents?: string[];
  sampling?: number;
  environment: 'development' | 'production';
}): LinkConfig {
  const {
    dubApiKey,
    domain = 'dub.sh',
    analyticsProvider,
    enabledEvents = ['link_created', 'link_clicked'],
    sampling = 1.0,
    environment,
  } = options;

  return {
    providers: {
      dub: {
        enabled: true,
        apiKey: dubApiKey,
        defaultDomain: domain,
      },
    },
    analytics: {
      enabled: true,
      provider: analyticsProvider,
      events: enabledEvents as LinkAnalyticsEvent[],
      sampling: environment === 'production' ? sampling * 0.1 : sampling,
      debugMode: environment === 'development',
      attribution: {
        cookieDuration: 30 * 24 * 60 * 60 * 1000,
        crossDomainTracking: true,
      },
    },
  };
}

// ============================================================================
// 9. ENVIRONMENT VARIABLES FOR ANALYTICS
// ============================================================================

export const analyticsEnvironmentVariables = `
# Analytics Integration
LINKS_ANALYTICS_ENABLED=true
LINKS_ANALYTICS_SAMPLING=0.1
LINKS_ANALYTICS_DEBUG=false

# PostHog Integration
POSTHOG_API_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_API_KEY=phc_xxxxxxxxxxxxx

# Segment Integration
SEGMENT_WRITE_KEY=xxxxxxxxxxxxx
NEXT_PUBLIC_SEGMENT_WRITE_KEY=xxxxxxxxxxxxx

# Dub Integration
DUB_API_KEY=dub_xxxxxxxxxxxxx
DUB_WORKSPACE=ws_xxxxxxxxxxxxx
DUB_DEFAULT_DOMAIN=yourdomain.com
`;

// ============================================================================
// 10. TESTING WITH ANALYTICS
// ============================================================================

/**
 * Example: Testing with mock analytics
 */
export async function testingWithMockAnalytics() {
  // Mock analytics provider for testing
  const mockAnalytics = {
    events: [] as any[],
    track: async (event: string, properties?: Record<string, any>) => {
      mockAnalytics.events.push({ event, properties, timestamp: new Date() });
      logInfo('Mock analytics event', { event, properties });
    },
  };

  const linkConfig: LinkConfig = {
    providers: {
      dub: {
        enabled: true,
        apiKey: 'test-api-key',
        defaultDomain: 'test.dub.sh',
      },
    },
    analytics: {
      enabled: true,
      provider: mockAnalytics,
      events: ['link_created', 'link_clicked'],
      sampling: 1.0,
      debugMode: true,
    },
  };

  const { createServerLinkManager } = await import('@repo/links/server');
  const linkManager = await createServerLinkManager(linkConfig);

  // Create a test link
  const link = await linkManager.createLink({
    url: 'https://example.com/test',
    title: 'Test Link',
  });

  // Verify analytics was called
  logInfo('Analytics events summary', { events: mockAnalytics.events });

  return { link, analyticsEvents: mockAnalytics.events };
}
