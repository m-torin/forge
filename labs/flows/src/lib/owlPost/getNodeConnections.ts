import { Edge, Node } from '@prisma/client';
import { prisma } from '#/lib/prisma/client';
import { logError } from '@repo/observability';

/**
 * Represents a connection between two nodes, including the edge and direction
 */
type NodeConnection = {
  sourceNode: Omit<Node, 'sourceEdges' | 'targetEdges'>;
  targetNode: Omit<Node, 'sourceEdges' | 'targetEdges'>;
  edge: Omit<Edge, 'sourceNode' | 'targetNode'>;
  direction: 'incoming' | 'outgoing';
};

/**
 * Type for a Node with its edges included
 */
type NodeWithEdges = Node & {
  sourceEdges: (Edge & {
    targetNode: Node;
  })[];
  targetEdges: (Edge & {
    sourceNode: Node;
  })[];
};

/**
 * Retrieves all active connections (edges and connected nodes) for a given node
 *
 * This function fetches both incoming and outgoing connections, including:
 * - Source nodes that connect to this node (incoming)
 * - Target nodes that this node connects to (outgoing)
 * - The edges that form these connections
 *
 * Only active (non-deleted) nodes and edges are included in the results.
 *
 * @param {string} nodeId - The unique identifier of the node to get connections for
 * @returns {Promise<NodeConnection[]>} Array of connections, each containing source node, target node, edge, and direction
 * @throws {Error} If the node is not found, is deleted, or if there's a database error
 */
export const getNodeConnections = async (
  nodeId: string,
): Promise<NodeConnection[]> => {
  try {
    const baseNode = (await prisma.node.findFirst({
      where: {
        id: nodeId,
        deleted: false,
      },
      include: {
        sourceEdges: {
          where: {
            deleted: false,
          },
          include: {
            targetNode: true,
          },
        },
        targetEdges: {
          where: {
            deleted: false,
          },
          include: {
            sourceNode: true,
          },
        },
      },
    })) as NodeWithEdges | null;

    if (!baseNode) {
      throw new Error(`Node with ID ${nodeId} not found or is deleted`);
    }

    const { sourceEdges, targetEdges, ...baseNodeWithoutEdges } = baseNode;

    const connections: NodeConnection[] = [
      // Map outgoing connections (from this node to others)
      ...sourceEdges.map(({ targetNode, ...edge }) => ({
        sourceNode: baseNodeWithoutEdges,
        targetNode,
        edge: edge as Omit<Edge, 'sourceNode' | 'targetNode'>,
        direction: 'outgoing' as const,
      })),
      // Map incoming connections (from others to this node)
      ...targetEdges.map(({ sourceNode, ...edge }) => ({
        sourceNode,
        targetNode: baseNodeWithoutEdges,
        edge: edge as Omit<Edge, 'sourceNode' | 'targetNode'>,
        direction: 'incoming' as const,
      })),
    ].filter(
      (conn) =>
        // Final validation to ensure no deleted nodes/edges are included
        !conn.sourceNode.deleted &&
        !conn.targetNode.deleted &&
        !conn.edge.deleted,
    );

    return connections;
  } catch (error) {
    logError('Error in getNodeConnections', { error });
    throw error;
  }
};
