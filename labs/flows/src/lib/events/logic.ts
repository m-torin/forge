import { getFlow, getNodesByIds } from '#/lib/prisma/ormApi';
import { readNodeAction } from '#/lib/prisma/serverActions/node';
import { Node, Edge } from '@prisma/client';
import { logError, logDebug } from '@repo/observability';

// Main function that combines all logic
export const findNextNodes = async (nodeId: string) => {
  // Fetch node
  const node = await readNodeAction(nodeId);
  if (!node) {
    throw new Error('Node not found');
  }

  const { flowId, instanceId } = node as any;

  // Fetch flow with all nodes and edges
  const flow = await getFlow(flowId, instanceId);
  if (!flow) {
    const message = `Flow with ID ${flowId} not found`;
    logError(message, { flowId, instanceId });
    throw new Error(message);
  }

  // Extract and deduplicate node ids
  const nodeIds = [...new Set(flow?.nodes?.map((node: Node) => node.id))];

  // Deduplicate edges based on source and target IDs
  const deduplicatedEdges = [
    ...new Map(
      flow?.edges?.map((edge: Edge) => [
        `${edge.sourceNodeId}-${edge.targetNodeId}`,
        edge,
      ]),
    ).values(),
  ];

  // Filter edges to find those matching the deduplicated node ids in the sourceNodeId field and ensure they are direct connections
  const directConnections = deduplicatedEdges.filter((edge: any) =>
    nodeIds.includes(edge.sourceNodeId),
  );

  const allPathsInFlow = directConnections.map((edge: any) => ({
    sourceNodeId: edge.sourceNodeId,
    targetNodeId: edge.targetNodeId,
    edgeId: edge.id,
  }));

  // Find the next steps
  const nextSteps = allPathsInFlow
    .filter((path) => path.sourceNodeId === nodeId)
    .map((path) => path.targetNodeId);

  // Return the combined result
  return {
    nextSteps,
    allPathsInFlow,
  };
};

// Given a nodeId, find the next nodes to call
export const fetchNextNodes = async (hookId: string) => {
  // Determine which nodes to call next
  const { nextSteps, allPathsInFlow } = await findNextNodes(hookId);

  // Fetch next step nodes
  const nextNodes = await getNodesByIds(nextSteps);
  logDebug('Fetched next nodes for flow execution', { nextNodes, nextSteps });

  return { nextSteps, allPathsInFlow, nextNodes };
};
