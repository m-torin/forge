import { devLog as logger } from '@repo/orchestration';

import { WorkflowEmailService } from './email-notifications';

import type { WorkflowRunDoc } from './firestore-service';

/**
 * Workflow Notification Configuration
 * Defines which workflows should send email notifications and when
 */

export interface WorkflowNotificationConfig {
  onApprovalRequired?: boolean;
  onComplete?: boolean;
  onFailure?: boolean;
  // Enable/disable notifications for specific events
  onStart?: boolean;

  customSubject?: string;
  includeDetails?: boolean;
  // Additional settings
  recipientEmail?: string;
  recipientUserId?: string;
}

// Default notification settings per workflow type
const DEFAULT_NOTIFICATION_CONFIG: Record<string, WorkflowNotificationConfig> = {
  // Critical workflows - always notify on failure
  'kitchen-sink': {
    includeDetails: true,
    onApprovalRequired: true,
    onComplete: true,
    onFailure: true,
    onStart: false,
  },

  // Long-running workflows - notify on start and completion
  'image-processing': {
    includeDetails: true,
    onApprovalRequired: false,
    onComplete: true,
    onFailure: true,
    onStart: true,
  },

  // Basic workflows - only notify on failure
  basic: {
    includeDetails: false,
    onApprovalRequired: true,
    onComplete: false,
    onFailure: true,
    onStart: false,
  },

  // Data workflows - notify on completion with results
  'chart-sitemaps': {
    includeDetails: true,
    onApprovalRequired: false,
    onComplete: true,
    onFailure: true,
    onStart: false,
  },

  'chart-pdps': {
    includeDetails: true,
    onApprovalRequired: false,
    onComplete: true,
    onFailure: true,
    onStart: false,
  },

  'map-taxterm': {
    includeDetails: true,
    onApprovalRequired: false,
    onComplete: true,
    onFailure: true,
    onStart: false,
  },

  'gen-copy': {
    includeDetails: true,
    onApprovalRequired: false,
    onComplete: true,
    onFailure: true,
    onStart: false,
  },
};

export class WorkflowNotificationService {
  /**
   * Get notification configuration for a workflow
   */
  static getNotificationConfig(
    workflowType: string,
    customConfig?: Partial<WorkflowNotificationConfig>,
  ): WorkflowNotificationConfig {
    const defaultConfig = DEFAULT_NOTIFICATION_CONFIG[workflowType] || {
      includeDetails: false,
      onApprovalRequired: true,
      onComplete: false,
      onFailure: true, // Always notify on failure by default
      onStart: false,
    };

    // Merge custom config with defaults
    return {
      ...defaultConfig,
      ...customConfig,
    };
  }

  /**
   * Check if notification should be sent for an event
   */
  static shouldNotify(
    workflowType: string,
    event: 'start' | 'complete' | 'failure' | 'approval',
    customConfig?: Partial<WorkflowNotificationConfig>,
  ): boolean {
    const config = this.getNotificationConfig(workflowType, customConfig);

    switch (event) {
      case 'start':
        return config.onStart || false;
      case 'complete':
        return config.onComplete || false;
      case 'failure':
        return config.onFailure || false;
      case 'approval':
        return config.onApprovalRequired || false;
      default:
        return false;
    }
  }

  /**
   * Send workflow started notification if configured
   */
  static async notifyWorkflowStarted(
    workflowRun: Partial<WorkflowRunDoc>,
    userEmail?: string,
    customConfig?: Partial<WorkflowNotificationConfig>,
  ): Promise<void> {
    if (!workflowRun.workflowType) return;

    const shouldSend = this.shouldNotify(workflowRun.workflowType, 'start', customConfig);
    if (!shouldSend) {
      logger.info('Skipping workflow start notification - not configured', {
        workflowRunId: workflowRun.workflowRunId,
        workflowType: workflowRun.workflowType,
      });
      return;
    }

    const config = this.getNotificationConfig(workflowRun.workflowType, customConfig);
    const recipientEmail = config.recipientEmail || userEmail;

    if (!recipientEmail) {
      logger.warn('Cannot send workflow start notification - no email provided');
      return;
    }

    try {
      await WorkflowEmailService.sendWorkflowStarted({
        userEmail: recipientEmail,
        workflowRun,
      });

      // Email sent tracking removed
    } catch (error) {
      logger.error('Failed to send workflow started email', error);
    }
  }

  /**
   * Send workflow completed notification if configured
   */
  static async notifyWorkflowCompleted(
    workflowRun: Partial<WorkflowRunDoc>,
    userEmail?: string,
    customConfig?: Partial<WorkflowNotificationConfig>,
  ): Promise<void> {
    if (!workflowRun.workflowType) return;

    const shouldSend = this.shouldNotify(workflowRun.workflowType, 'complete', customConfig);
    if (!shouldSend) {
      logger.info('Skipping workflow completion notification - not configured', {
        workflowRunId: workflowRun.workflowRunId,
        workflowType: workflowRun.workflowType,
      });
      return;
    }

    const config = this.getNotificationConfig(workflowRun.workflowType, customConfig);
    const recipientEmail = config.recipientEmail || userEmail;

    if (!recipientEmail) {
      logger.warn('Cannot send workflow completion notification - no email provided');
      return;
    }

    try {
      await WorkflowEmailService.sendWorkflowCompleted({
        userEmail: recipientEmail,
        workflowRun,
      });

      // Email sent tracking removed
    } catch (error) {
      logger.error('Failed to send workflow completed email', error);
    }
  }

