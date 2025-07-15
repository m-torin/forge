/**
 * Emitter Usage Patterns - Examples and Best Practices
 *
 * This file demonstrates various patterns for using the emitter-first
 * approach in the analytics package.
 */

import {
  type AnalyticsManager,
  ContextBuilder,
  createAnonymousSession,
  createClientAnalytics,
  createUserSession,
  ecommerce,
  EventBatch,
  identify,
  page,
  PayloadBuilder,
  track,
  withMetadata,
  withUTM,
} from '../client';

// ====================================
// BASIC EMITTER USAGE
// ====================================

async function basicEmitterUsage(analytics: AnalyticsManager) {
  // 1. Direct emit method (RECOMMENDED)
  await analytics.emit(
    track('Button Clicked', {
      button_id: 'cta-hero',
      text: 'Get Started',
      variant: 'primary',
    }),
  );

  // 2. Using overloaded methods
  await analytics.track(
    track('Form Submitted', {
      form_id: 'contact',
      fields_filled: 5,
      time_to_complete: 45000,
    }),
  );

  // 3. Batch multiple events
  await analytics.emitBatch([
    identify('user_123', { email: 'user@example.com' }),
    track('Signup Completed', { method: 'email' }),
    page(undefined, 'Welcome', { first_visit: true }),
  ]);
}

// ====================================
// CONTEXT MANAGEMENT
// ====================================

async function contextManagement(analytics: AnalyticsManager) {
  // Build rich context for all events
  const context = new ContextBuilder()
    .setUser('user_123', {
      created_at: '2024-01-15',
      email: 'user@example.com',
      plan: 'premium',
    })
    .setOrganization('org_456')
    .setPage({
      path: '/dashboard',
      referrer: 'https://google.com',
      title: 'Analytics Dashboard',
    })
    .setCampaign({
      campaign: 'summer-sale',
      content: 'banner-a',
      medium: 'cpc',
      source: 'google',
    })
    .setDevice({
      type: 'desktop',
      browser: 'chrome',
      os: 'macos',
    })
    .build();

  // Use context with PayloadBuilder
  const builder = new PayloadBuilder(context);

  await analytics.emit(
    builder.track('Dashboard Viewed', {
      widgets_count: 5,
      time_range: '30d',
    }),
  );

  await analytics.emit(
    builder.track('Export Generated', {
      format: 'csv',
      rows: 1500,
    }),
  );
}

// ====================================
// USER SESSION TRACKING
// ====================================

async function sessionTracking(analytics: AnalyticsManager) {
  // Create a session for authenticated user
  const session = createUserSession('user_123', 'session_abc123');

  // All events in this session will have consistent context
  await analytics.emit(
    session.identify({
      name: 'John Doe',
      company: 'Acme Corp',
      email: 'john@example.com',
    }),
  );

  await analytics.emit(
    session.track('Feature Used', {
      feature_name: 'advanced-search',
      query_length: 25,
      results_count: 142,
    }),
  );

  await analytics.emit(
    session.page('Search Results', {
      filters_applied: ['price', 'rating'],
      query: 'analytics tools',
    }),
  );

  await analytics.emit(
    session.group('org_456', {
      name: 'Acme Corp',
      plan: 'enterprise',
      seats: 50,
    }),
  );
}

// ====================================
// ANONYMOUS USER TRACKING
// ====================================

async function anonymousTracking(analytics: AnalyticsManager) {
  // Track anonymous user behavior
  const anonSession = createAnonymousSession('anon_789xyz');

  // Track browsing behavior
  await analytics.emit(
    anonSession.track('Product Viewed', {
      product_id: 'EXAMPLE-123',
      category: 'Electronics',
      price: 99.99,
    }),
  );

  await analytics.emit(
    anonSession.page('Product Detail', {
      product_id: 'EXAMPLE-123',
    }),
  );

  // When user signs up, alias and identify
  const userId = 'user_123';

  await analytics.emit(anonSession.alias(userId));

  await analytics.emit(
    anonSession.identify(userId, {
      email: 'newuser@example.com',
      source: 'organic',
    }),
  );
}

