import { beforeEach, describe, expect, vi } from 'vitest';

import {
  ContextBuilder,
  createAnonymousSession,
  createUserSession,
  EventBatch,
  isAliasPayload,
  isGroupPayload,
  isIdentifyPayload,
  isPagePayload,
  isTrackPayload,
  PayloadBuilder,
  withMetadata,
  withUTM,
} from '#/shared/emitters/helpers';

import type {
  EmitterContext,
  EmitterIdentifyPayload,
  EmitterPagePayload,
  EmitterPayload,
  EmitterTrackPayload,
} from '#/shared/emitters/emitter-types';

// Mock the core emitters
vi.mock('../../shared/emitters/emitters', () => ({
  identify: vi.fn((userId, traits, options) => ({
    type: 'identify',
    anonymousId: options?.anonymousId,
    context: options?.context || {},
    integrations: options?.integrations,
    timestamp: options?.timestamp,
    traits: traits || {},
    userId,
  })),
  alias: vi.fn((userId, previousId, options) => ({
    type: 'alias',
    anonymousId: options?.anonymousId,
    context: options?.context || {},
    integrations: options?.integrations,
    previousId,
    timestamp: options?.timestamp,
    userId,
  })),
  group: vi.fn((groupId, traits, options) => ({
    type: 'group',
    anonymousId: options?.anonymousId,
    context: options?.context || {},
    groupId,
    integrations: options?.integrations,
    timestamp: options?.timestamp,
    traits: traits || {},
  })),
  page: vi.fn((category, name, properties, options) => ({
    name,
    type: 'page',
    anonymousId: options?.anonymousId,
    category,
    context: options?.context || {},
    integrations: options?.integrations,
    properties: properties || {},
    timestamp: options?.timestamp,
  })),
  track: vi.fn((event, properties, options) => ({
    type: 'track',
    anonymousId: options?.anonymousId,
    context: options?.context || {},
    event,
    integrations: options?.integrations,
    properties: properties || {},
    timestamp: options?.timestamp,
  })),
}));

