/**
 * Link Management Usage Examples
 *
 * Comprehensive guide demonstrating how to use the @repo/links package for URL shortening,
 * link tracking, and analytics. This file covers all major use cases from basic link creation
 * to advanced analytics and bulk operations.
 *
 * Features Demonstrated:
 * - Basic and advanced link creation
 * - Bulk link operations
 * - Link analytics and metrics
 * - Next.js API route integration
 * - Client-side link management
 * - Custom redirect handling
 * - UTM parameter tracking
 * - Geo-targeting and expiration
 * - QR code generation
 *
 * Prerequisites:
 * - Dub.sh account and API key
 * - @repo/links package configured
 * - Custom domain configured (optional)
 *
 * Environment: Next.js Server-Side and Client-Side
 *
 * @see https://dub.sh/docs
 */

import { LinkConfig } from '../shared/types/index.js';

// ============================================================================
// 1. BASIC CONFIGURATION
// ============================================================================

/**
 * Basic Dub configuration for development
 */
export const developmentConfig: LinkConfig = {
  providers: {
    dub: {
      enabled: true,
      apiKey: process.env.DUB_API_KEY || 'dub_xxx',
      workspace: process.env.DUB_WORKSPACE,
      defaultDomain: 'dub.sh',
      baseUrl: 'https://api.dub.co',
      defaultTags: ['development'],
    },
  },
};

/**
 * Production configuration with custom domain
 */
