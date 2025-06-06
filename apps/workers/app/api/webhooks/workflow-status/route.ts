import { WorkflowFirestoreService } from '@/lib/firestore-service';
import { verifyQStashWebhook } from '@/lib/webhook-auth';
import { WorkflowConfigService } from '@/lib/workflow-config-service';
import { WorkflowNotificationService } from '@/lib/workflow-notifications';
import { type NextRequest, NextResponse } from 'next/server';

import { classifyWorkflowError, devLog as logger } from '@repo/orchestration';

/**
 * Webhook endpoint for workflow status updates
 * Called by QStash to update workflow progress
 */

interface WorkflowStatusUpdate {
  duration?: number;
  error?: string;
  result?: any;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  step?: {
    name: string;
    status: 'running' | 'completed' | 'failed';
    error?: string;
  };
  workflowRunId: string;
}

export async function POST(request: NextRequest) {
  // Verify QStash webhook signature
  const verifyResult = await verifyQStashWebhook(request);
  if (verifyResult instanceof NextResponse) {
    return verifyResult;
  }

  try {
    const update: WorkflowStatusUpdate = await request.json();
    const { duration, error, result, status, step, workflowRunId } = update;

    logger.info('Received workflow status update:', { status, workflowRunId });

    // Update workflow run status
    await WorkflowFirestoreService.updateWorkflowRunStatus(workflowRunId, status, {
      ...(result && { result }),
      ...(error && { error }),
      ...(duration && { duration }),
    });

    // Add step if provided
    if (step) {
      await WorkflowFirestoreService.addWorkflowStep(workflowRunId, {
        error: step.error,
        status: step.status,
        stepName: step.name,
      });
    }

    // Get workflow run details for notifications and analytics
    const workflowRun = await WorkflowFirestoreService.getWorkflowRun(workflowRunId);

    if (workflowRun) {
      // Record execution in PostgreSQL
      await WorkflowConfigService.recordExecution({
        completedSteps: workflowRun.steps?.filter((s: any) => s.status === 'completed').length,
        duration,
        error,
        errorType: error ? classifyWorkflowError(new Error(error)) : undefined,
        organizationId: workflowRun.organizationId,
        status: status as any,
        stepCount: workflowRun.steps?.length,
        triggeredBy: 'webhook',
        triggerSource: request.headers.get('x-forwarded-for') || 'unknown',
        userId: workflowRun.userId,
        workflowRunId,
        workflowSlug: workflowRun.workflowType,
      });

      // Send notifications based on workflow config
      const notificationConfig = await WorkflowConfigService.getNotificationSettings(
        workflowRun.workflowType,
        { organizationId: workflowRun.organizationId, userId: workflowRun.userId },
      );

      const userEmail = notificationConfig.recipientEmail || workflowRun.metadata?.userEmail;

      if (status === 'completed' && notificationConfig.onComplete) {
        await WorkflowNotificationService.notifyWorkflowCompleted(workflowRun, userEmail);
      } else if (status === 'failed' && notificationConfig.onFailure) {
        await WorkflowNotificationService.notifyWorkflowFailed(workflowRun, userEmail);
      }

      // Update analytics on completion
      if (['cancelled', 'completed', 'failed'].includes(status) && duration) {
        const errorType = error ? classifyWorkflowError(new Error(error)) : undefined;

        await WorkflowFirestoreService.updateAnalytics({
          duration,
          errorType,
          organizationId: workflowRun.organizationId,
          status: status as 'completed' | 'failed' | 'cancelled',
          userId: workflowRun.userId,
          workflowType: workflowRun.workflowType,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to process workflow status update:', error);
    return NextResponse.json({ error: 'Failed to process update' }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    endpoint: 'workflow-status-webhook',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
