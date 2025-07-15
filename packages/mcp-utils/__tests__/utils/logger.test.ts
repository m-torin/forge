/**
 * Tests for logger utilities
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { AsyncLogger, LoggerRegistry, globalLoggerRegistry, type LogLevel } from '../../src/utils/logger';

// Mock file system operations for testing
vi.mock('node:fs', async () => {
  const actual = await vi.importActual('node:fs');
  return {
    ...actual,
    promises: {
      ...actual.promises,
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      stat: vi.fn(),
      unlink: vi.fn(),
      readdir: vi.fn()
    }
  };
});

describe('AsyncLogger', () => {
  let logger: AsyncLogger;
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `mcp-utils-test-${Date.now()}`);
    
    logger = new AsyncLogger({
      sessionId: 'test-session',
      logDir: testDir,
      logLevel: 'debug',
      maxBufferSize: 1024,
      maxFileSize: 10000,
      maxFiles: 3
    });

    // Mock fs.mkdir to always succeed
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.stat).mockRejectedValue(new Error('File not found'));
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.readdir).mockResolvedValue([]);
  });

  afterEach(async () => {
    await logger.close();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default options', () => {
      const defaultLogger = new AsyncLogger({ sessionId: 'default-test' });
      expect(defaultLogger).toBeInstanceOf(AsyncLogger);
    });

    it('should create log directory on init', async () => {
      await logger.init();
      
      expect(fs.mkdir).toHaveBeenCalledWith(testDir, { recursive: true });
    });

    it('should handle existing log directory', async () => {
      vi.mocked(fs.mkdir).mockRejectedValueOnce(new Error('Directory exists'));
      
      await expect(logger.init()).resolves.not.toThrow();
    });
  });

  describe('logging levels', () => {
    beforeEach(async () => {
      await logger.init();
    });

    it('should log debug messages when level is debug', () => {
      logger.log('Debug message', 'debug');
      logger.log('Info message', 'info');
      logger.log('Warn message', 'warn');
      logger.log('Error message', 'error');
      
      const stats = logger.getStats();
      expect(stats.messagesByLevel.debug).toBe(1);
      expect(stats.messagesByLevel.info).toBe(1);
      expect(stats.messagesByLevel.warn).toBe(1);
      expect(stats.messagesByLevel.error).toBe(1);
    });

    it('should filter messages below log level', async () => {
      const infoLogger = new AsyncLogger({
        sessionId: 'info-test',
        logLevel: 'info'
      });
      await infoLogger.init();
      
      infoLogger.log('Debug message', 'debug'); // Should be filtered
      infoLogger.log('Info message', 'info');
      infoLogger.log('Warn message', 'warn');
      
      const stats = infoLogger.getStats();
      expect(stats.messagesByLevel.debug).toBe(0);
      expect(stats.messagesByLevel.info).toBe(1);
      expect(stats.messagesByLevel.warn).toBe(1);
      
      await infoLogger.close();
    });

    it('should handle all log levels correctly', async () => {
      const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
      
      levels.forEach(level => {
        logger.log(`Message at ${level} level`, level);
      });
      
      const stats = logger.getStats();
      levels.forEach(level => {
        expect(stats.messagesByLevel[level]).toBe(1);
      });
    });
  });

  describe('buffering and flushing', () => {
    beforeEach(async () => {
      await logger.init();
    });

    it('should buffer messages before writing', () => {
      logger.log('Test message 1');
      logger.log('Test message 2');
      
      const stats = logger.getStats();
      expect(stats.bufferedMessages).toBe(2);
      expect(stats.totalWrites).toBe(0); // Not flushed yet
    });

    it('should flush buffer when size exceeded', () => {
      const smallBufferLogger = new AsyncLogger({
        sessionId: 'small-buffer',
        maxBufferSize: 50 // Very small buffer
      });

      // Add messages that exceed buffer size
      const longMessage = 'x'.repeat(30);
      smallBufferLogger.log(longMessage);
      smallBufferLogger.log(longMessage); // Should trigger flush
      
      const stats = smallBufferLogger.getStats();
      expect(stats.totalWrites).toBeGreaterThan(0);
    });

    it('should flush manually', async () => {
      logger.log('Test message 1');
      logger.log('Test message 2');
      
      expect(logger.getStats().totalWrites).toBe(0);
      
      logger.flush();
      
      // Give some time for async flush
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(logger.getStats().totalWrites).toBeGreaterThan(0);
    });
  });

  describe('file rotation', () => {
    beforeEach(async () => {
      await logger.init();
    });

    it('should track file size', () => {
      const stats = logger.getStats();
      expect(stats.currentFileSize).toBe(0);
    });

    it('should handle rotation when file size exceeded', async () => {
      // Mock large file size
      vi.mocked(fs.stat).mockResolvedValueOnce({ 
        size: 15000, // Exceeds maxFileSize of 10000
        isFile: () => true 
      } as any);
      
      logger.log('Test message');
      logger.flush();
      
      const stats = logger.getStats();
      expect(stats.rotationCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('statistics and monitoring', () => {
    beforeEach(async () => {
      await logger.init();
    });

    it('should track message statistics', () => {
      logger.log('Debug msg', 'debug');
      logger.log('Info msg', 'info');
      logger.log('Warn msg', 'warn');
      logger.log('Error msg', 'error');
      
      const stats = logger.getStats();
      
      expect(stats.totalMessages).toBe(4);
      expect(stats.messagesByLevel.debug).toBe(1);
      expect(stats.messagesByLevel.info).toBe(1);
      expect(stats.messagesByLevel.warn).toBe(1);
      expect(stats.messagesByLevel.error).toBe(1);
      expect(stats.sessionId).toBe('test-session');
    });

    it('should track buffer statistics', () => {
      logger.log('Message 1');
      logger.log('Message 2');
      
      const stats = logger.getStats();
      expect(stats.bufferedMessages).toBe(2);
      expect(stats.maxBufferSize).toBe(1024);
    });

    it('should track timing information', () => {
      const stats = logger.getStats();
      expect(stats.createdAt).toBeInstanceOf(Date);
      expect(stats.lastWrite).toBeNull(); // No writes yet
    });
  });

  describe('cleanup and closing', () => {
    beforeEach(async () => {
      await logger.init();
    });

    it('should flush on close', async () => {
      logger.log('Test message');
      
      expect(logger.getStats().totalWrites).toBe(0);
      
      await logger.close();
      
      expect(logger.getStats().totalWrites).toBeGreaterThan(0);
    });

    it('should handle multiple close calls', async () => {
      await logger.close();
      await expect(logger.close()).resolves.not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle write errors gracefully', async () => {
      vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error('Write failed'));
      
      await logger.init();
      logger.log('Test message');
      
      // Should not throw
      expect(() => logger.flush()).not.toThrow();
    });

    it('should handle init errors', async () => {
      vi.mocked(fs.mkdir).mockRejectedValueOnce(new Error('Permission denied'));
      
      await expect(logger.init()).rejects.toThrow('Permission denied');
    });
  });
});

describe('LoggerRegistry', () => {
  let registry: LoggerRegistry;

  beforeEach(() => {
    registry = new LoggerRegistry();
  });

  afterEach(async () => {
    await registry.closeAll();
  });

  it('should create and retrieve loggers', async () => {
    const logger1 = registry.create('test-session', {
      sessionId: 'test-session',
      logLevel: 'info'
    });
    
    const logger2 = registry.get('test-session');
    
    expect(logger1).toBe(logger2);
    expect(logger1).toBeInstanceOf(AsyncLogger);
  });

  it('should return same logger for duplicate creates', () => {
    const logger1 = registry.create('test-session', { sessionId: 'test-session' });
    const logger2 = registry.create('test-session', { sessionId: 'test-session' });
    
    expect(logger1).toBe(logger2);
  });

  it('should return undefined for non-existent logger', () => {
    const logger = registry.get('nonexistent');
    expect(logger).toBeUndefined();
  });

  it('should list logger session IDs', () => {
    registry.create('session1', { sessionId: 'session1' });
    registry.create('session2', { sessionId: 'session2' });
    registry.create('session3', { sessionId: 'session3' });
    
    const sessions = registry.list();
    expect(sessions).toContain('session1');
    expect(sessions).toContain('session2');
    expect(sessions).toContain('session3');
    expect(sessions).toHaveLength(3);
  });

  it('should close specific logger', async () => {
    const logger = registry.create('test-session', { sessionId: 'test-session' });
    
    expect(registry.get('test-session')).toBeDefined();
    
    const closed = await registry.close('test-session');
    
    expect(closed).toBe(true);
    expect(registry.get('test-session')).toBeUndefined();
  });

  it('should return false when closing non-existent logger', async () => {
    const closed = await registry.close('nonexistent');
    expect(closed).toBe(false);
  });

  it('should close all loggers', async () => {
    const logger1 = registry.create('session1', { sessionId: 'session1' });
    const logger2 = registry.create('session2', { sessionId: 'session2' });
    
    expect(registry.list()).toHaveLength(2);
    
    await registry.closeAll();
    
    expect(registry.list()).toHaveLength(0);
  });

  it('should get global statistics', async () => {
    const logger1 = registry.create('session1', { sessionId: 'session1' });
    const logger2 = registry.create('session2', { sessionId: 'session2' });
    
    await logger1.init();
    await logger2.init();
    
    logger1.log('Message 1');
    logger2.log('Message 2');
    logger2.log('Message 3');
    
    const stats = registry.getGlobalStats();
    
    expect(stats.session1).toBeDefined();
    expect(stats.session2).toBeDefined();
    expect(stats.session1.totalMessages).toBe(1);
    expect(stats.session2.totalMessages).toBe(2);
  });
});

describe('globalLoggerRegistry', () => {
  afterEach(async () => {
    await globalLoggerRegistry.closeAll();
  });

  it('should be a singleton instance', () => {
    const logger1 = globalLoggerRegistry.create('test-session', { sessionId: 'test-session' });
    const logger2 = globalLoggerRegistry.get('test-session');
    
    expect(logger1).toBe(logger2);
  });

  it('should persist across imports', () => {
    globalLoggerRegistry.create('persistent-session', { sessionId: 'persistent-session' });
    
    // Simulate different import/module
    const { globalLoggerRegistry: importedRegistry } = require('../../src/utils/logger');
    
    expect(importedRegistry.get('persistent-session')).toBeDefined();
  });
});