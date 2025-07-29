'use server';

import type { Prisma } from '../../../../prisma-generated/client';
// WorkflowConfig imports
import {
  aggregateWorkflowConfigsOrm,
  countWorkflowConfigsOrm,
  createWorkflowConfigOrm,
  deleteManyWorkflowConfigsOrm,
  deleteWorkflowConfigOrm,
  findFirstWorkflowConfigOrm,
  findManyWorkflowConfigsOrm,
  findUniqueWorkflowConfigOrm,
  groupByWorkflowConfigsOrm,
  updateManyWorkflowConfigsOrm,
  updateWorkflowConfigOrm,
  upsertWorkflowConfigOrm,
} from '../orm/workflows/workflowConfigOrm';

// WorkflowAlert imports
import {
  aggregateWorkflowAlertsOrm,
  countWorkflowAlertsOrm,
  createWorkflowAlertOrm,
  deleteManyWorkflowAlertsOrm,
  deleteWorkflowAlertOrm,
  findFirstWorkflowAlertOrm,
  findManyWorkflowAlertsOrm,
  findUniqueWorkflowAlertOrm,
  groupByWorkflowAlertsOrm,
  updateManyWorkflowAlertsOrm,
  updateWorkflowAlertOrm,
  upsertWorkflowAlertOrm,
} from '../orm/workflows/workflowAlertOrm';

// WorkflowCheckpoint imports
import {
  aggregateWorkflowCheckpointsOrm,
  countWorkflowCheckpointsOrm,
  createCheckpointWithStateOrm,
  createWorkflowCheckpointOrm,
  deleteManyWorkflowCheckpointsOrm,
  deleteWorkflowCheckpointOrm,
  findFirstWorkflowCheckpointOrm,
  findManyWorkflowCheckpointsOrm,
  findUniqueWorkflowCheckpointOrm,
  groupByWorkflowCheckpointsOrm,
  updateManyWorkflowCheckpointsOrm,
  updateWorkflowCheckpointOrm,
  upsertWorkflowCheckpointOrm,
} from '../orm/workflows/workflowCheckpointOrm';

// WorkflowExecution imports
import {
  aggregateWorkflowExecutionsOrm,
  completeWorkflowExecutionOrm,
  countWorkflowExecutionsOrm,
  createWorkflowExecutionOrm,
  createWorkflowExecutionWithMetricsOrm,
  deleteManyWorkflowExecutionsOrm,
  deleteWorkflowExecutionOrm,
  findFirstWorkflowExecutionOrm,
  findManyWorkflowExecutionsOrm,
  findUniqueWorkflowExecutionOrm,
  getExecutionWithRelationsOrm,
  groupByWorkflowExecutionsOrm,
  updateExecutionProgressOrm,
  updateManyWorkflowExecutionsOrm,
  updateWorkflowExecutionOrm,
  upsertWorkflowExecutionOrm,
} from '../orm/workflows/workflowExecutionOrm';

// WorkflowMetrics imports
import {
  aggregateWorkflowMetricsOrm,
  countWorkflowMetricsOrm,
  createWorkflowMetricsOrm,
  deleteManyWorkflowMetricsOrm,
  deleteWorkflowMetricsOrm,
  findFirstWorkflowMetricsOrm,
  findManyWorkflowMetricsOrm,
  findUniqueWorkflowMetricsOrm,
  getWorkflowStatisticsOrm,
  groupByWorkflowMetricsOrm,
  updateManyWorkflowMetricsOrm,
  updateWorkflowMetricsOrm,
  upsertWorkflowMetricsOrm,
} from '../orm/workflows/workflowMetricsOrm';

// WorkflowSchedule imports
import {
  aggregateWorkflowSchedulesOrm,
  countWorkflowSchedulesOrm,
  createWorkflowScheduleOrm,
  deleteManyWorkflowSchedulesOrm,
  deleteWorkflowScheduleOrm,
  findFirstWorkflowScheduleOrm,
  findManyWorkflowSchedulesOrm,
  findUniqueWorkflowScheduleOrm,
  groupByWorkflowSchedulesOrm,
  updateManyWorkflowSchedulesOrm,
  updateWorkflowScheduleOrm,
  upsertWorkflowScheduleOrm,
} from '../orm/workflows/workflowScheduleOrm';

