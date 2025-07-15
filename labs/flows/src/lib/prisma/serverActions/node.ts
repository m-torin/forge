'use server';

import { Node, NodeType, Prisma } from '@prisma/client';
import { getNode, getNodeWithConditions } from '#/lib/prisma/ormApi';
import { logError } from '@repo/observability';

/**
 * Interface for additional node properties used internally.
 */
export interface InternalNode extends Node {
  measured?: {
    width: number;
    height: number;
  };
  instanceId: string | null;
}

type NodeQueryOptions = {
  type?: NodeType;
  includeDeleted?: boolean;
  additionalWhere?: Omit<Prisma.NodeWhereInput, 'id' | 'type' | 'deleted'>;
  include?: Omit<Prisma.NodeInclude, 'flow'>;
};

/**
 * Fetches a node by its unique identifier with optional filtering and includes.
 *
 * @param {string} nodeId - The unique identifier of the node
 * @param {NodeQueryOptions} options - Optional query parameters
 * @returns {Promise<InternalNode | null>} - A promise that resolves to the node or null if not found
 */
export const readNodeAction = async (
  nodeId: string,
  options: NodeQueryOptions = {},
): Promise<InternalNode | null> => {
  try {
    const {
      type,
      includeDeleted = false,
      additionalWhere = {},
      include = {},
    } = options;

    // If we have additional conditions beyond just ID, use getNodeWithConditions
    if (type || !includeDeleted || Object.keys(additionalWhere).length > 0) {
      const whereConditions: Prisma.NodeWhereInput = {
        ...additionalWhere,
        ...(type && { type }),
        ...(!includeDeleted && { deleted: false }),
      };

      const node = await getNodeWithConditions(nodeId, whereConditions, {
        include,
      });

      return node as InternalNode | null;
    }

    // Otherwise, use the simpler getNode function
    const node = await getNode(nodeId, { include });
    return node as InternalNode | null;
  } catch (error) {
    logError('Error in readNodeAction', { error });
    throw error; // Let the caller handle the error
  }
};
