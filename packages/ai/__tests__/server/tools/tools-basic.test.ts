import { beforeEach, describe, expect, test, vi } from 'vitest';

/**
 * Basic Tools Tests
 *
 * Uses environment variables to control testing mode:
 * - INTEGRATION_TEST=true: Test with real tool functionality
 * - INTEGRATION_TEST=false/undefined: Use mocks (default)
 */

const IS_INTEGRATION_TEST = process.env.INTEGRATION_TEST === 'true';
const TEST_TIMEOUT = IS_INTEGRATION_TEST ? 30000 : 5000;

// Mock setup for unit tests
if (!IS_INTEGRATION_TEST) {
  vi.mock('@repo/observability', () => ({
    logInfo: vi.fn(),
    logWarn: vi.fn(),
    logError: vi.fn(),
  }));
}

describe('basic Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    if (IS_INTEGRATION_TEST) {
      console.log('🔗 Integration test mode - testing with real tools');
    } else {
      console.log('🤖 Mock test mode - using simulated tools');
    }
  });

  test('should import simple tools successfully', async () => {
    const simpleTools = await import('../../../src/server/tools/simple-tools');
    expect(simpleTools).toBeDefined();
    expect(simpleTools.tool).toBeDefined();

    console.log(
      IS_INTEGRATION_TEST
        ? '✅ Integration: Simple tools imported'
        : '✅ Mock: Simple tools imported',
    );
  });

  test(
    'should create and execute simple tools',
    async () => {
      const { tool } = await import('../../../src/server/tools/simple-tools');
      const { z } = await import('zod/v4');

      const testTool = tool({
        description: 'A test tool',
        inputSchema: z.object({
          input: z.string(),
        }),
        execute: async ({ input }) => `Result: ${input}`,
      });

      expect(testTool).toBeDefined();

      // Test the tool by calling it directly - in AI SDK v5, tools are called differently
      const result = await testTool.execute!(
        { input: 'test' },
        { toolCallId: 'test-call', messages: [] },
      );
      expect(result).toBe('Result: test');

      console.log(
        IS_INTEGRATION_TEST
          ? '✅ Integration: Simple tool executed'
          : '✅ Mock: Simple tool executed',
      );
    },
    TEST_TIMEOUT,
  );
});
