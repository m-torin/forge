/**
 * Tests for centralized process lifecycle management
 */

import { beforeEach, describe, expect, vi } from 'vitest';
import {
  areHandlersRegistered,
  CLEANUP_PRIORITIES,
  getRegisteredHandlers,
  registerCleanupHandler,
  removeCleanupHandler,
} from '../../src/runtime/lifecycle';

describe('process Lifecycle Management', () => {
  beforeEach(() => {
    // Clear any existing handlers before each test
    const handlers = getRegisteredHandlers();
    handlers.forEach(name => {
      removeCleanupHandler(name);
    });
  });

  test('should register cleanup handlers', () => {
    const mockCleanup = vi.fn();

    registerCleanupHandler('test-handler', mockCleanup, CLEANUP_PRIORITIES.DEFAULT);

    const handlers = getRegisteredHandlers();
    expect(handlers).toContain('test-handler');
  });

  test('should remove cleanup handlers', () => {
    const mockCleanup = vi.fn();

    registerCleanupHandler('test-handler', mockCleanup);
    expect(getRegisteredHandlers()).toContain('test-handler');

    const removed = removeCleanupHandler('test-handler');
    expect(removed).toBeTruthy();
    expect(getRegisteredHandlers()).not.toContain('test-handler');
  });

  test('should return false when removing non-existent handler', () => {
    const removed = removeCleanupHandler('non-existent');
    expect(removed).toBeFalsy();
  });

  test('should track process handler registration status', () => {
    // Process handlers should be registered after first registerCleanupHandler call
    const mockCleanup = vi.fn();
    registerCleanupHandler('test', mockCleanup);

    expect(areHandlersRegistered()).toBeTruthy();
  });

  test('should handle multiple handlers with different priorities', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const handler3 = vi.fn();

    registerCleanupHandler('high-priority', handler1, CLEANUP_PRIORITIES.CRITICAL_RESOURCES);
    registerCleanupHandler('medium-priority', handler2, CLEANUP_PRIORITIES.DEFAULT);
    registerCleanupHandler('low-priority', handler3, CLEANUP_PRIORITIES.FINAL);

    const handlers = getRegisteredHandlers();
    expect(handlers).toHaveLength(3);
    expect(handlers).toContain('high-priority');
    expect(handlers).toContain('medium-priority');
    expect(handlers).toContain('low-priority');
  });

  test('should use default priority when not specified', () => {
    const mockCleanup = vi.fn();

    // Should not throw when priority is not specified
    expect(() => {
      registerCleanupHandler('default-priority', mockCleanup);
    }).not.toThrow();

    expect(getRegisteredHandlers()).toContain('default-priority');
  });

  test('should prevent duplicate handler names', () => {
    const cleanup1 = vi.fn();
    const cleanup2 = vi.fn();

    registerCleanupHandler('duplicate', cleanup1);
    registerCleanupHandler('duplicate', cleanup2);

    // Should only have one handler with this name
    const handlers = getRegisteredHandlers().filter(name => name === 'duplicate');
    expect(handlers).toHaveLength(1);
  });
});
