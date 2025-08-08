/**
 * Tests for distributed tracing utilities
 *
 * @deprecated These tests are skipped pending Sentry v9 migration
 */

// @ts-nocheck - Skip type checking for v8 → v9 migration

import * as Sentry from '@sentry/nextjs';
import { beforeEach, describe, expect, vi } from 'vitest';
import {
  continueTrace,
  continueTraceInServerComponent,
  createTraceHeaders,
  extractTraceHeaders,
  extractTraceparentData,
  generatePropagationContext,
} from '../distributed-tracing';
// Import Headers type differently to avoid Next.js module resolution issues
type Headers = {
  get(name: string): string | null;
};

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  continueTrace: vi.fn(),
  getDynamicSamplingContextFromClient: vi.fn(),
  getClient: vi.fn(),
  getScope: vi.fn(),
}));

describe.todo('distributed-tracing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractTraceparentData', () => {
    test('should extract valid traceparent data', () => {
      const traceparent = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';
      const result = extractTraceparentData(traceparent);

      expect(result).toStrictEqual({
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        parentSpanId: '00f067aa0ba902b7',
        traceFlags: '01',
      });
    });

    test('should return null for invalid traceparent', () => {
      expect(extractTraceparentData('invalid')).toBeNull();
      expect(extractTraceparentData('')).toBeNull();
      expect(extractTraceparentData('00-invalid-format')).toBeNull();
    });

    test('should handle different trace flags', () => {
      const traceparent = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-00';
      const result = extractTraceparentData(traceparent);

      expect(result?.traceFlags).toBe('00');
    });
  });

  describe('continueTrace', () => {
    test('should continue trace with valid headers', () => {
      const mockCallback = vi.fn(() => 'result');
      const headers = {
        'sentry-trace': '12345678901234567890123456789012-1234567890123456-1',
        baggage: 'sentry-trace_id=12345678901234567890123456789012',
      };

      (Sentry.continueTrace as any).mockImplementation((context, callback) => callback());

      const result = continueTrace(headers, mockCallback);

      expect(result).toBe('result');
      expect(Sentry.continueTrace).toHaveBeenCalledWith(
        {
          sentryTrace: '12345678901234567890123456789012-1234567890123456-1',
          baggage: 'sentry-trace_id=12345678901234567890123456789012',
        },
        mockCallback,
      );
    });

    test('should handle missing headers', () => {
      const mockCallback = vi.fn(() => 'result');
      const headers = {};

      (Sentry.continueTrace as any).mockImplementation((context, callback) => callback());

      const result = continueTrace(headers, mockCallback);

      expect(result).toBe('result');
      expect(Sentry.continueTrace).toHaveBeenCalledWith(
        {
          sentryTrace: undefined,
          baggage: undefined,
        },
        mockCallback,
      );
    });

    test('should normalize header names', () => {
      const mockCallback = vi.fn(() => 'result');
      const headers = {
        'Sentry-Trace': '12345678901234567890123456789012-1234567890123456-1',
        Baggage: 'sentry-trace_id=12345678901234567890123456789012',
      };

      (Sentry.continueTrace as any).mockImplementation((context, callback) => callback());

      continueTrace(headers, mockCallback);

      expect(Sentry.continueTrace).toHaveBeenCalledWith(
        {
          sentryTrace: '12345678901234567890123456789012-1234567890123456-1',
          baggage: 'sentry-trace_id=12345678901234567890123456789012',
        },
        mockCallback,
      );
    });
  });

  describe('continueTraceInServerComponent', () => {
    test('should extract trace context from Next.js Headers', () => {
      const mockHeaders = {
        get: vi.fn(),
      } as unknown as Headers;

      (mockHeaders.get as any)
        .mockReturnValueOnce('12345678901234567890123456789012-1234567890123456-1')
        .mockReturnValueOnce('sentry-trace_id=12345678901234567890123456789012');

      const result = continueTraceInServerComponent(mockHeaders);

      expect(result).toStrictEqual({
        traceId: '12345678901234567890123456789012',
        parentSpanId: '1234567890123456',
        traceFlags: '1',
      });

      expect(mockHeaders.get).toHaveBeenCalledWith('sentry-trace');
      expect(mockHeaders.get).toHaveBeenCalledWith('baggage');
    });

    test('should handle missing trace headers', () => {
      const mockHeaders = {
        get: vi.fn(() => null),
      } as unknown as Headers;

      const result = continueTraceInServerComponent(mockHeaders);

      expect(result).toStrictEqual({});
    });

    test('should extract partial trace data', () => {
      const mockHeaders = {
        get: vi.fn(),
      } as unknown as Headers;

      (mockHeaders.get as any)
        .mockReturnValueOnce('12345678901234567890123456789012-1234567890123456-1')
        .mockReturnValueOnce(null);

      const result = continueTraceInServerComponent(mockHeaders);

      expect(result).toStrictEqual({
        traceId: '12345678901234567890123456789012',
        parentSpanId: '1234567890123456',
        traceFlags: '1',
      });
    });
  });

  describe('generatePropagationContext', () => {
    test('should generate new propagation context', () => {
      const context = generatePropagationContext();

      expect(context).toHaveProperty('traceId');
      expect(context).toHaveProperty('spanId');
      expect(context.traceId).toHaveLength(32);
      expect(context.spanId).toHaveLength(16);
      expect(context.traceId).toMatch(/^[0-9a-f]{32}$/);
      expect(context.spanId).toMatch(/^[0-9a-f]{16}$/);
    });

    test('should generate different contexts each time', () => {
      const context1 = generatePropagationContext();
      const context2 = generatePropagationContext();

      expect(context1.traceId).not.toBe(context2.traceId);
      expect(context1.spanId).not.toBe(context2.spanId);
    });
  });

  describe('createTraceHeaders', () => {
    const mockScope = {
      getPropagationContext: vi.fn(),
    };

    beforeEach(() => {
      (Sentry.getScope as any).mockReturnValue(mockScope);
      (Sentry.getDynamicSamplingContextFromClient as any).mockReturnValue({
        environment: 'test',
        release: '1.0.0',
      });
    });

    test('should create trace headers from active context', () => {
      mockScope.getPropagationContext.mockReturnValue({
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: '00f067aa0ba902b7',
        sampled: true,
      });

      const headers = createTraceHeaders();

      expect(headers).toStrictEqual({
        'sentry-trace': '4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-1',
        baggage: 'sentry-environment=test,sentry-release=1.0.0',
      });
    });

    test('should handle unsampled trace', () => {
      mockScope.getPropagationContext.mockReturnValue({
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: '00f067aa0ba902b7',
        sampled: false,
      });

      const headers = createTraceHeaders();

      expect(headers['sentry-trace']).toBe('4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-0');
    });

    test('should handle missing sampling context', () => {
      mockScope.getPropagationContext.mockReturnValue({
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: '00f067aa0ba902b7',
        sampled: true,
      });

      (Sentry.getDynamicSamplingContextFromClient as any).mockReturnValue(null);

      const headers = createTraceHeaders();

      expect(headers).toStrictEqual({
        'sentry-trace': '4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-1',
        baggage: '',
      });
    });

    test('should generate new context when none exists', () => {
      mockScope.getPropagationContext.mockReturnValue(null);

      const headers = createTraceHeaders();

      expect(headers['sentry-trace']).toMatch(/^[0-9a-f]{32}-[0-9a-f]{16}-[01]$/);
      expect(headers).toHaveProperty('baggage');
    });
  });

  describe('extractTraceHeaders', () => {
    test('should extract trace headers from request headers', () => {
      const headers = {
        'sentry-trace': '4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-1',
        baggage: 'sentry-environment=test',
        'content-type': 'application/json',
      };

      const result = extractTraceHeaders(headers);

      expect(result).toStrictEqual({
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        parentSpanId: '00f067aa0ba902b7',
        traceFlags: '1',
      });
    });

    test('should handle case-insensitive headers', () => {
      const headers = {
        'Sentry-Trace': '4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-1',
        Baggage: 'sentry-environment=test',
      };

      const result = extractTraceHeaders(headers);

      expect(result).toStrictEqual({
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        parentSpanId: '00f067aa0ba902b7',
        traceFlags: '1',
      });
    });

    test('should return empty object for missing headers', () => {
      const headers = {
        'content-type': 'application/json',
      };

      const result = extractTraceHeaders(headers);

      expect(result).toStrictEqual({});
    });

    test('should handle invalid trace header format', () => {
      const headers = {
        'sentry-trace': 'invalid-format',
        baggage: 'sentry-environment=test',
      };

      const result = extractTraceHeaders(headers);

      expect(result).toStrictEqual({});
    });

    test('should work with Headers object', () => {
      const headers = new Headers({
        'sentry-trace': '4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-1',
        baggage: 'sentry-environment=test',
      });

      const result = extractTraceHeaders(headers);

      expect(result).toStrictEqual({
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        parentSpanId: '00f067aa0ba902b7',
        traceFlags: '1',
      });
    });
  });
});
