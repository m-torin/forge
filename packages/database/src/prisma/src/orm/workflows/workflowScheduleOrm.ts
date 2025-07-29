'use server';

import type { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

/**
 * Create a new workflow schedule
 */
export async function createWorkflowScheduleOrm(args: Prisma.WorkflowScheduleCreateArgs) {
  try {
    return await prisma.workflowSchedule.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Find first workflow schedule matching criteria
 */
export async function findFirstWorkflowScheduleOrm(args?: Prisma.WorkflowScheduleFindFirstArgs) {
  return await prisma.workflowSchedule.findFirst(args);
}

/**
 * Find unique workflow schedule
 */
export async function findUniqueWorkflowScheduleOrm(args: Prisma.WorkflowScheduleFindUniqueArgs) {
  return await prisma.workflowSchedule.findUnique(args);
}

/**
 * Find unique workflow schedule or throw error if not found
 */
export async function findUniqueWorkflowScheduleOrmOrThrow(
  args: Prisma.WorkflowScheduleFindUniqueOrThrowArgs,
) {
  try {
    return await prisma.workflowSchedule.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowSchedule not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find many workflow schedules
 */
export async function findManyWorkflowSchedulesOrm(args?: Prisma.WorkflowScheduleFindManyArgs) {
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Update workflow schedule
 */
export async function updateWorkflowScheduleOrm(args: Prisma.WorkflowScheduleUpdateArgs) {
  try {
    return await prisma.workflowSchedule.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowSchedule not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update many workflow schedules
 */
export async function updateManyWorkflowSchedulesOrm(args: Prisma.WorkflowScheduleUpdateManyArgs) {
  return await prisma.workflowSchedule.updateMany(args);
}

/**
 * Upsert workflow schedule
 */
export async function upsertWorkflowScheduleOrm(args: Prisma.WorkflowScheduleUpsertArgs) {
  try {
    return await prisma.workflowSchedule.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Delete workflow schedule
 */
export async function deleteWorkflowScheduleOrm(args: Prisma.WorkflowScheduleDeleteArgs) {
  try {
    return await prisma.workflowSchedule.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowSchedule not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Delete many workflow schedules
 */
export async function deleteManyWorkflowSchedulesOrm(args?: Prisma.WorkflowScheduleDeleteManyArgs) {
  return await prisma.workflowSchedule.deleteMany(args);
}

/**
 * Aggregate workflow schedule data
 */
export async function aggregateWorkflowSchedulesOrm(args?: Prisma.WorkflowScheduleAggregateArgs) {
  return await prisma.workflowSchedule.aggregate(args ?? {});
}

/**
 * Count workflow schedules
 */
export async function countWorkflowSchedulesOrm(args?: Prisma.WorkflowScheduleCountArgs) {
  return await prisma.workflowSchedule.count(args);
}

/**
 * Group workflow schedules by specified fields
 */
export async function groupByWorkflowSchedulesOrm(args: Prisma.WorkflowScheduleGroupByArgs) {
  return await prisma.workflowSchedule.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find workflow schedules by config ID (leverages index)
 */
export async function findWorkflowSchedulesByConfigIdOrm(
  configId: string,
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      configId: configId,
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find active workflow schedules
 */
export async function findActiveWorkflowSchedulesOrm(
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isActive: true,
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find inactive workflow schedules
 */
export async function findInactiveWorkflowSchedulesOrm(
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isActive: false,
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find workflow schedules by name
 */
export async function findWorkflowSchedulesByNameOrm(
  name: string,
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      name: name,
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find workflow schedules by cron expression
 */
export async function findWorkflowSchedulesByCronExpressionOrm(
  cronExpression: string,
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      cronExpression: cronExpression,
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find workflow schedules by timezone
 */
export async function findWorkflowSchedulesByTimezoneOrm(
  timezone: string,
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      timezone: timezone,
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find workflow schedules with description set
 */
export async function findWorkflowSchedulesWithDescriptionOrm(
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      description: {
        not: null,
      },
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find workflow schedules without description
 */
export async function findWorkflowSchedulesWithoutDescriptionOrm(
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      description: null,
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find workflow schedules by last run status
 */
export async function findWorkflowSchedulesByLastRunStatusOrm(
  lastRunStatus: string,
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      lastRunStatus: lastRunStatus,
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find workflow schedules that have never run
 */
export async function findWorkflowSchedulesNeverRunOrm(
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      lastRunAt: null,
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find workflow schedules that have run
 */
export async function findWorkflowSchedulesWithRunHistoryOrm(
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      lastRunAt: {
        not: null,
      },
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find workflow schedules by success rate threshold
 */
export async function findWorkflowSchedulesBySuccessRateOrm(
  minSuccessRate: number,
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      totalRuns: {
        gt: 0,
      },
    },
  };

  // Note: Prisma doesn't support computed fields in where clauses,
  // so we'll need to filter this in the application layer
  const schedules = await prisma.workflowSchedule.findMany(args);

  return schedules.filter(schedule => {
    if (schedule.totalRuns === 0) return false;
    const successRate = (schedule.successfulRuns / schedule.totalRuns) * 100;
    return successRate >= minSuccessRate;
  });
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// WorkflowSchedule model does not have self-relationships - section not applicable

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find workflow schedule with config relation
 */
export async function findWorkflowScheduleWithConfigOrm(id: string) {
  return await prisma.workflowSchedule.findUnique({
    where: { id },
    include: {
      config: true,
    },
  });
}

/**
 * Find workflow schedule with all relations included
 */
export async function findWorkflowScheduleWithAllRelationsOrm(id: string) {
  return await prisma.workflowSchedule.findUnique({
    where: { id },
    include: {
      config: true,
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find workflow schedules created after a specific date
 */
export async function findWorkflowSchedulesCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
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
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find workflow schedules updated after a specific date
 */
export async function findWorkflowSchedulesUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
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
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find workflow schedules with validity period
 */
export async function findWorkflowSchedulesWithValidityPeriodOrm(
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      validUntil: {
        not: null,
      },
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find workflow schedules valid at specific date
 */
export async function findWorkflowSchedulesValidAtDateOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      validFrom: {
        lte: date,
      },
      OR: [
        {
          validUntil: null,
        },
        {
          validUntil: {
            gte: date,
          },
        },
      ],
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find expired workflow schedules
 */
export async function findExpiredWorkflowSchedulesOrm(
  currentDate: Date = new Date(),
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      validUntil: {
        lt: currentDate,
      },
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find recently created or updated workflow schedules within specified days
 */
export async function findRecentWorkflowSchedulesOrm(
  days: number = 7,
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.WorkflowScheduleFindManyArgs = {
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
  return await prisma.workflowSchedule.findMany(args);
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find workflow schedules due for execution (leverages nextRunAt index)
 */
export async function findWorkflowSchedulesDueForExecutionOrm(
  currentDate: Date = new Date(),
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isActive: true,
      nextRunAt: {
        lte: currentDate,
      },
    },
    orderBy: {
      nextRunAt: 'asc',
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Search workflow schedules by name (case-insensitive contains)
 */
export async function searchWorkflowSchedulesByNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Search workflow schedules by description (case-insensitive contains)
 */
export async function searchWorkflowSchedulesByDescriptionOrm(
  searchTerm: string,
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      description: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find workflow schedules scheduled to run in date range
 */
export async function findWorkflowSchedulesInDateRangeOrm(
  startDate: Date,
  endDate: Date,
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      nextRunAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      nextRunAt: 'asc',
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

/**
 * Find workflow schedules by run count range
 */
export async function findWorkflowSchedulesByRunCountRangeOrm(
  minRuns: number,
  maxRuns: number,
  additionalArgs?: Prisma.WorkflowScheduleFindManyArgs,
) {
  const args: Prisma.WorkflowScheduleFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      totalRuns: {
        gte: minRuns,
        lte: maxRuns,
      },
    },
  };
  return await prisma.workflowSchedule.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * WorkflowSchedule with config relation
 */
export type WorkflowScheduleWithConfig = Prisma.WorkflowScheduleGetPayload<{
  include: { config: true };
}>;

/**
 * WorkflowSchedule with all relations for complete data access
 */
export type WorkflowScheduleWithAllRelations = Prisma.WorkflowScheduleGetPayload<{
  include: {
    config: true;
  };
}>;

/**
 * WorkflowSchedule search result type for optimized queries
 */
export type WorkflowScheduleSearchResult = Prisma.WorkflowScheduleGetPayload<{
  select: {
    id: true;
    configId: true;
    name: true;
    description: true;
    cronExpression: true;
    timezone: true;
    isActive: true;
    nextRunAt: true;
    lastRunAt: true;
    lastRunStatus: true;
    totalRuns: true;
    successfulRuns: true;
    failedRuns: true;
    validFrom: true;
    validUntil: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

/**
 * WorkflowSchedule with execution statistics
 */
export type WorkflowScheduleWithStats = Prisma.WorkflowScheduleGetPayload<{
  select: {
    id: true;
    name: true;
    isActive: true;
    totalRuns: true;
    successfulRuns: true;
    failedRuns: true;
    lastRunAt: true;
    lastRunStatus: true;
    nextRunAt: true;
  };
}>;

/**
 * WorkflowSchedule for execution planning
 */
export type WorkflowScheduleForExecution = Prisma.WorkflowScheduleGetPayload<{
  select: {
    id: true;
    configId: true;
    name: true;
    cronExpression: true;
    timezone: true;
    payload: true;
    nextRunAt: true;
    config: {
      select: {
        workflowSlug: true;
        isEnabled: true;
        maxRetries: true;
        timeoutSeconds: true;
        priority: true;
      };
    };
  };
}>;