  /**
   * Send workflow failed notification if configured
   */
  static async notifyWorkflowFailed(
    workflowRun: Partial<WorkflowRunDoc>,
    userEmail?: string,
    customConfig?: Partial<WorkflowNotificationConfig>,
  ): Promise<void> {
    if (!workflowRun.workflowType) return;

    const shouldSend = this.shouldNotify(workflowRun.workflowType, 'failure', customConfig);
    if (!shouldSend) {
      logger.info('Skipping workflow failure notification - not configured', {
        workflowRunId: workflowRun.workflowRunId,
        workflowType: workflowRun.workflowType,
      });
      return;
    }

    const config = this.getNotificationConfig(workflowRun.workflowType, customConfig);
    const recipientEmail = config.recipientEmail || userEmail;

    if (!recipientEmail) {
      logger.warn('Cannot send workflow failure notification - no email provided');
      return;
    }

    try {
      await WorkflowEmailService.sendWorkflowFailed({
        userEmail: recipientEmail,
        workflowRun,
      });

      // Email sent tracking removed
    } catch (error) {
      logger.error('Failed to send workflow failed email', error);
    }
  }

  /**
   * Send approval required notification if configured
   */
  static async notifyApprovalRequired(
    workflowRun: Partial<WorkflowRunDoc>,
    eventId: string,
    userEmail?: string,
    customConfig?: Partial<WorkflowNotificationConfig>,
  ): Promise<void> {
    if (!workflowRun.workflowType) return;

    const shouldSend = this.shouldNotify(workflowRun.workflowType, 'approval', customConfig);
    if (!shouldSend) {
      logger.info('Skipping approval required notification - not configured', {
        workflowRunId: workflowRun.workflowRunId,
        workflowType: workflowRun.workflowType,
      });
      return;
    }

    const config = this.getNotificationConfig(workflowRun.workflowType, customConfig);
    const recipientEmail = config.recipientEmail || userEmail;

    if (!recipientEmail) {
      logger.warn('Cannot send approval required notification - no email provided');
      return;
    }

    try {
      await WorkflowEmailService.sendApprovalRequired({
        eventId,
        userEmail: recipientEmail,
        workflowRun,
      });

      // Email sent tracking removed
    } catch (error) {
      logger.error('Failed to send approval required email', error);
    }
  }

  /**
   * Update notification configuration for a workflow type
   */
  static updateDefaultConfig(
    workflowType: string,
    config: Partial<WorkflowNotificationConfig>,
  ): void {
    DEFAULT_NOTIFICATION_CONFIG[workflowType] = {
      ...DEFAULT_NOTIFICATION_CONFIG[workflowType],
      ...config,
    };

    logger.info('Updated notification config for workflow type', {
      newConfig: DEFAULT_NOTIFICATION_CONFIG[workflowType],
      workflowType,
    });
  }

  /**
   * Get all notification configurations
   */
  static getAllConfigs(): Record<string, WorkflowNotificationConfig> {
    return { ...DEFAULT_NOTIFICATION_CONFIG };
  }

  /**
   * Parse notification preferences from workflow payload
   */
  static parseNotificationPreferences(
    payload: any,
  ): Partial<WorkflowNotificationConfig> | undefined {
    // Check for notification settings in various places
    const notifications =
      payload?.notifications ||
      payload?.options?.notifications ||
      payload?.config?.notifications ||
      payload?.settings?.notifications;

    if (!notifications || typeof notifications !== 'object') {
      return undefined;
    }

    // Parse and validate notification preferences
    const config: Partial<WorkflowNotificationConfig> = {};

    if (typeof notifications.onStart === 'boolean') {
      config.onStart = notifications.onStart;
    }
    if (typeof notifications.onComplete === 'boolean') {
      config.onComplete = notifications.onComplete;
    }
    if (typeof notifications.onFailure === 'boolean') {
      config.onFailure = notifications.onFailure;
    }
    if (typeof notifications.onApprovalRequired === 'boolean') {
      config.onApprovalRequired = notifications.onApprovalRequired;
    }
    if (typeof notifications.recipientEmail === 'string') {
      config.recipientEmail = notifications.recipientEmail;
    }
    if (typeof notifications.includeDetails === 'boolean') {
      config.includeDetails = notifications.includeDetails;
    }
    if (typeof notifications.customSubject === 'string') {
      config.customSubject = notifications.customSubject;
    }

    return Object.keys(config).length > 0 ? config : undefined;
  }
}
