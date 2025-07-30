import { Prisma, Node } from '@prisma/client';
import { logEntityChange } from './helpers';
import { logInfo } from '@repo/observability';

export interface InternalNode extends Node {
  measured?: {
    width: number;
    height: number;
  };
}

/**
 * Generic helper function to upsert related Nodes.
 * @param tx - The Prisma transaction client.
 * @param nodes - An array of nodes to upsert.
 * @param flowId - The ID of the associated flow.
 * @param changedBy - The ID of the user making the change.
 * @param existingNodes - Existing nodes in the database.
 */
export const upsertNodes = async (
  tx: Prisma.TransactionClient,
  nodes: InternalNode[] = [],
  flowId: string,
  changedBy: string,
  existingNodes: Node[] = [],
): Promise<void> => {
  const upsertPromises = nodes.map(async (node) => {
    const existingNode = existingNodes.find((e) => e.id === node.id);

    logInfo('upserting node', { node });

    const { measured: _measured, ...nodeData } = node;

    const {
      id,
      infrastructureId,
      name,
      metadata,
      position,
      rfId,
      type,
      deleted,
    } = nodeData;

    const data: Prisma.NodeUpsertArgs['create'] = {
      id,
      flowId,
      infrastructureId: infrastructureId || null,
      name: name || null,
      metadata: metadata ?? Prisma.JsonNull,
      position: position ?? Prisma.JsonNull,
      rfId,
      type,
      deleted,
    };

    await tx.node.upsert({
      where: { id },
      update: data,
      create: data,
    });

    await logEntityChange(
      'Node',
      id,
      flowId,
      existingNode ? 'UPDATE' : 'CREATE',
      existingNode || null,
      node,
      changedBy,
    );
  });

  await Promise.all(upsertPromises);
};

/**
 * Generic helper function to handle deletions of Nodes.
 * @param tx - The Prisma transaction client.
 * @param existingNodes - Existing nodes in the database.
 * @param incomingNodes - Incoming nodes from the request.
 * @param flowId - The ID of the associated flow.
 * @param changedBy - The ID of the user making the change.
 */
export const handleNodeDeletions = async (
  tx: Prisma.TransactionClient,
  existingNodes: Node[] = [],
  incomingNodes: Node[] = [],
  flowId: string,
  changedBy: string,
): Promise<void> => {
  const incomingIds = new Set(incomingNodes.map((e) => e.id));
  const entitiesToDelete = existingNodes.filter((e) => !incomingIds.has(e.id));

  const deletePromises = entitiesToDelete.map(async (node) => {
    await tx.node.update({
      where: { id: node.id },
      data: { deleted: true },
    });

    await logEntityChange(
      'Node',
      node.id.toString(),
      flowId,
      'DELETE',
      node,
      null,
      changedBy,
    );
  });

  await Promise.all(deletePromises);
};