export const productionConfig: LinkConfig = {
  providers: {
    dub: {
      enabled: true,
      apiKey: 'dub_example_key', // Use fallback in examples
      workspace: 'your-workspace', // Use fallback in examples
      defaultDomain: 'yourdomain.com', // Use fallback in examples
      baseUrl: 'https://api.dub.co',
      defaultTags: ['production'],
      defaultExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  },
};

// ============================================================================
// 2. SERVER-SIDE USAGE EXAMPLES
// ============================================================================

/**
 * Basic server-side link creation
 */
export async function serverBasicExample() {
  // const { createServerLinkManager } = await import('@repo/orchestration/server/next'); // Commented: module not available

  // const linkManager = await createServerLinkManager(productionConfig); // Commented: module not available
  throw new Error('Orchestration module not available - this is an example only');

  // All following code commented because linkManager throws error
  throw new Error('Function disabled - linkManager unavailable');

  /*
  // Create a simple short link
  const link = await linkManager.createLink({
    url: 'https://example.com/very/long/url/with/many/parameters',
    title: 'Example Page',
    description: 'A sample page for demonstration',
  });

  logInfo('Link created', { shortLink: link.shortLink, qrCode: link.qrCode });

  return link;
  */
}

/**
 * Advanced server-side link creation with tracking
 */
export async function serverAdvancedExample() {
  // const { createServerLinkManager } = await import('@repo/orchestration/server/next'); // Commented: module not available

  // const linkManager = await createServerLinkManager(productionConfig); // Commented: module not available
  throw new Error('Orchestration module not available - this is an example only');

  /*
  // Create a link with advanced options
  const link = await linkManager.createLink({
    url: 'https://example.com/product/123',
    key: 'product-123', // Custom short key
    title: 'Amazing Product',
    description: 'Check out this amazing product!',
    image: 'https://example.com/images/product-123.jpg',
    tags: ['marketing', 'product', 'campaign-2024'],
    trackConversion: true,
    publicStats: true,
    utm: {
      source: 'email',
      medium: 'newsletter',
      campaign: 'product-launch',
      content: 'header-cta',
    },
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    geo: {
      US: 'https://example.com/us/product/123',
      UK: 'https://example.com/uk/product/123',
    },
  });

  logInfo('Advanced link details', { link });

  return link;
  */
}

/**
 * Bulk link creation example
 */
export async function serverBulkExample() {
  // const { createServerLinkManager, bulkCreateShortLinks } = await import(
  //   '@repo/orchestration/server/next'
  // ); // Commented: module not available

  // const linkManager = await createServerLinkManager(productionConfig); // Commented: module not available
  throw new Error('Orchestration module not available - this is an example only');

  /*
  const linkRequests = [
    {
      url: 'https://example.com/page1',
      title: 'Page 1',
      tags: ['bulk', 'page1'],
    },
    {
      url: 'https://example.com/page2',
      title: 'Page 2',
      tags: ['bulk', 'page2'],
    },
    {
      url: 'https://example.com/page3',
      title: 'Page 3',
      tags: ['bulk', 'page3'],
    },
  ];

  const result = await bulkCreateShortLinks(linkManager, linkRequests, {
    validateUrls: true,
    chunkSize: 10,
    concurrency: 3,
  });

  logInfo('Bulk creation results', {
    created: result.created.length,
    errors: result.errors.length
  });

  return result;
  */
}

/**
 * Link analytics example
 */
export async function serverAnalyticsExample() {
  // const { createServerLinkManager } = await import('@repo/orchestration/server/next'); // Commented: module not available

  // const linkManager = await createServerLinkManager(productionConfig); // Commented: module not available
  throw new Error('Orchestration module not available - this is an example only');

  /*
  const linkId = 'your-link-id';

  // Get comprehensive analytics
  const analytics = await linkManager.getAnalytics(linkId, '7d');

  logInfo('Analytics summary', {
    clicks: analytics.clicks,
    uniqueClicks: analytics.uniqueClicks,
    topCountries: analytics.topCountries,
    topBrowsers: analytics.topBrowsers
  });

  // Get detailed metrics
  const metrics = await linkManager.getMetrics(linkId);

  logInfo('Link metrics', {
    link: metrics.link,
    timeSeriesDataPoints: metrics.timeSeries.length
  });

  return { analytics, metrics };
  */
}

// ============================================================================
// 3. NEXT.JS API ROUTE EXAMPLES
// ============================================================================

/**
 * Next.js API route for creating links
 */
export async function nextjsApiRouteExample(request: any) {
  // const { createNextLinkManager, createLinkAPIHandler } = await import(
  //   '@repo/orchestration/server/next'
  // ); // Commented: module not available

  // const linkManager = await createNextLinkManager(); // Commented: module not available
  // const apiHandler = createLinkAPIHandler(linkManager); // Commented: module not available
  throw new Error('Orchestration module not available - this is an example only');

  /*
  // Example: POST /api/links
  if (request.method === 'POST') {
    return apiHandler.createLink(request as any);
  }

  // Example: GET /api/links/[id]
  const url = new URL(request.url);
  const linkId = url.pathname.split('/').pop();

  if (request.method === 'GET' && linkId) {
    return apiHandler.getLink(linkId);
  }

  return new Response('Method not allowed', { status: 405 });
  */
}

/**
 * Next.js middleware for link redirects
 */
export async function nextjsMiddlewareExample(request: any) {
  // const { createNextLinkManager, createLinkMiddleware } = await import(
  //   '@repo/orchestration/server/next'
  // ); // Commented: module not available

  // const linkManager = await createNextLinkManager(); // Commented: module not available
  // const linkMiddleware = createLinkMiddleware(linkManager); // Commented: module not available
  throw new Error('Orchestration module not available - this is an example only');

  /*
  // Handle potential link redirects
  const response = await linkMiddleware(request);

  if (response) {
    return response; // Redirect response
  }

  // Not a short link, continue to next middleware
  return undefined;
  */
}

// ============================================================================
// 4. CLIENT-SIDE USAGE EXAMPLES
// ============================================================================

/**
 * Basic client-side link creation (React component)
 */
export const ClientBasicExample = `
import { useLinkManager, useCreateLink } from '@repo/links/client/next';

function CreateLinkForm() {
  const { createLink, isLoading, error } = useCreateLink();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const link = await createLink({
      url: formData.get('url') as string,
      title: formData.get('title') as string,
    });

    if (link) {
      logInfo('Link created', { shortLink: link.shortLink });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="url" placeholder="Enter URL" required />
      <input name="title" placeholder="Enter title" />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Link'}
      </button>
      {error && <p>Error: {error}</p>}
    </form>
  );
}
`;

/**
 * Link analytics dashboard component
 */
export const ClientAnalyticsExample = `
import { useLinkAnalytics } from '@repo/links/client/next';

function LinkAnalyticsDashboard({ linkId }: { linkId: string }) {
  const { analytics, isLoading, error } = useLinkAnalytics(linkId, '7d', 30000);

  if (isLoading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!analytics) return <div>No analytics data</div>;

  return (
    <div>
      <h2>Link Analytics</h2>
      <div>
        <p>Total Clicks: {analytics.clicks}</p>
        <p>Unique Clicks: {analytics.uniqueClicks}</p>
      </div>

      <div>
        <h3>Top Countries</h3>
        {analytics.topCountries.map((country: any, index: any) => (
          <p key={index}>{country.country}: {country.clicks} clicks</p>
        ))}
      </div>

      <div>
        <h3>Top Browsers</h3>
        {analytics.topBrowsers.map((browser: any, index: any) => (
          <p key={index}>{browser.browser}: {browser.clicks} clicks</p>
        ))}
      </div>
    </div>
  );
}
`;

/**
 * Link provider setup for Next.js app
 */
export const NextjsProviderExample = `
// app/layout.tsx
import { LinkProvider } from '@repo/links/client/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <LinkProvider
          config={{
            providers: {
              dub: {
                enabled: true,
                apiKey: process.env.NEXT_PUBLIC_DUB_API_KEY || 'your-api-key',
                defaultDomain: 'yourdomain.com',
              },
            },
          }}
          fallback={<div>Initializing link management...</div>}
        >
          {children}
        </LinkProvider>
      </body>
    </html>
  );
}
`;

// ============================================================================
// 5. ENVIRONMENT VARIABLES EXAMPLE
// ============================================================================

export const environmentVariablesExample = `
# Dub Configuration
DUB_ENABLED=true
DUB_API_KEY=dub_xxxxxxxxxxxxx
DUB_WORKSPACE=ws_xxxxxxxxxxxxx
DUB_DEFAULT_DOMAIN=yourdomain.com
DUB_BASE_URL=https://api.dub.co

# Client-side variables (for Next.js)
NEXT_PUBLIC_DUB_API_KEY=dub_xxxxxxxxxxxxx
NEXT_PUBLIC_DUB_DEFAULT_DOMAIN=yourdomain.com
`;

// ============================================================================
// 6. REDIRECT HANDLER EXAMPLE
// ============================================================================

/**
 * Custom redirect handler for domains
 */
export async function customRedirectExample() {
  // const { createServerLinkManager, createRedirectHandler } = await import(
  //   '@repo/orchestration/server/next'
  // ); // Commented: module not available

  // const linkManager = await createServerLinkManager(productionConfig); // Commented: module not available
  // const redirectHandler = createRedirectHandler(linkManager); // Commented: module not available
  throw new Error('Orchestration module not available - this is an example only');

  /*
  // Example usage in a custom server or edge function
  const result = await redirectHandler(
    'yourdomain.com', // domain
    'abc123', // short key
    {
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      referrer: 'https://google.com',
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
    },
  );

  if (result) {
    logInfo('Redirect details', {
      targetUrl: result.url,
      statusCode: result.status
    });
    // Perform actual redirect in your framework
  } else {
    logWarn('Link not found or expired');
    // Show 404 page
  }

  return result;
  */
}

// ============================================================================
// 7. TESTING UTILITIES
// ============================================================================

/**
 * Mock configuration for testing
 */
export const testConfig: LinkConfig = {
  providers: {
    dub: {
      enabled: true,
      apiKey: 'test-api-key',
      workspace: 'test-workspace',
      defaultDomain: 'test.dub.sh',
      baseUrl: 'https://api.dub.co',
    },
  },
};

/**
 * Helper function for testing link creation
 */
export async function createTestLink() {
  const { createServerLinkManager } = await import('../server');

  const linkManager = await createServerLinkManager(testConfig);

  return linkManager.createLink({
    url: 'https://example.com/test',
    title: 'Test Link',
    tags: ['test'],
  });
}
