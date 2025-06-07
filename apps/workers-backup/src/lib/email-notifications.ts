import { resend } from '@repo/email';
import { devLog as logger } from '@repo/orchestration';

import type { WorkflowRunDoc } from './firestore-service';

interface EmailNotificationOptions {
  userEmail?: string;
  userId?: string;
  workflowRun: Partial<WorkflowRunDoc>;
}

/**
 * Send workflow notification emails
 */
export class WorkflowEmailService {
  /**
   * Send workflow completion email
   */
  static async sendWorkflowCompleted(options: EmailNotificationOptions): Promise<void> {
    const { userEmail, workflowRun } = options;

    if (!userEmail) {
      logger.warn('Cannot send email - no user email provided');
      return;
    }

    try {
      await resend.emails.send({
        from: 'noreply@forge.app',
        html: `
          <h2>Workflow Completed</h2>
          <p>Your ${workflowRun.workflowType} workflow has completed successfully.</p>
          <p>Workflow ID: ${workflowRun.workflowRunId}</p>
          ${workflowRun.duration ? `<p>Duration: ${Math.round(workflowRun.duration / 1000)}s</p>` : ''}
          <p><a href="${process.env.NEXT_PUBLIC_URL}/monitoring?workflowRunId=${workflowRun.workflowRunId}">View Results</a></p>
        `,
        subject: `Workflow Completed: ${workflowRun.workflowType}`,
        to: userEmail,
      });

      logger.info('Sent workflow completion email:', {
        userEmail,
        workflowRunId: workflowRun.workflowRunId,
      });
    } catch (error) {
      logger.error('Failed to send workflow completion email:', error);
    }
  }

  /**
   * Send workflow failure email
   */
  static async sendWorkflowFailed(options: EmailNotificationOptions): Promise<void> {
    const { userEmail, workflowRun } = options;

    if (!userEmail) {
      logger.warn('Cannot send email - no user email provided');
      return;
    }

    try {
      await resend.emails.send({
        from: 'noreply@forge.app',
        html: `
          <h2>Workflow Failed</h2>
          <p>Your ${workflowRun.workflowType} workflow has failed.</p>
          <p>Workflow ID: ${workflowRun.workflowRunId}</p>
          ${workflowRun.error ? `<p>Error: ${workflowRun.error}</p>` : ''}
          ${workflowRun.duration ? `<p>Duration: ${Math.round(workflowRun.duration / 1000)}s</p>` : ''}
          <p><a href="${process.env.NEXT_PUBLIC_URL}/monitoring?workflowRunId=${workflowRun.workflowRunId}">View Error Details</a></p>
        `,
        subject: `Workflow Failed: ${workflowRun.workflowType}`,
        to: userEmail,
      });

      logger.info('Sent workflow failure email:', {
        userEmail,
        workflowRunId: workflowRun.workflowRunId,
      });
    } catch (error) {
      logger.error('Failed to send workflow failure email:', error);
    }
  }

  /**
   * Send workflow started email (for long-running workflows)
   */
  static async sendWorkflowStarted(options: EmailNotificationOptions): Promise<void> {
    const { userEmail, workflowRun } = options;

    if (!userEmail) {
      logger.warn('Cannot send email - no user email provided');
      return;
    }

    try {
      await resend.emails.send({
        from: 'noreply@forge.app',
        html: `
          <h2>Workflow Started</h2>
          <p>Your ${workflowRun.workflowType} workflow has started processing.</p>
          <p>Workflow ID: ${workflowRun.workflowRunId}</p>
          <p><a href="${process.env.NEXT_PUBLIC_URL}/monitoring?workflowRunId=${workflowRun.workflowRunId}">Monitor Progress</a></p>
        `,
        subject: `Workflow Started: ${workflowRun.workflowType}`,
        to: userEmail,
      });

      logger.info('Sent workflow started email:', {
        userEmail,
        workflowRunId: workflowRun.workflowRunId,
      });
    } catch (error) {
      logger.error('Failed to send workflow started email:', error);
    }
  }

  /**
   * Send workflow approval required email
   */
  static async sendApprovalRequired(
    options: EmailNotificationOptions & { eventId: string },
  ): Promise<void> {
    const { eventId, userEmail, workflowRun } = options;

    if (!userEmail) {
      logger.warn('Cannot send email - no user email provided');
      return;
    }

    try {
      await resend.emails.send({
        from: 'noreply@forge.app',
        html: `
          <h2>Approval Required</h2>
          <p>Your ${workflowRun.workflowType} workflow requires approval to continue.</p>
          <p>Workflow ID: ${workflowRun.workflowRunId}</p>
          <p>Event ID: ${eventId}</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_URL}/api/client/notify?eventId=${eventId}&action=approve">Approve</a> | 
            <a href="${process.env.NEXT_PUBLIC_URL}/api/client/notify?eventId=${eventId}&action=reject">Reject</a> | 
            <a href="${process.env.NEXT_PUBLIC_URL}/monitoring?workflowRunId=${workflowRun.workflowRunId}">View Workflow</a>
          </p>
        `,
        subject: `Approval Required: ${workflowRun.workflowType}`,
        to: userEmail,
      });

      logger.info('Sent approval required email:', {
        eventId,
        userEmail,
        workflowRunId: workflowRun.workflowRunId,
      });
    } catch (error) {
      logger.error('Failed to send approval required email:', error);
    }
  }

  /**
   * Send daily workflow summary email
   */
  static async sendDailySummary(options: {
    userEmail: string;
    date: string;
    stats: {
      totalRuns: number;
      successfulRuns: number;
      failedRuns: number;
      averageDuration: number;
      topWorkflowTypes: { type: string; count: number }[];
    };
  }): Promise<void> {
    const { date, stats, userEmail } = options;

    try {
      const successRate =
        stats.totalRuns > 0 ? ((stats.successfulRuns / stats.totalRuns) * 100).toFixed(1) : '0';

      await resend.emails.send({
        from: 'noreply@forge.app',
        html: `
          <h2>Workflow Daily Summary - ${date}</h2>
          <h3>Statistics:</h3>
          <ul>
            <li>Total Runs: ${stats.totalRuns}</li>
            <li>Successful: ${stats.successfulRuns}</li>
            <li>Failed: ${stats.failedRuns}</li>
            <li>Success Rate: ${successRate}%</li>
            <li>Average Duration: ${Math.round(stats.averageDuration / 1000)}s</li>
          </ul>
          <h3>Top Workflow Types:</h3>
          <ul>
            ${stats.topWorkflowTypes.map((wf) => `<li>${wf.type}: ${wf.count} runs</li>`).join('')}
          </ul>
          <p><a href="${process.env.NEXT_PUBLIC_URL}/monitoring">View Full Dashboard</a></p>
        `,
        subject: `Workflow Daily Summary - ${date}`,
        to: userEmail,
      });

      logger.info('Sent daily summary email:', { date, userEmail });
    } catch (error) {
      logger.error('Failed to send daily summary email:', error);
    }
  }
}