describe('emitter Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('contextBuilder', () => {
    test('should create empty context by default', () => {
      const builder = new ContextBuilder();
      const context = builder.build();

      expect(context).toStrictEqual({});
    });

    test('should accept initial context', () => {
      const initialContext: Partial<EmitterContext> = {
        app: { name: 'Test App', version: '1.0.0' },
      };

      const builder = new ContextBuilder(initialContext);
      const context = builder.build();

      expect(context).toStrictEqual({
        app: { name: 'Test App', version: '1.0.0' },
      });
    });

    test('should set user information', () => {
      const builder = new ContextBuilder();
      const context = builder
        .setUser('user123', { name: 'John Doe', email: 'john@example.com' })
        .build();

      expect(context).toStrictEqual({
        traits: { name: 'John Doe', email: 'john@example.com' },
      });
    });

    test('should set organization information', () => {
      const builder = new ContextBuilder();
      const context = builder.setOrganization('org456').build();

      expect(context).toStrictEqual({
        groupId: 'org456',
      });
    });

    test('should set page information', () => {
      const pageInfo = {
        url: 'https://example.com/products',
        path: '/products',
        referrer: 'https://google.com',
        title: 'Products Page',
      };

      const builder = new ContextBuilder();
      const context = builder.setPage(pageInfo).build();

      expect(context).toStrictEqual({
        page: pageInfo,
      });
    });

    test('should set campaign information', () => {
      const utmParams = {
        utm_campaign: 'summer_sale',
        utm_content: 'ad_variant_a',
        utm_medium: 'cpc',
        utm_source: 'google',
        utm_term: 'running shoes',
      };

      const builder = new ContextBuilder();
      const context = builder.setCampaign(utmParams).build();

      expect(context).toStrictEqual({
        campaign: utmParams,
      });
    });

    test('should set device information', () => {
      const deviceInfo = {
        type: 'mobile',
        brand: 'Apple',
        model: 'iPhone 12',
        os: 'iOS',
        osVersion: '14.7',
      };

      const builder = new ContextBuilder();
      const context = builder.setDevice(deviceInfo).build();

      expect(context).toStrictEqual({
        device: deviceInfo,
      });
    });

    test('should chain methods and merge contexts', () => {
      const builder = new ContextBuilder();
      const context = builder
        .setUser('user123', { name: 'Jane Doe' })
        .setOrganization('org456')
        .setPage({ path: '/dashboard', title: 'Dashboard' })
        .setCampaign({ utm_source: 'email' })
        .setDevice({ type: 'desktop' })
        .build();

      expect(context).toStrictEqual({
        campaign: { utm_source: 'email' },
        device: { type: 'desktop' },
        groupId: 'org456',
        page: { path: '/dashboard', title: 'Dashboard' },
        traits: { name: 'Jane Doe' },
      });
    });

    test('should merge with existing context properties', () => {
      const initialContext: Partial<EmitterContext> = {
        page: { url: 'https://initial.com' },
        traits: { email: 'initial@example.com' },
      };

      const builder = new ContextBuilder(initialContext);
      const context = builder
        .setUser('user123', { name: 'Updated Name' })
        .setPage({ title: 'Updated Title' })
        .build();

      expect(context).toStrictEqual({
        page: { url: 'https://initial.com', title: 'Updated Title' },
        traits: { name: 'Updated Name', email: 'initial@example.com' },
      });
    });

    test('should return new instance on build', () => {
      const builder = new ContextBuilder();
      builder.setUser('user1');
      const context1 = builder.build();

      builder.setUser('user2');
      const context2 = builder.build();

      // Should not affect previously built contexts (but they will be different due to mutation)
      // This test shows that build() returns independent snapshots
      expect(context1.traits).not.toBe(context2.traits); // Different object references
    });
  });

  describe('payloadBuilder', () => {
    test('should create payload builder without context', () => {
      const builder = new PayloadBuilder();
      const trackPayload = builder.track('test_event', { prop: 'value' });

      expect(trackPayload.type).toBe('track');
      expect(trackPayload.event).toBe('test_event');
      expect(trackPayload.properties).toStrictEqual({ prop: 'value' });
    });

    test('should create payload builder with context', () => {
      const context: EmitterContext = {
        app: { name: 'Test App' },
      };

      const builder = new PayloadBuilder(context);
      const trackPayload = builder.track('test_event');

      expect(trackPayload.context).toStrictEqual(context);
    });

    test('should set timestamp', () => {
      const timestamp = new Date('2024-01-01T00:00:00Z');
      const builder = new PayloadBuilder();
      const trackPayload = builder.withTimestamp(timestamp).track('test_event');

      expect(trackPayload.timestamp).toBe(timestamp);
    });

    test('should set anonymous ID', () => {
      const anonymousId = 'anon_123';
      const builder = new PayloadBuilder();
      const trackPayload = builder.withAnonymousId(anonymousId).track('test_event');

      expect(trackPayload.anonymousId).toBe(anonymousId);
    });

    test('should set integrations', () => {
      const integrations = {
        'Facebook Pixel': false,
        'Google Analytics': true,
        Segment: { apiKey: 'test_key' },
      };

      const builder = new PayloadBuilder();
      const trackPayload = builder.withIntegrations(integrations).track('test_event');

      expect(trackPayload.integrations).toStrictEqual(integrations);
    });

    test('should chain options and create track payload', () => {
      const context: EmitterContext = { app: { name: 'Test' } };
      const timestamp = new Date();
      const anonymousId = 'anon_456';
      const integrations = { 'Test Provider': true };

      const builder = new PayloadBuilder(context);
      const trackPayload = builder
        .withTimestamp(timestamp)
        .withAnonymousId(anonymousId)
        .withIntegrations(integrations)
        .track('chained_event', { test: true });

      expect(trackPayload).toMatchObject({
        type: 'track',
        anonymousId,
        context,
        event: 'chained_event',
        integrations,
        properties: { test: true },
        timestamp,
      });
    });

    test('should create identify payload', () => {
      const builder = new PayloadBuilder();
      const identifyPayload = builder
        .withTimestamp(new Date())
        .identify('user123', { name: 'Test User' });

      expect(identifyPayload).toMatchObject({
        type: 'identify',
        traits: { name: 'Test User' },
        userId: 'user123',
      });
    });

    test('should create page payload', () => {
      const builder = new PayloadBuilder();
      const pagePayload = builder.page('Product Page', { category: 'ecommerce' });

      expect(pagePayload).toMatchObject({
        name: 'Product Page',
        type: 'page',
        properties: { category: 'ecommerce' },
      });
    });

    test('should create group payload', () => {
      const builder = new PayloadBuilder();
      const groupPayload = builder.group('group123', { name: 'Test Organization' });

      expect(groupPayload).toMatchObject({
        type: 'group',
        groupId: 'group123',
        traits: { name: 'Test Organization' },
      });
    });

    test('should create alias payload', () => {
      const builder = new PayloadBuilder();
      const aliasPayload = builder.alias('user123', 'anon_456');

      expect(aliasPayload).toMatchObject({
        type: 'alias',
        previousId: 'anon_456',
        userId: 'user123',
      });
    });
  });

  describe('eventBatch', () => {
    test('should create empty batch', () => {
      const batch = new EventBatch();
      const events = batch.getEvents();

      expect(events).toStrictEqual([]);
    });

    test('should create batch with shared context', () => {
      const sharedContext: EmitterContext = {
        app: { name: 'Batch App' },
      };

      const batch = new EventBatch(sharedContext);
      batch.addTrack('test_event', { prop: 'value' });

      const events = batch.getEvents();
      expect(events[0].context).toStrictEqual(sharedContext);
    });

    test('should add custom payload to batch', () => {
      const batch = new EventBatch();
      const customPayload: EmitterTrackPayload = {
        type: 'track',
        context: {},
        event: 'custom_event',
        properties: { custom: true },
      };

      batch.add(customPayload);
      const events = batch.getEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toStrictEqual(customPayload);
    });

    test('should add track event to batch', () => {
      const batch = new EventBatch();
      batch.addTrack('batch_track', { value: 100 });

      const events = batch.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('track');
      expect((events[0] as any).event).toBe('batch_track');
    });

    test('should add identify event to batch', () => {
      const batch = new EventBatch();
      batch.addIdentify('user123', { name: 'Batch User' });

      const events = batch.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('identify');
    });

    test('should add page event to batch', () => {
      const batch = new EventBatch();
      batch.addPage('Batch Page', { section: 'products' });

      const events = batch.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('page');
    });

    test('should add group event to batch', () => {
      const batch = new EventBatch();
      batch.addGroup('group123', { plan: 'enterprise' });

      const events = batch.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('group');
    });

    test('should merge shared context with event context', () => {
      const sharedContext: EmitterContext = {
        app: { name: 'Shared App' },
        device: { type: 'mobile' },
      };

      const eventContext: EmitterContext = {
        app: { version: '2.0.0' }, // Should merge with shared
        page: { path: '/test' }, // Should add to shared
      };

      const batch = new EventBatch(sharedContext);
      const payload: EmitterTrackPayload = {
        type: 'track',
        context: eventContext,
        event: 'test',
        properties: {},
      };

      batch.add(payload);
      const events = batch.getEvents();

      // The EventBatch merges contexts, but shallow merge means event context overrides shared
      expect(events[0].context).toStrictEqual({
        app: { version: '2.0.0' }, // Event context app replaces shared app
        device: { type: 'mobile' }, // Shared device is preserved
        page: { path: '/test' }, // Event context page is added
      });
    });

    test('should clear batch events', () => {
      const batch = new EventBatch();
      batch.addTrack('event1');
      batch.addTrack('event2');

      expect(batch.getEvents()).toHaveLength(2);

      batch.clear();
      expect(batch.getEvents()).toHaveLength(0);
    });

    test('should chain batch operations', () => {
      const batch = new EventBatch();
      batch.addTrack('event1').addIdentify('user1').addPage('page1').addGroup('group1');

      const events = batch.getEvents();
      expect(events).toHaveLength(4);
      expect(events.map(e => e.type)).toStrictEqual(['track', 'identify', 'page', 'group']);
    });

    test('should return copy of events array', () => {
      const batch = new EventBatch();
      batch.addTrack('test_event');

      const events1 = batch.getEvents();
      const events2 = batch.getEvents();

      // Should be different array instances
      expect(events1).not.toBe(events2);
      // But should have same content
      expect(events1).toStrictEqual(events2);
    });
  });

  describe('createUserSession', () => {
    test('should create user session with basic identify', () => {
      const session = createUserSession('user123', 'session456');
      const identifyPayload = session.identify({ email: 'user@example.com' });

      expect(identifyPayload.type).toBe('identify');
      expect(identifyPayload.userId).toBe('user123');
      expect(identifyPayload.traits).toStrictEqual({
        email: 'user@example.com',
        sessionId: 'session456',
      });
    });

    test('should create user session track event', () => {
      const session = createUserSession('user123', 'session456');
      const trackPayload = session.track('button_clicked', { button: 'signup' });

      expect(trackPayload.type).toBe('track');
      expect(trackPayload.event).toBe('button_clicked');
      expect(trackPayload.properties).toStrictEqual({
        button: 'signup',
        sessionId: 'session456',
      });
    });

    test('should create user session page event', () => {
      const session = createUserSession('user123', 'session456');
      const pagePayload = session.page('Product Page', { product_id: 'p123' });

      expect(pagePayload.type).toBe('page');
      expect(pagePayload.name).toBe('Product Page');
      expect(pagePayload.properties).toStrictEqual({
        product_id: 'p123',
        sessionId: 'session456',
      });
    });

    test('should create user session group event', () => {
      const session = createUserSession('user123', 'session456');
      const groupPayload = session.group('org123', { plan: 'pro' });

      expect(groupPayload.type).toBe('group');
      expect(groupPayload.groupId).toBe('org123');
      expect(groupPayload.traits).toStrictEqual({
        plan: 'pro',
        sessionId: 'session456',
      });
    });

    test('should include user context in all events', () => {
      const session = createUserSession('user123', 'session456');
      const trackPayload = session.track('test_event');

      expect(trackPayload.context?.traits).toBeDefined();
    });
  });

  describe('createAnonymousSession', () => {
    test('should create anonymous track event', () => {
      const session = createAnonymousSession('anon_123');
      const trackPayload = session.track('page_viewed', { page: 'home' });

      expect(trackPayload.type).toBe('track');
      expect(trackPayload.event).toBe('page_viewed');
      expect(trackPayload.anonymousId).toBe('anon_123');
      expect(trackPayload.properties).toStrictEqual({ page: 'home' });
    });

    test('should create anonymous page event', () => {
      const session = createAnonymousSession('anon_123');
      const pagePayload = session.page('Home Page', { section: 'hero' });

      expect(pagePayload.type).toBe('page');
      expect(pagePayload.name).toBe('Home Page');
      expect(pagePayload.anonymousId).toBe('anon_123');
    });

    test('should convert anonymous to identified user', () => {
      const session = createAnonymousSession('anon_123');
      const identifyPayload = session.identify('user456', { email: 'new@example.com' });

      expect(identifyPayload.type).toBe('identify');
      expect(identifyPayload.userId).toBe('user456');
      expect(identifyPayload.anonymousId).toBe('anon_123');
      expect(identifyPayload.traits).toStrictEqual({ email: 'new@example.com' });
    });

    test('should create alias for user signup', () => {
      const session = createAnonymousSession('anon_123');
      const aliasPayload = session.alias('user456');

      expect(aliasPayload.type).toBe('alias');
      expect(aliasPayload.userId).toBe('user456');
      expect(aliasPayload.previousId).toBe('anon_123');
      expect(aliasPayload.anonymousId).toBe('anon_123');
    });
  });

  describe('type Guards', () => {
    const samplePayloads: EmitterPayload[] = [
      { type: 'track', context: {}, event: 'test', properties: {} },
      { type: 'identify', context: {}, traits: {}, userId: 'user1' },
      { name: 'test', type: 'page', context: {}, properties: {} },
      { type: 'group', context: {}, groupId: 'group1', traits: {} },
      { type: 'alias', context: {}, previousId: 'anon1', userId: 'user1' },
    ];

    test('should identify track payloads', () => {
      const trackPayload = samplePayloads[0];
      const nonTrackPayloads = samplePayloads.slice(1);

      expect(isTrackPayload(trackPayload)).toBeTruthy();
      nonTrackPayloads.forEach(payload => {
        expect(isTrackPayload(payload)).toBeFalsy();
      });
    });

    test('should identify identify payloads', () => {
      const identifyPayload = samplePayloads[1];
      const nonIdentifyPayloads = samplePayloads.filter((_, i) => i !== 1);

      expect(isIdentifyPayload(identifyPayload)).toBeTruthy();
      nonIdentifyPayloads.forEach(payload => {
        expect(isIdentifyPayload(payload)).toBeFalsy();
      });
    });

    test('should identify page payloads', () => {
      const pagePayload = samplePayloads[2];
      const nonPagePayloads = samplePayloads.filter((_, i) => i !== 2);

      expect(isPagePayload(pagePayload)).toBeTruthy();
      nonPagePayloads.forEach(payload => {
        expect(isPagePayload(payload)).toBeFalsy();
      });
    });

    test('should identify group payloads', () => {
      const groupPayload = samplePayloads[3];
      const nonGroupPayloads = samplePayloads.filter((_, i) => i !== 3);

      expect(isGroupPayload(groupPayload)).toBeTruthy();
      nonGroupPayloads.forEach(payload => {
        expect(isGroupPayload(payload)).toBeFalsy();
      });
    });

    test('should identify alias payloads', () => {
      const aliasPayload = samplePayloads[4];
      const nonAliasPayloads = samplePayloads.filter((_, i) => i !== 4);

      expect(isAliasPayload(aliasPayload)).toBeTruthy();
      nonAliasPayloads.forEach(payload => {
        expect(isAliasPayload(payload)).toBeFalsy();
      });
    });
  });

  describe('withMetadata', () => {
    test('should add metadata to payload app context', () => {
      const payload: EmitterTrackPayload = {
        type: 'track',
        context: {},
        event: 'test',
        properties: {},
      };

      const metadata = {
        build: 'production',
        source: 'mobile_app',
        version: '1.2.3',
      };

      const result = withMetadata(payload, metadata);

      expect(result.context?.app).toStrictEqual(metadata);
    });

    test('should merge with existing app context', () => {
      const payload: EmitterTrackPayload = {
        type: 'track',
        context: {
          app: {
            name: 'Existing App',
            build: 'ios-1.0',
          },
        },
        event: 'test',
        properties: {},
      };

      const metadata = {
        source: 'app_store',
        version: '2.0.0',
      };

      const result = withMetadata(payload, metadata);

      expect(result.context?.app).toStrictEqual({
        name: 'Existing App',
        build: 'ios-1.0',
        source: 'app_store' as any,
        version: '2.0.0',
      });
    });

    test('should preserve other context properties', () => {
      const payload: EmitterTrackPayload = {
        type: 'track',
        context: {
          device: { type: 'mobile' },
          page: { url: 'https://example.com' },
        },
        event: 'test',
        properties: {},
      };

      const metadata = { version: '1.0.0' };
      const result = withMetadata(payload, metadata);

      expect(result.context?.device).toStrictEqual({ type: 'mobile' });
      expect(result.context?.page).toStrictEqual({ url: 'https://example.com' });
      expect(result.context?.app).toStrictEqual({ version: '1.0.0' });
    });

    test('should work with different payload types', () => {
      const identifyPayload: EmitterIdentifyPayload = {
        type: 'identify',
        context: {},
        traits: {},
        userId: 'user1',
      };

      const metadata = { version: '3.0.0' };
      const result = withMetadata(identifyPayload, metadata);

      expect(result.type).toBe('identify');
      expect(result.context?.app).toStrictEqual(metadata);
    });
  });

  describe('withUTM', () => {
    test('should add UTM parameters to payload campaign context', () => {
      const payload: EmitterTrackPayload = {
        type: 'track',
        context: {},
        event: 'test',
        properties: {},
      };

      const utm = {
        campaign: 'summer_sale',
        content: 'ad_variant_a',
        medium: 'cpc',
        source: 'google',
        term: 'running shoes',
      };

      const result = withUTM(payload, utm);

      expect(result.context?.campaign).toStrictEqual(utm);
    });

    test('should merge with existing campaign context', () => {
      const payload: EmitterTrackPayload = {
        type: 'track',
        context: {
          campaign: {
            id: 'camp_123',
            name: 'Existing Campaign',
          },
        },
        event: 'test',
        properties: {},
      };

      const utm = {
        medium: 'social',
        source: 'facebook',
      };

      const result = withUTM(payload, utm);

      expect(result.context?.campaign).toStrictEqual({
        id: 'camp_123',
        name: 'Existing Campaign',
        medium: 'social',
        source: 'facebook',
      });
    });

    test('should handle partial UTM parameters', () => {
      const payload: EmitterTrackPayload = {
        type: 'track',
        context: {},
        event: 'test',
        properties: {},
      };

      const utm = {
        campaign: 'newsletter',
        source: 'email',
      };

      const result = withUTM(payload, utm);

      expect(result.context?.campaign).toStrictEqual({
        campaign: 'newsletter',
        source: 'email',
      });
    });

    test('should preserve other context properties', () => {
      const payload: EmitterTrackPayload = {
        type: 'track',
        context: {
          app: { name: 'Test App' },
          device: { type: 'desktop' },
        },
        event: 'test',
        properties: {},
      };

      const utm = { source: 'twitter' };
      const result = withUTM(payload, utm);

      expect(result.context?.app).toStrictEqual({ name: 'Test App' });
      expect(result.context?.device).toStrictEqual({ type: 'desktop' });
      expect(result.context?.campaign).toStrictEqual({ source: 'twitter' });
    });

    test('should work with different payload types', () => {
      const pagePayload: EmitterPagePayload = {
        name: 'Landing Page',
        type: 'page',
        context: {},
        properties: {},
      };

      const utm = {
        medium: 'organic',
        source: 'google',
      };

      const result = withUTM(pagePayload, utm);

      expect(result.type).toBe('page');
      expect(result.context?.campaign).toStrictEqual(utm);
    });
  });

  // Integration and performance tests
  describe('integration and Performance', () => {
    test('should handle complex workflow with all helpers', () => {
      // 1. Build complex context
      const context = new ContextBuilder()
        .setUser('user123', { name: 'John Doe', plan: 'premium' })
        .setOrganization('org456')
        .setPage({ path: '/dashboard', title: 'Dashboard' })
        .setCampaign({ utm_campaign: 'onboarding', utm_source: 'email' })
        .setDevice({ type: 'desktop', os: 'macOS' })
        .build();

      // 2. Create payload builder with context
      const builder = new PayloadBuilder(context);

      // 3. Create events with metadata and UTM
      const trackPayload = withUTM(
        withMetadata(
          builder
            .withTimestamp(new Date('2024-01-01'))
            .withAnonymousId('anon_123')
            .track('feature_used', { feature: 'dashboard_export' }),
          { build: 'production', version: '2.1.0' },
        ),
        { content: 'email_link' },
      );

      // 4. Create batch with shared context
      const batch = new EventBatch(context);
      batch.add(trackPayload);
      batch.addIdentify('user123', { last_active: '2024-01-01' });

      const events = batch.getEvents();

      // Verify complex integration
      expect(events).toHaveLength(2);
      expect(events[0].context?.app?.version).toBe('2.1.0');
      expect(events[0].context?.campaign?.utm_source).toBe('email');
      expect(events[0].context?.campaign?.content).toBe('email_link');
      expect(events[1].context?.traits?.name).toBe('John Doe');
    });

    test('should handle performance with large batches', () => {
      const batch = new EventBatch();
      const startTime = performance.now();

      // Add 1000 events
      for (let i = 0; i < 1000; i++) {
        batch.addTrack(`event_${i}`, { index: i });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(batch.getEvents()).toHaveLength(1000);
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    test('should handle memory efficiency with context builders', () => {
      const contexts = [];

      // Create 100 context builders
      for (let i = 0; i < 100; i++) {
        const builder = new ContextBuilder()
          .setUser(`user_${i}`)
          .setOrganization(`org_${i}`)
          .setPage({ path: `/page_${i}` });

        contexts.push(builder.build());
      }

      // Each context should be independent
      expect(contexts[0]).not.toBe(contexts[1]); // Different object references
      expect(contexts[99].page?.path).toBe('/page_99');
      expect(contexts[0].groupId).toBe('org_0');
      expect(contexts[99].groupId).toBe('org_99');
    });

    test('should maintain type safety across all helpers', () => {
      // This test ensures TypeScript types work correctly
      const context = new ContextBuilder().build();
      const builder = new PayloadBuilder(context);
      const batch = new EventBatch();

      // All these should compile without type errors
      const trackPayload = builder.track('test');
      const identifyPayload = builder.identify('user1');
      const pagePayload = builder.page('test');
      const groupPayload = builder.group('group1');
      const aliasPayload = builder.alias('user1', 'anon1');

      // Type guards should work
      expect(isTrackPayload(trackPayload)).toBeTruthy();
      expect(isIdentifyPayload(identifyPayload)).toBeTruthy();
      expect(isPagePayload(pagePayload)).toBeTruthy();
      expect(isGroupPayload(groupPayload)).toBeTruthy();
      expect(isAliasPayload(aliasPayload)).toBeTruthy();

      // Batch operations should work
      batch.add(trackPayload);
      batch.addTrack('test2');

      expect(batch.getEvents()).toHaveLength(2);
    });

    test('should handle edge cases gracefully', () => {
      // Empty context builder
      const emptyContext = new ContextBuilder().build();
      expect(emptyContext).toStrictEqual({});

      // Empty batch
      const emptyBatch = new EventBatch();
      expect(emptyBatch.getEvents()).toStrictEqual([]);

      // Metadata with empty object
      const payload: EmitterTrackPayload = {
        type: 'track',
        context: {},
        event: 'test',
        properties: {},
      };
      const withEmptyMetadata = withMetadata(payload, {});
      expect(withEmptyMetadata.context?.app).toStrictEqual({});

      // UTM with empty object
      const withEmptyUTM = withUTM(payload, {});
      expect(withEmptyUTM.context?.campaign).toStrictEqual({});
    });
  });
});
