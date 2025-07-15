import { prisma } from '#/lib/prisma/client';
import { Flow, Node, NodeType, Prisma } from '@prisma/client';
import { logError, logDebug } from '@repo/observability';

/**
 * Fetches all nodes from the database.
 * @param {Prisma.NodeFindManyArgs} options - Optional query parameters.
 * @returns {Promise<Node[]>} An array of node objects.
 */
export const getNodes = async (options: any = {}): Promise<Node[]> => {
  try {
    return await prisma.node.findMany(options);
  } catch (error) {
    logError('Failed to fetch nodes', { error });
    return [];
  }
};

/**
 * Fetches multiple nodes by their IDs.
 * @param {string[]} ids - The IDs of the nodes to fetch.
 * @param {Prisma.NodeFindManyArgs} options - Optional query parameters.
 * @returns {Promise<Node[]>} An array of node objects.
 */
export const getNodesByIds = async (
  ids: string[],
  options: Prisma.NodeFindManyArgs = {},
): Promise<Node[]> => {
  try {
    return await prisma.node.findMany({
      where: {
        id: { in: ids },
      },
      ...options,
    });
  } catch (error) {
    logError('Failed to fetch nodes by IDs', { error });
    return [];
  }
};

type NodeWithFlow = Node & {
  flow: Flow | null;
};

/**
 * Fetches a single node by its ID, including the instanceId from the related flow.
 * @param {string} cuid - The ID of the node to fetch
 * @param {Prisma.NodeFindUniqueArgs} args - Optional Prisma query arguments
 * @returns {Promise<(Node & { instanceId: string | null }) | null>}
 */
export const getNode = async (
  cuid: string,
  args: Omit<Prisma.NodeFindUniqueArgs, 'where'> = {},
): Promise<(Node & { instanceId: string | null }) | null> => {
  try {
    // Merge the provided args with our base query
    const query: Prisma.NodeFindUniqueArgs = {
      where: { id: cuid },
      include: {
        flow: true,
        ...args.include,
      },
      ...args,
    };

    const node = (await prisma.node.findUnique(query)) as NodeWithFlow | null;

    if (!node) {
      return null;
    }

    // Now TypeScript knows that node.flow exists due to the type assertion
    const instanceId = node.flow?.instanceId || null;

    // Spread node properties and add instanceId
    const { flow: _flow, ...nodeWithoutFlow } = node;

    return {
      ...nodeWithoutFlow,
      instanceId,
    };
  } catch (error) {
    logError(`Failed to fetch node with ID ${cuid}`, { error, cuid });
    return null;
  }
};

/**
 * Advanced node query that accepts full Prisma query conditions
 * @param {string} cuid - The ID of the node to fetch
 * @param {Prisma.NodeWhereInput} whereConditions - Additional where conditions
 * @param {Prisma.NodeFindUniqueArgs} args - Other Prisma query arguments
 * @returns {Promise<(Node & { instanceId: string | null }) | null>}
 */
export const getNodeWithConditions = async (
  cuid: string,
  whereConditions: Omit<Prisma.NodeWhereInput, 'id'> = {},
  args: Omit<Prisma.NodeFindUniqueArgs, 'where'> = {},
): Promise<(Node & { instanceId: string | null }) | null> => {
  try {
    const query: Prisma.NodeFindFirstArgs = {
      where: {
        id: cuid,
        ...whereConditions,
      },
      include: {
        flow: true,
        ...args.include,
      },
      ...args,
    };

    const node = (await prisma.node.findFirst(query)) as NodeWithFlow | null;

    if (!node) {
      return null;
    }

    const instanceId = node.flow?.instanceId || null;
    const { flow: _flow, ...nodeWithoutFlow } = node;

    return {
      ...nodeWithoutFlow,
      instanceId,
    };
  } catch (error) {
    logError(`Failed to fetch node with ID ${cuid} with conditions`, { error, cuid });
    return null;
  }
};

/**
 * Fetches a node by ID with optional type filtering
 * @param {string} nodeId - The ID of the node to fetch
 * @param {NodeType} type - Optional node type to filter by
 * @returns {Promise<Node | null>}
 */
export const readNodeAction = async (
  nodeId: string,
  type?: NodeType,
): Promise<(Node & { instanceId: string | null }) | null> => {
  try {
    if (type) {
      return await getNodeWithConditions(nodeId, { type });
    }
    return await getNode(nodeId);
  } catch (error) {
    logError('Error in readNodeAction', { error });
    return null;
  }
};

/**
 * Fetches a single node by its rfId.
 * @param {string} rfId - The rfId of the node to fetch.
 * @param {Omit<Prisma.NodeFindFirstArgs, 'where'>} options - Optional query parameters.
 * @returns {Promise<Node | null>} The node object, or null if not found.
 */