// WorkflowServiceUsage imports
import {
  aggregateWorkflowServiceUsagesOrm,
  countWorkflowServiceUsagesOrm,
  createWorkflowServiceUsageOrm,
  deleteManyWorkflowServiceUsagesOrm,
  deleteWorkflowServiceUsageOrm,
  findFirstWorkflowServiceUsageOrm,
  findManyWorkflowServiceUsagesOrm,
  findUniqueWorkflowServiceUsageOrm,
  groupByWorkflowServiceUsagesOrm,
  trackServiceUsageOrm,
  updateManyWorkflowServiceUsagesOrm,
  updateWorkflowServiceUsageOrm,
  upsertWorkflowServiceUsageOrm,
} from '../orm/workflows/workflowServiceUsageOrm';

//==============================================================================
// WORKFLOWCONFIG SERVER ACTIONS
//==============================================================================

export async function createWorkflowConfigAction(args: Prisma.WorkflowConfigCreateArgs) {
  'use server';
  return createWorkflowConfigOrm(args);
}

export async function findFirstWorkflowConfigAction(args?: Prisma.WorkflowConfigFindFirstArgs) {
  'use server';
  return findFirstWorkflowConfigOrm(args);
}

export async function findUniqueWorkflowConfigAction(args: Prisma.WorkflowConfigFindUniqueArgs) {
  'use server';
  return findUniqueWorkflowConfigOrm(args);
}

export async function findManyWorkflowConfigsAction(args?: Prisma.WorkflowConfigFindManyArgs) {
  'use server';
  return findManyWorkflowConfigsOrm(args);
}

export async function updateWorkflowConfigAction(args: Prisma.WorkflowConfigUpdateArgs) {
  'use server';
  return updateWorkflowConfigOrm(args);
}

export async function updateManyWorkflowConfigsAction(args: Prisma.WorkflowConfigUpdateManyArgs) {
  'use server';
  return updateManyWorkflowConfigsOrm(args);
}

export async function upsertWorkflowConfigAction(args: Prisma.WorkflowConfigUpsertArgs) {
  'use server';
  return upsertWorkflowConfigOrm(args);
}

export async function deleteWorkflowConfigAction(args: Prisma.WorkflowConfigDeleteArgs) {
  'use server';
  return deleteWorkflowConfigOrm(args);
}

export async function deleteManyWorkflowConfigsAction(args?: Prisma.WorkflowConfigDeleteManyArgs) {
  'use server';
  return deleteManyWorkflowConfigsOrm(args);
}

export async function aggregateWorkflowConfigsAction(args?: Prisma.WorkflowConfigAggregateArgs) {
  'use server';
  return aggregateWorkflowConfigsOrm(args);
}

export async function countWorkflowConfigsAction(args?: Prisma.WorkflowConfigCountArgs) {
  'use server';
  return countWorkflowConfigsOrm(args);
}

export async function groupByWorkflowConfigsAction(args: Prisma.WorkflowConfigGroupByArgs) {
  'use server';
  return groupByWorkflowConfigsOrm(args);
}

//==============================================================================
// WORKFLOWEXECUTION SERVER ACTIONS
//==============================================================================

export async function createWorkflowExecutionAction(args: Prisma.WorkflowExecutionCreateArgs) {
  'use server';
  return createWorkflowExecutionOrm(args);
}

export async function findFirstWorkflowExecutionAction(
  args?: Prisma.WorkflowExecutionFindFirstArgs,
) {
  'use server';
  return findFirstWorkflowExecutionOrm(args);
}

export async function findUniqueWorkflowExecutionAction(
  args: Prisma.WorkflowExecutionFindUniqueArgs,
) {
  'use server';
  return findUniqueWorkflowExecutionOrm(args);
}

export async function findManyWorkflowExecutionsAction(
  args?: Prisma.WorkflowExecutionFindManyArgs,
) {
  'use server';
  return findManyWorkflowExecutionsOrm(args);
}

export async function updateWorkflowExecutionAction(args: Prisma.WorkflowExecutionUpdateArgs) {
  'use server';
  return updateWorkflowExecutionOrm(args);
}

export async function updateManyWorkflowExecutionsAction(
  args: Prisma.WorkflowExecutionUpdateManyArgs,
) {
  'use server';
  return updateManyWorkflowExecutionsOrm(args);
}

export async function upsertWorkflowExecutionAction(args: Prisma.WorkflowExecutionUpsertArgs) {
  'use server';
  return upsertWorkflowExecutionOrm(args);
}

