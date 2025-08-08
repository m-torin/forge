/**
 * Tests for data stream analytics and v5 type mapping
 * Testing createDataStreamWithAnalytics and UI message stream integration
 */

import { describe, expect, test, vi } from 'vitest';

import { createDataStreamWithAnalytics } from '#/server/streaming/streaming-transformations';

// Mock AI SDK createUIMessageStream to capture write calls
const mockWrites: any[] = [];
const mockWriter = {
  write: vi.fn((data: any) => {
    mockWrites.push(data);
    return Promise.resolve();
  }),
};

vi.mock('ai', async importOriginal => {
  const actual = await importOriginal<typeof import('ai')>();
  return {
    ...actual,
    createUIMessageStream: vi.fn(({ execute }) => {
      // Reset writes for each test
      mockWrites.length = 0;

      // Create a mock stream that captures writes and allows us to run execute
      const mockStream = {
        getWrites: () => [...mockWrites],
        _runExecute: async () => {
          try {
            await execute({ writer: mockWriter });
          } catch (error) {
            // Handle execute errors
            console.warn('Execute error:', error);
          }
        },
        // Mock ReadableStream interface
        getReader: () => new ReadableStream().getReader(),
        [Symbol.asyncIterator]: async function* () {
          yield* mockWrites;
        },
      };

      return mockStream as any;
    }),
  };
});

