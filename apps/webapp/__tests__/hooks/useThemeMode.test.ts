import { useThemeMode } from '@/hooks/useThemeMode';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Unmock the hook for testing
vi.unmock('@/hooks/useThemeMode');

describe('useThemeMode', () => {
  let mockHtmlElement: HTMLElement;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock HTML element
    mockHtmlElement = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(() => false),
      },
    } as any;

    // Mock document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: mockHtmlElement,
      writable: true,
    });

    // Mock localStorage
    mockLocalStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should initialize with dark mode when localStorage has is-darkmode', async () => {
    mockLocalStorage['is-darkmode'] = 'true';

    const { result } = renderHook(() => useThemeMode());

    // Wait for useEffect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isDarkMode).toBeTruthy();
    expect(mockHtmlElement.classList.add).toHaveBeenCalledWith('dark');
  });

  test('should initialize with light mode when localStorage has is-lightmode', async () => {
    mockLocalStorage['is-lightmode'] = 'true';

    const { result } = renderHook(() => useThemeMode());

    // Wait for useEffect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isDarkMode).toBeFalsy();
    expect(mockHtmlElement.classList.remove).toHaveBeenCalledWith('dark');
  });

  test('should initialize with light mode when localStorage is empty', async () => {
    const { result } = renderHook(() => useThemeMode());

    // Wait for useEffect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isDarkMode).toBeFalsy();
  });

  test('should switch to dark mode', () => {
    const { result } = renderHook(() => useThemeMode());

    act(() => {
      result.current.toDark();
    });

    expect(result.current.isDarkMode).toBeTruthy();
    expect(mockHtmlElement.classList.add).toHaveBeenCalledWith('dark');
  });

  test('should switch to light mode', async () => {
    const { result } = renderHook(() => useThemeMode());

    // Wait for initial effect
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.toLight();
    });

    expect(result.current.isDarkMode).toBeFalsy();
    expect(mockHtmlElement.classList.remove).toHaveBeenCalledWith('dark');
  });

  test('should toggle from light to dark mode', async () => {
    const { result } = renderHook(() => useThemeMode());

    // Wait for initial effect
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.toogleDarkMode();
    });

    expect(result.current.isDarkMode).toBeTruthy();
    expect(mockHtmlElement.classList.add).toHaveBeenCalledWith('dark');
  });

  test('should toggle from dark to light mode', async () => {
    const { result } = renderHook(() => useThemeMode());

    // Wait for initial effect
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.toogleDarkMode();
    });

    expect(result.current.isDarkMode).toBeFalsy();
    expect(mockHtmlElement.classList.remove).toHaveBeenCalledWith('dark');
  });

  test('should handle missing html element gracefully', () => {
    // Remove document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: undefined,
      writable: true,
    });

    const { result } = renderHook(() => useThemeMode());

    // Should not throw error
    act(() => {
      result.current.toDark();
      result.current.toLight();
      result.current.toogleDarkMode();
    });

    expect(result.current.isDarkMode).toBeFalsy();
  });

  test('should not add dark class if already present', () => {
    vi.spyOn(mockHtmlElement.classList, 'contains').mockImplementation(() => true);

    const { result } = renderHook(() => useThemeMode());

    act(() => {
      result.current.toDark();
    });

    expect(mockHtmlElement.classList.add).not.toHaveBeenCalled();
  });

  test('should handle toggle when localStorage has no theme', () => {
    const { result } = renderHook(() => useThemeMode());

    act(() => {
      result.current.toogleDarkMode();
    });

    // Should default to switching to dark mode
    expect(result.current.isDarkMode).toBeTruthy();
  });

  test('should persist theme preference across hook instances', async () => {
    const { result: result1 } = renderHook(() => useThemeMode());

    act(() => {
      result1.current.toDark();
    });

    // Unmount first hook
    const { result: result2 } = renderHook(() => useThemeMode());

    // Wait for useEffect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Second hook should read from localStorage
    expect(result2.current.isDarkMode).toBeTruthy();
  });

  test('should handle multiple rapid toggles', () => {
    const { result } = renderHook(() => useThemeMode());

    act(() => {
      result.current.toogleDarkMode(); // light -> dark
      result.current.toogleDarkMode(); // dark -> light
      result.current.toogleDarkMode(); // light -> dark
    });

    expect(result.current.isDarkMode).toBeTruthy();
  });

  test('should handle invalid localStorage values', async () => {
    mockLocalStorage['is-darkmode'] = 'invalid';

    const { result } = renderHook(() => useThemeMode());

    // Wait for useEffect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should default to light mode
    expect(result.current.isDarkMode).toBeFalsy();
  });
});