// ====================================
// ECOMMERCE TRACKING
// ====================================

async function ecommerceTracking(analytics: AnalyticsManager) {
  // Product browsing
  await analytics.emit(
    ecommerce.productViewed({
      product_id: 'EXAMPLE-123',
      name: 'Wireless Headphones',
      image_url: 'https://shop.com/images/headphones-black.jpg',
      url: 'https://shop.com/products/wireless-headphones',
      brand: 'AudioTech',
      category: 'Electronics/Audio',
      position: 1,
      price: 129.99,
      variant: 'Black',
    }),
  );

  // Add to cart
  await analytics.emit(
    ecommerce.cartUpdated({
      action: 'added',
      cart_total: 129.99,
      product: {
        product_id: 'EXAMPLE-123',
        name: 'Wireless Headphones',
        category: 'Electronics/Audio',
        price: 129.99,
        quantity: 1,
      },
    }),
  );

  // Checkout flow
  const checkoutBatch = new EventBatch();

  checkoutBatch
    .addTrack('Checkout Step Viewed', {
      step_name: 'shipping_info',
      shipping_method: 'standard',
      step: 1,
    })
    .addTrack('Checkout Step Viewed', {
      step_name: 'payment_info',
      payment_method: 'credit_card',
      step: 2,
    })
    .addTrack('Order Completed', {
      order_id: 'ORD-12345',
      coupon: '',
      currency: 'USD',
      discount: 0,
      products: [
        {
          product_id: 'EXAMPLE-123',
          name: 'Wireless Headphones',
          brand: 'AudioTech',
          category: 'Electronics/Audio',
          price: 129.99,
          quantity: 1,
        },
      ],
      revenue: 129.99,
      shipping: 0,
      tax: 12.49,
      total: 142.48,
    });

  await analytics.emitBatch(checkoutBatch.getEvents());
}

// ====================================
// METADATA AND ENRICHMENT
// ====================================

async function metadataEnrichment(analytics: AnalyticsManager) {
  // Base event
  const event = track('Feature Launched', {
    feature: 'ai-assistant',
    trigger: 'keyboard-shortcut',
  });

  // Add application metadata
  const enrichedEvent = withMetadata(event, {
    experiment_id: 'exp_123',
    build: 'production',
    source: 'web-app',
    version: '2.1.0',
  });

  // Add UTM parameters
  const campaignEvent = withUTM(enrichedEvent, {
    campaign: 'feature-announcement',
    content: 'variant-a',
    medium: 'newsletter',
    source: 'email',
  });

  await analytics.emit(campaignEvent);
}

// ====================================
// FORM TRACKING PATTERN
// ====================================

async function formTracking(analytics: AnalyticsManager) {
  const formId = 'signup-form';
  const formSession = new EventBatch();

  // Track form interactions
  formSession
    .addTrack('Form Viewed', {
      form_id: formId,
      fields_count: 5,
    })
    .addTrack('Form Started', {
      form_id: formId,
      first_field: 'email',
    });

  // Track field completions
  const fields = ['email', 'password', 'company', 'role', 'phone'];
  fields.forEach((field, index) => {
    formSession.addTrack('Form Field Completed', {
      form_id: formId,
      field_name: field,
      field_index: index,
      time_to_complete: Math.random() * 5000,
    });
  });

  // Track form submission
  formSession.addTrack('Form Submitted', {
    form_id: formId,
    validation_errors: 0,
    total_time: 45000,
  });

  await analytics.emitBatch(formSession.getEvents());
}

// ====================================
// ERROR TRACKING PATTERN
// ====================================

