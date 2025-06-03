import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Analytics } from '../emitters/analytics';
import { BaseAnalyticsEmitter } from '../emitters/base';
import { MultiEmitter } from '../emitters/multi';

import type { IdentifyMessage, TrackMessage } from '../emitters/types';

describe('Analytics Emitters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Analytics Client', () => {
    it('should create a no-op emitter when disabled', async () => {
      const analytics = new Analytics({ disabled: true });

      // These should not throw
      await analytics.identify('user-123');
      await analytics.track('Test Event');
      await analytics.page();
      await analytics.group('group-123');
      await analytics.alias('new-id');
      await analytics.flush();
      await analytics.reset();
    });

    it('should track user identity', async () => {
      const analytics = new Analytics();

      analytics.setUser('user-123', 'anon-456');
      const user = analytics.getUser();

      expect(user.userId).toBe('user-123');
      expect(user.anonymousId).toBe('anon-456');
    });

    it('should update user on identify', async () => {
      const analytics = new Analytics();

      await analytics.identify('user-789', { name: 'John' });
      const user = analytics.getUser();

      expect(user.userId).toBe('user-789');
      expect(user.traits).toEqual({ name: 'John' });
    });

    it('should use stored user for events', async () => {
      const mockEmitter = {
        identify: vi.fn(),
        alias: vi.fn(),
        flush: vi.fn(),
        group: vi.fn(),
        page: vi.fn(),
        reset: vi.fn(),
        screen: vi.fn(),
        track: vi.fn(),
      };

      const analytics = new Analytics();
      // Replace the emitter with our mock
      (analytics as any).emitter = mockEmitter;

      analytics.setUser('user-123', 'anon-456');

      await analytics.track('Test Event', { value: 10 });

      expect(mockEmitter.track).toHaveBeenCalledWith(
        expect.objectContaining({
          anonymousId: 'anon-456',
          event: 'Test Event',
          properties: { value: 10 },
          userId: 'user-123',
        }),
      );
    });
  });

  describe('BaseAnalyticsEmitter', () => {
    class TestEmitter extends BaseAnalyticsEmitter {
      async identify(_message: IdentifyMessage): Promise<void> {
        // Test implementation
      }
      async track(_message: TrackMessage): Promise<void> {
        // Test implementation
      }
      async page(): Promise<void> {
        // Not implemented for test
      }
      async group(): Promise<void> {
        // Not implemented for test
      }
      async alias(): Promise<void> {
        // Not implemented for test
      }
      async screen(): Promise<void> {
        // Not implemented for test
      }
    }

    it('should generate default context', () => {
      const emitter = new TestEmitter();
      const context = (emitter as any).getDefaultContext();

      expect(context.library).toEqual({
        name: '@repo/analytics',
        version: '1.0.0',
      });
    });

    it('should generate unique message IDs', () => {
      const emitter = new TestEmitter();
      const id1 = (emitter as any).generateMessageId();
      const id2 = (emitter as any).generateMessageId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^\d+-[a-z0-9]+$/);
    });

    it('should validate user identity', () => {
      const emitter = new TestEmitter();

      expect(() => {
        (emitter as any).validateUserIdentity({});
      }).toThrow('Either userId or anonymousId must be provided');

      expect(() => {
        (emitter as any).validateUserIdentity({ userId: 'user-123' });
      }).not.toThrow();

      expect(() => {
        (emitter as any).validateUserIdentity({ anonymousId: 'anon-456' });
      }).not.toThrow();
    });

    it('should handle flush timer', () => {
      vi.useFakeTimers();

      const emitter = new TestEmitter({
        flushInterval: 1000,
      });

      const flushSpy = vi.spyOn(emitter, 'flush').mockResolvedValue();

      vi.advanceTimersByTime(1000);
      expect(flushSpy).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('MultiEmitter', () => {
    it('should call all emitters', async () => {
      const emitter1 = {
        identify: vi.fn(),
        alias: vi.fn(),
        flush: vi.fn(),
        group: vi.fn(),
        page: vi.fn(),
        reset: vi.fn(),
        screen: vi.fn(),
        track: vi.fn(),
      };

      const emitter2 = {
        identify: vi.fn(),
        alias: vi.fn(),
        flush: vi.fn(),
        group: vi.fn(),
        page: vi.fn(),
        reset: vi.fn(),
        screen: vi.fn(),
        track: vi.fn(),
      };

      const multi = new MultiEmitter([emitter1, emitter2]);

      await multi.track({
        event: 'Test Event',
        properties: { value: 10 },
        userId: 'user-123',
      });

      expect(emitter1.track).toHaveBeenCalled();
      expect(emitter2.track).toHaveBeenCalled();
    });

    it('should handle emitter errors gracefully', async () => {
      const errorEmitter = {
        identify: vi.fn().mockRejectedValue(new Error('Test error')),
        alias: vi.fn(),
        flush: vi.fn(),
        group: vi.fn(),
        page: vi.fn(),
        reset: vi.fn(),
        screen: vi.fn(),
        track: vi.fn(),
      };

      const goodEmitter = {
        identify: vi.fn(),
        alias: vi.fn(),
        flush: vi.fn(),
        group: vi.fn(),
        page: vi.fn(),
        reset: vi.fn(),
        screen: vi.fn(),
        track: vi.fn(),
      };

      const multi = new MultiEmitter([errorEmitter, goodEmitter], true);

      // Should not throw
      await multi.identify({ userId: 'user-123' });

      expect(errorEmitter.identify).toHaveBeenCalled();
      expect(goodEmitter.identify).toHaveBeenCalled();
    });

    it('should add and remove emitters', async () => {
      const emitter1 = {
        identify: vi.fn(),
        alias: vi.fn(),
        flush: vi.fn(),
        group: vi.fn(),
        page: vi.fn(),
        reset: vi.fn(),
        screen: vi.fn(),
        track: vi.fn(),
      };

      const multi = new MultiEmitter();

      multi.addEmitter(emitter1);
      await multi.track({ event: 'Test', userId: 'user-123' });
      expect(emitter1.track).toHaveBeenCalled();

      multi.removeEmitter(emitter1);
      vi.clearAllMocks();

      await multi.track({ event: 'Test', userId: 'user-123' });
      expect(emitter1.track).not.toHaveBeenCalled();
    });
  });
});
