'use server';

import { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

/**
 * Create a new workflow alert
 */
export async function createWorkflowAlertOrm(args: Prisma.WorkflowAlertCreateArgs) {
  try {
    return await prisma.workflowAlert.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Find first workflow alert matching criteria
 */
export async function findFirstWorkflowAlertOrm(args?: Prisma.WorkflowAlertFindFirstArgs) {
  return await prisma.workflowAlert.findFirst(args);
}

/**
 * Find unique workflow alert
 */
export async function findUniqueWorkflowAlertOrm(args: Prisma.WorkflowAlertFindUniqueArgs) {
  return await prisma.workflowAlert.findUnique(args);
}

/**
 * Find unique workflow alert or throw error if not found
 */
export async function findUniqueWorkflowAlertOrmOrThrow(
  args: Prisma.WorkflowAlertFindUniqueOrThrowArgs,
) {
  try {
    return await prisma.workflowAlert.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowAlert not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find many workflow alerts
 */
export async function findManyWorkflowAlertsOrm(args?: Prisma.WorkflowAlertFindManyArgs) {
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Update workflow alert
 */
export async function updateWorkflowAlertOrm(args: Prisma.WorkflowAlertUpdateArgs) {
  try {
    return await prisma.workflowAlert.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowAlert not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update many workflow alerts
 */
export async function updateManyWorkflowAlertsOrm(args: Prisma.WorkflowAlertUpdateManyArgs) {
  return await prisma.workflowAlert.updateMany(args);
}

/**
 * Upsert workflow alert
 */
export async function upsertWorkflowAlertOrm(args: Prisma.WorkflowAlertUpsertArgs) {
  try {
    return await prisma.workflowAlert.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Delete workflow alert
 */
export async function deleteWorkflowAlertOrm(args: Prisma.WorkflowAlertDeleteArgs) {
  try {
    return await prisma.workflowAlert.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowAlert not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Delete many workflow alerts
 */
export async function deleteManyWorkflowAlertsOrm(args?: Prisma.WorkflowAlertDeleteManyArgs) {
  return await prisma.workflowAlert.deleteMany(args);
}

/**
 * Aggregate workflow alert data
 */
export async function aggregateWorkflowAlertsOrm(args?: Prisma.WorkflowAlertAggregateArgs) {
  return await prisma.workflowAlert.aggregate(args ?? {});
}

/**
 * Count workflow alerts
 */
export async function countWorkflowAlertsOrm(args?: Prisma.WorkflowAlertCountArgs) {
  return await prisma.workflowAlert.count(args);
}

/**
 * Group workflow alerts by specified fields
 */
export async function groupByWorkflowAlertsOrm(args: Prisma.WorkflowAlertGroupByArgs) {
  return await prisma.workflowAlert.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find workflow alerts by workflow slug (leverages index)
 */
export async function findWorkflowAlertsBySlugOrm(
  workflowSlug: string,
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      workflowSlug: workflowSlug,
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts by execution ID (leverages index)
 */
export async function findWorkflowAlertsByExecutionIdOrm(
  executionId: string,
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      executionId: executionId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts with execution relation
 */
export async function findWorkflowAlertsWithExecutionOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      executionId: {
        not: null,
      },
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts without execution relation (global alerts)
 */
export async function findWorkflowAlertsWithoutExecutionOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      executionId: null,
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts by alert type
 */
export async function findWorkflowAlertsByTypeOrm(
  alertType: string,
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      alertType: alertType,
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find failure workflow alerts
 */
export async function findFailureWorkflowAlertsOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      alertType: 'failure',
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find timeout workflow alerts
 */
export async function findTimeoutWorkflowAlertsOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      alertType: 'timeout',
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find cost exceeded workflow alerts
 */
export async function findCostExceededWorkflowAlertsOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      alertType: 'cost_exceeded',
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts by severity
 */
export async function findWorkflowAlertsBySeverityOrm(
  severity: string,
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      severity: severity,
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find critical workflow alerts
 */
export async function findCriticalWorkflowAlertsOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      severity: 'critical',
    },
    orderBy: {
      createdAt: 'desc',
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find error and critical workflow alerts
 */
export async function findHighSeverityWorkflowAlertsOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      severity: {
        in: ['error', 'critical'],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts by status
 */
export async function findWorkflowAlertsByStatusOrm(
  status: string,
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: status,
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find active workflow alerts
 */
export async function findActiveWorkflowAlertsOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'active',
    },
    orderBy: {
      createdAt: 'desc',
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find acknowledged workflow alerts
 */
export async function findAcknowledgedWorkflowAlertsOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'acknowledged',
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find resolved workflow alerts
 */
export async function findResolvedWorkflowAlertsOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      status: 'resolved',
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find unacknowledged workflow alerts
 */
export async function findUnacknowledgedWorkflowAlertsOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      acknowledgedAt: null,
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find unresolved workflow alerts
 */
export async function findUnresolvedWorkflowAlertsOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      resolvedAt: null,
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts with specific tag
 */
export async function findWorkflowAlertsWithTagOrm(
  tag: string,
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      tags: {
        has: tag,
      },
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts with any of the specified tags
 */
export async function findWorkflowAlertsWithAnyTagsOrm(
  tags: string[],
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      tags: {
        hasSome: tags,
      },
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts with threshold data
 */
export async function findWorkflowAlertsWithThresholdOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      threshold: {
        not: Prisma.JsonNull,
      },
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts with actual value data
 */
export async function findWorkflowAlertsWithActualValueOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      actualValue: {
        not: Prisma.JsonNull,
      },
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts by notification count range
 */
export async function findWorkflowAlertsByNotificationCountOrm(
  minNotifications: number,
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      notificationsSent: {
        gte: minNotifications,
      },
    },
    orderBy: {
      notificationsSent: 'desc',
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts that have been notified
 */
export async function findWorkflowAlertsWithNotificationsOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      notificationsSent: {
        gt: 0,
      },
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts that haven't been notified
 */
export async function findWorkflowAlertsWithoutNotificationsOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      notificationsSent: 0,
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// WorkflowAlert model does not have self-relationships - section not applicable

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find workflow alert with execution relation
 */
export async function findWorkflowAlertWithExecutionOrm(id: string) {
  return await prisma.workflowAlert.findUnique({
    where: { id },
    include: {
      execution: true,
    },
  });
}

/**
 * Find workflow alert with all relations included
 */
export async function findWorkflowAlertWithAllRelationsOrm(id: string) {
  return await prisma.workflowAlert.findUnique({
    where: { id },
    include: {
      execution: true,
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find workflow alerts created after a specific date
 */
export async function findWorkflowAlertsCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
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
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts updated after a specific date
 */
export async function findWorkflowAlertsUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
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
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts acknowledged after a specific date
 */
export async function findWorkflowAlertsAcknowledgedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      acknowledgedAt: {
        gte: date,
      },
    },
    orderBy: {
      acknowledgedAt: 'desc',
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts resolved after a specific date
 */
export async function findWorkflowAlertsResolvedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      resolvedAt: {
        gte: date,
      },
    },
    orderBy: {
      resolvedAt: 'desc',
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find recently created workflow alerts within specified days
 */
export async function findRecentWorkflowAlertsOrm(
  days: number = 7,
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.WorkflowAlertFindManyArgs = {
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
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Acknowledge workflow alert
 */
export async function acknowledgeWorkflowAlertOrm(id: string, acknowledgedBy: string) {
  try {
    return await prisma.workflowAlert.update({
      where: { id },
      data: {
        status: 'acknowledged',
        acknowledgedAt: new Date(),
        acknowledgedBy: acknowledgedBy,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowAlert not found for acknowledgment: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Resolve workflow alert
 */
export async function resolveWorkflowAlertOrm(id: string, resolvedBy: string) {
  try {
    return await prisma.workflowAlert.update({
      where: { id },
      data: {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: resolvedBy,
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowAlert not found for resolution: ${id}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Increment notification count for workflow alert
 */
export async function incrementWorkflowAlertNotificationCountOrm(id: string) {
  try {
    return await prisma.workflowAlert.update({
      where: { id },
      data: {
        notificationsSent: {
          increment: 1,
        },
        lastNotifiedAt: new Date(),
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowAlert not found for notification increment: ${id}`);
    }
    handlePrismaError(error);
  }
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Search workflow alerts by title (case-insensitive contains)
 */
export async function searchWorkflowAlertsByTitleOrm(
  searchTerm: string,
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      title: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Search workflow alerts by description (case-insensitive contains)
 */
export async function searchWorkflowAlertsByDescriptionOrm(
  searchTerm: string,
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      description: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Find workflow alerts requiring immediate attention (critical, unacknowledged)
 */
export async function findWorkflowAlertsRequiringAttentionOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      severity: {
        in: ['critical', 'error'],
      },
      status: 'active',
    },
    orderBy: [
      {
        severity: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],
  };
  return await prisma.workflowAlert.findMany(args);
}

/**
 * Get workflow alert summary by workflow slug
 */
export async function getWorkflowAlertSummaryBySlugOrm(workflowSlug: string) {
  return await prisma.workflowAlert.groupBy({
    by: ['severity', 'status'],
    where: { workflowSlug },
    _count: {
      id: true,
    },
    orderBy: {
      severity: 'desc',
    },
  });
}

/**
 * Get workflow alert summary by alert type
 */
export async function getWorkflowAlertSummaryByTypeOrm() {
  return await prisma.workflowAlert.groupBy({
    by: ['alertType', 'severity'],
    _count: {
      id: true,
    },
    orderBy: [
      {
        alertType: 'asc',
      },
      {
        severity: 'desc',
      },
    ],
  });
}

/**
 * Find workflow alerts dashboard summary
 */
export async function findWorkflowAlertsDashboardSummaryOrm(
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const activeCount = await prisma.workflowAlert.count({
    where: {
      ...additionalArgs?.where,
      status: 'active',
    },
  });

  const criticalCount = await prisma.workflowAlert.count({
    where: {
      ...additionalArgs?.where,
      severity: 'critical',
      status: 'active',
    },
  });

  const recentCount = await prisma.workflowAlert.count({
    where: {
      ...additionalArgs?.where,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  });

  return {
    active: activeCount,
    critical: criticalCount,
    recent: recentCount,
  };
}

/**
 * Find workflow alerts timeline for monitoring
 */
export async function findWorkflowAlertsTimelineOrm(
  workflowSlug?: string,
  hours: number = 24,
  additionalArgs?: Prisma.WorkflowAlertFindManyArgs,
) {
  const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

  const args: Prisma.WorkflowAlertFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      ...(workflowSlug && { workflowSlug }),
      createdAt: {
        gte: cutoffDate,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
      workflowSlug: true,
      alertType: true,
      severity: true,
      title: true,
      status: true,
      createdAt: true,
      acknowledgedAt: true,
      resolvedAt: true,
    },
  };
  return await prisma.workflowAlert.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * WorkflowAlert with execution relation
 */
export type WorkflowAlertWithExecution = Prisma.WorkflowAlertGetPayload<{
  include: { execution: true };
}>;

/**
 * WorkflowAlert with all relations for complete data access
 */
export type WorkflowAlertWithAllRelations = Prisma.WorkflowAlertGetPayload<{
  include: {
    execution: true;
  };
}>;

/**
 * WorkflowAlert search result type for optimized queries
 */
export type WorkflowAlertSearchResult = Prisma.WorkflowAlertGetPayload<{
  select: {
    id: true;
    workflowSlug: true;
    executionId: true;
    alertType: true;
    severity: true;
    title: true;
    description: true;
    status: true;
    createdAt: true;
    acknowledgedAt: true;
    resolvedAt: true;
    notificationsSent: true;
    tags: true;
  };
}>;

/**
 * WorkflowAlert dashboard summary
 */
export type WorkflowAlertDashboardSummary = {
  active: number;
  critical: number;
  recent: number;
};

/**
 * WorkflowAlert timeline entry for monitoring
 */
export type WorkflowAlertTimelineEntry = Prisma.WorkflowAlertGetPayload<{
  select: {
    id: true;
    workflowSlug: true;
    alertType: true;
    severity: true;
    title: true;
    status: true;
    createdAt: true;
    acknowledgedAt: true;
    resolvedAt: true;
  };
}>;

/**
 * WorkflowAlert summary by workflow
 */
export type WorkflowAlertSummaryByWorkflow = Prisma.WorkflowAlertGroupByOutputType;

/**
 * WorkflowAlert summary by type
 */
export type WorkflowAlertSummaryByType = Prisma.WorkflowAlertGroupByOutputType;

/**
 * WorkflowAlert management data
 */
export type WorkflowAlertManagement = Prisma.WorkflowAlertGetPayload<{
  select: {
    id: true;
    workflowSlug: true;
    alertType: true;
    severity: true;
    title: true;
    status: true;
    acknowledgedAt: true;
    acknowledgedBy: true;
    resolvedAt: true;
    resolvedBy: true;
    notificationsSent: true;
    lastNotifiedAt: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

/**
 * WorkflowAlert notification status
 */
export type WorkflowAlertNotificationStatus = Prisma.WorkflowAlertGetPayload<{
  select: {
    id: true;
    title: true;
    severity: true;
    notificationsSent: true;
    lastNotifiedAt: true;
    status: true;
  };
}>;
