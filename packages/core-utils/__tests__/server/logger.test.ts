import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LogMessage, LogTransport } from '../../src/server/logger';
import {
  AsyncLogger,
  ConsoleTransport,
  createObservabilityTransport,
  globalLoggerRegistry,
  LoggerRegistry,
} from '../../src/server/logger';

describe('server/logger', () => {
  describe('ConsoleTransport', () => {
    let consoleTransport: ConsoleTransport;
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleTransport = new ConsoleTransport();
      consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      vi.spyOn(console, 'debug').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('logs messages to console', () => {
      const message: LogMessage = {
        message: 'Test message',
        level: 'info',
        timestamp: new Date(),
        sessionId: 'test-session',
      };

      consoleTransport.log(message);

      expect(console.info).toHaveBeenCalled();
      const call = (console.info as any).mock.calls[0][0];
      expect(call).toContain('Test message');
      expect(call).toContain('[INFO]');
      expect(call).toContain('[test-session]');
    });

    it('uses appropriate console methods for different log levels', () => {
      const baseMessage = {
        message: 'Test',
        timestamp: new Date(),
        sessionId: 'test',
      };

      consoleTransport.log({ ...baseMessage, level: 'debug' });
      expect(console.debug).toHaveBeenCalled();

      consoleTransport.log({ ...baseMessage, level: 'info' });
      expect(console.info).toHaveBeenCalled();

      consoleTransport.log({ ...baseMessage, level: 'warn' });
      expect(console.warn).toHaveBeenCalled();

      consoleTransport.log({ ...baseMessage, level: 'error' });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('AsyncLogger', () => {
    let logger: AsyncLogger;
    let mockTransport: LogTransport;

    beforeEach(() => {
      mockTransport = {
        name: 'mock',
        log: vi.fn(),
      };
      logger = new AsyncLogger({
        sessionId: 'test-session',
        logLevel: 'debug',
        transports: [mockTransport],
      });
    });

    it('initializes with correct default values', () => {
      const defaultLogger = new AsyncLogger();
      const stats = defaultLogger.getStats();

      expect(stats.sessionId).toBe('unknown');
      expect(stats.currentLevel).toBe('info');
      expect(stats.transports).toContain('console');
    });

    it('logs messages at appropriate levels', () => {
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(mockTransport.log).toHaveBeenCalledTimes(4);

      const calls = (mockTransport.log as any).mock.calls;
      expect(calls[0][0].level).toBe('debug');
      expect(calls[1][0].level).toBe('info');
      expect(calls[2][0].level).toBe('warn');
      expect(calls[3][0].level).toBe('error');
    });

    it('respects log level filtering', () => {
      const warnLogger = new AsyncLogger({
        logLevel: 'warn',
        transports: [mockTransport],
      });

      warnLogger.debug('Debug message');
      warnLogger.info('Info message');
      warnLogger.warn('Warn message');
      warnLogger.error('Error message');

      expect(mockTransport.log).toHaveBeenCalledTimes(2); // Only warn and error
    });

    it('includes context in log messages', () => {
      const context = {
        extra: { userId: '123' },
        tags: { component: 'test' },
      };

      logger.info('Test message', context);

      expect(mockTransport.log).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test message',
          level: 'info',
          context,
        }),
      );
    });

    it('tracks statistics', () => {
      logger.info('Message 1');
      logger.warn('Message 2');
      logger.flush();

      const stats = logger.getStats();
      expect(stats.messagesLogged).toBe(2);
      expect(stats.bytesWritten).toBeGreaterThan(0);
      expect(stats.flushCount).toBe(1);
    });

    it('manages transports', () => {
      const newTransport: LogTransport = {
        name: 'new-transport',
        log: vi.fn(),
      };

      expect(logger.getTransports()).toEqual(['mock']);

      logger.addTransport(newTransport);
      expect(logger.getTransports()).toContain('new-transport');

      logger.removeTransport('mock');
      expect(logger.getTransports()).not.toContain('mock');
    });

    it('handles transport errors gracefully', () => {
      const faultyTransport: LogTransport = {
        name: 'faulty',
        log: vi.fn().mockRejectedValue(new Error('Transport failed')),
      };

      logger.addTransport(faultyTransport);

      // Should not throw
      logger.info('Test message');

      const stats = logger.getStats();
      expect(stats.errors).toBeGreaterThan(0);
    });

    it('stops logging after close', async () => {
      await logger.close();
      logger.info('Should not log');

      expect(mockTransport.log).not.toHaveBeenCalled();
    });

    it('calls transport flush and close methods', async () => {
      mockTransport.flush = vi.fn();
      mockTransport.close = vi.fn();

      logger.flush();
      await logger.close();

      expect(mockTransport.flush).toHaveBeenCalled();
      expect(mockTransport.close).toHaveBeenCalled();
    });
  });

  describe('LoggerRegistry', () => {
    let registry: LoggerRegistry;

    beforeEach(() => {
      registry = new LoggerRegistry();
    });

    it('creates and retrieves loggers', () => {
      const logger1 = registry.create('session1');
      const logger2 = registry.get('session1');

      expect(logger1).toBe(logger2);
      expect(logger1).toBeInstanceOf(AsyncLogger);
    });

    it('returns same instance for duplicate create calls', () => {
      const logger1 = registry.create('session1');
      const logger2 = registry.create('session1');

      expect(logger1).toBe(logger2);
    });

    it('returns undefined for non-existent loggers', () => {
      expect(registry.get('nonexistent')).toBeUndefined();
    });

    it('closes and removes loggers', async () => {
      registry.create('session1');
      expect(registry.list()).toContain('session1');

      const result = await registry.close('session1');
      expect(result).toBe(true);
      expect(registry.get('session1')).toBeUndefined();

      const falseResult = await registry.close('nonexistent');
      expect(falseResult).toBe(false);
    });

    it('lists logger session IDs', () => {
      registry.create('session1');
      registry.create('session2');

      expect(registry.list().sort()).toEqual(['session1', 'session2']);
    });

    it('closes all loggers', async () => {
      registry.create('session1');
      registry.create('session2');

      await registry.closeAll();

      expect(registry.list()).toEqual([]);
    });

    it('provides global statistics', () => {
      const logger1 = registry.create('session1');
      const logger2 = registry.create('session2');

      logger1.info('Message from logger1');
      logger2.warn('Message from logger2');

      const stats = registry.getGlobalStats();

      expect(stats.session1.messagesLogged).toBe(1);
      expect(stats.session2.messagesLogged).toBe(1);
    });

    it('manages global transports', () => {
      const logger1 = registry.create('session1');
      const logger2 = registry.create('session2');

      const globalTransport: LogTransport = {
        name: 'global',
        log: vi.fn(),
      };

      registry.addGlobalTransport(globalTransport);

      expect(logger1.getTransports()).toContain('global');
      expect(logger2.getTransports()).toContain('global');

      registry.removeGlobalTransport('global');

      expect(logger1.getTransports()).not.toContain('global');
      expect(logger2.getTransports()).not.toContain('global');
    });
  });

  describe('createObservabilityTransport', () => {
    it('creates transport that delegates to observability functions', () => {
      const mockObservability = {
        logDebug: vi.fn(),
        logInfo: vi.fn(),
        logWarn: vi.fn(),
        logError: vi.fn(),
      };

      const transport = createObservabilityTransport(mockObservability);
      expect(transport.name).toBe('observability');

      const message: LogMessage = {
        message: 'Test message',
        level: 'info',
        timestamp: new Date(),
        sessionId: 'test-session',
        context: {
          extra: { key: 'value' },
          tags: { component: 'test' },
        },
      };

      transport.log(message);

      expect(mockObservability.logInfo).toHaveBeenCalledWith(
        '[test-session] Test message',
        expect.objectContaining({
          extra: expect.objectContaining({
            sessionId: 'test-session',
            component: 'core-utils',
            key: 'value',
          }),
          tags: expect.objectContaining({
            logger: 'AsyncLogger',
            sessionId: 'test-session',
            component: 'test',
          }),
        }),
      );
    });

    it('handles all log levels', () => {
      const mockObservability = {
        logDebug: vi.fn(),
        logInfo: vi.fn(),
        logWarn: vi.fn(),
        logError: vi.fn(),
      };

      const transport = createObservabilityTransport(mockObservability);
      const baseMessage = {
        message: 'Test',
        timestamp: new Date(),
        sessionId: 'test',
      };

      transport.log({ ...baseMessage, level: 'debug' });
      transport.log({ ...baseMessage, level: 'info' });
      transport.log({ ...baseMessage, level: 'warn' });
      transport.log({ ...baseMessage, level: 'error' });

      expect(mockObservability.logDebug).toHaveBeenCalled();
      expect(mockObservability.logInfo).toHaveBeenCalled();
      expect(mockObservability.logWarn).toHaveBeenCalled();
      expect(mockObservability.logError).toHaveBeenCalled();
    });
  });

  describe('globalLoggerRegistry', () => {
    it('provides a global registry instance', () => {
      expect(globalLoggerRegistry).toBeInstanceOf(LoggerRegistry);
    });
  });
});
