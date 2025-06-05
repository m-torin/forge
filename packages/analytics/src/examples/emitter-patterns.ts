/**
 * Emitter Usage Patterns - Examples and Best Practices
 * 
 * This file demonstrates various patterns for using the emitter-first
 * approach in the analytics package.
 */

import { 
  createClientAnalytics,
  track,
  identify,
  page,
  group,
  alias,
  ContextBuilder,
  PayloadBuilder,
  EventBatch,
  createUserSession,
  createAnonymousSession,
  withMetadata,
  withUTM,
  ecommerce,
  type AnalyticsManager
} from '../client';

// ====================================
// BASIC EMITTER USAGE
// ====================================

async function basicEmitterUsage(analytics: AnalyticsManager) {
  // 1. Direct emit method (RECOMMENDED)
  await analytics.emit(
    track('Button Clicked', {
      button_id: 'cta-hero',
      variant: 'primary',
      text: 'Get Started'
    })
  );

  // 2. Using overloaded methods
  await analytics.track(
    track('Form Submitted', {
      form_id: 'contact',
      fields_filled: 5,
      time_to_complete: 45000
    })
  );

  // 3. Batch multiple events
  await analytics.emitBatch([
    identify('user_123', { email: 'user@example.com' }),
    track('Signup Completed', { method: 'email' }),
    page(undefined, 'Welcome', { first_visit: true })
  ]);
}

// ====================================
// CONTEXT MANAGEMENT
// ====================================

async function contextManagement(analytics: AnalyticsManager) {
  // Build rich context for all events
  const context = new ContextBuilder()
    .setUser('user_123', { 
      email: 'user@example.com',
      plan: 'premium',
      created_at: '2024-01-15'
    })
    .setOrganization('org_456')
    .setPage({ 
      path: '/dashboard',
      title: 'Analytics Dashboard',
      referrer: 'https://google.com'
    })
    .setCampaign({
      source: 'google',
      medium: 'cpc',
      campaign: 'summer-sale',
      content: 'banner-a'
    })
    .setDevice({
      type: 'desktop',
      browser: 'chrome',
      os: 'macos'
    })
    .build();

  // Use context with PayloadBuilder
  const builder = new PayloadBuilder(context);
  
  await analytics.emit(
    builder.track('Dashboard Viewed', {
      widgets_count: 5,
      time_range: '30d'
    })
  );

  await analytics.emit(
    builder.track('Export Generated', {
      format: 'csv',
      rows: 1500
    })
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
      email: 'john@example.com',
      company: 'Acme Corp'
    })
  );

  await analytics.emit(
    session.track('Feature Used', {
      feature_name: 'advanced-search',
      query_length: 25,
      results_count: 142
    })
  );

  await analytics.emit(
    session.page('Search Results', {
      query: 'analytics tools',
      filters_applied: ['price', 'rating']
    })
  );

  await analytics.emit(
    session.group('org_456', {
      name: 'Acme Corp',
      plan: 'enterprise',
      seats: 50
    })
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
      product_id: 'PROD-123',
      price: 99.99,
      category: 'Electronics'
    })
  );

  await analytics.emit(
    anonSession.page('Product Detail', {
      product_id: 'PROD-123'
    })
  );

  // When user signs up, alias and identify
  const userId = 'user_123';
  
  await analytics.emit(
    anonSession.alias(userId)
  );

  await analytics.emit(
    anonSession.identify(userId, {
      email: 'newuser@example.com',
      source: 'organic'
    })
  );
}

// ====================================
// ECOMMERCE TRACKING
// ====================================

