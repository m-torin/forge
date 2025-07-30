import { prisma } from '#/lib/prisma/client';
import { Edge, EdgeType, Prisma } from '@prisma/client';
import { logInfo, logError, logWarn } from '@repo/observability';

/**
 * Upsert and map each edge in the incoming list to the flow,
 * update it if it exists, and create it if it doesn't.
 * @param {any[]} rfEdges - The list of edges data to upsert.
 * @param {string} flowId - The ID of the flow.
 * @returns {Promise<Edge[]>} The list of upserted edge objects.
 */
export const upsertAndMapEdges = async (
  rfEdges: any[],
  flowId: string,
): Promise<Edge[]> => {
  logInfo('Upserting edges for flow', { edges: rfEdges, flowId });

  // Validate edges before processing
  validateEdges(rfEdges);

  // Update flowId for incoming edges if it's 'flow-id'
  rfEdges.forEach((edge: any) => {
    if (edge.flowId === 'flow-id') {
      edge.flowId = flowId;
    }
  });

  return await prisma.$transaction(
    async (transaction: Prisma.TransactionClient) => {
      const dbEdges = await fetchEdgesFromDatabase(transaction, flowId);
      const combinedEdges = combineEdges(rfEdges, dbEdges);
      const cleanedArray = cleanEdgeDuplicates(combinedEdges);

      const edgesToDelete = await identifyEdgesToDelete(
        transaction,
        dbEdges,
        cleanedArray,
        flowId,
      );
      await deleteEdges(transaction, edgesToDelete);

      const { edgesToUpdate, edgesToCreate } =
        separateEdgesToUpsert(cleanedArray);
      const updatedEdges = await updateEdges(
        transaction,
        edgesToUpdate,
        flowId,
      );
      const createdEdges = await createEdges(
        transaction,
        edgesToCreate,
        flowId,
      );

      logUpsertedEdges(updatedEdges, createdEdges);
      const finalEdges = cleanFinalEdgesArray(cleanedArray, updatedEdges);

      return finalEdges;
    },
  );
};

const validateEdges = (edges: any[]) => {
  edges.forEach((edge: any) => {
    if (!edge.sourceNodeId || !edge.targetNodeId || !edge.flowId) {
      throw new Error('Missing required fields in edge object');
    }
  });
};

const fetchEdgesFromDatabase = async (
  transaction: Prisma.TransactionClient,
  flowId: string,
) => {
  const dbEdges = await transaction.edge.findMany({ where: { flowId } });
  return dbEdges.map((edge) => ({ ...edge, dataSource: 'db' }));
};

const combineEdges = (rfEdges: any[], dbEdges: any[]) => {
  const newEdges = rfEdges.map(
    ({
      sourceNodeId,
      targetNodeId,
      flowId,
      id,
      label,
      type,
      metadata,
    }: any) => ({
      sourceNodeId,
      targetNodeId,
      flowId,
      id,
      label,
      type,
      metadata,
      dataSource: 'ui',
    }),
  );
  const combinedEdges = [...newEdges, ...dbEdges];
  logInfo('Combined edges generated', { combinedEdges });
  return combinedEdges;
};

const cleanEdgeDuplicates = (combinedEdges: any[]) => {
  const duplicatedArray = groupBySourceAndTarget(combinedEdges);
  logInfo('Edge duplicates identified', { duplicatedArray });
  const cleanedArray = mergeAndCleanDuplicates(duplicatedArray).flat();
  logInfo('Edges cleaned after flattening', { cleanedArray });
  return cleanedArray;
};

const identifyEdgesToDelete = async (
  transaction: Prisma.TransactionClient,
  dbEdges: any[],
  cleanedArray: any[],
  flowId: string,
) => {
  const cleanedEdgeIds = new Set(cleanedArray.map((edge: any) => edge.id));
  let edgesToDelete = dbEdges
    .filter((edge: any) => !cleanedEdgeIds.has(edge.id))
    .map((edge: any) => edge.id);

  logInfo('Initial edges to be deleted', { edgesToDelete });
  edgesToDelete = await verifyNodeExistenceAndAddToDelete(
    transaction,
    cleanedArray,
    edgesToDelete,
    flowId,
  );
  logInfo('Final edges to be deleted', { edgesToDelete });

  return edgesToDelete;
};

const deleteEdges = async (
  transaction: Prisma.TransactionClient,
  edgesToDelete: string[],
) => {
  if (edgesToDelete.length > 0) {
    logInfo('Deleting edges', { edgesToDelete });
    await transaction.edge.deleteMany({ where: { id: { in: edgesToDelete } } });
  }
};

const separateEdgesToUpsert = (cleanedArray: any[]) => {
  const edgesToUpdate = cleanedArray.filter((edge: any) => edge.id);
  const edgesToCreate = cleanedArray.filter((edge: any) => !edge.id);
  return { edgesToUpdate, edgesToCreate };
};

