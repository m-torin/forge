'use server';

import type { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

/**
 * Create a new workflow configuration
 */
export async function createWorkflowConfigOrm(args: Prisma.WorkflowConfigCreateArgs) {
  try {
    return await prisma.workflowConfig.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Find first workflow config matching criteria
 */
export async function findFirstWorkflowConfigOrm(args?: Prisma.WorkflowConfigFindFirstArgs) {
  return await prisma.workflowConfig.findFirst(args);
}

/**
 * Find unique workflow config
 */
export async function findUniqueWorkflowConfigOrm(args: Prisma.WorkflowConfigFindUniqueArgs) {
  return await prisma.workflowConfig.findUnique(args);
}

/**
 * Find unique workflow config or throw error if not found
 */
export async function findUniqueWorkflowConfigOrmOrThrow(
  args: Prisma.WorkflowConfigFindUniqueOrThrowArgs,
) {
  try {
    return await prisma.workflowConfig.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowConfig not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find many workflow configs
 */
export async function findManyWorkflowConfigsOrm(args?: Prisma.WorkflowConfigFindManyArgs) {
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Update workflow config
 */
export async function updateWorkflowConfigOrm(args: Prisma.WorkflowConfigUpdateArgs) {
  try {
    return await prisma.workflowConfig.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowConfig not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update many workflow configs
 */
export async function updateManyWorkflowConfigsOrm(args: Prisma.WorkflowConfigUpdateManyArgs) {
  return await prisma.workflowConfig.updateMany(args);
}

/**
 * Upsert workflow config
 */
export async function upsertWorkflowConfigOrm(args: Prisma.WorkflowConfigUpsertArgs) {
  try {
    return await prisma.workflowConfig.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Delete workflow config
 */
export async function deleteWorkflowConfigOrm(args: Prisma.WorkflowConfigDeleteArgs) {
  try {
    return await prisma.workflowConfig.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowConfig not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Delete many workflow configs
 */
export async function deleteManyWorkflowConfigsOrm(args?: Prisma.WorkflowConfigDeleteManyArgs) {
  return await prisma.workflowConfig.deleteMany(args);
}

/**
 * Aggregate workflow config data
 */
export async function aggregateWorkflowConfigsOrm(args?: Prisma.WorkflowConfigAggregateArgs) {
  return await prisma.workflowConfig.aggregate(args ?? {});
}

/**
 * Count workflow configs
 */
export async function countWorkflowConfigsOrm(args?: Prisma.WorkflowConfigCountArgs) {
  return await prisma.workflowConfig.count(args);
}

/**
 * Group workflow configs by specified fields
 */
export async function groupByWorkflowConfigsOrm(args: Prisma.WorkflowConfigGroupByArgs) {
  return await prisma.workflowConfig.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find workflow configs by workflow slug (leverages index)
 */
export async function findWorkflowConfigsBySlugOrm(
  workflowSlug: string,
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      workflowSlug: workflowSlug,
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs by organization (leverages index)
 */
export async function findWorkflowConfigsByOrganizationOrm(
  organizationId: string,
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      organizationId: organizationId,
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs by user (leverages index)
 */
export async function findWorkflowConfigsByUserOrm(
  userId: string,
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      userId: userId,
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find enabled workflow configs
 */
export async function findEnabledWorkflowConfigsOrm(
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isEnabled: true,
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find disabled workflow configs
 */
export async function findDisabledWorkflowConfigsOrm(
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isEnabled: false,
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs with display name set
 */
export async function findWorkflowConfigsWithDisplayNameOrm(
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      displayName: {
        not: null,
      },
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs without display name
 */
export async function findWorkflowConfigsWithoutDisplayNameOrm(
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      displayName: null,
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs by category
 */
export async function findWorkflowConfigsByCategoryOrm(
  category: string,
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      category: category,
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs with specific tag
 */
export async function findWorkflowConfigsWithTagOrm(
  tag: string,
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      tags: {
        has: tag,
      },
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs with any of the specified tags
 */
export async function findWorkflowConfigsWithAnyTagsOrm(
  tags: string[],
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      tags: {
        hasSome: tags,
      },
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs with notification on start enabled
 */
export async function findWorkflowConfigsWithStartNotificationOrm(
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      notifyOnStart: true,
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs with notification on completion enabled
 */
export async function findWorkflowConfigsWithCompleteNotificationOrm(
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      notifyOnComplete: true,
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs with notification on failure enabled
 */
export async function findWorkflowConfigsWithFailureNotificationOrm(
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      notifyOnFailure: true,
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs with notification email set
 */
export async function findWorkflowConfigsWithNotificationEmailOrm(
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      notificationEmail: {
        not: null,
      },
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs with retry limits set
 */
export async function findWorkflowConfigsWithRetryLimitOrm(
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      maxRetries: {
        not: null,
      },
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs with timeout set
 */
export async function findWorkflowConfigsWithTimeoutOrm(
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      timeoutSeconds: {
        not: null,
      },
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs by priority level
 */
export async function findWorkflowConfigsByPriorityOrm(
  priority: number,
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      priority: priority,
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs with high priority (< 5)
 */
export async function findHighPriorityWorkflowConfigsOrm(
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      priority: {
        lt: 5,
      },
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// WorkflowConfig model does not have self-relationships - section not applicable

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find workflow configs with schedules
 */
export async function findWorkflowConfigsWithSchedulesOrm(
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      schedules: {
        some: {},
      },
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs without schedules
 */
export async function findWorkflowConfigsWithoutSchedulesOrm(
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      schedules: {
        none: {},
      },
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow config with all relations included
 */
export async function findWorkflowConfigWithAllRelationsOrm(id: string) {
  return await prisma.workflowConfig.findUnique({
    where: { id },
    include: {
      schedules: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

//==============================================================================
// 5. LIFECYCLE OPERATIONS
//==============================================================================

/**
 * Find workflow configs created after a specific date
 */
export async function findWorkflowConfigsCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
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
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find workflow configs updated after a specific date
 */
export async function findWorkflowConfigsUpdatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
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
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find recently created or updated workflow configs within specified days
 */
export async function findRecentWorkflowConfigsOrm(
  days: number = 7,
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.WorkflowConfigFindManyArgs = {
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
  return await prisma.workflowConfig.findMany(args);
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find workflow config by unique slug and organization combination (leverages unique index)
 */
export async function findWorkflowConfigBySlugAndOrganizationOrm(
  workflowSlug: string,
  organizationId: string,
) {
  return await prisma.workflowConfig.findUnique({
    where: {
      workflowSlug_organizationId: {
        workflowSlug,
        organizationId,
      },
    },
  });
}

/**
 * Find workflow config by unique slug and user combination (leverages unique index)
 */
export async function findWorkflowConfigBySlugAndUserOrm(workflowSlug: string, userId: string) {
  return await prisma.workflowConfig.findUnique({
    where: {
      workflowSlug_userId: {
        workflowSlug,
        userId,
      },
    },
  });
}

/**
 * Search workflow configs by display name (case-insensitive contains)
 */
export async function searchWorkflowConfigsByDisplayNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      displayName: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Search workflow configs by description (case-insensitive contains)
 */
export async function searchWorkflowConfigsByDescriptionOrm(
  searchTerm: string,
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      description: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

/**
 * Find organization workflow configs by slug and enabled status (leverages indexes)
 */
export async function findOrganizationWorkflowConfigsBySlugAndStatusOrm(
  organizationId: string,
  workflowSlug: string,
  isEnabled: boolean,
  additionalArgs?: Prisma.WorkflowConfigFindManyArgs,
) {
  const args: Prisma.WorkflowConfigFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      organizationId: organizationId,
      workflowSlug: workflowSlug,
      isEnabled: isEnabled,
    },
  };
  return await prisma.workflowConfig.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * WorkflowConfig with schedules relation
 */
export type WorkflowConfigWithSchedules = Prisma.WorkflowConfigGetPayload<{
  include: { schedules: true };
}>;

/**
 * WorkflowConfig with all relations for complete data access
 */
export type WorkflowConfigWithAllRelations = Prisma.WorkflowConfigGetPayload<{
  include: {
    schedules: true;
  };
}>;

/**
 * WorkflowConfig search result type for optimized queries
 */
export type WorkflowConfigSearchResult = Prisma.WorkflowConfigGetPayload<{
  select: {
    id: true;
    workflowSlug: true;
    displayName: true;
    description: true;
    category: true;
    isEnabled: true;
    organizationId: true;
    userId: true;
    priority: true;
    createdAt: true;
    updatedAt: true;
    _count: {
      select: {
        schedules: true;
      };
    };
  };
}>;

/**
 * WorkflowConfig with notification settings for alerts
 */
export type WorkflowConfigWithNotifications = Prisma.WorkflowConfigGetPayload<{
  select: {
    id: true;
    workflowSlug: true;
    notifyOnStart: true;
    notifyOnComplete: true;
    notifyOnFailure: true;
    notifyOnApproval: true;
    notificationEmail: true;
  };
}>;

/**
 * WorkflowConfig with execution limits for resource management
 */
export type WorkflowConfigWithLimits = Prisma.WorkflowConfigGetPayload<{
  select: {
    id: true;
    workflowSlug: true;
    maxRetries: true;
    timeoutSeconds: true;
    rateLimitPerHour: true;
    maxConcurrent: true;
    priority: true;
  };
}>;
