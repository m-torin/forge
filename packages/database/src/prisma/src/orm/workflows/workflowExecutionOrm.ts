'use server';

import type { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

/**
 * Create a new workflow execution
 */
export async function createWorkflowExecutionOrm(args: Prisma.WorkflowExecutionCreateArgs) {
  try {
    return await prisma.workflowExecution.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Find first workflow execution matching criteria
 */
export async function findFirstWorkflowExecutionOrm(args?: Prisma.WorkflowExecutionFindFirstArgs) {
  return await prisma.workflowExecution.findFirst(args);
}

/**
 * Find unique workflow execution
 */
export async function findUniqueWorkflowExecutionOrm(args: Prisma.WorkflowExecutionFindUniqueArgs) {
  return await prisma.workflowExecution.findUnique(args);
}

/**
 * Find unique workflow execution or throw error if not found
 */
export async function findUniqueWorkflowExecutionOrmOrThrow(
  args: Prisma.WorkflowExecutionFindUniqueOrThrowArgs,
) {
  try {
    return await prisma.workflowExecution.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowExecution not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find many workflow executions
 */
export async function findManyWorkflowExecutionsOrm(args?: Prisma.WorkflowExecutionFindManyArgs) {
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Update workflow execution
 */
export async function updateWorkflowExecutionOrm(args: Prisma.WorkflowExecutionUpdateArgs) {
  try {
    return await prisma.workflowExecution.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowExecution not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update many workflow executions
 */
export async function updateManyWorkflowExecutionsOrm(
  args: Prisma.WorkflowExecutionUpdateManyArgs,
) {
  return await prisma.workflowExecution.updateMany(args);
}

/**
 * Upsert workflow execution
 */
export async function upsertWorkflowExecutionOrm(args: Prisma.WorkflowExecutionUpsertArgs) {
  try {
    return await prisma.workflowExecution.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Delete workflow execution
 */
export async function deleteWorkflowExecutionOrm(args: Prisma.WorkflowExecutionDeleteArgs) {
  try {
    return await prisma.workflowExecution.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowExecution not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Delete many workflow executions
 */
export async function deleteManyWorkflowExecutionsOrm(
  args?: Prisma.WorkflowExecutionDeleteManyArgs,
) {
  return await prisma.workflowExecution.deleteMany(args);
}

/**
 * Aggregate workflow execution data
 */
export async function aggregateWorkflowExecutionsOrm(args?: Prisma.WorkflowExecutionAggregateArgs) {
  return await prisma.workflowExecution.aggregate(args ?? {});
}

/**
 * Count workflow executions
 */
export async function countWorkflowExecutionsOrm(args?: Prisma.WorkflowExecutionCountArgs) {
  return await prisma.workflowExecution.count(args);
}

/**
 * Group workflow executions by specified fields
 */
export async function groupByWorkflowExecutionsOrm(args: Prisma.WorkflowExecutionGroupByArgs) {
  return await prisma.workflowExecution.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find workflow executions by workflow slug (leverages index)
 */
export async function findWorkflowExecutionsBySlugOrm(
  workflowSlug: string,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      workflowSlug: workflowSlug,
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions by user (leverages index)
 */
export async function findWorkflowExecutionsByUserOrm(
  userId: string,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: userId,
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions by organization (leverages index)
 */
export async function findWorkflowExecutionsByOrganizationOrm(
  organizationId: string,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      organizationId: organizationId,
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions by status
 */
export async function findWorkflowExecutionsByStatusOrm(
  status: string,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: status,
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find pending workflow executions
 */
export async function findPendingWorkflowExecutionsOrm(
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'pending',
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find running workflow executions
 */
export async function findRunningWorkflowExecutionsOrm(
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'running',
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find completed workflow executions
 */
export async function findCompletedWorkflowExecutionsOrm(
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'completed',
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find failed workflow executions
 */
export async function findFailedWorkflowExecutionsOrm(
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'failed',
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions by trigger type
 */
export async function findWorkflowExecutionsByTriggerOrm(
  triggeredBy: string,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      triggeredBy: triggeredBy,
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions with output
 */
export async function findWorkflowExecutionsWithOutputOrm(
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      hasOutput: true,
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions without output
 */
export async function findWorkflowExecutionsWithoutOutputOrm(
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      hasOutput: false,
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions with errors
 */
export async function findWorkflowExecutionsWithErrorsOrm(
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      error: {
        not: null,
      },
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions by error type
 */
export async function findWorkflowExecutionsByErrorTypeOrm(
  errorType: string,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      errorType: errorType,
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions by current step
 */
export async function findWorkflowExecutionsByCurrentStepOrm(
  currentStep: string,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      currentStep: currentStep,
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions by progress percentage range
 */
export async function findWorkflowExecutionsByProgressRangeOrm(
  minProgress: number,
  maxProgress: number,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      progressPercent: {
        gte: minProgress,
        lte: maxProgress,
      },
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions with specific tag
 */
export async function findWorkflowExecutionsWithTagOrm(
  tag: string,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      tags: {
        has: tag,
      },
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find scheduled workflow executions
 */
export async function findScheduledWorkflowExecutionsOrm(
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      scheduledFor: {
        not: null,
      },
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions scheduled for specific date range
 */
export async function findWorkflowExecutionsScheduledBetweenOrm(
  startDate: Date,
  endDate: Date,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      scheduledFor: {
        gte: startDate,
        lte: endDate,
      },
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

/**
 * Find child workflow executions (retries) of a specific parent
 */
export async function findWorkflowExecutionRetriesOrm(
  parentExecutionId: string,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      retryOfExecutionId: parentExecutionId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow execution with all its retries
 */
export async function findWorkflowExecutionWithRetriesOrm(id: string) {
  return await prisma.workflowExecution.findUnique({
    where: { id },
    include: {
      retries: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

/**
 * Find original workflow execution for a retry
 */
export async function findOriginalWorkflowExecutionOrm(retryExecutionId: string) {
  const retry = await prisma.workflowExecution.findUnique({
    where: { id: retryExecutionId },
    include: {
      originalExecution: true,
    },
  });
  return retry?.originalExecution;
}

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find workflow executions with checkpoints
 */
export async function findWorkflowExecutionsWithCheckpointsOrm(
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      checkpoints: {
        some: {},
      },
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions with metrics
 */
export async function findWorkflowExecutionsWithMetricsOrm(
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      metrics: {
        isNot: null,
      },
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions with service usage records
 */
export async function findWorkflowExecutionsWithServiceUsageOrm(
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      serviceUsage: {
        some: {},
      },
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions with alerts
 */
export async function findWorkflowExecutionsWithAlertsOrm(
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      alerts: {
        some: {},
      },
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow execution with all relations included
 */
export async function findWorkflowExecutionWithAllRelationsOrm(id: string) {
  return await prisma.workflowExecution.findUnique({
    where: { id },
    include: {
      checkpoints: {
        orderBy: { createdAt: 'asc' },
      },
      metrics: true,
      serviceUsage: {
        orderBy: { startedAt: 'asc' },
      },
      alerts: {
        orderBy: { createdAt: 'desc' },
      },
      retries: {
        orderBy: { createdAt: 'asc' },
      },
      originalExecution: true,
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find workflow executions created after a specific date
 */
export async function findWorkflowExecutionsCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      createdAt: {
        gte: date,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions updated after a specific date
 */
export async function findWorkflowExecutionsUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      updatedAt: {
        gte: date,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions started after a specific date (leverages index)
 */
export async function findWorkflowExecutionsStartedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      startedAt: {
        gte: date,
      },
    },
    orderBy: {
      startedAt: 'desc',
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions completed after a specific date
 */
export async function findWorkflowExecutionsCompletedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      completedAt: {
        gte: date,
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find recently created or updated workflow executions within specified days
 */
export async function findRecentWorkflowExecutionsOrm(
  days: number = 7,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      OR: [
        {
          createdAt: {
            gte: cutoffDate,
          },
        },
        {
          updatedAt: {
            gte: cutoffDate,
          },
        },
      ],
    },
    orderBy: {
      updatedAt: 'desc',
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find workflow execution by unique workflowRunId (leverages unique index)
 */
export async function findWorkflowExecutionByRunIdOrm(workflowRunId: string) {
  return await prisma.workflowExecution.findUnique({
    where: { workflowRunId },
  });
}

/**
 * Search workflow executions by input payload hash
 */
export async function findWorkflowExecutionsByInputHashOrm(
  inputPayloadHash: string,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      inputPayloadHash: inputPayloadHash,
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find organization workflow executions by status and start date (leverages composite index)
 */
export async function findOrganizationWorkflowExecutionsByStatusAndDateOrm(
  organizationId: string,
  status: string,
  startDate: Date,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      organizationId: organizationId,
      status: status,
      startedAt: {
        gte: startDate,
      },
    },
    orderBy: {
      startedAt: 'desc',
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find user workflow executions by status (leverages composite index)
 */
export async function findUserWorkflowExecutionsByStatusOrm(
  userId: string,
  status: string,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: userId,
      status: status,
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions for monitoring (leverages monitoring index)
 */
export async function findWorkflowExecutionsForMonitoringOrm(
  workflowSlug: string,
  status: string,
  startDate: Date,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      workflowSlug: workflowSlug,
      status: status,
      startedAt: {
        gte: startDate,
      },
    },
    orderBy: {
      startedAt: 'desc',
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find long-running workflow executions (duration above threshold)
 */
export async function findLongRunningWorkflowExecutionsOrm(
  durationThresholdMs: number,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      duration: {
        gte: durationThresholdMs,
      },
    },
    orderBy: {
      duration: 'desc',
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

/**
 * Find workflow executions by cost range (in cents)
 */
export async function findWorkflowExecutionsByCostRangeOrm(
  minCostCents: number,
  maxCostCents: number,
  additionalArgs?: Prisma.WorkflowExecutionFindManyArgs,
) {
  const args: Prisma.WorkflowExecutionFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      totalCostCents: {
        gte: minCostCents,
        lte: maxCostCents,
      },
    },
  };
  return await prisma.workflowExecution.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * WorkflowExecution with checkpoints relation
 */
export type WorkflowExecutionWithCheckpoints = Prisma.WorkflowExecutionGetPayload<{
  include: { checkpoints: true };
}>;

/**
 * WorkflowExecution with metrics relation
 */
export type WorkflowExecutionWithMetrics = Prisma.WorkflowExecutionGetPayload<{
  include: { metrics: true };
}>;

/**
 * WorkflowExecution with service usage relation
 */
export type WorkflowExecutionWithServiceUsage = Prisma.WorkflowExecutionGetPayload<{
  include: { serviceUsage: true };
}>;

/**
 * WorkflowExecution with alerts relation
 */
export type WorkflowExecutionWithAlerts = Prisma.WorkflowExecutionGetPayload<{
  include: { alerts: true };
}>;

/**
 * WorkflowExecution with retries relation
 */
export type WorkflowExecutionWithRetries = Prisma.WorkflowExecutionGetPayload<{
  include: { retries: true };
}>;

/**
 * WorkflowExecution with all relations for complete data access
 */
export type WorkflowExecutionWithAllRelations = Prisma.WorkflowExecutionGetPayload<{
  include: {
    checkpoints: true;
    metrics: true;
    serviceUsage: true;
    alerts: true;
    retries: true;
    originalExecution: true;
  };
}>;

/**
 * WorkflowExecution search result type for optimized queries
 */
export type WorkflowExecutionSearchResult = Prisma.WorkflowExecutionGetPayload<{
  select: {
    id: true;
    workflowRunId: true;
    workflowSlug: true;
    status: true;
    startedAt: true;
    completedAt: true;
    duration: true;
    userId: true;
    organizationId: true;
    triggeredBy: true;
    hasOutput: true;
    progressPercent: true;
    totalCostCents: true;
    _count: {
      select: {
        checkpoints: true;
        serviceUsage: true;
        alerts: true;
        retries: true;
      };
    };
  };
}>;

/**
 * WorkflowExecution with monitoring data
 */
export type WorkflowExecutionMonitoring = Prisma.WorkflowExecutionGetPayload<{
  select: {
    id: true;
    workflowRunId: true;
    workflowSlug: true;
    status: true;
    startedAt: true;
    completedAt: true;
    duration: true;
    progressPercent: true;
    currentStep: true;
    stepCount: true;
    completedSteps: true;
    failedSteps: true;
    retryCount: true;
    error: true;
    errorType: true;
    totalCostCents: true;
    qualityScore: true;
  };
}>;

/**
 * WorkflowExecution with performance metrics
 */
export type WorkflowExecutionPerformance = Prisma.WorkflowExecutionGetPayload<{
  select: {
    id: true;
    workflowSlug: true;
    duration: true;
    stepCount: true;
    completedSteps: true;
    apiCallCount: true;
    totalCostCents: true;
    creditsUsed: true;
    aiTokensUsed: true;
    storageBytes: true;
    emailsSent: true;
    imagesProcessed: true;
  };
}>;

/**
 * WorkflowExecution retry chain result
 */
export type WorkflowExecutionRetryChain = Prisma.WorkflowExecutionGetPayload<{
  include: {
    retries: {
      select: {
        id: true;
        status: true;
        startedAt: true;
        completedAt: true;
        retryCount: true;
        error: true;
      };
    };
    originalExecution: {
      select: {
        id: true;
        workflowRunId: true;
        status: true;
        startedAt: true;
      };
    };
  };
}>;

//==============================================================================
// SPECIALIZED WORKFLOW EXECUTION OPERATIONS
//==============================================================================

/**
 * Create a workflow execution with associated metrics
 */
export async function createWorkflowExecutionWithMetricsOrm(
  executionData: Prisma.WorkflowExecutionCreateInput,
  metricsData: Prisma.WorkflowMetricsCreateInput,
) {
  try {
    return await prisma.$transaction(async tx => {
      const execution = await tx.workflowExecution.create({
        data: executionData,
      });

      const { execution: _, ...metrics_data } = metricsData;
      const metrics = await tx.workflowMetrics.create({
        data: {
          ...metrics_data,
          executionId: execution.id,
        },
      });

      return { execution, metrics };
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Update execution progress and associated metrics
 */
export async function updateExecutionProgressOrm(
  executionId: string,
  progressData: Partial<Prisma.WorkflowExecutionUpdateInput>,
  metricsUpdate?: Partial<Prisma.WorkflowMetricsUpdateInput>,
) {
  try {
    return await prisma.$transaction(async tx => {
      const execution = await tx.workflowExecution.update({
        where: { id: executionId },
        data: progressData,
      });

      if (metricsUpdate) {
        await tx.workflowMetrics.updateMany({
          where: { executionId },
          data: metricsUpdate,
        });
      }

      return execution;
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Get execution with all relations
 */
export async function getExecutionWithRelationsOrm(executionId: string) {
  try {
    return await prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        metrics: true,
        checkpoints: true,
        alerts: true,
        serviceUsage: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Complete a workflow execution
 */
export async function completeWorkflowExecutionOrm(
  executionId: string,
  completionData: {
    result?: any;
    error?: string;
    endTime?: Date;
  },
) {
  try {
    return await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: completionData.error ? 'failed' : 'completed',
        error: completionData.error,
        completedAt: completionData.endTime || new Date(),
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}
