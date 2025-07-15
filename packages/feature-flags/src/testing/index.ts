import { logError } from '@repo/observability';
import type { Adapter } from 'flags';

export function createMockAdapter<T>(value: T): Adapter<T, any> {
  return {
    decide: async () => value,
    config: { reportValue: false },
    origin: { provider: 'mock' },
  };
}

export function createMockAdapterWithLogic<T>(
  logic: (context: any) => T | Promise<T>,
): Adapter<T, any> {
  return {
    decide: async ({ entities, ...context }) => {
      return await logic({ entities, ...context });
    },
    config: { reportValue: false },
    origin: { provider: 'mock-logic' },
  };
}

// Common mock scenarios
export const mockAdapters = {
  alwaysTrue: createMockAdapter(true),
  alwaysFalse: createMockAdapter(false),
  variant: (variant: string) => createMockAdapter(variant),
  percentage: (percent: number) =>
    createMockAdapterWithLogic(context => {
      const hash = (context.entities?.userId || 'anonymous')
        .split('')
        .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      return hash % 100 < percent;
    }),
};

export async function createTestFlag<T>(key: string, value: T) {
  const { flag } = await import('flags/next');
  return flag({
    key,
    adapter: createMockAdapter(value),
    identify: async () => ({
      userId: 'test-user',
      visitorId: 'test-visitor',
    }),
  });
}

export async function testFlagEvaluation<T>(
  flagFunction: () => Promise<T>,
  expectedValue: T,
): Promise<boolean> {
  try {
    const result = await flagFunction();
    return result === expectedValue;
  } catch (error) {
    logError('Flag evaluation failed:', error);
    return false;
  }
}

// Integration with @repo/qa
export function setupFlagMocks(flags: Record<string, any>) {
  // Mock flag values for testing
  const mocks = Object.entries(flags).map(([key, value]) => ({
    key,
    mock: createMockAdapter(value),
  }));

  return mocks;
}
