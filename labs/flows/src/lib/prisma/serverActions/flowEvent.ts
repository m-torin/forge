'use server';

import { FlowEvent, Prisma } from '@prisma/client';
import {
  getFlowEvent,
  createFlowEvent,
  getFlowEventsByFlowRunId,
} from '#/lib/prisma/ormApi';
import { logInfo, logError } from '@repo/observability';

/**
 * Fetches a flow event by their unique identifier.
 * @param {number} eventId - The unique identifier of the flow event.
 * @returns {Promise<FlowEvent | null>} - A promise that resolves to the flow event or null if not found.
 */
export const readFlowEventAction = async (
  eventId: number,
): Promise<FlowEvent | null> => {
  try {
    return await getFlowEvent(eventId);
  } catch (error) {
    logError('Error in readFlowEventAction', { error });
    return null;
  }
};

/**
 * Creates a new flow event.
 * @param {Prisma.FlowEventCreateInput} data - The data for creating the flow event.
 * @returns {Promise<FlowEvent | null>} - A promise that resolves to the created flow event or null if the creation failed.
 */
export const createFlowEventAction = async (
  data: Prisma.FlowEventCreateInput,
): Promise<FlowEvent | null> => {
  logInfo('createFlowEventAction', { data });
  try {
    return await createFlowEvent(data);
  } catch (error) {
    logError('Error in createFlowEventAction', { error });
    return null;
  }
};

/**
 * Fetches all flow events by a given flow run ID.
 * @param {number} flowRunId - The unique identifier of the flow run.
 * @returns {Promise<FlowEvent[]>} - A promise that resolves to an array of flow events for the specified flow run.
 */
export const readFlowEventsByFlowRunIdAction = async (
  flowRunId: number,
): Promise<FlowEvent[]> => {
  try {
    return await getFlowEventsByFlowRunId(flowRunId);
  } catch (error) {
    logError('Error in readFlowEventsByFlowRunIdAction', { error });
    return [];
  }
};
