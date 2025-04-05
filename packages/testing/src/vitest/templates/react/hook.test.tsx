/**
 * React Hook Test Template
 *
 * This serves as a template for hook tests in the codebase.
 * Usage examples:
 * - Generate tests for hooks using the test generator
 * - Reference for consistent hook testing patterns
 */
import React from "react";
// @ts-ignore - Importing from a template file
import { renderHook, act } from "@repo/testing/vitest";

/**
 * Example hook test
 */
describe("useHookName", () => {
  it("returns the correct initial state", () => {
    // This is a placeholder for actual hook rendering
    const { result } = renderHook(() => {
      // Replace with actual hook
      const [count, setCount] = React.useState(0);
      const increment = () => setCount((c) => c + 1);
      return { count, increment };
    });

    // Assert the expected initial state
    // @ts-ignore - Jest-specific assertion methods
    expect(result.current.count).toBe(0);
  });

  it("updates state when actions are performed", () => {
    // This is a placeholder for actual hook rendering
    const { result } = renderHook(() => {
      // Replace with actual hook
      const [count, setCount] = React.useState(0);
      const increment = () => setCount((c) => c + 1);
      return { count, increment };
    });

    // Perform an action that should update the state
    act(() => {
      result.current.increment();
    });

    // Assert the expected state after the action
    // @ts-ignore - Jest-specific assertion methods
    expect(result.current.count).toBe(1);
  });

  it("handles prop changes correctly", () => {
    // Initial props for the hook
    const initialProps = { initialValue: 0 };

    // This is a placeholder for actual hook rendering
    const { result, rerender } = renderHook(
      (props) => {
        // Replace with actual hook
        const [value, setValue] = React.useState(props.initialValue);
        const increment = () => setValue((v) => v + 1);
        return { value, increment };
      },
      { initialProps },
    );

    // Assert initial state
    // @ts-ignore - Jest-specific assertion methods
    expect(result.current.value).toBe(0);

    // Rerender with new props
    rerender({ initialValue: 10 });

    // Assert that the state reflects the new props
    // Note: useState doesn't update when props change unless explicitly handled in the hook
    // This is just for example purposes
    // @ts-ignore - Jest-specific assertion methods
    expect(result.current.value).toBe(0);
  });
});

// Sample of a more complex hook test
export const complexHookTest = `
import { renderHook, act } from '@repo/testing/vitest';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should initialize with the given value', () => {
    const { result } = renderHook(() => useCounter(5));

    expect(result.current.count).toBe(5);
  });

  it('should increment the counter', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should decrement the counter', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  it('should not allow negative counts when preventNegative is true', () => {
    const { result } = renderHook(() => useCounter(0, { preventNegative: true }));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(0);
  });

  it('should reset the counter to the given value', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset(10);
    });

    expect(result.current.count).toBe(10);
  });
});
`;
