/**
 * Tests for interval disposal in advanced memory monitor
 */

import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import { AdvancedMemoryMonitor } from '../../src/tools/advanced-memory-monitor';

describe('advancedMemoryMonitor Interval Management', () => {
  let monitor: AdvancedMemoryMonitor;

  beforeEach(() => {
    monitor = new AdvancedMemoryMonitor();
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Always dispose to clean up intervals
    monitor.dispose();
    vi.restoreAllMocks();
  });

  test('should start and stop monitoring properly', () => {
    // Should start without errors
    expect(() => {
      monitor.startMonitoring(1000); // 1 second for fast tests
    }).not.toThrow();

    // Should stop without errors
    expect(() => {
      monitor.stopMonitoring();
    }).not.toThrow();
  });

  test('should not start monitoring twice', () => {
    monitor.startMonitoring(1000);

    // Starting again should not throw and should not create multiple intervals
    expect(() => {
      monitor.startMonitoring(500);
    }).not.toThrow();

    // Should still be able to stop normally
    monitor.stopMonitoring();
  });

  test('should dispose cleanly', () => {
    monitor.startMonitoring(1000);

    // Should dispose without errors
    expect(() => {
      monitor.dispose();
    }).not.toThrow();

    // After disposal, starting monitoring should work again
    expect(() => {
      monitor.startMonitoring(1000);
    }).not.toThrow();
  });

  test('should track objects and provide stats', () => {
    const testObj = { test: 'data' };

    const trackingId = monitor.trackObject(testObj, 'test-object', { context: 'test' });
    expect(typeof trackingId).toBe('string');
    expect(trackingId).toBeTruthy();

    const stats = monitor.getStats();
    expect(stats).toHaveProperty('totalTracked');
    expect(stats).toHaveProperty('aliveObjects');
    expect(stats.totalTracked).toBeGreaterThan(0);
  });

  test('should handle memory pressure calculation', () => {
    const pressure = monitor.getMemoryPressure();

    expect(pressure).toHaveProperty('level');
    expect(pressure).toHaveProperty('heapUsage');
    expect(pressure).toHaveProperty('recommendation');
    expect(pressure).toHaveProperty('actionRequired');

    expect(['optimal', 'elevated', 'high', 'critical', 'emergency']).toContain(pressure.level);
  });

  test('should detect memory leaks', async () => {
    // This is a simple test - in practice leak detection requires time
    const leaks = await monitor.detectMemoryLeaks(0); // 0 threshold for immediate detection

    expect(Array.isArray(leaks)).toBeTruthy();
    // Should not throw errors even if no leaks detected
  });

  test('should generate memory report', async () => {
    const report = await monitor.getMemoryReport();

    expect(report).toHaveProperty('pressure');
    expect(report).toHaveProperty('leaks');
    expect(report).toHaveProperty('heapAnalysis');
    expect(report).toHaveProperty('gcMetrics');
    expect(report).toHaveProperty('tracking');
    expect(report).toHaveProperty('recommendations');

    expect(Array.isArray(report.leaks)).toBeTruthy();
    expect(Array.isArray(report.recommendations)).toBeTruthy();
  });
});