async function errorTracking(analytics: AnalyticsManager) {
  try {
    // Some operation that might fail
    throw new Error('Network timeout');
  } catch (error) {
    await analytics.emit(
      track('Error Occurred', {
        error_type: 'network',
        component: 'data-fetcher',
        error_message: error instanceof Error ? error.message : String(error),
        error_stack: error instanceof Error ? error.stack : undefined,
        recovery_action: 'retry',
        severity: 'high',
        user_impact: 'data-not-loaded',
      }),
    );
  }
}

// ====================================
// A/B TEST TRACKING
// ====================================

async function abTestTracking(analytics: AnalyticsManager) {
  const experiments = {
    'cta-color': 'green',
    'homepage-hero': 'variant-b',
    'pricing-layout': 'cards',
  };

  // Track experiment exposure
  for (const [experiment, variant] of Object.entries(experiments)) {
    await analytics.emit(
      track('Experiment Viewed', {
        experiment_id: experiment,
        variant_id: variant,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  // Track conversion with experiment context
  const conversionEvent = track('Trial Started', {
    billing_cycle: 'monthly',
    plan: 'premium',
  });

  const enrichedConversion = withMetadata(conversionEvent, {
    experiments,
  });

  await analytics.emit(enrichedConversion);
}

// ====================================
// FUNNEL TRACKING
// ====================================

async function funnelTracking(analytics: AnalyticsManager) {
  const funnelId = 'onboarding';
  const userId = 'user_123';

  // Create a context for the entire funnel
  const funnelContext = new ContextBuilder().setUser(userId).build();

  const funnelBuilder = new PayloadBuilder(funnelContext);

  // Track funnel steps
  const steps = [
    { name: 'Signup Started', properties: { method: 'email' } },
    { name: 'Email Verified', properties: { time_to_verify: 120000 } },
    { name: 'Profile Created', properties: { fields_filled: 7 } },
    { name: 'Team Invited', properties: { invites_sent: 3 } },
    { name: 'First Project Created', properties: { template_used: 'blank' } },
    { name: 'Onboarding Completed', properties: { total_time: 600000 } },
  ];

  for (const [index, step] of steps.entries()) {
    await analytics.emit(
      funnelBuilder.track(step.name, {
        ...step.properties,
        funnel_id: funnelId,
        funnel_step_name: step.name.toLowerCase().replace(/\s+/g, '_'),
        funnel_step: index + 1,
      }),
    );
  }
}

// ====================================
// MAIN EXAMPLE RUNNER
// ====================================

export async function runAllExamples() {
  // Initialize analytics
  const analytics = await createClientAnalytics({
    providers: {
      console: { options: { prefix: '[Example]' } },
      // Add other providers as needed
    },
  });

  console.log('🚀 Running Emitter Pattern Examples...\n');

  // Run all examples
  await basicEmitterUsage(analytics);
  console.log('✅ Basic emitter usage complete\n');

  await contextManagement(analytics);
  console.log('✅ Context management complete\n');

  await sessionTracking(analytics);
  console.log('✅ Session tracking complete\n');

  await anonymousTracking(analytics);
  console.log('✅ Anonymous tracking complete\n');

  await ecommerceTracking(analytics);
  console.log('✅ Ecommerce tracking complete\n');

  await metadataEnrichment(analytics);
  console.log('✅ Metadata enrichment complete\n');

  await formTracking(analytics);
  console.log('✅ Form tracking complete\n');

  await errorTracking(analytics);
  console.log('✅ Error tracking complete\n');

  await abTestTracking(analytics);
  console.log('✅ A/B test tracking complete\n');

  await funnelTracking(analytics);
  console.log('✅ Funnel tracking complete\n');

  console.log('🎉 All examples completed successfully!');
}

// Run examples if this file is executed directly
if (require.main === module) {
  // Intentionally not awaited - fire and forget
  // eslint-disable-next-line promise/prefer-await-to-then
  runAllExamples().catch(error => {
    console.error('Error running examples:', error);
  });
}
