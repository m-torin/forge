import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { safeStringifyPure } from '@repo/core-utils/shared/stringify';
import { safeStringifyTool } from '../../src/tools/safe-stringify';

vi.mock('@repo/core-utils/shared/stringify', async orig => {
  const mod: any = await import('@repo/core-utils/shared/stringify');
  return {
    ...mod,
    safeStringifyPure: vi.fn(mod.safeStringifyPure),
  };
});

describe('safeStringifyTool branches', () => {
  const orig = safeStringifyPure as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    (safeStringifyPure as any as ReturnType<typeof vi.fn>).mockClear();
  });

  afterEach(() => {
    (safeStringifyPure as any as ReturnType<typeof vi.fn>).mockReset();
  });

  test('returns error content when stringify reports error', async () => {
    (safeStringifyPure as any as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      result: '[Stringify Error: boom]',
      metadata: { circularRefs: 0, truncated: false, originalLength: 0 },
    });

    const res = await safeStringifyTool.execute({ obj: { a: 1 } } as any);
    expect(res.isError).toBeTruthy();
    const parsed = JSON.parse(res.content[0].text);
    expect(parsed.error).toContain('Stringify Error');
  });

  test('includes metadata when requested', async () => {
    (safeStringifyPure as any as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      result: '{"a":1}',
      metadata: { circularRefs: 0, truncated: false, originalLength: 5 },
    });

    const res = await safeStringifyTool.execute({ obj: { a: 1 }, includeMetadata: true } as any);
    expect(res.metadata).toBeDefined();
  });

  test('handles exceptions thrown by underlying stringify', async () => {
    (safeStringifyPure as any as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error('kaboom');
    });
    const res = await safeStringifyTool.execute({ obj: { a: 1 } } as any);
    expect(res.isError).toBeTruthy();
    const parsed = JSON.parse(res.content[0].text);
    expect(parsed.error).toContain('Tool Error');
  });
});