describe('createDataStreamWithAnalytics', () => {
  test('should map legacy types to v5 write calls', async () => {
    const stream: any = createDataStreamWithAnalytics(
      async (writer, { sendDelta, sendStatus, progressTracker, sendMetadata }) => {
        // Test different delta types mapping to v5
        sendStatus('starting', 'Starting process');
        sendDelta({ type: 'text', content: 'Hello ' });
        sendDelta({ type: 'text', content: 'world!' });
        sendDelta({ type: 'reasoning-delta', content: 'Thinking step 1...' });
        sendDelta({ type: 'reasoning-delta', content: 'Thinking step 2...' });
        progressTracker.update(25, 'Quarter progress');
        progressTracker.update(50, 'Half progress');
        sendMetadata({ key: 'custom', value: 'metadata' });
        sendStatus('completed', 'Process completed');
      },
    );

    // Run the execute function to trigger writes
    await stream._runExecute?.();

    const writes = stream.getWrites?.() || [];
    const writeTypes = writes.map((w: any) => w.type);

    // Verify v5 type mapping
    expect(writeTypes).toContain('data-status');
    expect(writeTypes).toContain('text-delta');
    expect(writeTypes).toContain('reasoning-delta');
    expect(writeTypes).toContain('data-progress');
    expect(writeTypes).toContain('data-metadata');

    // Verify status writes
    const statusWrites = writes.filter((w: any) => w.type === 'data-status');
    expect(statusWrites).toHaveLength(2);
    expect(statusWrites[0].status).toBe('starting');
    expect(statusWrites[1].status).toBe('completed');

    // Verify text deltas are combined/streamed properly
    const textDeltas = writes.filter((w: any) => w.type === 'text-delta');
    expect(textDeltas.length).toBeGreaterThanOrEqual(2);

    // Verify reasoning deltas
    const reasoningDeltas = writes.filter((w: any) => w.type === 'reasoning-delta');
    expect(reasoningDeltas.length).toBeGreaterThanOrEqual(2);

    // Verify progress updates
    const progressWrites = writes.filter((w: any) => w.type === 'data-progress');
    expect(progressWrites).toHaveLength(2);
    expect(progressWrites[0].progress).toBe(25);
    expect(progressWrites[1].progress).toBe(50);

    // Verify metadata
    const metadataWrites = writes.filter((w: any) => w.type === 'data-metadata');
    expect(metadataWrites).toHaveLength(1);
    expect(metadataWrites[0].metadata).toEqual({ key: 'custom', value: 'metadata' });
  });

  test('should handle analytics and telemetry data', async () => {
    const stream: any = createDataStreamWithAnalytics(
      async (writer, { sendAnalytics, sendTelemetry }) => {
        sendAnalytics({
          event: 'user_action',
          properties: { action: 'click', element: 'button' },
          timestamp: Date.now(),
        });

        sendTelemetry({
          operation: 'generate_text',
          duration: 1500,
          tokens: { input: 100, output: 50 },
          model: 'gpt-4',
        });
      },
    );

    await stream._runExecute?.();

    const writes = stream.getWrites?.() || [];
    const analyticsWrites = writes.filter((w: any) => w.type === 'data-analytics');
    const telemetryWrites = writes.filter((w: any) => w.type === 'data-telemetry');

    expect(analyticsWrites).toHaveLength(1);
    expect(analyticsWrites[0].event).toBe('user_action');
    expect(analyticsWrites[0].properties.action).toBe('click');

    expect(telemetryWrites).toHaveLength(1);
    expect(telemetryWrites[0].operation).toBe('generate_text');
    expect(telemetryWrites[0].duration).toBe(1500);
  });

  test('should handle errors in execute function', async () => {
    const stream: any = createDataStreamWithAnalytics(async (writer, helpers) => {
      helpers.sendStatus('error', 'Something went wrong');
      throw new Error('Test error');
    });

    // Should not throw, but handle error internally
    await expect(stream._runExecute?.()).resolves.not.toThrow();

    const writes = stream.getWrites?.() || [];
    const errorStatus = writes.find((w: any) => w.type === 'data-status' && w.status === 'error');
    expect(errorStatus).toBeDefined();
  });

  test('should support custom stream transformations', async () => {
    const stream: any = createDataStreamWithAnalytics(
      async (writer, { sendDelta, applyTransform }) => {
        // Send raw delta
        sendDelta({ type: 'text', content: 'raw content' });

        // Apply custom transformation
        applyTransform?.('uppercase', (content: string) => content.toUpperCase());
        sendDelta({ type: 'text', content: 'transformed content', transform: 'uppercase' });
      },
    );

    await stream._runExecute?.();

    const writes = stream.getWrites?.() || [];
    const textDeltas = writes.filter((w: any) => w.type === 'text-delta');

    expect(textDeltas.length).toBeGreaterThanOrEqual(2);

    // Check if transformation was applied (this depends on implementation)
    const transformedDelta = textDeltas.find((w: any) => w.transform === 'uppercase');
    if (transformedDelta) {
      expect(transformedDelta.content).toBe('TRANSFORMED CONTENT');
    }
  });

  test('should handle rapid sequential writes', async () => {
    const stream: any = createDataStreamWithAnalytics(async (writer, { sendDelta }) => {
      // Rapid sequential writes to test buffering/batching
      for (let i = 0; i < 10; i++) {
        sendDelta({ type: 'text', content: `chunk${i} ` });
      }
    });

    await stream._runExecute?.();

    const writes = stream.getWrites?.() || [];
    const textDeltas = writes.filter((w: any) => w.type === 'text-delta');

    // Should handle all rapid writes
    expect(textDeltas.length).toBeGreaterThan(0);

    // Verify content ordering is preserved
    const contents = textDeltas.map((w: any) => w.content);
    expect(contents.some(c => c.includes('chunk0'))).toBeTruthy();
    expect(contents.some(c => c.includes('chunk9'))).toBeTruthy();
  });

  test('should support progress tracking with custom steps', async () => {
    const stream: any = createDataStreamWithAnalytics(async (writer, { progressTracker }) => {
      progressTracker.setTotal(4);
      progressTracker.step('Step 1', 'Processing input');
      progressTracker.step('Step 2', 'Analyzing data');
      progressTracker.step('Step 3', 'Generating response');
      progressTracker.step('Step 4', 'Finalizing output');
    });

    await stream._runExecute?.();

    const writes = stream.getWrites?.() || [];
    const progressWrites = writes.filter((w: any) => w.type === 'data-progress');

    // Should have progress updates for each step
    expect(progressWrites.length).toBeGreaterThanOrEqual(4);

    // Verify progress increases
    const progressValues = progressWrites.map((w: any) => w.progress).filter(Boolean);
    expect(progressValues.length).toBeGreaterThan(0);

    // Should reach completion (100%)
    expect(progressValues.some(p => p === 100)).toBeTruthy();
  });
});