export const getNodeByRfId = async (
  rfId: string,
  options: Omit<Prisma.NodeFindFirstArgs, 'where'> = {},
): Promise<Node | null> => {
  try {
    return await prisma.node.findFirst({
      where: { rfId },
      ...options,
    });
  } catch (error) {
    logError(`Failed to fetch node with rfId ${rfId}`, { error, rfId });
    return null;
  }
};

/**
 * Creates a new node in the database.
 * @param {string} flowId - The ID of the flow to which the node belongs.
 * @param {NodeType} type - The type of the node.
 * @param {Omit<Prisma.NodeCreateInput, 'flow' | 'type'> & { data?: Prisma.InputJsonValue }} data - The data for the new node.
 * @returns {Promise<Node | null>} The created node object, or null if creation failed.
 */
export const createNode = async (
  flowId: string,
  type: NodeType,
  data: Omit<Prisma.NodeCreateInput, 'flow' | 'type'> & {
    data?: Prisma.InputJsonValue;
  } & { rfId?: string }, // rfId is optional here
): Promise<Node | null> => {
  if (!data.rfId) {
    throw new Error('rfId is required');
  }

  try {
    return await prisma.node.create({
      data: {
        ...data,
        flow: { connect: { id: flowId } },
        type,
        metadata: data.metadata ?? {},
      },
    });
  } catch (error) {
    logError('Failed to create node', { error });
    return null;
  }
};

export const upsertAndMapNodes = async (
  rfNodes: any[],
  flowId: string,
): Promise<Node[]> => {
  const results = await Promise.all(
    rfNodes.map(async (rfNode) => {
      const upsertedNode = await upsertNode(rfNode, flowId);
      return upsertedNode ?? null;
    }),
  );
  return results.filter((node): node is Node => node !== null);
};

/**
 * Upserts a node in the database.
 *
 * This function attempts to update an existing node if it exists or create a new one if it does not. It checks for the existence of a flow and optionally the existence of an RF ID before proceeding with the upsert operation.
 *
 * @param {Object} rfNode - The RF node object containing node details.
 * @param {string} flowId - The ID of the flow.
 * @returns {Promise<Node | null>} The upserted node object, or null if the operation fails.
 *
 * @throws {Error} Throws an error if the flow with the specified ID does not exist.
 */
export const upsertNode = async (
  rfNode: any,
  flowId: string,
): Promise<Node | null> => {
  logDebug('Upserting node', { rfNodeId: rfNode.id, flowId, nodeType: rfNode.type });

  const { metadata } = rfNode;
  const { formFields } = metadata as any;

  // Extract additional fields from the `data` key for updating specific columns
  const { nodeName, webhookType: _webhookType, arn, infrastructureId, ..._restData } =
    rfNode.data || {};

  const updatedMetadata = {
    ...metadata,
    ...rfNode.data,
  };

  logDebug('Processing node metadata and form fields', { 
    hasMetadata: !!metadata, 
    hasFormFields: !!formFields,
    fieldCount: formFields ? Object.keys(formFields).length : 0
  });

  try {
    return await prisma.$transaction(async (transactionPrisma) => {
      // Verify the flow exists
      const flowExists = await transactionPrisma.flow.findUnique({
        where: { id: flowId },
      });
      if (!flowExists) {
        throw new Error(`Flow with id ${flowId} does not exist`);
      }

      // Construct conditions for finding existing node
      const conditions: Prisma.NodeWhereInput[] = [
        rfNode.id ? { id: rfNode.id } : null,
        rfNode.rfId ? { rfId: rfNode.rfId } : null,
      ].filter(Boolean) as Prisma.NodeWhereInput[];

      const existingNodeId =
        conditions.length > 0
          ? (
              await transactionPrisma.node.findFirst({
                where: { OR: conditions },
                select: { id: true },
              })
            )?.id
          : undefined;
      if (!existingNodeId) rfNode.rfId = rfNode.id;

      // Standardized upsert data
      const baseData: Prisma.NodeCreateInput & Prisma.NodeUpdateInput = {
        rfId: rfNode.rfId,
        // Update specific columns based on `data` key
        name: nodeName ?? rfNode.name ?? '',
        arn: arn ?? rfNode.arn,
        position: rfNode.position,
        metadata: updatedMetadata,
        flow: { connect: { id: flowId } },
        type: rfNode.type,
        ...(infrastructureId && { infrastructure: { connect: { id: infrastructureId } } }),
        // Add any other columns that are based on the `data` key.
      };

      logDebug('Prepared base data for node upsert', { 
        nodeId: existingNodeId, 
        rfId: baseData.rfId,
        hasInfrastructure: !!baseData.infrastructure 
      });

      return await transactionPrisma.node.upsert({
        where: { id: existingNodeId ?? '' },
        update: {
          ...baseData,
          updatedAt: new Date(),
        },
        create: {
          ...baseData,
          ...(existingNodeId && { id: existingNodeId }),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });
  } catch (error) {
    logError('Failed to upsert a node', { error });
    return null;
  }
};
