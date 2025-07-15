import { getNodeConnections } from './getNodeConnections';
import { getComputeFunction } from './computeRegistry';
import { logUtils } from './logUtils';

// ==================================================================================
// Types
// ==================================================================================

export interface ExecutionNode {
  payload: any;
  nodeId: string;
  type?: string; // Add type field
  status: ExecutionStatus;
  result: any;
  error?: string;
  startTime: string;
  endTime?: string;
  children: ExecutionNode[];
}

export type ExecutionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'error'
  | 'skipped';

interface ProcessContext {
  processedNodes: Set<string>;
  maxDepth?: number;
  currentDepth: number;
  chainId: string;
}

// ==================================================================================
// Execution Tracking
// ==================================================================================

class ExecutionTracker {
  private static instance: ExecutionTracker;
  private executions: Map<string, ExecutionNode>;

  private constructor() {
    this.executions = new Map();
  }

  static getInstance(): ExecutionTracker {
    if (!ExecutionTracker.instance) {
      ExecutionTracker.instance = new ExecutionTracker();
    }
    return ExecutionTracker.instance;
  }

  initializeChain(chainId: string, rootNodeId: string): void {
    this.executions.set(chainId, {
      nodeId: rootNodeId,
      payload: null, // Add missing payload
      status: 'pending',
      result: null,
      startTime: new Date().toISOString(),
      children: [],
    } as ExecutionNode);
  }

  updateNodeStatus(
    chainId: string,
    nodeId: string,
    status: ExecutionStatus,
    result?: any,
    error?: string,
  ): void {
    const chain = this.executions.get(chainId);
    if (!chain) return;

    const updateNode = (node: ExecutionNode): boolean => {
      if (node.nodeId === nodeId) {
        node.status = status;
        if (result) node.result = result;
        if (error) node.error = error;
        if (status === 'completed' || status === 'error') {
          node.endTime = new Date().toISOString();
        }
        return true;
      }
      return node.children.some(updateNode);
    };

    updateNode(chain);
  }

  addChildNode(chainId: string, parentId: string, childId: string): void {
    const chain = this.executions.get(chainId);
    if (!chain) return;

    const addChild = (node: ExecutionNode): boolean => {
      if (node.nodeId === parentId) {
        node.children.push({
          nodeId: childId,
          payload: null,
          status: 'pending',
          result: null,
          startTime: new Date().toISOString(),
          children: [],
        } as ExecutionNode);
        return true;
      }
      return node.children.some(addChild);
    };

    addChild(chain);
  }

  getChainStatus(chainId: string): ExecutionNode | null {
    return this.executions.get(chainId) || null;
  }

  cleanupOldChains(maxAgeMs: number = 3600000): void {
    const now = Date.now();
    for (const [chainId, execution] of this.executions.entries()) {
      const startTime = new Date(execution.startTime).getTime();
      if (now - startTime > maxAgeMs) {
        this.executions.delete(chainId);
      }
    }
  }
}

// ==================================================================================
// Main Processing Functions
// ==================================================================================

/**
 * Initiates and manages the chain of node executions
 */
