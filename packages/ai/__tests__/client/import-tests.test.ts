import { describe, expect, vi } from 'vitest';

// Mock React and related hooks for client-side tests
vi.mock('react', () => ({
  useState: vi.fn(() => [null, vi.fn()]),
  useEffect: vi.fn(),
  useCallback: vi.fn(fn => fn),
  useMemo: vi.fn(fn => fn()),
  useRef: vi.fn(() => ({ current: null })),
  createContext: vi.fn(),
  useContext: vi.fn(),
  forwardRef: vi.fn(comp => comp),
}));

describe('client Module Imports', () => {
  test('should import client entry points', async () => {
    const modules = [() => import('@repo/ai/client'), () => import('@repo/ai/client/next')];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import client provider modules', async () => {
    const modules = [() => import('#/client/providers')];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import client utils', async () => {
    const modules = [() => import('#/client/utils')];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });

  test('should import hook modules', async () => {
    const modules = [
      () => import('#/hooks'),
      () => import('#/hooks/use-ai-stream'),
      () => import('#/hooks/use-classification'),
      () => import('#/hooks/use-moderation'),
    ];

    for (const importModule of modules) {
      const module = await importModule();
      expect(module).toBeDefined();
    }
  });
});
