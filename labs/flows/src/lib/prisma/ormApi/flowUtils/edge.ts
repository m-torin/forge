import { Prisma, Edge } from '@prisma/client';
import { logEntityChange } from './helpers';

/**
 * Generic helper function to upsert related Edges.
 * @param tx - The Prisma transaction client.
 * @param edges - An array of edges to upsert.
 * @param flowId - The ID of the associated flow.
 * @param changedBy - The ID of the user making the change.
 * @param existingEdges - Existing edges in the database.
 */
export const upsertEdges = async (
  tx: Prisma.TransactionClient,
  edges: Edge[] = [],
  flowId: string,
  changedBy: string,
  existingEdges: Edge[] = [],
): Promise<void> => {
  const upsertPromises = edges.map(async (edge) => {
    const existingEdge = existingEdges.find((e) => e.id === edge.id);
    const data = {
      ...edge,
      metadata: edge.metadata ?? Prisma.JsonNull, // Ensure proper typing for metadata
    };

    const createPayload = {
      ...data,
      flowId,
    };

    await tx.edge.upsert({
      where: { id: edge.id },
      update: data,
      create: createPayload,
    });

    await logEntityChange(
      'Edge',
      edge.id.toString(),
      flowId,
      existingEdge ? 'UPDATE' : 'CREATE',
      existingEdge || null,
      edge,
      changedBy,
    );
  });

  await Promise.all(upsertPromises);
};

/**
 * Generic helper function to handle deletions of Edges.
 * @param tx - The Prisma transaction client.
 * @param existingEdges - Existing edges in the database.
 * @param incomingEdges - Incoming edges from the request.
 * @param flowId - The ID of the associated flow.
 * @param changedBy - The ID of the user making the change.
 */
export const handleEdgeDeletions = async (
  tx: Prisma.TransactionClient,
  existingEdges: Edge[] = [],
  incomingEdges: Edge[] = [],
  flowId: string,
  changedBy: string,
): Promise<void> => {
  const incomingIds = new Set(incomingEdges.map((e) => e.id));
  const entitiesToDelete = existingEdges.filter((e) => !incomingIds.has(e.id));

  const deletePromises = entitiesToDelete.map(async (edge) => {
    await tx.edge.update({
      where: { id: edge.id },
      data: { deleted: true },
    });

    await logEntityChange(
      'Edge',
      edge.id.toString(),
      flowId,
      'DELETE',
      edge,
      null,
      changedBy,
    );
  });

  await Promise.all(deletePromises);
};
