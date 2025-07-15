import { prisma } from '#/lib/prisma/client';
import { FlowEvent, Prisma } from '@prisma/client';
import { logError } from '@repo/observability';

/**
 * Fetches all flow events from the database.
 * @param {Prisma.FlowEventFindManyArgs} options - Optional query parameters.
 * @returns {Promise<FlowEvent[]>} An array of FlowEvent objects.
 */
export const getFlowEvents = async (
  options: Prisma.FlowEventFindManyArgs = {},
): Promise<FlowEvent[]> => {
  try {
    return await prisma.flowEvent.findMany(options);
  } catch (error) {
    logError('Failed to fetch flow events', { error });
    return [];
  }
};

/**
 * Fetches multiple flow events by their IDs.
 * @param {number[]} ids - The IDs of the flow events to fetch.
 * @param {Prisma.FlowEventFindManyArgs} options - Optional query parameters.
 * @returns {Promise<FlowEvent[]>} An array of FlowEvent objects.
 */
export const getFlowEventsByIds = async (
  ids: number[],
  options: Prisma.FlowEventFindManyArgs = {},
): Promise<FlowEvent[]> => {
  try {
    return await prisma.flowEvent.findMany({
      where: {
        id: { in: ids },
      },
      ...options,
    });
  } catch (error) {
    logError('Failed to fetch flow events by IDs', { error });
    return [];
  }
};

/**
 * Fetches a single flow event by its ID.
 * @param {number} id - The ID of the flow event to fetch.
 * @param {Omit<Prisma.FlowEventFindUniqueArgs, 'where'>} options - Optional query parameters.
 * @returns {Promise<FlowEvent | null>} The flow event object, or null if not found.
 */
export const getFlowEvent = async (
  id: number,
  options: Omit<Prisma.FlowEventFindUniqueArgs, 'where'> = {},
): Promise<FlowEvent | null> => {
  try {
    return await prisma.flowEvent.findUnique({
      where: { id },
      ...options,
    });
  } catch (error) {
    logError(`Failed to fetch flow event with ID ${id}`, { error, id });
    return null;
  }
};

/**
 * Creates a new flow event in the database.
 * @param {Prisma.FlowEventCreateInput} data - The data for the new flow event.
 * @returns {Promise<FlowEvent | null>} The created flow event object, or null if creation failed.
 */
export const createFlowEvent = async (
  data: Prisma.FlowEventCreateInput,
): Promise<FlowEvent | null> => {
  try {
    return await prisma.flowEvent.create({
      data,
    });
  } catch (error) {
    logError('Failed to create flow event', { error });
    return null;
  }
};

/**
 * Fetches all flow events by a given flow run ID.
 * @param {number} flowRunId - The ID of the flow run.
 * @param {Prisma.FlowEventFindManyArgs} options - Optional query parameters.
 * @returns {Promise<FlowEvent[]>} An array of FlowEvent objects for the specified flow run.
 */
export const getFlowEventsByFlowRunId = async (
  flowRunId: number,
  options: Prisma.FlowEventFindManyArgs = {},
): Promise<FlowEvent[]> => {
  try {
    return await prisma.flowEvent.findMany({
      where: {
        flowRunId: flowRunId,
      },
      ...options,
    });
  } catch (error) {
    logError(`Failed to fetch flow events for flow run ID ${flowRunId}`, {
      error,
      flowRunId
    });
    return [];
  }
};