export async function deleteWorkflowExecutionAction(args: Prisma.WorkflowExecutionDeleteArgs) {
  'use server';
  return deleteWorkflowExecutionOrm(args);
}

export async function deleteManyWorkflowExecutionsAction(
  args?: Prisma.WorkflowExecutionDeleteManyArgs,
) {
  'use server';
  return deleteManyWorkflowExecutionsOrm(args);
}

export async function aggregateWorkflowExecutionsAction(
  args?: Prisma.WorkflowExecutionAggregateArgs,
) {
  'use server';
  return aggregateWorkflowExecutionsOrm(args);
}

export async function countWorkflowExecutionsAction(args?: Prisma.WorkflowExecutionCountArgs) {
  'use server';
  return countWorkflowExecutionsOrm(args);
}

export async function groupByWorkflowExecutionsAction(args: Prisma.WorkflowExecutionGroupByArgs) {
  'use server';
  return groupByWorkflowExecutionsOrm(args);
}

//==============================================================================
// WORKFLOWSCHEDULE SERVER ACTIONS
//==============================================================================

export async function createWorkflowScheduleAction(args: Prisma.WorkflowScheduleCreateArgs) {
  'use server';
  return createWorkflowScheduleOrm(args);
}

export async function findFirstWorkflowScheduleAction(args?: Prisma.WorkflowScheduleFindFirstArgs) {
  'use server';
  return findFirstWorkflowScheduleOrm(args);
}

export async function findUniqueWorkflowScheduleAction(
  args: Prisma.WorkflowScheduleFindUniqueArgs,
) {
  'use server';
  return findUniqueWorkflowScheduleOrm(args);
}

export async function findManyWorkflowSchedulesAction(args?: Prisma.WorkflowScheduleFindManyArgs) {
  'use server';
  return findManyWorkflowSchedulesOrm(args);
}

export async function updateWorkflowScheduleAction(args: Prisma.WorkflowScheduleUpdateArgs) {
  'use server';
  return updateWorkflowScheduleOrm(args);
}

export async function updateManyWorkflowSchedulesAction(
  args: Prisma.WorkflowScheduleUpdateManyArgs,
) {
  'use server';
  return updateManyWorkflowSchedulesOrm(args);
}

export async function upsertWorkflowScheduleAction(args: Prisma.WorkflowScheduleUpsertArgs) {
  'use server';
  return upsertWorkflowScheduleOrm(args);
}

export async function deleteWorkflowScheduleAction(args: Prisma.WorkflowScheduleDeleteArgs) {
  'use server';
  return deleteWorkflowScheduleOrm(args);
}

export async function deleteManyWorkflowSchedulesAction(
  args?: Prisma.WorkflowScheduleDeleteManyArgs,
) {
  'use server';
  return deleteManyWorkflowSchedulesOrm(args);
}

export async function aggregateWorkflowSchedulesAction(
  args?: Prisma.WorkflowScheduleAggregateArgs,
) {
  'use server';
  return aggregateWorkflowSchedulesOrm(args);
}

export async function countWorkflowSchedulesAction(args?: Prisma.WorkflowScheduleCountArgs) {
  'use server';
  return countWorkflowSchedulesOrm(args);
}

export async function groupByWorkflowSchedulesAction(args: Prisma.WorkflowScheduleGroupByArgs) {
  'use server';
  return groupByWorkflowSchedulesOrm(args);
}

//==============================================================================
// WORKFLOW BUSINESS LOGIC ACTIONS
//==============================================================================

// Create workflow execution
export async function createExecutionAction(
  workflowSlug: string,
  data: {
    error?: string;
    organizationId?: string;
    status: string;
    triggeredBy?: string;
    userId?: string;
    workflowRunId: string;
  },
) {
  'use server';

  return createWorkflowExecutionOrm({
    data: {
      error: data.error ?? null,
      organizationId: data.organizationId,
      startedAt: new Date(),
      status: data.status,
      triggeredBy: data.triggeredBy ?? 'api',
      userId: data.userId,
      workflowRunId: data.workflowRunId,
      workflowSlug,
    },
  });
}

// Get all workflows for an organization
export async function getOrganizationWorkflowsAction(organizationId: string) {
  'use server';

  return findManyWorkflowConfigsOrm({
    orderBy: { createdAt: 'desc' },
    where: {
      isEnabled: true,
      organizationId,
    },
  });
}

