/**
 * AI SDK v5 RSC - AI Context Implementation
 * Create AI context for server components
 */

import { createAI as aiCreateAI } from '@ai-sdk/rsc';
import { logError, logInfo } from '@repo/observability/server/next';
import { type ReactNode } from 'react';
import {
  getChatUIState,
  getPersistedUIState,
  goToStep,
  nextStep,
  previousStep,
  setChatAIState,
  setPersistedAIState,
  submitForm,
  validateField,
} from './ai-actions';

/**
 * Enhanced createAI with additional features
 */
export function createAI<
  AIState = any,
  UIState = any,
  Actions extends Record<string, any> = Record<string, any>,
>(options: Parameters<typeof aiCreateAI<AIState, UIState, Actions>>[0]) {
  logInfo('RSC: Creating AI context', {
    operation: 'rsc_create_ai',
    metadata: {
      hasInitialAIState: !!options.initialAIState,
      hasInitialUIState: !!options.initialUIState,
      actionsCount: Object.keys(options.actions || {}).length,
    },
  });

  // Wrap actions with logging
  const wrappedActions = Object.entries(options.actions || {}).reduce(
    (acc, [name, action]) => ({
      ...acc,
      [name]: async (...args: any[]) => {
        logInfo(`RSC: Executing action '${name}'`, {
          operation: 'rsc_ai_action_execute',
          metadata: { actionName: name },
        });

        try {
          const result = await (action as any)(...args);

          logInfo(`RSC: Action '${name}' completed`, {
            operation: 'rsc_ai_action_complete',
            metadata: { actionName: name },
          });

          return result;
        } catch (error) {
          logError(`RSC: Action '${name}' failed`, {
            operation: 'rsc_ai_action_error',
            metadata: { actionName: name },
            error: error instanceof Error ? error : new Error(String(error)),
          });
          throw error;
        }
      },
    }),
    {} as Actions,
  );

  return aiCreateAI({
    ...options,
    actions: wrappedActions,
  });
}

/**
 * Create AI with middleware support
 */
export function createAIWithMiddleware<
  AIState = any,
  UIState = any,
  Actions extends Record<string, any> = Record<string, any>,
>(
  options: Parameters<typeof aiCreateAI<AIState, UIState, Actions>>[0] & {
    middleware?: {
      beforeAction?: (actionName: string, args: any[]) => void | Promise<void>;
      afterAction?: (actionName: string, result: any) => void | Promise<void>;
      onError?: (actionName: string, error: any) => void | Promise<void>;
    };
  },
) {
  const { middleware, ...aiOptions } = options;

  // Wrap actions with middleware
  const wrappedActions = Object.entries(aiOptions.actions || {}).reduce(
    (acc, [name, action]) => ({
      ...acc,
      [name]: async (...args: any[]) => {
        // Before action middleware
        if (middleware?.beforeAction) {
          await middleware.beforeAction(name, args);
        }

        try {
          const result = await (action as any)(...args);

          // After action middleware
          if (middleware?.afterAction) {
            await middleware.afterAction(name, result);
          }

          return result;
        } catch (error) {
          // Error middleware
          if (middleware?.onError) {
            await middleware.onError(name, error);
          }
          throw error;
        }
      },
    }),
    {} as Actions,
  );

  return createAI({
    ...aiOptions,
    actions: wrappedActions,
  });
}

/**
 * AI Context patterns
 */
export const aiContextPatterns = {
  /**
   * Chat context pattern
   */
  createChatContext: <T extends Record<string, any>>(
    actions: T,
    options?: {
      maxMessages?: number;
      sessionTimeout?: number;
    },
  ) => {
    type ChatAIState = {
      messages: Array<{
        id: string;
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp: number;
      }>;
      sessionId: string;
      createdAt: number;
    };

    type ChatUIState = {
      messages: Array<{
        id: string;
        display: ReactNode;
      }>;
    };

    return createAI<ChatAIState, ChatUIState, T>({
      actions,
      initialAIState: {
        messages: [],
        sessionId: Date.now().toString(),
        createdAt: Date.now(),
      },
      initialUIState: {
        messages: [],
      },
      onGetUIState: getChatUIState,
      onSetAIState: async ({ state }: { state: any }) => {
        // Trim messages if exceeding limit
        if (options?.maxMessages && state.messages.length > options.maxMessages) {
          state.messages = state.messages.slice(-options.maxMessages);
        }
        await setChatAIState({ state });
      },
    });
  },

  /**
   * Form context pattern
   */
  createFormContext: <T extends Record<string, any>>(
    actions: T,
    validationRules?: Record<string, (value: any) => boolean | string>,
  ) => {
    type FormAIState = {
      values: Record<string, any>;
      errors: Record<string, string>;
      touched: Record<string, boolean>;
      isSubmitting: boolean;
      submitCount: number;
    };

    type FormUIState = {
      fields: Array<{
        name: string;
        display: ReactNode;
      }>;
      isValid: boolean;
    };

    const contextActions = {
      ...actions,
      validateField: async (name: string, value: any) => {
        return await validateField(name, value, validationRules);
      },
      submitForm: async (values: Record<string, any>) => {
        return await submitForm(values, validationRules);
      },
    };

    return createAI<FormAIState, FormUIState, typeof contextActions>({
      actions: contextActions,
      initialAIState: {
        values: {},
        errors: {},
        touched: {},
        isSubmitting: false,
        submitCount: 0,
      },
      initialUIState: {
        fields: [],
        isValid: true,
      },
    });
  },

  /**
   * Workflow context pattern
   */
  createWorkflowContext: <T extends Record<string, any>>(
    actions: T,
    _workflow: {
      steps: Array<{
        id: string;
        name: string;
        validator?: (data: any) => boolean;
      }>;
    },
  ) => {
    type WorkflowAIState = {
      currentStep: number;
      completedSteps: string[];
      stepData: Record<string, any>;
      isComplete: boolean;
    };

    type WorkflowUIState = {
      currentStepDisplay: ReactNode;
      progress: number;
    };

    const contextActions = {
      ...actions,
      nextStep,
      previousStep,
      goToStep,
    };

    return createAI<WorkflowAIState, WorkflowUIState, typeof contextActions>({
      actions: contextActions,
      initialAIState: {
        currentStep: 0,
        completedSteps: [],
        stepData: {},
        isComplete: false,
      },
      initialUIState: {
        currentStepDisplay: null,
        progress: 0,
      },
    });
  },
};

/**
 * Create AI with state persistence
 */
export function createPersistedAI<
  AIState = any,
  UIState = any,
  Actions extends Record<string, any> = Record<string, any>,
>(
  options: Parameters<typeof aiCreateAI<AIState, UIState, Actions>>[0] & {
    storage?: {
      get: (key: string) => Promise<AIState | null>;
      set: (key: string, value: AIState) => Promise<void>;
      remove: (key: string) => Promise<void>;
    };
    storageKey?: string;
  },
) {
  const { storage, storageKey = 'ai-state', ...aiOptions } = options;

  return createAI({
    ...aiOptions,
    onGetUIState: async () => {
      return await getPersistedUIState(storage, storageKey, aiOptions.initialUIState);
    },
    onSetAIState: async ({ state, done, key }: any) => {
      return await setPersistedAIState(
        { state, done, key },
        storage,
        storageKey,
        aiOptions.onSetAIState as any,
      );
    },
  });
}

/**
 * Helper to create typed actions
 */
export function createTypedActions<T extends Record<string, (...args: any[]) => any>>(
  actions: T,
): T {
  return actions;
}
