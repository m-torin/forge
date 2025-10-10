import { useCarouselDotButton } from '@/hooks/use-carousel-dot-buttons';
import { act, renderHook } from '@testing-library/react';
import type { EmblaCarouselType } from 'embla-carousel';
import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('useCarouselDotButton', () => {
  let mockEmblaApi: Partial<EmblaCarouselType>;
  let eventHandlers: Record<string, Function[]>;

  beforeEach(() => {
    eventHandlers = {};

    mockEmblaApi = {
      scrollSnapList: vi.fn().mockReturnValue([0, 1, 2, 3]),
      selectedScrollSnap: vi.fn().mockReturnValue(0),
      scrollTo: vi.fn(),
      on: vi.fn().mockImplementation((event, handler) => {
        if (!eventHandlers[event]) {
          eventHandlers[event] = [];
        }
        eventHandlers[event].push(handler);
        return mockEmblaApi;
      }),
    };
  });

  test('should initialize with correct values', () => {
    const { result } = renderHook(() => useCarouselDotButton(mockEmblaApi as EmblaCarouselType));

    expect(result.current.selectedIndex).toBe(0);
    expect(result.current.scrollSnaps).toStrictEqual([0, 1, 2, 3]);
  });

  test('should handle undefined emblaApi', () => {
    const { result } = renderHook(() => useCarouselDotButton(undefined));

    expect(result.current.selectedIndex).toBe(0);
    expect(result.current.scrollSnaps).toStrictEqual([]);

    // Clicking dot button should not throw errors
    act(() => {
      result.current.onDotButtonClick(1);
    });
  });

  test('should call scrollTo when onDotButtonClick is called', () => {
    const { result } = renderHook(() => useCarouselDotButton(mockEmblaApi as EmblaCarouselType));

    act(() => {
      result.current.onDotButtonClick(2);
    });

    expect(mockEmblaApi.scrollTo).toHaveBeenCalledWith(2);
  });

  test('should not call scrollTo when emblaApi is undefined', () => {
    const { result } = renderHook(() => useCarouselDotButton(undefined));

    act(() => {
      result.current.onDotButtonClick(2);
    });

    // Should not throw error
    expect(true).toBeTruthy();
  });

  test('should register event handlers for reInit and select events', () => {
    renderHook(() => useCarouselDotButton(mockEmblaApi as EmblaCarouselType));

    expect(mockEmblaApi.on).toHaveBeenCalledWith('reInit', expect.any(Function));
    expect(mockEmblaApi.on).toHaveBeenCalledWith('select', expect.any(Function));
  });

  test('should update scrollSnaps when reInit event is triggered', () => {
    const { result } = renderHook(() => useCarouselDotButton(mockEmblaApi as EmblaCarouselType));

    // Change the mock return value
    (mockEmblaApi.scrollSnapList as any).mockReturnValue([0, 1, 2, 3, 4, 5]);

    // Trigger the reInit event (first callback)
    act(() => {
      const reInitHandlers = eventHandlers['reInit'];
      if (reInitHandlers && reInitHandlers[0]) {
        reInitHandlers[0](mockEmblaApi);
      }
    });

    expect(result.current.scrollSnaps).toStrictEqual([0, 1, 2, 3, 4, 5]);
  });

  test('should update selectedIndex when select event is triggered', () => {
    const { result } = renderHook(() => useCarouselDotButton(mockEmblaApi as EmblaCarouselType));

    // Change the mock return value
    (mockEmblaApi.selectedScrollSnap as any).mockReturnValue(2);

    // Trigger the select event
    act(() => {
      eventHandlers['select']?.forEach(handler => handler(mockEmblaApi));
    });

    expect(result.current.selectedIndex).toBe(2);
  });

  test('should update selectedIndex when reInit event triggers select callback', () => {
    const { result } = renderHook(() => useCarouselDotButton(mockEmblaApi as EmblaCarouselType));

    // Change the mock return value
    (mockEmblaApi.selectedScrollSnap as any).mockReturnValue(3);

    // Trigger the reInit event (second callback for select)
    act(() => {
      const reInitHandlers = eventHandlers['reInit'];
      if (reInitHandlers && reInitHandlers[1]) {
        reInitHandlers[1](mockEmblaApi);
      }
    });

    expect(result.current.selectedIndex).toBe(3);
  });

  test('should handle empty scroll snap list', () => {
    (mockEmblaApi.scrollSnapList as any).mockReturnValue([]);

    const { result } = renderHook(() => useCarouselDotButton(mockEmblaApi as EmblaCarouselType));

    expect(result.current.scrollSnaps).toStrictEqual([]);
  });

  test('should handle large number of scroll snaps', () => {
    const largeSnapList = Array.from({ length: 100 }, (_, i) => i);
    (mockEmblaApi.scrollSnapList as any).mockReturnValue(largeSnapList);

    const { result } = renderHook(() => useCarouselDotButton(mockEmblaApi as EmblaCarouselType));

    expect(result.current.scrollSnaps).toStrictEqual(largeSnapList);
    expect(result.current.scrollSnaps).toHaveLength(100);
  });

  test('should handle clicking on current index', () => {
    (mockEmblaApi.selectedScrollSnap as any).mockReturnValue(2);

    const { result } = renderHook(() => useCarouselDotButton(mockEmblaApi as EmblaCarouselType));

    // Update selected index
    act(() => {
      eventHandlers['select']?.forEach(handler => handler(mockEmblaApi));
    });

    expect(result.current.selectedIndex).toBe(2);

    // Click on the same index
    act(() => {
      result.current.onDotButtonClick(2);
    });

    expect(mockEmblaApi.scrollTo).toHaveBeenCalledWith(2);
  });

  test('should handle out of bounds index gracefully', () => {
    const { result } = renderHook(() => useCarouselDotButton(mockEmblaApi as EmblaCarouselType));

    // Try to scroll to an index that doesn't exist
    act(() => {
      result.current.onDotButtonClick(10);
    });

    // Should still call scrollTo - Embla will handle bounds checking
    expect(mockEmblaApi.scrollTo).toHaveBeenCalledWith(10);
  });

  test('should handle negative index', () => {
    const { result } = renderHook(() => useCarouselDotButton(mockEmblaApi as EmblaCarouselType));

    act(() => {
      result.current.onDotButtonClick(-1);
    });

    // Should still call scrollTo - Embla will handle bounds checking
    expect(mockEmblaApi.scrollTo).toHaveBeenCalledWith(-1);
  });
});