// Get workflow with execution history
export async function getWorkflowWithExecutionsAction(workflowId: string, limit = 20) {
  'use server';

  const workflow = await findFirstWorkflowConfigOrm({
    where: {
      id: workflowId,
    },
  });

  if (!workflow) return null;

  // Get executions separately since there's no direct relation
  const executions = await findManyWorkflowExecutionsOrm({
    orderBy: { startedAt: 'desc' },
    take: limit,
    where: {
      organizationId: workflow.organizationId,
      workflowSlug: workflow.workflowSlug,
    },
  });

  return {
    ...workflow,
    executions,
  };
}

// Update execution status
export async function updateExecutionStatusAction(
  executionId: string,
  status: string,
  data?: {
    error?: string;
  },
) {
  'use server';

  return updateWorkflowExecutionOrm({
    data: {
      completedAt: ['completed', 'failed'].includes(status) ? new Date() : undefined,
      error: data?.error ?? null,
      status,
    },
    where: { id: executionId },
  });
}

//==============================================================================
// WORKFLOWCHECKPOINT SERVER ACTIONS
//==============================================================================

export async function createWorkflowCheckpointAction(args: Prisma.WorkflowCheckpointCreateArgs) {
  'use server';
  return createWorkflowCheckpointOrm(args);
}

export async function findFirstWorkflowCheckpointAction(
  args?: Prisma.WorkflowCheckpointFindFirstArgs,
) {
  'use server';
  return findFirstWorkflowCheckpointOrm(args);
}

export async function findUniqueWorkflowCheckpointAction(
  args: Prisma.WorkflowCheckpointFindUniqueArgs,
) {
  'use server';
  return findUniqueWorkflowCheckpointOrm(args);
}

export async function findManyWorkflowCheckpointsAction(
  args?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  'use server';
  return findManyWorkflowCheckpointsOrm(args);
}

export async function updateWorkflowCheckpointAction(args: Prisma.WorkflowCheckpointUpdateArgs) {
  'use server';
  return updateWorkflowCheckpointOrm(args);
}

export async function updateManyWorkflowCheckpointsAction(
  args: Prisma.WorkflowCheckpointUpdateManyArgs,
) {
  'use server';
  return updateManyWorkflowCheckpointsOrm(args);
}

export async function upsertWorkflowCheckpointAction(args: Prisma.WorkflowCheckpointUpsertArgs) {
  'use server';
  return upsertWorkflowCheckpointOrm(args);
}

export async function deleteWorkflowCheckpointAction(args: Prisma.WorkflowCheckpointDeleteArgs) {
  'use server';
  return deleteWorkflowCheckpointOrm(args);
}

export async function deleteManyWorkflowCheckpointsAction(
  args?: Prisma.WorkflowCheckpointDeleteManyArgs,
) {
  'use server';
  return deleteManyWorkflowCheckpointsOrm(args);
}

export async function aggregateWorkflowCheckpointsAction(
  args?: Prisma.WorkflowCheckpointAggregateArgs,
) {
  'use server';
  return aggregateWorkflowCheckpointsOrm(args);
}

export async function countWorkflowCheckpointsAction(args?: Prisma.WorkflowCheckpointCountArgs) {
  'use server';
  return countWorkflowCheckpointsOrm(args);
}

export async function groupByWorkflowCheckpointsAction(args: Prisma.WorkflowCheckpointGroupByArgs) {
  'use server';
  return groupByWorkflowCheckpointsOrm(args);
}

//==============================================================================
// WORKFLOWMETRICS SERVER ACTIONS
//==============================================================================

export async function createWorkflowMetricsAction(args: Prisma.WorkflowMetricsCreateArgs) {
  'use server';
  return createWorkflowMetricsOrm(args);
}

export async function findFirstWorkflowMetricsAction(args?: Prisma.WorkflowMetricsFindFirstArgs) {
  'use server';
  return findFirstWorkflowMetricsOrm(args);
}

export async function findUniqueWorkflowMetricsAction(args: Prisma.WorkflowMetricsFindUniqueArgs) {
  'use server';
  return findUniqueWorkflowMetricsOrm(args);
}

export async function findManyWorkflowMetricsAction(args?: Prisma.WorkflowMetricsFindManyArgs) {
  'use server';
  return findManyWorkflowMetricsOrm(args);
}

