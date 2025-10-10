import { useCarouselArrowButtons } from '@/hooks/use-carousel-arrow-buttons';
import { act, renderHook } from '@testing-library/react';
import type { EmblaCarouselType } from 'embla-carousel';
import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('useCarouselArrowButtons', () => {
  let mockEmblaApi: Partial<EmblaCarouselType>;
  let eventHandlers: Record<string, Function[]>;

  beforeEach(() => {
    eventHandlers = {};

    mockEmblaApi = {
      canScrollPrev: vi.fn().mockReturnValue(true),
      canScrollNext: vi.fn().mockReturnValue(true),
      scrollPrev: vi.fn(),
      scrollNext: vi.fn(),
      on: vi.fn().mockImplementation((event, handler) => {
        if (!eventHandlers[event]) {
          eventHandlers[event] = [];
        }
        eventHandlers[event].push(handler);
        return mockEmblaApi;
      }),
    };
  });

  test('should initialize with correct disabled states', () => {
    (mockEmblaApi.canScrollPrev as any).mockReturnValue(false);
    (mockEmblaApi.canScrollNext as any).mockReturnValue(false);

    const { result } = renderHook(() => useCarouselArrowButtons(mockEmblaApi as EmblaCarouselType));

    expect(result.current.prevBtnDisabled).toBeTruthy();
    expect(result.current.nextBtnDisabled).toBeTruthy();
  });

  test('should handle undefined emblaApi', () => {
    const { result } = renderHook(() => useCarouselArrowButtons(undefined));

    expect(result.current.prevBtnDisabled).toBeTruthy();
    expect(result.current.nextBtnDisabled).toBeTruthy();

    // Clicking buttons should not throw errors
    act(() => {
      result.current.onPrevButtonClick();
      result.current.onNextButtonClick();
    });
  });

  test('should call scrollPrev when onPrevButtonClick is called', () => {
    const { result } = renderHook(() => useCarouselArrowButtons(mockEmblaApi as EmblaCarouselType));

    act(() => {
      result.current.onPrevButtonClick();
    });

    expect(mockEmblaApi.scrollPrev).toHaveBeenCalledTimes(1);
  });

  test('should call scrollNext when onNextButtonClick is called', () => {
    const { result } = renderHook(() => useCarouselArrowButtons(mockEmblaApi as EmblaCarouselType));

    act(() => {
      result.current.onNextButtonClick();
    });

    expect(mockEmblaApi.scrollNext).toHaveBeenCalledTimes(1);
  });

  test('should update button states when carousel can scroll', () => {
    (mockEmblaApi.canScrollPrev as any).mockReturnValue(true);
    (mockEmblaApi.canScrollNext as any).mockReturnValue(false);

    const { result } = renderHook(() => useCarouselArrowButtons(mockEmblaApi as EmblaCarouselType));

    expect(result.current.prevBtnDisabled).toBeFalsy();
    expect(result.current.nextBtnDisabled).toBeTruthy();
  });

  test('should register event handlers for reInit and select events', () => {
    renderHook(() => useCarouselArrowButtons(mockEmblaApi as EmblaCarouselType));

    expect(mockEmblaApi.on).toHaveBeenCalledWith('reInit', expect.any(Function));
    expect(mockEmblaApi.on).toHaveBeenCalledWith('select', expect.any(Function));
  });

  test('should update button states when select event is triggered', () => {
    const { result } = renderHook(() => useCarouselArrowButtons(mockEmblaApi as EmblaCarouselType));

    // Initially both buttons enabled
    expect(result.current.prevBtnDisabled).toBeFalsy();
    expect(result.current.nextBtnDisabled).toBeFalsy();

    // Change the mock return values
    (mockEmblaApi.canScrollPrev as any).mockReturnValue(false);
    (mockEmblaApi.canScrollNext as any).mockReturnValue(true);

    // Trigger the select event
    act(() => {
      eventHandlers['select']?.forEach(handler => handler(mockEmblaApi));
    });

    expect(result.current.prevBtnDisabled).toBeTruthy();
    expect(result.current.nextBtnDisabled).toBeFalsy();
  });

  test('should update button states when reInit event is triggered', () => {
    const { result } = renderHook(() => useCarouselArrowButtons(mockEmblaApi as EmblaCarouselType));

    // Change the mock return values
    (mockEmblaApi.canScrollPrev as any).mockReturnValue(false);
    (mockEmblaApi.canScrollNext as any).mockReturnValue(false);

    // Trigger the reInit event
    act(() => {
      eventHandlers['reInit']?.forEach(handler => handler(mockEmblaApi));
    });

    expect(result.current.prevBtnDisabled).toBeTruthy();
    expect(result.current.nextBtnDisabled).toBeTruthy();
  });

  test('should not call scroll methods when emblaApi is undefined', () => {
    const { result } = renderHook(() => useCarouselArrowButtons(undefined));

    act(() => {
      result.current.onPrevButtonClick();
      result.current.onNextButtonClick();
    });

    // Should not throw errors
    expect(true).toBeTruthy();
  });

  test('should handle carousel at the beginning (cannot scroll prev)', () => {
    (mockEmblaApi.canScrollPrev as any).mockReturnValue(false);
    (mockEmblaApi.canScrollNext as any).mockReturnValue(true);

    const { result } = renderHook(() => useCarouselArrowButtons(mockEmblaApi as EmblaCarouselType));

    expect(result.current.prevBtnDisabled).toBeTruthy();
    expect(result.current.nextBtnDisabled).toBeFalsy();
  });

  test('should handle carousel at the end (cannot scroll next)', () => {
    (mockEmblaApi.canScrollPrev as any).mockReturnValue(true);
    (mockEmblaApi.canScrollNext as any).mockReturnValue(false);

    const { result } = renderHook(() => useCarouselArrowButtons(mockEmblaApi as EmblaCarouselType));

    expect(result.current.prevBtnDisabled).toBeFalsy();
    expect(result.current.nextBtnDisabled).toBeTruthy();
  });

  test('should handle single item carousel (cannot scroll in any direction)', () => {
    (mockEmblaApi.canScrollPrev as any).mockReturnValue(false);
    (mockEmblaApi.canScrollNext as any).mockReturnValue(false);

    const { result } = renderHook(() => useCarouselArrowButtons(mockEmblaApi as EmblaCarouselType));

    expect(result.current.prevBtnDisabled).toBeTruthy();
    expect(result.current.nextBtnDisabled).toBeTruthy();
  });
});