const updateEdges = async (
  transaction: Prisma.TransactionClient,
  edgesToUpdate: any[],
  flowId: string,
) => {
  const updatedEdges: Edge[] = [];
  const invalidEdgesToDelete: string[] = [];

  for (const edge of edgesToUpdate) {
    const [sourceNodeExists, targetNodeExists] = await Promise.all([
      transaction.node.findUnique({ where: { id: edge.sourceNodeId, flowId } }),
      transaction.node.findUnique({ where: { id: edge.targetNodeId, flowId } }),
    ]);

    if (sourceNodeExists && targetNodeExists) {
      const updatedEdge = await transaction.edge.update({
        where: { id: edge.id },
        data: {
          label: edge.label,
          isActive: edge.isActive,
          type: edge.type as EdgeType,
          rfId: edge.rfId,
          metadata: edge.metadata, // Include metadata in update
          updatedAt: new Date(),
        },
      });
      updatedEdges.push(updatedEdge);
    } else {
      logWarn(`Skipped updating edge ${edge.id} due to missing nodes`, { edgeId: edge.id });
      if (edge.dataSource === 'db') {
        invalidEdgesToDelete.push(edge.id);
      }
    }
  }

  if (invalidEdgesToDelete.length > 0) {
    await deleteEdges(transaction, invalidEdgesToDelete);
  }

  return updatedEdges;
};

const createEdges = async (
  transaction: Prisma.TransactionClient,
  edgesToCreate: any[],
  flowId: string,
) => {
  const validEdgesToCreate: any[] = [];

  for (const edge of edgesToCreate) {
    const [sourceNodeExists, targetNodeExists] = await Promise.all([
      transaction.node.findUnique({ where: { id: edge.sourceNodeId, flowId } }),
      transaction.node.findUnique({ where: { id: edge.targetNodeId, flowId } }),
    ]);

    if (sourceNodeExists && targetNodeExists) {
      validEdgesToCreate.push(edge);
    } else {
      logWarn(`Skipped creating edge due to missing nodes`, { sourceNodeId: edge.sourceNodeId, targetNodeId: edge.targetNodeId });
    }
  }

  await transaction.edge.createMany({
    data: validEdgesToCreate.map((edge) => ({
      rfId: edge.rfId,
      label: edge.label,
      type: edge.type || EdgeType.default,
      isActive: edge.isActive,
      sourceNodeId: edge.sourceNodeId,
      targetNodeId: edge.targetNodeId,
      flowId: flowId,
      metadata: edge.metadata, // Include metadata in create
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    skipDuplicates: true,
  });

  return validEdgesToCreate; // Since `createMany` returns the count, we instead return the validEdgesToCreate
};

const logUpsertedEdges = (updatedEdges: Edge[], createdEdges: any[]) => {
  logInfo('Edges upserted successfully', { updatedEdges, createdEdges });
};

const cleanFinalEdgesArray = (cleanedArray: any[], updatedEdges: Edge[]) => {
  const finalEdges = cleanedArray
    .filter((edge: any) => !updatedEdges.some((e) => e.id === edge.id))
    .map((edge: any) => {
      if (!edge.type) edge.type = EdgeType.default;
      if (edge.id && edge.id.startsWith('edge-')) delete edge.id;
      const { createdAt: _createdAt, updatedAt: _updatedAt, dataSource: _dataSource, ...rest } = edge;
      return rest;
    });

  logInfo('Final edges processed', { finalEdges });
  return finalEdges;
};

const groupBySourceAndTarget = (edges: any[]) => {
  const groups = edges.reduce((acc: Record<string, any[]>, edge: any) => {
    const key1 = `${edge.sourceNodeId}-${edge.targetNodeId}`;
    const key2 = `${edge.targetNodeId}-${edge.sourceNodeId}`;
    const key = key1 < key2 ? key1 : key2;
    if (!acc[key]) acc[key] = [];
    acc[key].push(edge);
    return acc;
  }, {});
  return Object.values(groups);
};

const mergeAndCleanDuplicates = (duplicatedArray: any[]) => {
  return duplicatedArray.map((group) => {
    const uiItem = group.find((edge: any) => edge.dataSource === 'ui');
    const dbItem = group.find((edge: any) => edge.dataSource === 'db');
    if (uiItem && dbItem) {
      dbItem.label = uiItem.label ?? dbItem.label;
      dbItem.type = uiItem.type ?? dbItem.type;
      dbItem.metadata = uiItem.metadata ?? dbItem.metadata; // Merge metadata field
      dbItem.dataSource = 'combined';
      return dbItem;
    }
    return uiItem || dbItem;
  });
};

const verifyNodeExistenceAndAddToDelete = async (
  transaction: Prisma.TransactionClient,
  duplicatedArray: any[],
  edgesToDelete: string[],
  flowId: string,
) => {
  for (const group of duplicatedArray) {
    if (!Array.isArray(group)) continue;

    for (const edge of group as any[]) {
      try {
        const [sourceNode, targetNode] = await Promise.all([
          transaction.node.findUnique({
            where: { id: edge.sourceNodeId, flowId },
          }),
          transaction.node.findUnique({
            where: { id: edge.targetNodeId, flowId },
          }),
        ]);

        if (!sourceNode || !targetNode) {
          logWarn(`Node check failed for edge ${edge.id}`, { edgeId: edge.id, sourceNode, targetNode });
          edgesToDelete.push(edge.id);
        }
      } catch (error) {
        logError(`Error verifying node existence for edge ${edge.id}`, { error, edgeId: edge.id });
        edgesToDelete.push(edge.id);
      }
    }
  }
  return edgesToDelete;
};
