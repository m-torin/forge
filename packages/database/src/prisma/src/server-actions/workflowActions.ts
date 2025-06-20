'use server';

import {
  // WorkflowConfig CRUD functions
  createWorkflowConfigOrm,
  findFirstWorkflowConfigOrm,
  findUniqueWorkflowConfigOrm,
  findManyWorkflowConfigsOrm,
  updateWorkflowConfigOrm,
  updateManyWorkflowConfigsOrm,
  upsertWorkflowConfigOrm,
  deleteWorkflowConfigOrm,
  deleteManyWorkflowConfigsOrm,
  aggregateWorkflowConfigsOrm,
  countWorkflowConfigsOrm,
  groupByWorkflowConfigsOrm,
  // WorkflowExecution CRUD functions
  createWorkflowExecutionOrm,
  findFirstWorkflowExecutionOrm,
  findUniqueWorkflowExecutionOrm,
  findManyWorkflowExecutionsOrm,
  updateWorkflowExecutionOrm,
  updateManyWorkflowExecutionsOrm,
  upsertWorkflowExecutionOrm,
  deleteWorkflowExecutionOrm,
  deleteManyWorkflowExecutionsOrm,
  aggregateWorkflowExecutionsOrm,
  countWorkflowExecutionsOrm,
  groupByWorkflowExecutionsOrm,
  // WorkflowSchedule CRUD functions
  createWorkflowScheduleOrm,
  findFirstWorkflowScheduleOrm,
  findUniqueWorkflowScheduleOrm,
  findManyWorkflowSchedulesOrm,
  updateWorkflowScheduleOrm,
  updateManyWorkflowSchedulesOrm,
  upsertWorkflowScheduleOrm,
  deleteWorkflowScheduleOrm,
  deleteManyWorkflowSchedulesOrm,
  aggregateWorkflowSchedulesOrm,
  countWorkflowSchedulesOrm,
  groupByWorkflowSchedulesOrm,
} from '../orm/workflowOrm';
import type { Prisma } from '../../../../prisma-generated/client';

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
