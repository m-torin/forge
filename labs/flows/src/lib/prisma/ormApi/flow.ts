// src/lib/prisma/ormApi/flow.ts

import { prisma } from '#/lib/prisma/client';
import {
  FlowMethod,
  Prisma,
  Flow,
} from '@prisma/client';
import { upsertFlowWithNodesAndEdges } from './upsertFlow';
import { FullFlow } from './flowUtils';
import { logError, logDebug } from '@repo/observability';
import { FlowWithRelations } from './types';

/**
 * Retrieves all flows for a specific instance.
 * @param instanceId - The ID of the instance.
 * @returns {Promise<Flow[]>} - An array of Flow objects.
 */
export const getFlows = async (instanceId: string): Promise<Flow[]> => {
  try {
    const flows = await prisma.flow.findMany({
      where: {
        instanceId: instanceId,
        deleted: false,
      },
      include: { 
        edges: true, 
        nodes: true, 
        tags: true, 
        secrets: true,
        statistics: true 
      },
    });
    return flows;
  } catch (error) {
    logError('Failed to fetch flows', { error });
    return [];
  }
};

/**
 * Retrieves a flow by its ID.
 * @param flowId - The ID of the flow.
 * @returns {Promise<FullFlow | null>} - The flow object or null if not found.
 */
export const getFlowById = async (flowId: string): Promise<FullFlow | null> => {
  try {
    const flow = await prisma.flow.findUnique({
      where: { id: flowId },
      include: { 
        edges: true, 
        nodes: true, 
        tags: true, 
        secrets: true,
        statistics: true 
      },
    });
    return flow;
  } catch (error) {
    logError('Failed to fetch flow by id', { error });
    return null;
  }
};

/**
 * Retrieves a specific flow by its ID and associated instance ID.
 * @param flowId - The ID of the flow.
 * @param instanceId - The ID of the instance.
 * @returns {Promise<FullFlow | null>} - The Flow object with relations or null if not found.
 */
export const getFlow = async (
  flowId: string,
  instanceId: string,
): Promise<FullFlow | null> => {
  try {
    const flow = await prisma.flow.findUnique({
      where: {
        id_instanceId: {
          id: flowId,
          instanceId: instanceId,
        },
      },
      include: { edges: true, nodes: true, tags: true, secrets: true },
    });
    logDebug('Retrieved flow with relations from database', { flow: flow?.id, hasNodes: !!flow?.nodes?.length, hasEdges: !!flow?.edges?.length });
    return flow as FullFlow | null;
  } catch (error) {
    logError(`Failed to fetch flow with ID ${flowId} and instance ID ${instanceId}`, {
      error,
      flowId,
      instanceId
    });
    return null;
  }
};

/**
 * Retrieves the instance ID associated with a specific flow ID.
 * @param flowId - The ID of the flow.
 * @returns {Promise<string | null>} - The instance ID or null if not found.
 */
export const getInstanceIdByFlow = async (
  flowId: string,
): Promise<string | null> => {
  try {
    const flow = await prisma.flow.findUnique({
      where: { id: flowId },
      select: { instanceId: true },
    });
    return flow?.instanceId || null;
  } catch (error) {
    logError(`Failed to fetch flow with ID ${flowId}`, { error, flowId });
    throw error;
  }
};


/**
 * Creates a new flow with the specified details.
 * @param instanceId - The ID of the instance.
 * @param name - The name of the flow.
 * @param method - The method used for the flow.
 * @param authorId - The ID of the author creating the flow.
 * @param tagsIds - An array of tag IDs to associate with the flow.
 * @returns {Promise<Flow | null>} - The created Flow object or null if creation fails.
 */
export const createFlow = async (
  instanceId: string,
  name: string,
  method: FlowMethod,
  authorId: string,
  tagsIds: number[] = [],
): Promise<Flow | null> => {
  try {
    const flowData: Prisma.FlowCreateInput = {
      name,
      method,
      isEnabled: false,
      metadata: Prisma.JsonNull,
      instance: {
        connect: { id: instanceId },
      },
    };

    if (tagsIds.length > 0) {
      flowData.tags = {
        connect: tagsIds.map((id) => ({ id, instanceId })),
      };
    }

    const newFlow = await prisma.flow.create({
      data: flowData,
    });

    return newFlow;
  } catch (error) {
    logError('Failed to create a new flow', { error });
    return null;
  }
};

/**
 * Saves or updates a flow along with its nodes, edges, tags, and secrets.
 * @param data - The flow data including nodes, edges, tags, and secrets.
 * @returns {Promise<FullFlow | null>} - The upserted flow object or null if the operation fails.
 */
export const saveFlow = async (data: any): Promise<FullFlow | null> => {
  try {
    // Extract necessary properties from 'data'
    const {
      flowId,
      instanceId,
      name,
      method,
      isEnabled,
      viewport,
      metadata,
      nodes,
      edges,
      tags,
      secrets,
      changedBy,
    } = data;

    // Ensure 'changedBy' is defined
    if (!changedBy) {
      throw new Error('changedBy is required to save the flow.');
    }

    // Prepare the flow object
    const flowData: FlowWithRelations = {
      id: flowId,
      instanceId,
      name,
      method,
      isEnabled,
      viewport,
      metadata, // Ensure metadata is included
      nodes,
      edges,
      tags,
      secrets,
    };

    // Call the upsert function with both arguments
    const updatedFlow = await upsertFlowWithNodesAndEdges(flowData, changedBy);
    return updatedFlow;
  } catch (error) {
    logError('Error saving flow', { error });
    return null;
  }
};
