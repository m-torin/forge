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
 * Streamable UI patterns
 */
export const streamableUIPatterns: any = {
  /**
   * Progress indicator pattern
   */
  createProgressIndicator: (totalSteps: number) => {
    const ui = createStreamableUI(
      <div className="progress-indicator">
        <div className="progress-bar" style={{ width: '0%' }} />
        <span>0 / {totalSteps}</span>
      </div>,
    );

    return {
      ui,
      updateProgress: (currentStep: number) => {
        const percentage = (currentStep / totalSteps) * 100;
        ui.update(
          <div className="progress-indicator">
            <div className="progress-bar" style={{ width: `${percentage}%` }} />
            <span>
              {currentStep} / {totalSteps}
            </span>
          </div>,
        );
      },
      complete: () => {
        ui.done(
          <div className="progress-indicator complete">
            <div className="progress-bar" style={{ width: '100%' }} />
            <span>Complete!</span>
          </div>,
        );
      },
    };
  },

  /**
   * List builder pattern
   */
  createListBuilder: <T,>(renderItem: (item: T, index: number) => ReactNode) => {
    const items: T[] = [];
    const ui = createStreamableUI(<ul />);

    return {
      ui,
      addItem: (item: T) => {
        items.push(item);
        ui.update(
          <ul>
            {items.map((item, index) => (
              <li key={index}>{renderItem(item, index)}</li>
            ))}
          </ul>,
        );
      },
      removeItem: (index: number) => {
        items.splice(index, 1);
        ui.update(
          <ul>
            {items.map((item, index) => (
              <li key={index}>{renderItem(item, index)}</li>
            ))}
          </ul>,
        );
      },
      complete: () => {
        ui.done();
      },
    };
  },

  /**
   * Form builder pattern
   */
  createFormBuilder: () => {
    const fields: Record<string, any> = {};
    const ui = createStreamableUI(<form />);

    const updateForm = () => {
      ui.update(
        <form>
          {Object.entries(fields).map(([name, config]) => (
            <div key={name} className="form-field">
              <label>{config.label}</label>
              <input
                type={config.type || 'text'}
                name={name}
                value={config.value || ''}
                placeholder={config.placeholder}
              />
              {config.error && <span className="error">{config.error}</span>}
            </div>
          ))}
        </form>,
      );
    };

    return {
      ui,
      addField: (name: string, config: any) => {
        fields[name] = config;
        updateForm();
      },
      updateField: (name: string, updates: any) => {
        fields[name] = { ...fields[name], ...updates };
        updateForm();
      },
      setError: (name: string, error: string) => {
        if (fields[name]) {
          fields[name].error = error;
          updateForm();
        }
      },
      submit: (onSubmit: (data: Record<string, any>) => void) => {
        const data = Object.entries(fields).reduce(
          (acc, [name, config]) => ({
            ...acc,
            [name]: config.value,
          }),
          {},
        );
        onSubmit(data);
        ui.done(<div className="form-submitted">Form submitted successfully!</div>);
      },
    };
  },

  /**
   * Notification system pattern
   */
  createNotificationSystem: () => {
    const notifications: Array<{
      id: string;
      type: 'info' | 'success' | 'warning' | 'error';
      message: string;
    }> = [];
    const ui = createStreamableUI(<div className="notifications" />);

    const updateNotifications = () => {
      ui.update(
        <div className="notifications">
          {notifications.map(notif => (
            <div key={notif.id} className={`notification ${notif.type}`}>
              {notif.message}
            </div>
          ))}
        </div>,
      );
    };

    return {
      ui,
      notify: (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
        const id = Date.now().toString();
        notifications.push({ id, type, message });
        updateNotifications();

        // Auto-remove after 5 seconds
        setTimeout(() => {
          const index = notifications.findIndex(n => n.id === id);
          if (index !== -1) {
            notifications.splice(index, 1);
            updateNotifications();
          }
        }, 5000);
      },
      clear: () => {
        notifications.length = 0;
        updateNotifications();
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
