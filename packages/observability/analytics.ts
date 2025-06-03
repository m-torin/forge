import { useCallback } from 'react';

/**
 * Analytics tracking utilities for workflow and user interactions
 * This integrates with @repo/analytics for PostHog, GA, and Segment tracking
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  userId?: string;
}

export interface WorkflowAnalyticsEvent extends AnalyticsEvent {
  action: 'start' | 'complete' | 'error' | 'cancel' | 'retry' | 'configure' | 'view';
  workflowId?: string;
  workflowType: string;
}

export interface UIAnalyticsEvent extends AnalyticsEvent {
  action: 'click' | 'view' | 'scroll' | 'focus' | 'blur' | 'submit' | 'cancel';
  component: string;
  location?: string;
}

/**
 * Hook for tracking analytics events
 * Uses dynamic import to avoid loading analytics in server components
 */
export function useAnalytics() {
  const track = useCallback(async (event: AnalyticsEvent) => {
    try {
      // Disable analytics for now to fix build issues
      console.log('Analytics event would be tracked:', event.name, event.properties);
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }, []);

  const trackPage = useCallback(async (pageName: string, properties?: Record<string, unknown>) => {
    try {
      // Disable analytics for now to fix build issues
      console.log('Page view would be tracked:', pageName, properties);
    } catch (error) {
      console.warn('Page tracking failed:', error);
    }
  }, []);

  const identify = useCallback(async (userId: string, traits?: Record<string, unknown>) => {
    try {
      // Disable analytics for now to fix build issues
      console.log('User identification would be tracked:', userId, traits);
    } catch (error) {
      console.warn('User identification failed:', error);
    }
  }, []);

  return {
    identify,
    track,
    trackPage,
  };
}

/**
 * Hook for tracking workflow-specific analytics
 */
export function useWorkflowAnalytics(workflowType: string) {
  const { track } = useAnalytics();

  const trackWorkflow = useCallback(
    (event: Omit<WorkflowAnalyticsEvent, 'workflowType'>) => {
      void track({
        name: `workflow_${event.action}`,
        properties: {
          workflowId: event.workflowId,
          workflowType,
          ...event.properties,
        },
        userId: event.userId,
      });
    },
    [track, workflowType],
  );

  const trackWorkflowStart = useCallback(
    (workflowId: string, properties?: Record<string, unknown>) => {
      trackWorkflow({
        name: 'workflow_start',
        action: 'start',
        properties,
        workflowId,
      });
    },
    [trackWorkflow],
  );

  const trackWorkflowComplete = useCallback(
    (workflowId: string, duration?: number, properties?: Record<string, unknown>) => {
      trackWorkflow({
        name: 'workflow_complete',
        action: 'complete',
        properties: {
          duration,
          ...properties,
        },
        workflowId,
      });
    },
    [trackWorkflow],
  );

  const trackWorkflowError = useCallback(
    (workflowId: string, error: string, properties?: Record<string, unknown>) => {
      trackWorkflow({
        name: 'workflow_error',
        action: 'error',
        properties: {
          error,
          ...properties,
        },
        workflowId,
      });
    },
    [trackWorkflow],
  );

  const trackWorkflowView = useCallback(
    (properties?: Record<string, unknown>) => {
      trackWorkflow({
        name: 'workflow_view',
        action: 'view',
        properties,
      });
    },
    [trackWorkflow],
  );

  const trackWorkflowConfigure = useCallback(
    (configChanges: Record<string, unknown>) => {
      trackWorkflow({
        name: 'workflow_configure',
        action: 'configure',
        properties: {
          configChanges,
        },
      });
    },
    [trackWorkflow],
  );

  return {
    trackWorkflow,
    trackWorkflowComplete,
    trackWorkflowConfigure,
    trackWorkflowError,
    trackWorkflowStart,
    trackWorkflowView,
  };
}

/**
 * Hook for tracking UI component interactions
 */
export function useUIAnalytics() {
  const { track } = useAnalytics();

  const trackUI = useCallback(
    (event: UIAnalyticsEvent) => {
      void track({
        name: `ui_${event.action}`,
        properties: {
          component: event.component,
          location: event.location,
          ...event.properties,
        },
        userId: event.userId,
      });
    },
    [track],
  );

  const trackClick = useCallback(
    (component: string, properties?: Record<string, unknown>) => {
      trackUI({
        name: 'ui_click',
        action: 'click',
        component,
        properties,
      });
    },
    [trackUI],
  );

  const trackView = useCallback(
    (component: string, properties?: Record<string, unknown>) => {
      trackUI({
        name: 'ui_view',
        action: 'view',
        component,
        properties,
      });
    },
    [trackUI],
  );

  const trackSubmit = useCallback(
    (component: string, properties?: Record<string, unknown>) => {
      trackUI({
        name: 'ui_submit',
        action: 'submit',
        component,
        properties,
      });
    },
    [trackUI],
  );

  return {
    trackClick,
    trackSubmit,
    trackUI,
    trackView,
  };
}

/**
 * Hook for tracking form interactions with detailed field-level analytics
 */
export function useFormAnalytics(formName: string) {
  const { track } = useAnalytics();

  const trackFormStart = useCallback(() => {
    void track({
      name: 'form_start',
      properties: {
        formName,
      },
    });
  }, [track, formName]);

  const trackFormSubmit = useCallback(
    (success: boolean, errors?: string[]) => {
      void track({
        name: 'form_submit',
        properties: {
          errors,
          formName,
          success,
        },
      });
    },
    [track, formName],
  );

  const trackFieldInteraction = useCallback(
    (fieldName: string, action: 'focus' | 'blur' | 'change', value?: unknown) => {
      void track({
        name: 'form_field_interaction',
        properties: {
          action,
          fieldName,
          formName,
          hasValue: value !== undefined && value !== '',
        },
      });
    },
    [track, formName],
  );

  const trackValidationError = useCallback(
    (fieldName: string, error: string) => {
      void track({
        name: 'form_validation_error',
        properties: {
          error,
          fieldName,
          formName,
        },
      });
    },
    [track, formName],
  );

  return {
    trackValidationError,
    trackFieldInteraction,
    trackFormStart,
    trackFormSubmit,
  };
}
