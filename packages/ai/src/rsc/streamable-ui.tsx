/**
 * AI SDK v5 RSC - Streamable UI Implementation
 * Create UI components that can be streamed and updated
 */

import { createStreamableUI as aiCreateStreamableUI } from '@ai-sdk/rsc';
import { logInfo } from '@repo/observability/server/next';
import { type ReactNode } from 'react';

// Type for streamable UI - using any for now due to experimental RSC API
type StreamableUI = any;

/**
 * Enhanced createStreamableUI with additional features
 */
export function createStreamableUI(initialValue?: ReactNode): any {
  logInfo('RSC: Creating streamable UI', {
    operation: 'rsc_create_streamable_ui',
    metadata: {
      hasInitialValue: !!initialValue,
    },
  });

  const streamable = aiCreateStreamableUI(initialValue);

  // Wrap methods with logging
  const originalUpdate = streamable.update.bind(streamable);
  const originalAppend = streamable.append.bind(streamable);
  const originalDone = streamable.done.bind(streamable);
  const originalError = streamable.error.bind(streamable);

  streamable.update = (value: ReactNode) => {
    logInfo('RSC: Streamable UI update', {
      operation: 'rsc_streamable_ui_update',
    });
    return originalUpdate(value);
  };

  streamable.append = (value: ReactNode) => {
    logInfo('RSC: Streamable UI append', {
      operation: 'rsc_streamable_ui_append',
    });
    return originalAppend(value);
  };

  streamable.done = (value?: ReactNode) => {
    logInfo('RSC: Streamable UI done', {
      operation: 'rsc_streamable_ui_done',
      metadata: {
        hasFinalValue: value !== undefined,
      },
    });
    return originalDone(value);
  };

  streamable.error = (error: any) => {
    logInfo('RSC: Streamable UI error', {
      operation: 'rsc_streamable_ui_error',
      metadata: {
        errorType: error?.constructor?.name || 'Unknown',
      },
    });
    return originalError(error);
  };

  return streamable;
}

/**
 * Create a streamable UI with lifecycle hooks
 */
export function createStreamableUIWithHooks(
  initialValue?: ReactNode,
  hooks?: {
    onUpdate?: (value: ReactNode) => void;
    onAppend?: (value: ReactNode) => void;
    onDone?: (value?: ReactNode) => void;
    onError?: (error: any) => void;
  },
): any {
  const streamable = createStreamableUI(initialValue);

  const originalUpdate = streamable.update.bind(streamable);
  const originalAppend = streamable.append.bind(streamable);
  const originalDone = streamable.done.bind(streamable);
  const originalError = streamable.error.bind(streamable);

  if (hooks?.onUpdate) {
    streamable.update = (value: ReactNode) => {
      hooks.onUpdate?.(value);
      return originalUpdate(value);
    };
  }

  if (hooks?.onAppend) {
    streamable.append = (value: ReactNode) => {
      hooks.onAppend?.(value);
      return originalAppend(value);
    };
  }

  if (hooks?.onDone) {
    streamable.done = (value?: ReactNode) => {
      hooks.onDone?.(value);
      return originalDone(value);
    };
  }

  if (hooks?.onError) {
    streamable.error = (error: any) => {
      hooks.onError?.(error);
      return originalError(error);
    };
  }

  return streamable;
}

/**
 * Core streamable UI utilities (non-UI-specific patterns)
 *
 * Note: UI-specific patterns have been moved to application layer.
 * This module now provides only core abstractions and utilities.
 */
export const streamableUIUtilities = {
  /**
   * Create a generic state manager for streamable UI
   */
  createStateManager: <T extends unknown>(initialState: T) => {
    let currentState = initialState;
    const listeners: Array<(state: T) => void> = [];

    return {
      getState: () => currentState,
      setState: (newState: T | ((prevState: T) => T)) => {
        currentState =
          typeof newState === 'function'
            ? (newState as (prevState: T) => T)(currentState)
            : newState;
        listeners.forEach(listener => listener(currentState));
      },
      subscribe: (listener: (state: T) => void) => {
        listeners.push(listener);
        return () => {
          const index = listeners.indexOf(listener);
          if (index > -1) listeners.splice(index, 1);
        };
      },
    };
  },

  /**
   * Create a generic data collector pattern
   */
  createDataCollector: <T extends unknown>() => {
    const items: T[] = [];
    const listeners: Array<(items: T[]) => void> = [];

    return {
      add: (item: T) => {
        items.push(item);
        listeners.forEach(listener => listener([...items]));
      },
      addMany: (newItems: T[]) => {
        items.push(...newItems);
        listeners.forEach(listener => listener([...items]));
      },
      remove: (index: number) => {
        items.splice(index, 1);
        listeners.forEach(listener => listener([...items]));
      },
      clear: () => {
        items.length = 0;
        listeners.forEach(listener => listener([]));
      },
      getItems: () => [...items],
      subscribe: (listener: (items: T[]) => void) => {
        listeners.push(listener);
        return () => {
          const index = listeners.indexOf(listener);
          if (index > -1) listeners.splice(index, 1);
        };
      },
    };
  },

  /**
   * Create a step-based progress tracker (UI-agnostic)
   */
  createProgressTracker: (totalSteps: number) => {
    let currentStep = 0;
    const listeners: Array<
      (progress: { current: number; total: number; percentage: number }) => void
    > = [];

    const notifyListeners = () => {
      const percentage = Math.round((currentStep / totalSteps) * 100);
      listeners.forEach(listener =>
        listener({
          current: currentStep,
          total: totalSteps,
          percentage,
        }),
      );
    };

    return {
      nextStep: () => {
        if (currentStep < totalSteps) {
          currentStep++;
          notifyListeners();
        }
      },
      setStep: (step: number) => {
        currentStep = Math.min(Math.max(0, step), totalSteps);
        notifyListeners();
      },
      complete: () => {
        currentStep = totalSteps;
        notifyListeners();
      },
      getProgress: () => ({
        current: currentStep,
        total: totalSteps,
        percentage: Math.round((currentStep / totalSteps) * 100),
      }),
      subscribe: (
        listener: (progress: { current: number; total: number; percentage: number }) => void,
      ) => {
        listeners.push(listener);
        return () => {
          const index = listeners.indexOf(listener);
          if (index > -1) listeners.splice(index, 1);
        };
      },
    };
  },
};

/**
 * Utility to manage multiple streamable UIs
 */
export class StreamableUIManager {
  private uis: Map<string, StreamableUI> = new Map();

  create(id: string, initialValue?: ReactNode): StreamableUI {
    const ui = createStreamableUI(initialValue);
    this.uis.set(id, ui);
    return ui;
  }

  get(id: string): StreamableUI | undefined {
    return this.uis.get(id);
  }

  update(id: string, value: ReactNode): void {
    const ui = this.uis.get(id);
    if (ui) {
      ui.update(value);
    }
  }

  append(id: string, value: ReactNode): void {
    const ui = this.uis.get(id);
    if (ui) {
      ui.append(value);
    }
  }

  done(id: string, value?: ReactNode): void {
    const ui = this.uis.get(id);
    if (ui) {
      ui.done(value);
      this.uis.delete(id);
    }
  }

  error(id: string, error: any): void {
    const ui = this.uis.get(id);
    if (ui) {
      ui.error(error);
      this.uis.delete(id);
    }
  }

  doneAll(): void {
    this.uis.forEach(ui => ui.done());
    this.uis.clear();
  }
}