export async function updateWorkflowMetricsAction(args: Prisma.WorkflowMetricsUpdateArgs) {
  'use server';
  return updateWorkflowMetricsOrm(args);
}

export async function updateManyWorkflowMetricsAction(args: Prisma.WorkflowMetricsUpdateManyArgs) {
  'use server';
  return updateManyWorkflowMetricsOrm(args);
}

export async function upsertWorkflowMetricsAction(args: Prisma.WorkflowMetricsUpsertArgs) {
  'use server';
  return upsertWorkflowMetricsOrm(args);
}

export async function deleteWorkflowMetricsAction(args: Prisma.WorkflowMetricsDeleteArgs) {
  'use server';
  return deleteWorkflowMetricsOrm(args);
}

export async function deleteManyWorkflowMetricsAction(args?: Prisma.WorkflowMetricsDeleteManyArgs) {
  'use server';
  return deleteManyWorkflowMetricsOrm(args);
}

export async function aggregateWorkflowMetricsAction(args?: Prisma.WorkflowMetricsAggregateArgs) {
  'use server';
  return aggregateWorkflowMetricsOrm(args);
}

export async function countWorkflowMetricsAction(args?: Prisma.WorkflowMetricsCountArgs) {
  'use server';
  return countWorkflowMetricsOrm(args);
}

export async function groupByWorkflowMetricsAction(args: Prisma.WorkflowMetricsGroupByArgs) {
  'use server';
  return groupByWorkflowMetricsOrm(args);
}

//==============================================================================
// WORKFLOWSERVICEUSAGE SERVER ACTIONS
//==============================================================================

export async function createWorkflowServiceUsageAction(
  args: Prisma.WorkflowServiceUsageCreateArgs,
) {
  'use server';
  return createWorkflowServiceUsageOrm(args);
}

export async function findFirstWorkflowServiceUsageAction(
  args?: Prisma.WorkflowServiceUsageFindFirstArgs,
) {
  'use server';
  return findFirstWorkflowServiceUsageOrm(args);
}

export async function findUniqueWorkflowServiceUsageAction(
  args: Prisma.WorkflowServiceUsageFindUniqueArgs,
) {
  'use server';
  return findUniqueWorkflowServiceUsageOrm(args);
}

export async function findManyWorkflowServiceUsagesAction(
  args?: Prisma.WorkflowServiceUsageFindManyArgs,
) {
  'use server';
  return findManyWorkflowServiceUsagesOrm(args);
}

export async function updateWorkflowServiceUsageAction(
  args: Prisma.WorkflowServiceUsageUpdateArgs,
) {
  'use server';
  return updateWorkflowServiceUsageOrm(args);
}

export async function updateManyWorkflowServiceUsagesAction(
  args: Prisma.WorkflowServiceUsageUpdateManyArgs,
) {
  'use server';
  return updateManyWorkflowServiceUsagesOrm(args);
}

export async function upsertWorkflowServiceUsageAction(
  args: Prisma.WorkflowServiceUsageUpsertArgs,
) {
  'use server';
  return upsertWorkflowServiceUsageOrm(args);
}

export async function deleteWorkflowServiceUsageAction(
  args: Prisma.WorkflowServiceUsageDeleteArgs,
) {
  'use server';
  return deleteWorkflowServiceUsageOrm(args);
}

export async function deleteManyWorkflowServiceUsagesAction(
  args?: Prisma.WorkflowServiceUsageDeleteManyArgs,
) {
  'use server';
  return deleteManyWorkflowServiceUsagesOrm(args);
}

export async function aggregateWorkflowServiceUsagesAction(
  args?: Prisma.WorkflowServiceUsageAggregateArgs,
) {
  'use server';
  return aggregateWorkflowServiceUsagesOrm(args);
}

export async function countWorkflowServiceUsagesAction(
  args?: Prisma.WorkflowServiceUsageCountArgs,
) {
  'use server';
  return countWorkflowServiceUsagesOrm(args);
}

export async function groupByWorkflowServiceUsagesAction(
  args: Prisma.WorkflowServiceUsageGroupByArgs,
) {
  'use server';
  return groupByWorkflowServiceUsagesOrm(args);
}

//==============================================================================
// WORKFLOWALERT SERVER ACTIONS
//==============================================================================

export async function createWorkflowAlertAction(args: Prisma.WorkflowAlertCreateArgs) {
  'use server';
  return createWorkflowAlertOrm(args);
}

