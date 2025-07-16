import { describe, test, expect, vi, beforeEach } from 'vitest';

describe('AnalyticsManager Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AnalyticsManager Class', () => {
    describe('Initialization', () => {
      test('should initialize with empty providers', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const config = {
          providers: {},
        };
        
        const manager = new AnalyticsManager(config, {});
        await manager.initialize();
        
        // Just verify the manager exists and can be initialized
        expect(manager).toBeDefined();
      });

      test('should initialize with working providers', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
            segment: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
          segment: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        expect(providerRegistry.console).toHaveBeenCalledWith({ enabled: true });
        expect(providerRegistry.segment).toHaveBeenCalledWith({ enabled: true });
        expect(mockProvider.initialize).toHaveBeenCalledTimes(2);
      });

      test('should handle provider initialization errors', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const workingProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const failingProvider = {
          initialize: vi.fn().mockRejectedValue(new Error('Init failed')),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const onError = vi.fn();
        
        const config = {
          providers: {
            console: { enabled: true },
            failing: { enabled: true },
          },
          onError,
        };
        
        const providerRegistry = {
          console: vi.fn(() => workingProvider),
          failing: vi.fn(() => failingProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        expect(onError).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            provider: 'failing',
            method: 'initialize',
          })
        );
      });

      test('should handle provider creation errors', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const workingProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const onError = vi.fn();
        
        const config = {
          providers: {
            console: { enabled: true },
            failing: { enabled: true },
          },
          onError,
        };
        
        const providerRegistry = {
          console: vi.fn(() => workingProvider),
          failing: vi.fn(() => {
            throw new Error('Provider creation failed');
          }),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        expect(onError).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            provider: 'failing',
            method: 'create',
          })
        );
      });

      test('should skip unavailable providers silently', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const workingProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
            unavailable: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => workingProvider),
          // unavailable provider not in registry
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        // Should not throw and should work with available providers
        expect(workingProvider.initialize).toHaveBeenCalled();
      });

      test('should not initialize twice', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        
        await manager.initialize();
        await manager.initialize();
        
        expect(mockProvider.initialize).toHaveBeenCalledTimes(1);
      });

      test('should call onInfo callback in debug mode', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const onInfo = vi.fn();
        
        const config = {
          providers: {
            console: { enabled: true },
          },
          debug: true,
          onInfo,
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        expect(onInfo).toHaveBeenCalledWith(
          expect.stringContaining('Analytics initialized with providers: console')
        );
      });
    });

    describe('Context Management', () => {
      test('should set and get context', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const manager = new AnalyticsManager({}, {});
        
        const context = { userId: 'test-user', sessionId: 'session-123' };
        manager.setContext(context);
        
        expect(manager.getContext()).toEqual(context);
      });

      test('should merge context updates', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const manager = new AnalyticsManager({}, {});
        
        manager.setContext({ userId: 'test-user' });
        manager.setContext({ sessionId: 'session-123' });
        
        expect(manager.getContext()).toEqual({
          userId: 'test-user',
          sessionId: 'session-123',
        });
      });

      test('should update context on providers that support it', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const providerWithContext = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
          setContext: vi.fn(),
        };
        
        const providerWithoutContext = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            withContext: { enabled: true },
            withoutContext: { enabled: true },
          },
        };
        
        const providerRegistry = {
          withContext: vi.fn(() => providerWithContext),
          withoutContext: vi.fn(() => providerWithoutContext),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        const context = { userId: 'test-user' };
        manager.setContext(context);
        
        expect(providerWithContext.setContext).toHaveBeenCalledWith(context);
      });

      test('should return copy of context to prevent mutation', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const manager = new AnalyticsManager({}, {});
        
        const originalContext = { userId: 'test-user' };
        manager.setContext(originalContext);
        
        const retrievedContext = manager.getContext();
        retrievedContext.userId = 'modified';
        
        expect(manager.getContext().userId).toBe('test-user');
      });
    });

    describe('Track Method', () => {
      test('should track events with string and properties', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        await manager.track('test_event', { key: 'value' });
        
        expect(mockProvider.track).toHaveBeenCalledWith(
          'test_event',
          { key: 'value' },
          {}
        );
      });

      test('should track events with emitter payload', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        const payload = {
          type: 'track' as const,
          event: 'test_event',
          properties: { key: 'value' },
          context: { source: 'emitter' },
        };
        
        await manager.track(payload);
        
        // The implementation merges context but still passes the manager's context to provider
        expect(mockProvider.track).toHaveBeenCalledWith(
          'test_event',
          { key: 'value' },
          {}
        );
      });

      test('should merge context with properties', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        manager.setContext({ userId: 'test-user' });
        await manager.track('test_event', { key: 'value' });
        
        expect(mockProvider.track).toHaveBeenCalledWith(
          'test_event',
          { userId: 'test-user', key: 'value' },
          { userId: 'test-user' }
        );
      });

      test('should handle provider track errors', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const failingProvider = {
          initialize: vi.fn(),
          track: vi.fn().mockRejectedValue(new Error('Track failed')),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const onError = vi.fn();
        
        const config = {
          providers: {
            failing: { enabled: true },
          },
          onError,
        };
        
        const providerRegistry = {
          failing: vi.fn(() => failingProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        await manager.track('test_event', { key: 'value' });
        
        expect(onError).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            provider: 'failing',
            event: 'test_event',
            method: 'track',
          })
        );
      });

      test('should not track if not initialized', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const onError = vi.fn();
        
        const config = {
          providers: {
            console: { enabled: true },
          },
          onError,
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        // Don't initialize
        
        await manager.track('test_event', { key: 'value' });
        
        expect(mockProvider.track).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            provider: 'analytics',
            event: 'test_event',
            method: 'track',
          })
        );
      });
    });

    describe('Identify Method', () => {
      test('should identify users with string and traits', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        await manager.identify('user-123', { name: 'Test User' });
        
        // The implementation adds userId to the traits
        expect(mockProvider.identify).toHaveBeenCalledWith(
          'user-123',
          { name: 'Test User', userId: 'user-123' },
          { name: 'Test User', userId: 'user-123' }
        );
      });

      test('should identify with emitter payload', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        const payload = {
          type: 'identify' as const,
          userId: 'user-123',
          traits: { name: 'Test User' },
          context: { source: 'emitter' },
        };
        
        await manager.identify(payload);
        
        // The implementation adds userId to the traits and uses manager context
        expect(mockProvider.identify).toHaveBeenCalledWith(
          'user-123',
          { name: 'Test User', userId: 'user-123' },
          { name: 'Test User', userId: 'user-123' }
        );
      });

      test('should handle identify errors', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const failingProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn().mockRejectedValue(new Error('Identify failed')),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const onError = vi.fn();
        
        const config = {
          providers: {
            failing: { enabled: true },
          },
          onError,
        };
        
        const providerRegistry = {
          failing: vi.fn(() => failingProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        await manager.identify('user-123', { name: 'Test User' });
        
        expect(onError).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            provider: 'failing',
            userId: 'user-123',
            method: 'identify',
          })
        );
      });

      test('should not identify if not initialized', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const onError = vi.fn();
        
        const config = {
          providers: {
            console: { enabled: true },
          },
          onError,
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        // Don't initialize
        
        await manager.identify('user-123', { name: 'Test User' });
        
        expect(mockProvider.identify).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            provider: 'analytics',
            userId: 'user-123',
            method: 'identify',
          })
        );
      });
    });

    describe('Page Method', () => {
      test('should track page views', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        await manager.page('Test Page', { url: '/test' });
        
        expect(mockProvider.page).toHaveBeenCalledWith(
          'Test Page',
          { url: '/test' },
          {}
        );
      });

      test('should track page with emitter payload', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        const payload = {
          type: 'page' as const,
          name: 'Test Page',
          properties: { url: '/test' },
          context: { source: 'emitter' },
        };
        
        await manager.page(payload);
        
        // The implementation uses manager's context
        expect(mockProvider.page).toHaveBeenCalledWith(
          'Test Page',
          { url: '/test' },
          {}
        );
      });

      test('should handle page errors', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const failingProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn().mockRejectedValue(new Error('Page failed')),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const onError = vi.fn();
        
        const config = {
          providers: {
            failing: { enabled: true },
          },
          onError,
        };
        
        const providerRegistry = {
          failing: vi.fn(() => failingProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        await manager.page('Test Page', { url: '/test' });
        
        expect(onError).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            provider: 'failing',
            name: 'Test Page',
            method: 'page',
          })
        );
      });
    });

    describe('Group Method', () => {
      test('should track group associations', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        await manager.group('group-123', { name: 'Test Group' });
        
        // The implementation adds organizationId to the traits
        expect(mockProvider.group).toHaveBeenCalledWith(
          'group-123',
          { name: 'Test Group', organizationId: 'group-123' },
          { name: 'Test Group', organizationId: 'group-123' }
        );
      });

      test('should track group with emitter payload', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        const payload = {
          type: 'group' as const,
          groupId: 'group-123',
          traits: { name: 'Test Group' },
          context: { source: 'emitter' },
        };
        
        await manager.group(payload);
        
        // The implementation adds organizationId to the traits
        expect(mockProvider.group).toHaveBeenCalledWith(
          'group-123',
          { name: 'Test Group', organizationId: 'group-123' },
          { name: 'Test Group', organizationId: 'group-123' }
        );
      });

      test('should handle group errors', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const failingProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn().mockRejectedValue(new Error('Group failed')),
          alias: vi.fn(),
        };
        
        const onError = vi.fn();
        
        const config = {
          providers: {
            failing: { enabled: true },
          },
          onError,
        };
        
        const providerRegistry = {
          failing: vi.fn(() => failingProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        await manager.group('group-123', { name: 'Test Group' });
        
        expect(onError).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            provider: 'failing',
            groupId: 'group-123',
            method: 'group',
          })
        );
      });
    });

    describe('Alias Method', () => {
      test('should create user aliases', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        await manager.alias('new-user', 'old-user');
        
        expect(mockProvider.alias).toHaveBeenCalledWith(
          'new-user',
          'old-user',
          {}
        );
      });

      test('should create alias with emitter payload', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        const payload = {
          type: 'alias' as const,
          userId: 'new-user',
          previousId: 'old-user',
          context: { source: 'emitter' },
        };
        
        await manager.alias(payload);
        
        // The implementation uses manager's context
        expect(mockProvider.alias).toHaveBeenCalledWith(
          'new-user',
          'old-user',
          {}
        );
      });

      test('should handle alias errors', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const failingProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn().mockRejectedValue(new Error('Alias failed')),
        };
        
        const onError = vi.fn();
        
        const config = {
          providers: {
            failing: { enabled: true },
          },
          onError,
        };
        
        const providerRegistry = {
          failing: vi.fn(() => failingProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        await manager.alias('new-user', 'old-user');
        
        expect(onError).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            provider: 'failing',
            userId: 'new-user',
            method: 'alias',
          })
        );
      });
    });

    describe('Emit Method', () => {
      test('should emit track payload', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        const payload = {
          type: 'track' as const,
          event: 'test_event',
          properties: { key: 'value' },
          context: {},
        };
        
        await manager.emit(payload);
        
        expect(mockProvider.track).toHaveBeenCalledWith(
          'test_event',
          { key: 'value' },
          {}
        );
      });

      test('should emit identify payload', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        const payload = {
          type: 'identify' as const,
          userId: 'user-123',
          traits: { name: 'Test User' },
          context: {},
        };
        
        await manager.emit(payload);
        
        expect(mockProvider.identify).toHaveBeenCalledWith(
          'user-123',
          { name: 'Test User', userId: 'user-123' },
          { name: 'Test User', userId: 'user-123' }
        );
      });

      test('should handle unknown payload type', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const manager = new AnalyticsManager({}, {});
        
        const payload = {
          type: 'unknown' as any,
          data: 'test',
        };
        
        await expect(manager.emit(payload)).rejects.toThrow('Unknown emitter payload type: unknown');
      });
    });

    describe('Provider Filtering', () => {
      test('should filter providers with only option', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const consoleProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const segmentProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
            segment: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => consoleProvider),
          segment: vi.fn(() => segmentProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        await manager.track('test_event', { key: 'value' }, { only: ['console'] });
        
        expect(consoleProvider.track).toHaveBeenCalled();
        expect(segmentProvider.track).not.toHaveBeenCalled();
      });

      test('should filter providers with exclude option', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const consoleProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const segmentProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
            segment: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => consoleProvider),
          segment: vi.fn(() => segmentProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        await manager.track('test_event', { key: 'value' }, { exclude: ['console'] });
        
        expect(consoleProvider.track).not.toHaveBeenCalled();
        expect(segmentProvider.track).toHaveBeenCalled();
      });
    });

    describe('Batch Operations', () => {
      test('should emit batch payloads', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        const payloads = [
          {
            type: 'track' as const,
            event: 'event1',
            properties: { key: 'value1' },
            context: {},
          },
          {
            type: 'track' as const,
            event: 'event2',
            properties: { key: 'value2' },
            context: {},
          },
        ];
        
        await manager.emitBatch(payloads);
        
        expect(mockProvider.track).toHaveBeenCalledTimes(2);
        expect(mockProvider.track).toHaveBeenCalledWith('event1', { key: 'value1' }, {});
        expect(mockProvider.track).toHaveBeenCalledWith('event2', { key: 'value2' }, {});
      });
    });

    describe('Utility Methods', () => {
      test('should create emitter function', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        const emitter = manager.createEmitter();
        
        expect(typeof emitter).toBe('function');
        
        const payload = {
          type: 'track' as const,
          event: 'test_event',
          properties: { key: 'value' },
          context: {},
        };
        
        await emitter(payload);
        
        expect(mockProvider.track).toHaveBeenCalledWith('test_event', { key: 'value' }, {});
      });

      test('should track ecommerce events', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        await manager.trackEcommerce({
          name: 'purchase',
          properties: { total: 100 },
        });
        
        expect(mockProvider.track).toHaveBeenCalledWith('purchase', { total: 100 }, {});
      });

      test('should process emitter payload (deprecated)', async () => {
        const { AnalyticsManager } = await import('@/shared/utils/manager');
        
        const mockProvider = {
          initialize: vi.fn(),
          track: vi.fn(),
          identify: vi.fn(),
          page: vi.fn(),
          group: vi.fn(),
          alias: vi.fn(),
        };
        
        const config = {
          providers: {
            console: { enabled: true },
          },
        };
        
        const providerRegistry = {
          console: vi.fn(() => mockProvider),
        };
        
        const manager = new AnalyticsManager(config, providerRegistry);
        await manager.initialize();
        
        const payload = {
          type: 'track' as const,
          event: 'test_event',
          properties: { key: 'value' },
          context: {},
        };
        
        await manager.processEmitterPayload(payload);
        
        expect(mockProvider.track).toHaveBeenCalledWith('test_event', { key: 'value' }, {});
      });
    });
  });

  describe('createAnalyticsManager Function', () => {
    test('should create AnalyticsManager instance', async () => {
      const { createAnalyticsManager } = await import('@/shared/utils/manager');
      
      const config = {
        providers: {
          console: { enabled: true },
        },
      };
      
      const manager = createAnalyticsManager(config, {});
      
      expect(manager).toBeDefined();
      expect(typeof manager.initialize).toBe('function');
      expect(typeof manager.track).toBe('function');
      expect(typeof manager.identify).toBe('function');
      expect(typeof manager.page).toBe('function');
      expect(typeof manager.group).toBe('function');
      expect(typeof manager.alias).toBe('function');
      expect(typeof manager.emit).toBe('function');
    });
  });
});