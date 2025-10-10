import { characterCountAtom, editorAtom, wordCountAtom } from '@/state/atoms';
import { renderHook } from '@testing-library/react';
import { Provider, useAtomValue } from 'jotai';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

const wrapper = ({ children }: { children: ReactNode }) => <Provider>{children}</Provider>;

describe('useEditor hooks', () => {
  it('should initialize editor atom as null', () => {
    const { result } = renderHook(() => useAtomValue(editorAtom), { wrapper });
    expect(result.current).toBeNull();
  });

  it('should initialize character count as 0', () => {
    const { result } = renderHook(() => useAtomValue(characterCountAtom), {
      wrapper,
    });
    expect(result.current).toBe(0);
  });

  it('should initialize word count as 0', () => {
    const { result } = renderHook(() => useAtomValue(wordCountAtom), {
      wrapper,
    });
    expect(result.current).toBe(0);
  });
});
