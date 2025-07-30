import { prisma } from '#/lib/prisma/client';
import { FlowRun, Prisma } from '@prisma/client';
import { logError } from '@repo/observability';

/**
 * Fetches all flow runs from the database.
 * @param {Prisma.FlowRunFindManyArgs} options - Optional query parameters.
 * @returns {Promise<FlowRun[]>} An array of FlowRun objects.
 */
export const getFlowRuns = async (
  options: Prisma.FlowRunFindManyArgs = {},
): Promise<FlowRun[]> => {
  try {
    return await prisma.flowRun.findMany(options);
  } catch (error) {
    logError('Failed to fetch flow runs', { error });
    return [];
  }
};

/**
 * Fetches multiple flow runs by their IDs.
 * @param {number[]} ids - The IDs of the flow runs to fetch.
 * @param {Prisma.FlowRunFindManyArgs} options - Optional query parameters.
 * @returns {Promise<FlowRun[]>} An array of FlowRun objects.
 */
export const getFlowRunsByIds = async (
  ids: number[],
  options: Prisma.FlowRunFindManyArgs = {},
): Promise<FlowRun[]> => {
  try {
    return await prisma.flowRun.findMany({
      where: {
        id: { in: ids },
      },
      ...options,
    });
  } catch (error) {
    logError('Failed to fetch flow runs by IDs', { error });
    return [];
  }
};

/**
 * Fetches a single flow run by its ID.
 * @param {number} id - The ID of the flow run to fetch.
 * @param {Omit<Prisma.FlowRunFindUniqueArgs, 'where'>} options - Optional query parameters.
 * @returns {Promise<FlowRun | null>} The flow run object, or null if not found.
 */
export const getFlowRun = async (
  id: number,
  options: Omit<Prisma.FlowRunFindUniqueArgs, 'where'> = {},
): Promise<FlowRun | null> => {
  try {
    return await prisma.flowRun.findUnique({
      where: { id },
      ...options,
    });
  } catch (error) {
    logError(`Failed to fetch flow run with ID ${id}`, { error, id });
    return null;
  }
};

/**
 * Creates a new flow run in the database.
 * @param {Prisma.FlowRunCreateInput} data - The data for the new flow run.
 * @returns {Promise<FlowRun | null>} The created flow run object, or null if creation failed.
 */
export const createFlowRun = async (
  data: Prisma.FlowRunCreateInput,
): Promise<FlowRun | null> => {
  try {
    return await prisma.flowRun.create({
      data,
    });
  } catch (error) {
    logError('Failed to create flow run', { error });
    return null;
  }
};

/**
 * Fetches all flow runs by a given flow ID.
 * @param {string} flowId - The ID of the flow.
 * @param {Prisma.FlowRunFindManyArgs} options - Optional query parameters.
 * @returns {Promise<FlowRun[]>} An array of FlowRun objects for the specified flow.
 */
export const getFlowRunsByFlowId = async (
  flowId: string,
  options: Prisma.FlowRunFindManyArgs = {},
): Promise<FlowRun[]> => {
  try {
    return await prisma.flowRun.findMany({
      where: {
        flowId: flowId,
      },
      ...options,
    });
  } catch (error) {
    logError(`Failed to fetch flow runs for flow ID ${flowId}`, { error, flowId });
    return [];
  }
};
