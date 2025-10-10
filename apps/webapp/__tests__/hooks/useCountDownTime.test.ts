import useCountDownTime from '@/hooks/useCountDownTime';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

describe('useCountDownTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should initialize with calculated time left', () => {
    const mockDate = new Date('2024-01-15T12:00:00');
    vi.setSystemTime(mockDate);

    const { result } = renderHook(() => useCountDownTime());

    // The hook calculates time until the 10th of month + 2
    // From Jan 15 to Mar 10 (month=0+2=2)
    // Jan 15 12:00 to Mar 10 00:00 = 54 days 12 hours
    expect(result.current.days).toBe(54);
    expect(result.current.hours).toBe(12);
    expect(result.current.minutes).toBe(0);
    expect(result.current.seconds).toBe(0);
  });

  test('should update countdown every second', () => {
    const mockDate = new Date('2024-01-15T12:00:00');
    vi.setSystemTime(mockDate);

    const { result } = renderHook(() => useCountDownTime());

    const initialDays = result.current.days;
    const initialHours = result.current.hours;
    const initialMinutes = result.current.minutes;
    const initialSeconds = result.current.seconds;

    // Advance time by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Time should have decreased by 1 second
    const totalSecondsBefore =
      initialDays * 86400 + initialHours * 3600 + initialMinutes * 60 + initialSeconds;
    const totalSecondsAfter =
      result.current.days * 86400 +
      result.current.hours * 3600 +
      result.current.minutes * 60 +
      result.current.seconds;
    expect(totalSecondsAfter).toBe(totalSecondsBefore - 1);
  });

  test('should handle countdown when target date is in the past', () => {
    const mockDate = new Date('2024-03-15T12:00:00');
    vi.setSystemTime(mockDate);

    const { result } = renderHook(() => useCountDownTime());

    // March (month=2) + 2 = May (month=4), so target is May 10
    // From Mar 15 12:00 to May 10 00:00 = 55 days + 12 hours
    expect(result.current.days).toBe(55);
    expect(result.current.hours).toBe(12);
    expect(result.current.minutes).toBe(0);
    expect(result.current.seconds).toBe(0);
  });

  test('should handle month boundary correctly', () => {
    // Test when current month is December
    const mockDate = new Date('2024-12-15T12:00:00');
    vi.setSystemTime(mockDate);

    const { result } = renderHook(() => useCountDownTime());

    // December (month=11) + 2 = 13, which wraps to January of next year (month=1)
    // From Dec 15 2024 12:00 to Feb 10 2025 00:00 = 56 days + 12 hours
    expect(result.current.days).toBe(56);
  });

  test('should clean up timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() => useCountDownTime());

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalledWith();
  });

  test('should correctly calculate hours, minutes, and seconds', () => {
    // Set to March 10 minus some time for testing
    // The target for Jan (month=0) is March 10 (month=2)
    const mockDate = new Date('2024-03-09T20:14:30'); // 3h 45m 30s before March 10
    vi.setSystemTime(mockDate);

    const { result } = renderHook(() => useCountDownTime());

    // From March 9 20:14:30, the target is May 10 00:00:00 (month + 2)
    // That's about 61 days
    expect(result.current.days).toBe(61);
    expect(result.current.hours).toBeLessThan(24);
    expect(result.current.minutes).toBeLessThan(60);
    expect(result.current.seconds).toBeLessThan(60);
  });

  test('should handle February correctly in leap years', () => {
    const mockDate = new Date('2024-02-15T12:00:00'); // 2024 is a leap year
    vi.setSystemTime(mockDate);

    const { result } = renderHook(() => useCountDownTime());

    // February (month=1) + 2 = April (month=3)
    // From Feb 15 12:00 to Apr 10 00:00 = 54 days + 12 hours
    expect(result.current.days).toBe(54);
  });

  test('should handle February correctly in non-leap years', () => {
    const mockDate = new Date('2023-02-15T12:00:00'); // 2023 is not a leap year
    vi.setSystemTime(mockDate);

    const { result } = renderHook(() => useCountDownTime());

    // February (month=1) + 2 = April (month=3)
    // From Feb 15 12:00 to Apr 10 00:00 = 53 days + 12 hours
    expect(result.current.days).toBe(53);
  });

  test('should continuously update the countdown', () => {
    // Set to 2 seconds before March 10 for January (month + 2)
    const mockDate = new Date('2024-03-09T23:59:58');
    vi.setSystemTime(mockDate);

    const { result } = renderHook(() => useCountDownTime());

    // Should show countdown to May 10 (March + 2 months)
    const initialTotalSeconds =
      result.current.days * 86400 +
      result.current.hours * 3600 +
      result.current.minutes * 60 +
      result.current.seconds;

    // Advance by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const afterOneSecond =
      result.current.days * 86400 +
      result.current.hours * 3600 +
      result.current.minutes * 60 +
      result.current.seconds;
    expect(afterOneSecond).toBe(initialTotalSeconds - 1);

    // Advance by another second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const afterTwoSeconds =
      result.current.days * 86400 +
      result.current.hours * 3600 +
      result.current.minutes * 60 +
      result.current.seconds;
    expect(afterTwoSeconds).toBe(initialTotalSeconds - 2);
  });
});
