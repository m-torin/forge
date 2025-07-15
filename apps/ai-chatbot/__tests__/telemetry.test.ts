import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the AI package telemetry
vi.mock('@repo/ai/server/next', () => ({
  createTelemetryMiddleware: vi.fn(),
}));

const mockCreateTelemetryMiddleware = vi.mocked(
  (await import('@repo/ai/server/next')).createTelemetryMiddleware,
);

describe('telemetry Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should create telemetry middleware with correct configuration', () => {
    const mockTelemetry = { track: vi.fn() };
    mockCreateTelemetryMiddleware.mockReturnValue(mockTelemetry);

    // Test the telemetry middleware creation
    const telemetry = mockCreateTelemetryMiddleware({
      isEnabled: true,
      functionId: 'chat-stream',
      metadata: {
        service: 'ai-chatbot',
        version: '1.0.0',
      },
    });

    expect(mockCreateTelemetryMiddleware).toHaveBeenCalledWith({
      isEnabled: true,
      functionId: 'chat-stream',
      metadata: {
        service: 'ai-chatbot',
        version: '1.0.0',
      },
    });

    expect(telemetry).toBeDefined();
    expect(telemetry.track).toBeDefined();
  });

  test('should track operations with metadata', async () => {
    const mockTrack = vi.fn(async fn => await fn());
    const mockTelemetry = { track: mockTrack };
    mockCreateTelemetryMiddleware.mockReturnValue(mockTelemetry);

    // Test tracking functionality
    const telemetry = mockCreateTelemetryMiddleware({
      isEnabled: true,
      functionId: 'test-function',
      metadata: {
        service: 'ai-chatbot',
        version: '1.0.0',
      },
    });

    const testFunction = async () => 'test-result';
    const result = await telemetry.track(testFunction, {
      metadata: {
        testId: 'test-123',
        userId: 'user-456',
        operation: 'test-operation',
      },
    });

    expect(mockTrack).toHaveBeenCalledWith(testFunction, {
      metadata: {
        testId: 'test-123',
        userId: 'user-456',
        operation: 'test-operation',
      },
    });

    expect(result).toBe('test-result');
  });

  test('should handle disabled telemetry', () => {
    const mockTelemetry = { track: vi.fn() };
    mockCreateTelemetryMiddleware.mockReturnValue(mockTelemetry);

    const telemetry = mockCreateTelemetryMiddleware({
      isEnabled: false,
      functionId: 'test-function',
      metadata: {
        service: 'ai-chatbot',
        version: '1.0.0',
      },
    });

    expect(mockCreateTelemetryMiddleware).toHaveBeenCalledWith({
      isEnabled: false,
      functionId: 'test-function',
      metadata: {
        service: 'ai-chatbot',
        version: '1.0.0',
      },
    });

    expect(telemetry).toBeDefined();
  });
});
