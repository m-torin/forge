'use server';

import { Prisma } from '../../../../../prisma-generated/client';
import { prisma } from '../../../clients/standard';
import { handlePrismaError, isNotFoundError } from '../validation';

//==============================================================================
// 1. BASIC CRUD OPERATIONS
//==============================================================================

/**
 * Create a new workflow checkpoint
 */
export async function createWorkflowCheckpointOrm(args: Prisma.WorkflowCheckpointCreateArgs) {
  try {
    return await prisma.workflowCheckpoint.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Find first workflow checkpoint matching criteria
 */
export async function findFirstWorkflowCheckpointOrm(
  args?: Prisma.WorkflowCheckpointFindFirstArgs,
) {
  return await prisma.workflowCheckpoint.findFirst(args);
}

/**
 * Find unique workflow checkpoint
 */
export async function findUniqueWorkflowCheckpointOrm(
  args: Prisma.WorkflowCheckpointFindUniqueArgs,
) {
  return await prisma.workflowCheckpoint.findUnique(args);
}

/**
 * Find unique workflow checkpoint or throw error if not found
 */
export async function findUniqueWorkflowCheckpointOrmOrThrow(
  args: Prisma.WorkflowCheckpointFindUniqueOrThrowArgs,
) {
  try {
    return await prisma.workflowCheckpoint.findUniqueOrThrow(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowCheckpoint not found with criteria: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Find many workflow checkpoints
 */
export async function findManyWorkflowCheckpointsOrm(args?: Prisma.WorkflowCheckpointFindManyArgs) {
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Update workflow checkpoint
 */
export async function updateWorkflowCheckpointOrm(args: Prisma.WorkflowCheckpointUpdateArgs) {
  try {
    return await prisma.workflowCheckpoint.update(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowCheckpoint not found for update: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Update many workflow checkpoints
 */
export async function updateManyWorkflowCheckpointsOrm(
  args: Prisma.WorkflowCheckpointUpdateManyArgs,
) {
  return await prisma.workflowCheckpoint.updateMany(args);
}

/**
 * Upsert workflow checkpoint
 */
export async function upsertWorkflowCheckpointOrm(args: Prisma.WorkflowCheckpointUpsertArgs) {
  try {
    return await prisma.workflowCheckpoint.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Delete workflow checkpoint
 */
export async function deleteWorkflowCheckpointOrm(args: Prisma.WorkflowCheckpointDeleteArgs) {
  try {
    return await prisma.workflowCheckpoint.delete(args);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowCheckpoint not found for deletion: ${JSON.stringify(args.where)}`);
    }
    handlePrismaError(error);
  }
}

/**
 * Delete many workflow checkpoints
 */
export async function deleteManyWorkflowCheckpointsOrm(
  args?: Prisma.WorkflowCheckpointDeleteManyArgs,
) {
  return await prisma.workflowCheckpoint.deleteMany(args);
}

/**
 * Aggregate workflow checkpoint data
 */
export async function aggregateWorkflowCheckpointsOrm(
  args?: Prisma.WorkflowCheckpointAggregateArgs,
) {
  return await prisma.workflowCheckpoint.aggregate(args ?? {});
}

/**
 * Count workflow checkpoints
 */
export async function countWorkflowCheckpointsOrm(args?: Prisma.WorkflowCheckpointCountArgs) {
  return await prisma.workflowCheckpoint.count(args);
}

/**
 * Group workflow checkpoints by specified fields
 */
export async function groupByWorkflowCheckpointsOrm(args: Prisma.WorkflowCheckpointGroupByArgs) {
  return await prisma.workflowCheckpoint.groupBy(args);
}

//==============================================================================
// 2. FIELD-BASED QUERIES
//==============================================================================

/**
 * Find workflow checkpoints by execution ID (leverages index)
 */
export async function findWorkflowCheckpointsByExecutionIdOrm(
  executionId: string,
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      executionId: executionId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Find workflow checkpoints by workflow slug (leverages index)
 */
export async function findWorkflowCheckpointsBySlugOrm(
  workflowSlug: string,
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      workflowSlug: workflowSlug,
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Find workflow checkpoints by checkpoint name
 */
export async function findWorkflowCheckpointsByNameOrm(
  checkpointName: string,
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      checkpointName: checkpointName,
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Find workflow checkpoints by step ID (leverages index)
 */
export async function findWorkflowCheckpointsByStepIdOrm(
  stepId: string,
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      stepId: stepId,
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Find workflow checkpoints by step name
 */
export async function findWorkflowCheckpointsByStepNameOrm(
  stepName: string,
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      stepName: stepName,
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Find workflow checkpoints with step name set
 */
export async function findWorkflowCheckpointsWithStepNameOrm(
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      stepName: {
        not: null,
      },
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Find workflow checkpoints without step name
 */
export async function findWorkflowCheckpointsWithoutStepNameOrm(
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      stepName: null,
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Find restored workflow checkpoints
 */
export async function findRestoredWorkflowCheckpointsOrm(
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isRestored: true,
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Find non-restored workflow checkpoints
 */
export async function findNonRestoredWorkflowCheckpointsOrm(
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      isRestored: false,
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Find workflow checkpoints with progress data
 */
export async function findWorkflowCheckpointsWithProgressOrm(
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      progress: {
        not: Prisma.JsonNull,
      },
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Find workflow checkpoints without progress data
 */
export async function findWorkflowCheckpointsWithoutProgressOrm(
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      progress: { equals: Prisma.JsonNull },
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Find workflow checkpoints with metadata
 */
export async function findWorkflowCheckpointsWithMetadataOrm(
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      metadata: {
        not: Prisma.JsonNull,
      },
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Find workflow checkpoints by state size range
 */
export async function findWorkflowCheckpointsByStateSizeRangeOrm(
  minSizeBytes: number,
  maxSizeBytes: number,
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      stateSizeBytes: {
        gte: minSizeBytes,
        lte: maxSizeBytes,
      },
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Find large workflow checkpoints (above size threshold)
 */
export async function findLargeWorkflowCheckpointsOrm(
  sizeThresholdBytes: number = 1048576, // 1MB default
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      stateSizeBytes: {
        gte: sizeThresholdBytes,
      },
    },
    orderBy: {
      stateSizeBytes: 'desc',
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

//==============================================================================
// 3. HIERARCHICAL OPERATIONS
//==============================================================================

// WorkflowCheckpoint model does not have self-relationships - section not applicable

//==============================================================================
// 4. RELATIONSHIP QUERIES
//==============================================================================

/**
 * Find workflow checkpoint with execution relation
 */
export async function findWorkflowCheckpointWithExecutionOrm(id: string) {
  return await prisma.workflowCheckpoint.findUnique({
    where: { id },
    include: {
      execution: true,
    },
  });
}

/**
 * Find workflow checkpoint with all relations included
 */
export async function findWorkflowCheckpointWithAllRelationsOrm(id: string) {
  return await prisma.workflowCheckpoint.findUnique({
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
 * Find workflow checkpoints created after a specific date
 */
export async function findWorkflowCheckpointsCreatedAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
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
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Find workflow checkpoints restored after a specific date
 */
export async function findWorkflowCheckpointsRestoredAfterOrm(
  date: Date,
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      restoredAt: {
        gte: date,
      },
    },
    orderBy: {
      restoredAt: 'desc',
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Find recently created workflow checkpoints within specified days
 */
export async function findRecentWorkflowCheckpointsOrm(
  days: number = 7,
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      createdAt: {
        gte: cutoffDate,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Mark workflow checkpoint as restored
 */
export async function markWorkflowCheckpointAsRestoredOrm(id: string) {
  try {
    return await prisma.workflowCheckpoint.update({
      where: { id },
      data: {
        isRestored: true,
        restoredAt: new Date(),
      },
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`WorkflowCheckpoint not found for restoration marking: ${id}`);
    }
    handlePrismaError(error);
  }
}

//==============================================================================
// 6. SEARCH & OPTIMIZATION
//==============================================================================

/**
 * Find workflow checkpoint by unique execution and checkpoint name combination (leverages unique index)
 */
export async function findWorkflowCheckpointByExecutionAndNameOrm(
  executionId: string,
  checkpointName: string,
) {
  return await prisma.workflowCheckpoint.findUnique({
    where: {
      executionId_checkpointName: {
        executionId,
        checkpointName,
      },
    },
  });
}

/**
 * Search workflow checkpoints by checkpoint name (case-insensitive contains)
 */
export async function searchWorkflowCheckpointsByNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      checkpointName: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Search workflow checkpoints by step name (case-insensitive contains)
 */
export async function searchWorkflowCheckpointsByStepNameOrm(
  searchTerm: string,
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      stepName: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

/**
 * Find latest workflow checkpoint for execution
 */
export async function findLatestWorkflowCheckpointForExecutionOrm(
  executionId: string,
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      executionId: executionId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1,
  };
  const results = await prisma.workflowCheckpoint.findMany(args);
  return results[0] || null;
}

/**
 * Find workflow checkpoints for execution step timeline
 */
export async function findWorkflowCheckpointsTimelineOrm(
  executionId: string,
  additionalArgs?: Prisma.WorkflowCheckpointFindManyArgs,
) {
  const args: Prisma.WorkflowCheckpointFindManyArgs = {
    ...additionalArgs,
    where: {
      ...additionalArgs?.where,
      executionId: executionId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
      checkpointName: true,
      stepId: true,
      stepName: true,
      createdAt: true,
      isRestored: true,
      restoredAt: true,
      stateSizeBytes: true,
    },
  };
  return await prisma.workflowCheckpoint.findMany(args);
}

//==============================================================================
// 7. TYPE EXPORTS
//==============================================================================

/**
 * WorkflowCheckpoint with execution relation
 */
export type WorkflowCheckpointWithExecution = Prisma.WorkflowCheckpointGetPayload<{
  include: { execution: true };
}>;

/**
 * WorkflowCheckpoint with all relations for complete data access
 */
export type WorkflowCheckpointWithAllRelations = Prisma.WorkflowCheckpointGetPayload<{
  include: {
    execution: true;
  };
}>;

/**
 * WorkflowCheckpoint search result type for optimized queries
 */
export type WorkflowCheckpointSearchResult = Prisma.WorkflowCheckpointGetPayload<{
  select: {
    id: true;
    executionId: true;
    workflowSlug: true;
    checkpointName: true;
    stepId: true;
    stepName: true;
    createdAt: true;
    isRestored: true;
    restoredAt: true;
    stateSizeBytes: true;
  };
}>;

/**
 * WorkflowCheckpoint timeline entry for step tracking
 */
export type WorkflowCheckpointTimelineEntry = Prisma.WorkflowCheckpointGetPayload<{
  select: {
    id: true;
    checkpointName: true;
    stepId: true;
    stepName: true;
    createdAt: true;
    isRestored: true;
    restoredAt: true;
    stateSizeBytes: true;
  };
}>;

/**
 * WorkflowCheckpoint for restoration operations
 */
export type WorkflowCheckpointForRestoration = Prisma.WorkflowCheckpointGetPayload<{
  select: {
    id: true;
    executionId: true;
    checkpointName: true;
    state: true;
    progress: true;
    metadata: true;
    isRestored: true;
    execution: {
      select: {
        id: true;
        workflowSlug: true;
        status: true;
      };
    };
  };
}>;

/**
 * WorkflowCheckpoint state summary for monitoring
 */
export type WorkflowCheckpointStateSummary = Prisma.WorkflowCheckpointGetPayload<{
  select: {
    id: true;
    executionId: true;
    checkpointName: true;
    stepId: true;
    stepName: true;
    stateSizeBytes: true;
    createdAt: true;
    isRestored: true;
  };
}>;

//==============================================================================
// SPECIALIZED CHECKPOINT OPERATIONS
//==============================================================================

/**
 * Create a checkpoint with state data
 */
export async function createCheckpointWithStateOrm(
  checkpointData: Prisma.WorkflowCheckpointCreateInput & {
    stateData?: any;
  },
) {
  try {
    const { stateData, ...checkpointInput } = checkpointData;

    return await prisma.workflowCheckpoint.create({
      data: {
        ...checkpointInput,
        state: stateData ? JSON.stringify(stateData) : Prisma.JsonNull,
        stateSizeBytes: stateData ? Buffer.byteLength(JSON.stringify(stateData), 'utf8') : 0,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}
