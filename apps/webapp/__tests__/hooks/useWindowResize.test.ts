import useWindowSize from '@/hooks/useWindowResize';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

describe('useWindowSize', () => {
  beforeEach(() => {
    // Mock window resize event
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should return initial window size', () => {
    const { result } = renderHook(() => useWindowSize());

    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
  });

  test('should update size on window resize', () => {
    const { result } = renderHook(() => useWindowSize());

    // Change window size
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(1920);
    expect(result.current.height).toBe(1080);
  });

  test('should handle multiple resize events', () => {
    const { result } = renderHook(() => useWindowSize());

    // First resize
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(800);
    expect(result.current.height).toBe(600);

    // Second resize
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 720, configurable: true });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(1280);
    expect(result.current.height).toBe(720);
  });

  test('should handle mobile screen sizes', () => {
    const { result } = renderHook(() => useWindowSize());

    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, configurable: true });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(375);
    expect(result.current.height).toBe(667);
  });

  test('should handle tablet screen sizes', () => {
    const { result } = renderHook(() => useWindowSize());

    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 768, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1024, configurable: true });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(768);
    expect(result.current.height).toBe(1024);
  });

  test('should handle zero dimensions', () => {
    const { result } = renderHook(() => useWindowSize());

    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 0, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 0, configurable: true });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(0);
    expect(result.current.height).toBe(0);
  });

  test('should handle very large screen sizes', () => {
    const { result } = renderHook(() => useWindowSize());

    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 5120, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 2880, configurable: true });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(5120);
    expect(result.current.height).toBe(2880);
  });

  test('should handle rapid resize events', () => {
    const { result } = renderHook(() => useWindowSize());

    act(() => {
      // Simulate rapid resizing
      for (let i = 100; i <= 500; i += 100) {
        Object.defineProperty(window, 'innerWidth', { value: i, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: i * 0.75, configurable: true });
        window.dispatchEvent(new Event('resize'));
      }
    });

    // Should have the last value
    expect(result.current.width).toBe(500);
    expect(result.current.height).toBe(375);
  });

  test('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useWindowSize());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