export async function owlPost(
  sourceNodeId: string,
  inputData: any,
  context: Omit<ProcessContext, 'chainId'> = {
    processedNodes: new Set(),
    currentDepth: 0,
    maxDepth: 10,
  },
): Promise<string> {
  const chainId = `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const tracker = ExecutionTracker.getInstance();

  logUtils.stepStart('Starting execution chain', {
    chainId,
    sourceNodeId,
    inputData: JSON.parse(JSON.stringify(inputData)),
    context: {
      ...context,
      processedNodes: Array.from(context.processedNodes),
    },
  });

  tracker.initializeChain(chainId, sourceNodeId);

  try {
    await processChain(sourceNodeId, inputData, { ...context, chainId });

    const status = getChainStatus(chainId);

    // Find the last node's payload in the chain
    const getFinalPayload = (node: ExecutionNode): any => {
      // Get meaningful payload from current node
      const getNodePayload = (n: ExecutionNode): any => {
        if (n.result?.success?.processedData) {
          const eventId = n.result.success.eventIds[0];
          const data = n.result.success.processedData[eventId];
          // Skip webhook destination format responses
          if (data && !('format' in data && 'contentType' in data)) {
            return data;
          }
        }
        return null;
      };

      // Get last meaningful transformation
      const payload = getNodePayload(node);
      if (node.children.length > 0) {
        const childPayload = getFinalPayload(
          node.children[node.children.length - 1],
        );
        return childPayload || payload;
      }
      return payload;
    };

    // Add the final payload to the chain status
    if (status) {
      status.payload = getFinalPayload(status);
    }

    logUtils.stepEnd('Chain processing completed', {
      chainId,
      status: status ? formatExecutionTree(status) : null,
    });

    return chainId;
  } catch (error) {
    logUtils.error('Chain processing error', error);
    throw error;
  }
}

/**
 * Core processing function for the node chain.
 * Handles recursive processing of nodes, tracking their execution state,
 * and managing the flow of data between nodes.
 *
 * @param nodeId - Current node being processed
 * @param inputData - Data flowing into the node
 * @param context - Processing context with chain metadata
 */
/**
 * Core processing function for the node chain.
 * Handles recursive processing of nodes, tracking their execution state,
 * and managing the flow of data between nodes.
 */
const processChain = async (
  nodeId: string,
  inputData: any,
  context: ProcessContext,
): Promise<void> => {
  const tracker = ExecutionTracker.getInstance();
  const { chainId, maxDepth = 10, currentDepth = 0, processedNodes } = context;

  // Initial validation checks
  if (maxDepth && currentDepth >= maxDepth) {
    logUtils.error(`Max depth ${maxDepth} reached`, { nodeId, currentDepth });
    tracker.updateNodeStatus(
      chainId,
      nodeId,
      'skipped',
      null,
      'Max depth exceeded',
    );
    return;
  }

  if (processedNodes.has(nodeId)) {
    logUtils.error(`Cycle detected`, {
      nodeId,
      processedNodes: Array.from(processedNodes),
    });
    tracker.updateNodeStatus(
      chainId,
      nodeId,
      'skipped',
      null,
      'Cycle detected',
    );
    return;
  }

  // Mark node as being processed
  processedNodes.add(nodeId);
  tracker.updateNodeStatus(chainId, nodeId, 'processing');

  logUtils.stepStart(`Process Node: ${nodeId}`, {
    nodeId,
    depth: currentDepth,
    input: inputData,
    context: {
      processedNodes: Array.from(processedNodes),
      maxDepth,
      currentDepth,
      chainId,
    },
  });

  try {
    // Get node connections to determine flow
    const connections = await getNodeConnections(nodeId);

    logUtils.state('Node Connections', {
      nodeId,
      connections: connections.map((c) => ({
        direction: c.direction,
        sourceId: c.sourceNode.id,
        sourceType: c.sourceNode.type,
        targetId: c.targetNode.id,
        targetType: c.targetNode.type,
      })),
    });

    // Find current node in connections
    const currentNodeConn = connections.find(
      (conn) => conn.sourceNode.id === nodeId || conn.targetNode.id === nodeId,
    );

    if (!currentNodeConn) {
      logUtils.state(`No connections found`, { nodeId, inputData });
      tracker.updateNodeStatus(chainId, nodeId, 'completed', inputData);
      return;
    }

    // Get current node reference
    const currentNode =
      nodeId === currentNodeConn.sourceNode.id
        ? currentNodeConn.sourceNode
        : currentNodeConn.targetNode;

    // Get and validate compute function
    const computeFn = getComputeFunction(currentNode.type);

    if (!computeFn) {
      logUtils.error(`No compute function found`, {
        nodeId,
        nodeType: currentNode.type,
      });
      tracker.updateNodeStatus(
        chainId,
        nodeId,
        'error',
        null,
        `No compute function for type: ${currentNode.type}`,
      );
      return;
    }

    // Execute computation
    logUtils.stepStart(`Computing ${currentNode.type}`, {
      nodeId,
      nodeType: currentNode.type,
      inputData,
    });

    const result = await computeFn(inputData, currentNode);

    // Log transformation
    logUtils.transform(nodeId, inputData, result);

    // Update tracker with result
    tracker.updateNodeStatus(chainId, nodeId, 'completed', result);

    // Find downstream nodes
    const downstream = connections.filter(
      (conn) => conn.direction === 'outgoing' && conn.sourceNode.id === nodeId,
    );

    logUtils.state('Downstream Nodes', {
      nodeId,
      count: downstream.length,
      nodes: downstream.map((d) => ({
        id: d.targetNode.id,
        type: d.targetNode.type,
      })),
    });

    // Process downstream nodes
    for (const connection of downstream) {
      const targetNodeId = connection.targetNode.id;

      // Add child to execution tracker
      tracker.addChildNode(chainId, nodeId, targetNodeId);

      logUtils.stepStart(`Processing downstream`, {
        parentId: nodeId,
        targetId: targetNodeId,
        targetType: connection.targetNode.type,
      });

      // Recursive processing
      await processChain(targetNodeId, result, {
        ...context,
        currentDepth: currentDepth + 1,
      });
    }

    // Log completion status
    if (currentDepth === 0) {
      const finalStatus = tracker.getChainStatus(chainId);

      logUtils.state('Chain Completion Summary', {
        chainId,
        nodesProcessed: finalStatus?.children?.length ?? 0,
        transformations: finalStatus?.children?.map((node) => ({
          nodeId: node.nodeId,
          type: node.type,
          status: node.status,
          startTime: node.startTime,
          endTime: node.endTime,
          output: node.result?.success?.processedData?.[node.nodeId]?.data,
        })),
        finalOutput:
          finalStatus?.children?.[(finalStatus?.children?.length ?? 1) - 1]
            ?.result,
      });
    }
  } catch (error) {
    logUtils.error(`Error in processChain`, {
      nodeId,
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error,
    });

    tracker.updateNodeStatus(
      chainId,
      nodeId,
      'error',
      null,
      error instanceof Error ? error.message : 'Unknown error occurred',
    );

    throw error;
  } finally {
    // Log final node state regardless of success/failure
    logUtils.stepEnd(`Process Node: ${nodeId}`, {
      node: {
        id: nodeId,
        depth: currentDepth,
        processedCount: processedNodes.size,
      },
      status: tracker.getChainStatus(chainId)?.children?.[currentDepth],
      downstream: tracker
        .getChainStatus(chainId)
        ?.children?.slice(currentDepth + 1),
    });
  }
};

// ==================================================================================
// Status and Utility Functions
// ==================================================================================

/**
 * Get the current status of a processing chain
 */
export function getChainStatus(chainId: string): ExecutionNode | null {
  return ExecutionTracker.getInstance().getChainStatus(chainId);
}

/**
 * Utility to check if a chain has completed (successfully or with errors)
 */
export function isChainComplete(chainId: string): boolean {
  const status = getChainStatus(chainId);
  if (!status) return true;

  const checkNode = (node: ExecutionNode): boolean => {
    return (
      (node.status === 'completed' ||
        node.status === 'error' ||
        node.status === 'skipped') &&
      node.children.every(checkNode)
    );
  };

  return checkNode(status);
}

/**
 * Format the execution tree for logging/debugging
 */
export function formatExecutionTree(node: ExecutionNode, depth = 0): string {
  const indent = '  '.repeat(depth);
  let output = `${indent}Node: ${node.nodeId}
`;
  output += `${indent}Status: ${node.status}
`;
  output += `${indent}Start: ${node.startTime}
`;
  if (node.endTime) output += `${indent}End: ${node.endTime}
`;
  if (node.error) output += `${indent}Error: ${node.error}
`;
  if (node.result)
    output += `${indent}Result: ${JSON.stringify(node.result, null, 2)}
`;

  node.children.forEach((child) => {
    output += formatExecutionTree(child, depth + 1);
  });

  return output;
}

// Start cleanup interval for old chains
setInterval(() => {
  ExecutionTracker.getInstance().cleanupOldChains();
}, 3600000);