async function ecommerceTracking(analytics: AnalyticsManager) {
  // Product browsing
  await analytics.emit(
    ecommerce.productViewed({
      product_id: 'SKU-123',
      name: 'Wireless Headphones',
      price: 129.99,
      category: 'Electronics/Audio',
      brand: 'AudioTech',
      variant: 'Black',
      position: 1,
      url: 'https://shop.com/products/wireless-headphones',
      image_url: 'https://shop.com/images/headphones-black.jpg'
    })
  );

  // Add to cart
  await analytics.emit(
    ecommerce.cartUpdated({
      action: 'added',
      product: {
        product_id: 'SKU-123',
        name: 'Wireless Headphones',
        price: 129.99,
        quantity: 1,
        category: 'Electronics/Audio'
      },
      cart_total: 129.99
    })
  );

  // Checkout flow
  const checkoutBatch = new EventBatch();
  
  checkoutBatch
    .addTrack('Checkout Step Viewed', {
      step: 1,
      step_name: 'shipping_info',
      shipping_method: 'standard'
    })
    .addTrack('Checkout Step Viewed', {
      step: 2,
      step_name: 'payment_info', 
      payment_method: 'credit_card'
    })
    .addTrack('Order Completed', {
      order_id: 'ORD-12345',
      total: 142.48,
      revenue: 129.99,
      tax: 12.49,
      shipping: 0,
      discount: 0,
      coupon: '',
      currency: 'USD',
      products: [{
        product_id: 'SKU-123',
        name: 'Wireless Headphones',
        price: 129.99,
        quantity: 1,
        category: 'Electronics/Audio',
        brand: 'AudioTech'
      }]
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
    trigger: 'keyboard-shortcut'
  });

  // Add application metadata
  const enrichedEvent = withMetadata(event, {
    version: '2.1.0',
    build: 'production',
    source: 'web-app',
    experiment_id: 'exp_123'
  });

  // Add UTM parameters
  const campaignEvent = withUTM(enrichedEvent, {
    source: 'email',
    medium: 'newsletter',
    campaign: 'feature-announcement',
    content: 'variant-a'
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
      fields_count: 5 
    })
    .addTrack('Form Started', { 
      form_id: formId,
      first_field: 'email' 
    });

  // Track field completions
  const fields = ['email', 'password', 'company', 'role', 'phone'];
  fields.forEach((field, index) => {
    formSession.addTrack('Form Field Completed', {
      form_id: formId,
      field_name: field,
      field_index: index,
      time_to_complete: Math.random() * 5000
    });
  });

  // Track form submission
  formSession.addTrack('Form Submitted', {
    form_id: formId,
    total_time: 45000,
    validation_errors: 0
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
        error_message: error instanceof Error ? error.message : String(error),
        error_stack: error instanceof Error ? error.stack : undefined,
        component: 'data-fetcher',
        severity: 'high',
        user_impact: 'data-not-loaded',
        recovery_action: 'retry'
      })
    );
  }
}

// ====================================
// A/B TEST TRACKING
// ====================================

async function abTestTracking(analytics: AnalyticsManager) {
  const experiments = {
    'homepage-hero': 'variant-b',
    'cta-color': 'green',
    'pricing-layout': 'cards'
  };

  // Track experiment exposure
  for (const [experiment, variant] of Object.entries(experiments)) {
    await analytics.emit(
      track('Experiment Viewed', {
        experiment_id: experiment,
        variant_id: variant,
        timestamp: new Date().toISOString()
      })
    );
  }

  // Track conversion with experiment context
  const conversionEvent = track('Trial Started', {
    plan: 'premium',
    billing_cycle: 'monthly'
  });

  const enrichedConversion = withMetadata(conversionEvent, {
    experiments
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
  const funnelContext = new ContextBuilder()
    .setUser(userId)
    .build();

  const funnelBuilder = new PayloadBuilder(funnelContext);
  
  // Track funnel steps
  const steps = [
    { name: 'Signup Started', properties: { method: 'email' } },
    { name: 'Email Verified', properties: { time_to_verify: 120000 } },
    { name: 'Profile Created', properties: { fields_filled: 7 } },
    { name: 'Team Invited', properties: { invites_sent: 3 } },
    { name: 'First Project Created', properties: { template_used: 'blank' } },
    { name: 'Onboarding Completed', properties: { total_time: 600000 } }
  ];

  for (const [index, step] of steps.entries()) {
    await analytics.emit(
      funnelBuilder.track(step.name, {
        ...step.properties,
        funnel_id: funnelId,
        funnel_step: index + 1,
        funnel_step_name: step.name.toLowerCase().replace(/\s+/g, '_')
      })
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
    }
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
  runAllExamples().catch(console.error);
}