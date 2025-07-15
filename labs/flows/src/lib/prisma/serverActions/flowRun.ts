'use server';

import { FlowRun, Prisma } from '@prisma/client';
import {
  getFlowRun,
  createFlowRun,
  getFlowRunsByFlowId,
} from '#/lib/prisma/ormApi';
import { logInfo, logError } from '@repo/observability';

/**
 * Fetches a flow run by its unique identifier.
 * @param {number} flowRunId - The unique identifier of the flow run.
 * @returns {Promise<FlowRun | null>} - A promise that resolves to the flow run or null if not found.
 */
export const readFlowRunAction = async (
  flowRunId: number,
): Promise<FlowRun | null> => {
  try {
    return await getFlowRun(flowRunId);
  } catch (error) {
    logError('Error in readFlowRunAction', { error });
    return null;
  }
};

/**
 * Creates a new flow run.
 * @param {Prisma.FlowRunCreateInput} data - The data for creating the flow run.
 * @returns {Promise<FlowRun | null>} - A promise that resolves to the created flow run or null if the creation failed.
 */
export const createFlowRunAction = async (
  data: Prisma.FlowRunCreateInput,
): Promise<FlowRun | null> => {
  logInfo('createFlowRunAction', { data });
  try {
    return await createFlowRun(data);
  } catch (error) {
    logError('Error in createFlowRunAction', { error });
    return null;
  }
};

/**
 * Fetches all flow runs by a given flow ID.
 * @param {string} flowId - The unique identifier of the flow.
 * @returns {Promise<FlowRun[]>} - A promise that resolves to an array of flow runs for the specified flow.
 */
export const readFlowRunsByFlowIdAction = async (
  flowId: string,
): Promise<FlowRun[]> => {
  try {
    return await getFlowRunsByFlowId(flowId);
  } catch (error) {
    logError('Error in readFlowRunsByFlowIdAction', { error });
    return [];
  }
};
