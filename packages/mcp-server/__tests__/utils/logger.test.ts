/**
 * Tests for logger utilities
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AsyncLogger, LoggerRegistry, globalLoggerRegistry } from '../../src/utils/logger';

// Mock fs module
vi.mock('node:fs/promises', () => {
  return {
    default: {
      mkdir: vi.fn(),
      writeFile: vi.fn(),
      stat: vi.fn(),
      unlink: vi.fn(),
      readdir: vi.fn(),
    },
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    stat: vi.fn(),
    unlink: vi.fn(),
    readdir: vi.fn(),
  };
});

// Mock observability layer to avoid side effects and capture calls
vi.mock('@repo/observability/server', () => ({
  logDebug: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

describe('asyncLogger', () => {
  test('respects log levels and updates stats', async () => {
    const logger = new AsyncLogger({ sessionId: 's1', logLevel: 'info' });
    await logger.init();
    logger.debug('hidden'); // below level, ignored
    logger.info('shown');
    logger.warn('warn');
    logger.error('err');
    logger.flush();

    const stats = logger.getStats();
    // 3 messages above info level
    expect(stats.messagesLogged).toBe(3);
    expect(stats.flushCount).toBe(1);
    expect(stats.sessionId).toBe('s1');
    await logger.close();
  });
});

describe('loggerRegistry', () => {
  let registry: LoggerRegistry;

  beforeEach(() => {
    registry = new LoggerRegistry();
  });

  afterEach(async () => {
    await registry.closeAll();
  });

  test('should create and retrieve loggers', async () => {
    const logger1 = registry.create('test-session', {
      sessionId: 'test-session',
      logLevel: 'info',
    });

    const logger2 = registry.get('test-session');

    expect(logger1).toBe(logger2);
    expect(logger1).toBeInstanceOf(AsyncLogger);
  });

  test('should return same logger for duplicate creates', () => {
    const logger1 = registry.create('test-session', { sessionId: 'test-session' });
    const logger2 = registry.create('test-session', { sessionId: 'test-session' });

    expect(logger1).toBe(logger2);
  });

  test('should return undefined for non-existent logger', () => {
    const logger = registry.get('nonexistent');
    expect(logger).toBeUndefined();
  });

  test('should list logger session IDs', () => {
    registry.create('session1', { sessionId: 'session1' });
    registry.create('session2', { sessionId: 'session2' });
    registry.create('session3', { sessionId: 'session3' });

    const sessions = registry.list();
    expect(sessions).toContain('session1');
    expect(sessions).toContain('session2');
    expect(sessions).toContain('session3');
    expect(sessions).toHaveLength(3);
  });

  test('should close specific logger', async () => {
    const logger = registry.create('test-session', { sessionId: 'test-session' });

    expect(registry.get('test-session')).toBeDefined();

    const closed = await registry.close('test-session');

    expect(closed).toBeTruthy();
    expect(registry.get('test-session')).toBeUndefined();
  });

  test('should return false when closing non-existent logger', async () => {
    const closed = await registry.close('nonexistent');
    expect(closed).toBeFalsy();
  });

  test('should close all loggers', async () => {
    const logger1 = registry.create('session1', { sessionId: 'session1' });
    const logger2 = registry.create('session2', { sessionId: 'session2' });

    expect(registry.list()).toHaveLength(2);

    await registry.closeAll();

    expect(registry.list()).toHaveLength(0);
  });

  test.todo('should get global statistics');
});

describe('globalLoggerRegistry', () => {
  afterEach(async () => {
    await globalLoggerRegistry.closeAll();
  });

  test('should be a singleton instance', () => {
    const logger1 = globalLoggerRegistry.create('test-session', { sessionId: 'test-session' });
    const logger2 = globalLoggerRegistry.get('test-session');

    expect(logger1).toBe(logger2);
  });

  test('should persist across imports', async () => {
    globalLoggerRegistry.create('persistent-session', { sessionId: 'persistent-session' });

    // Simulate different import/module
    const { globalLoggerRegistry: importedRegistry } = await import('../../src/utils/logger');

    expect(importedRegistry.get('persistent-session')).toBeDefined();
  });
});