export async function findFirstWorkflowAlertAction(args?: Prisma.WorkflowAlertFindFirstArgs) {
  'use server';
  return findFirstWorkflowAlertOrm(args);
}

export async function findUniqueWorkflowAlertAction(args: Prisma.WorkflowAlertFindUniqueArgs) {
  'use server';
  return findUniqueWorkflowAlertOrm(args);
}

export async function findManyWorkflowAlertsAction(args?: Prisma.WorkflowAlertFindManyArgs) {
  'use server';
  return findManyWorkflowAlertsOrm(args);
}

export async function updateWorkflowAlertAction(args: Prisma.WorkflowAlertUpdateArgs) {
  'use server';
  return updateWorkflowAlertOrm(args);
}

export async function updateManyWorkflowAlertsAction(args: Prisma.WorkflowAlertUpdateManyArgs) {
  'use server';
  return updateManyWorkflowAlertsOrm(args);
}

export async function upsertWorkflowAlertAction(args: Prisma.WorkflowAlertUpsertArgs) {
  'use server';
  return upsertWorkflowAlertOrm(args);
}

export async function deleteWorkflowAlertAction(args: Prisma.WorkflowAlertDeleteArgs) {
  'use server';
  return deleteWorkflowAlertOrm(args);
}

export async function deleteManyWorkflowAlertsAction(args?: Prisma.WorkflowAlertDeleteManyArgs) {
  'use server';
  return deleteManyWorkflowAlertsOrm(args);
}

export async function aggregateWorkflowAlertsAction(args?: Prisma.WorkflowAlertAggregateArgs) {
  'use server';
  return aggregateWorkflowAlertsOrm(args);
}

export async function countWorkflowAlertsAction(args?: Prisma.WorkflowAlertCountArgs) {
  'use server';
  return countWorkflowAlertsOrm(args);
}

export async function groupByWorkflowAlertsAction(args: Prisma.WorkflowAlertGroupByArgs) {
  'use server';
  return groupByWorkflowAlertsOrm(args);
}

//==============================================================================
// SPECIALIZED V3 WORKFLOW ACTIONS
//==============================================================================

// Create workflow execution with automatic metrics initialization
export async function createWorkflowExecutionWithMetricsAction(
  executionData: Prisma.WorkflowExecutionCreateInput,
  metricsData?: Partial<Prisma.WorkflowMetricsCreateInput>,
) {
  'use server';
  if (!metricsData) {
    throw new Error('metricsData is required');
  }
  return createWorkflowExecutionWithMetricsOrm(
    executionData,
    metricsData as Prisma.WorkflowMetricsCreateInput,
  );
}

// Update execution progress with automatic metric updates
export async function updateExecutionProgressAction(
  executionId: string,
  progressData: {
    status?: string;
    currentStep?: string;
    progressPercent?: number;
    completedSteps?: number;
    failedSteps?: number;
  },
  metricsUpdate?: Partial<Prisma.WorkflowMetricsUpdateInput>,
) {
  'use server';
  return updateExecutionProgressOrm(executionId, progressData, metricsUpdate);
}

// Create checkpoint with automatic state size calculation
export async function createCheckpointWithStateAction(
  checkpointData: Prisma.WorkflowCheckpointCreateInput,
) {
  'use server';
  return createCheckpointWithStateOrm(checkpointData);
}

// Track service usage with automatic cost calculation
export async function trackServiceUsageAction(usageData: Prisma.WorkflowServiceUsageCreateInput) {
  'use server';
  return trackServiceUsageOrm(usageData);
}

// Get execution with all relations
export async function getExecutionWithRelationsAction(executionId: string) {
  'use server';
  return getExecutionWithRelationsOrm(executionId);
}

// Complete workflow execution with final metrics
export async function completeWorkflowExecutionAction(
  executionId: string,
  completionData: {
    status: 'completed' | 'failed' | 'cancelled';
    outputPayload?: any;
    error?: string;
    errorType?: string;
    errorStack?: string;
  },
) {
  'use server';
  return completeWorkflowExecutionOrm(executionId, completionData);
}

// Get workflow statistics for a time range
export async function getWorkflowStatisticsAction(
  workflowSlug: string,
  timeRange?: { from: Date; to: Date },
) {
  'use server';
  const dateRange = timeRange ? { startDate: timeRange.from, endDate: timeRange.to } : undefined;
  return getWorkflowStatisticsOrm(workflowSlug, dateRange);
}
