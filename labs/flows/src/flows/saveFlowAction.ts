'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logInfo, logError, logWarn } from '@repo/observability';
import { prisma } from '#/lib/prisma';
import { isDemoMode, createDemoResponse, saveDemoData } from '#/lib/demoMode';
import {
  Prisma,
  FlowMethod,
  NodeType as PrismaNodeType,
  NodeType,
  EdgeType,
} from '@prisma/client';

// Import generated schemas only for validation



// ==================================================================================
// Type Definitions & Schemas
// ==================================================================================

// 1. Define a single source of truth for node types
const NODE_TYPES = Object.values(NodeType) as [string, ...string[]];

// 2. Define ReactFlowNodeSchema
const ReactFlowNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  width: z.number().optional(),
  height: z.number().optional(),
  selected: z.boolean().optional(),
  dragging: z.boolean().optional(),
  data: z.object({
    type: z.string(),
    name: z.string().nullable().optional(),
    metadata: z.custom<Prisma.JsonValue>().optional(),
    infrastructureId: z.string().nullable().optional(),
    arn: z.string().nullable().optional(),
    uxMeta: z
      .object({
        heading: z.string().optional(),
        isExpanded: z.boolean().optional(),
        layer: z.number().optional(),
        isLocked: z.boolean().optional(),
        rotation: z.number().optional(),
      })
      .optional(),
    formFields: z.custom<Prisma.JsonValue>().optional(),
    isEnabled: z.boolean().optional(),
    nodeMeta: z.object({
      displayName: z.string(),
      group: z.string(),
      icon: z.string(),
      color: z.string(),
      type: z.string(),
    }),
    rfId: z.string().optional(),
    prismaData: z
      .object({
        id: z.string(),
        type: z.string(),
      })
      .optional(),
  }),
});

// Updated to match FbEdge structure
const ReactFlowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.nativeEnum(EdgeType).optional(),
  selected: z.boolean().optional(),
  data: z
    .object({
      name: z.string().nullable().optional(),
      isActive: z.boolean().optional(),
      normalizedKey: z.string().nullable().optional(),
      metadata: z.custom<Prisma.JsonValue>().optional(),
      label: z.string().optional(),
      className: z.string().optional(),
      prismaData: z
        .object({
          id: z.string(),
          type: z.nativeEnum(EdgeType),
        })
        .optional(),
    })
    .optional(),
});

// This matches ReactFlow's toObject() output with our custom types
const ReactFlowStateSchema = z.object({
  nodes: z.array(ReactFlowNodeSchema),
  edges: z.array(ReactFlowEdgeSchema),
  viewport: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number(),
  }),
});

const SaveFlowInputSchema = z
  .object({
    flowId: z.string(),
    instanceId: z.string().nullable(),
    flowData: ReactFlowStateSchema,
    updatedFlow: z
      .object({
        name: z.string(),
        method: z.nativeEnum(FlowMethod),
        isEnabled: z.boolean(),
        metadata: z.custom<Prisma.JsonValue>().optional(),
      })
      .strict(),
  })
  .strict();

export type SaveFlowInput = z.infer<typeof SaveFlowInputSchema>;

// ==================================================================================
// Utility Functions
// ==================================================================================

const logger = {
  info: (message: string, data?: any) => {
    logInfo(`ℹ️ ${message}`, { data });
  },
  success: (message: string, data?: any) => {
    logInfo(`✅ ${message}`, { data });
  },
  warning: (message: string, data?: any) => {
    logWarn(`⚠️ ${message}`, { data });
  },
  error: (message: string, error: any) => {
    logError(`❌ ${message}`, { error, cause: error?.meta?.cause, code: error?.code });
  },
  db: (operation: string, details: any) => {
    logInfo(`🔸 DB ${operation}`, { details });
  },
};

/**
 * Runtime validation to check if a node type is valid
 */
function isValidNodeType(type: string): type is NodeType {
  const isValid = NODE_TYPES.includes(type);
  if (!isValid) {
    logger.warning(`Invalid node type detected: "${type}"`);
  }
  return isValid;
}

/**
 * Validates and casts node type to PrismaNodeType
 */
function castNodeType(type: string): PrismaNodeType {
  if (isValidNodeType(type)) {
    return type as PrismaNodeType;
  }
  logger.warning(`Unknown node type "${type}", defaulting to 'default'`);
  return 'default';
}

/**
 * Validates edge type and returns appropriate Prisma EdgeType
 */
function castEdgeType(type: string | undefined): EdgeType {
  if (type && Object.values(EdgeType).includes(type as EdgeType)) {
    return type as EdgeType;
  }
  return 'default';
}

/**
 * Validates edges and checks for cycles
 */
function validateEdges(
  edges: z.infer<typeof ReactFlowEdgeSchema>[],
  nodeIds: Set<string>,
): void {
  // Create a mapping of temporary IDs to validate against
  const validNodeIds = new Set(nodeIds);

  // Validate edge connections
  edges.forEach((edge) => {
    if (!edge.source || !edge.target) {
      throw new Error(`Edge ${edge.id} must have both source and target nodes`);
    }

    // Allow connections to both existing and new nodes
    if (!validNodeIds.has(edge.source)) {
      throw new Error(
        `Edge ${edge.id} references non-existent source node ${edge.source}`,
      );
    }
    if (!validNodeIds.has(edge.target)) {
      throw new Error(
        `Edge ${edge.id} references non-existent target node ${edge.target}`,
      );
    }
  });

  // Check for cycles - we can use the temporary IDs here since
  // the topology remains the same
  const graph = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (!graph.has(edge.source)) {
      graph.set(edge.source, []);
    }
    graph.get(edge.source)?.push(edge.target);
  });

  const hasCycle = (
    node: string,
    visited: Set<string>,
    path: Set<string>,
  ): boolean => {
    if (path.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    path.add(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (hasCycle(neighbor, visited, path)) return true;
    }

    path.delete(node);
    return false;
  };

  const visited = new Set<string>();
  const path = new Set<string>();
  for (const node of validNodeIds) {
    if (hasCycle(node, visited, path)) {
      throw new Error('Circular edge reference detected');
    }
  }
}

/**
 * Transforms a node for database operation with enhanced type validation
 */
function transformNodeForUpsert(
  node: z.infer<typeof ReactFlowNodeSchema>,
  flowId: string,
): Prisma.NodeUpsertArgs | Prisma.NodeCreateArgs {
  // Use runtime validation to ensure node type is valid
  const nodeType = isValidNodeType(node.type) ? node.type : 'default';

  const metadata: Prisma.InputJsonObject = {
    ...((node.data?.metadata as Record<string, unknown>) ?? {}),
    uxMeta: node.data?.uxMeta ?? {},
    nodeMeta: node.data?.nodeMeta ?? {},
    formFields: node.data?.formFields ?? {},
  };

  // Build base data with corrected rfId handling
  const baseData: Prisma.NodeUncheckedCreateInput = {
    flowId,
    type: castNodeType(nodeType),
    name: node.data?.name ?? null,
    position: node.position as Prisma.InputJsonObject,
    rfId: node.data?.rfId ?? node.id, // Use rfId from data or fall back to node.id
    infrastructureId: node.data?.infrastructureId ?? null,
    arn: node.data?.arn ?? null,
    metadata,
  };

  logger.info('Node transform', {
    nodeId: node.id,
    rfId: baseData.rfId,
    type: baseData.type,
  });

  // For existing nodes, return upsert args
  if (!node.id.startsWith('node_')) {
    return {
      where: { id: node.id },
      create: { ...baseData },
      update: { ...baseData },
    };
  }

  // For new nodes, return create args
  return {
    data: baseData,
  };
}

/**
 * Transforms an edge for database operation with proper handling of undefined values
 */
function transformEdgeForUpsert(
  edge: z.infer<typeof ReactFlowEdgeSchema>,
  flowId: string,
  nodeMapping: Map<string, string>,
): Prisma.EdgeCreateArgs | Prisma.EdgeUpsertArgs {
  // Log edge transformation input for debugging
  logger.info('Edge transform input', {
    edgeId: edge.id,
    source: edge.source,
    target: edge.target,
    mappingSize: nodeMapping.size,
    mappingEntries: Array.from(nodeMapping.entries()),
  });

  // Clean up metadata
  const cleanMetadata = (obj: Record<string, unknown> | null | undefined) => {
    if (!obj) return {};
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined),
    );
  };

  const baseMetadata = cleanMetadata(
    edge.data?.metadata as Record<string, unknown>,
  );
  const metadata: Prisma.InputJsonObject = {
    ...baseMetadata,
    ...(edge.data?.label !== undefined && { label: edge.data.label }),
  };

  // Get the node IDs from mapping or fall back to original IDs
  const sourceNodeId = nodeMapping.get(edge.source) || edge.source;
  const targetNodeId = nodeMapping.get(edge.target) || edge.target;

  logger.info('Node ID resolution', {
    edgeId: edge.id,
    originalSource: edge.source,
    resolvedSource: sourceNodeId,
    originalTarget: edge.target,
    resolvedTarget: targetNodeId,
  });

  const baseData: Prisma.EdgeUncheckedCreateInput = {
    flowId,
    rfId: edge.id,
    sourceNodeId,
    targetNodeId,
    type: castEdgeType(edge.type),
    label: edge.data?.label || null,
    isActive: edge.data?.isActive ?? false,
    normalizedKey: edge.data?.normalizedKey ?? null,
    metadata: Object.keys(metadata).length > 0 ? metadata : {},
  };

  // For new edges
  if (edge.id.startsWith('edge_')) {
    return {
      data: baseData,
      include: {
        sourceNode: true,
        targetNode: true,
      },
    };
  }

  // For existing edges
  return {
    where: { id: edge.id },
    create: {
      ...baseData,
      id: edge.id,
    },
    update: {
      ...baseData,
      id: edge.id,
    },
    include: {
      sourceNode: true,
      targetNode: true,
    },
  };
}

// ==================================================================================
// Main Action
// ==================================================================================

/**
 * Server Action: Saves flow state including nodes and edges
 */
export async function saveFlowAction(input: SaveFlowInput) {
  logger.info('Starting saveFlowAction', { flowId: input.flowId });

  // Handle demo mode - save to localStorage and return mock success
  if (isDemoMode()) {
    logger.info('Demo mode detected - saving to localStorage only');
    
    const demoData = {
      flowId: input.flowId,
      instanceId: input.instanceId,
      flowData: input.flowData,
      updatedFlow: input.updatedFlow,
      savedAt: new Date().toISOString()
    };
    
    // Save to localStorage (will work client-side)
    saveDemoData(`flow-${input.flowId}`, demoData);
    
    // Return mock successful response
    return createDemoResponse({
      flow: {
        id: input.flowId,
        name: input.updatedFlow.name,
        method: input.updatedFlow.method,
        isEnabled: input.updatedFlow.isEnabled,
        metadata: input.updatedFlow.metadata,
        viewport: input.flowData.viewport,
        nodes: input.flowData.nodes,
        edges: input.flowData.edges,
      },
      nodes: input.flowData.nodes,
      edges: input.flowData.edges,
    });
  }

  // Validate input data
  const parsedInput = SaveFlowInputSchema.safeParse(input);
  if (!parsedInput.success) {
    logger.error('Input validation failed', parsedInput.error);
    return {
      success: false,
      error: {
        message: 'Invalid input data',
        details: parsedInput.error.issues,
      },
    };
  }

  const { flowId, instanceId, flowData, updatedFlow } = parsedInput.data;
  const { nodes: rfNodes, edges: rfEdges, viewport } = flowData;

  try {
    // Step 1: Validate all edges to ensure they reference valid nodes and have no cycles
    const nodeIds = new Set(rfNodes.map((n) => n.id));
    logger.info('Validating edges', {
      totalNodes: nodeIds.size,
      totalEdges: rfEdges.length,
    });
    validateEdges(rfEdges, nodeIds);
    logger.success('Edge validation passed');

    const result = await prisma.$transaction(async (tx) => {
      // Step 2: Fetch existing flow data to compare against new state
      logger.db('fetch', { operation: 'findUnique', flowId });
      const existingFlow = await tx.flow.findUnique({
        where: { id: flowId },
        include: {
          nodes: true,
          edges: true,
        },
      });

      if (!existingFlow) {
        logger.error('Flow not found', { flowId });
        throw new Error('Flow not found');
      }

      logger.success('Found existing flow', {
        name: existingFlow.name,
        nodeCount: existingFlow.nodes.length,
        edgeCount: existingFlow.edges.length,
      });

      // Identify nodes for operations
      const existingNodeIds = new Set(existingFlow.nodes.map((n) => n.id));
      const nodesToDelete = Array.from(existingNodeIds).filter((id) => {
        const existingNode = existingFlow.nodes.find((n) => n.id === id);
        const isNodePresent = rfNodes.some((n) => {
          // Match by:
          // 1. Permanent ID match
          // 2. ReactFlow ID matches the stored rfId
          // 3. Stored rfId matches the permanent ID
          return (
            n.id === id ||
            n.id === existingNode?.rfId ||
            existingNode?.rfId === n.data?.rfId
          );
        });
        return !isNodePresent;
      });

      // Identify edges for operations
      const existingEdgeIds = new Set(existingFlow.edges.map((e) => e.id));
      const permanentEdgeIds = new Set(
        rfEdges.filter((e) => !e.id.startsWith('edge_')).map((e) => e.id),
      );
      const edgesToDelete = Array.from(existingEdgeIds).filter(
        (id) => !permanentEdgeIds.has(id),
      );

      // Categorize nodes and edges
      const newNodes = rfNodes.filter((n) => n.id.startsWith('node_'));
      const existingNodes = rfNodes.filter((n) => !n.id.startsWith('node_'));
      const newEdges = rfEdges.filter((e) => e.id.startsWith('edge_'));
      const existingEdges = rfEdges.filter((e) => !e.id.startsWith('edge_'));

      logger.info('Computed changes', {
        nodesToDelete: nodesToDelete.length,
        edgesToDelete: edgesToDelete.length,
        newNodes: newNodes.length,
        existingNodes: existingNodes.length,
        newEdges: newEdges.length,
        existingEdges: existingEdges.length,
      });

      // Delete obsolete edges first
      if (edgesToDelete.length > 0) {
        logger.db('delete', {
          operation: 'edge.deleteMany',
          count: edgesToDelete.length,
        });
        await tx.edge.deleteMany({
          where: {
            id: { in: edgesToDelete },
            flowId,
          },
        });
        logger.success('Deleted edges', { count: edgesToDelete.length });
      }

      // Delete obsolete nodes
      if (nodesToDelete.length > 0) {
        logger.db('delete', {
          operation: 'node.deleteMany',
          count: nodesToDelete.length,
        });
        await tx.node.deleteMany({
          where: {
            id: { in: nodesToDelete },
            flowId,
          },
        });
        logger.success('Deleted nodes', { count: nodesToDelete.length });
      }

      // Create new nodes
      logger.info('Creating new nodes', { count: newNodes.length });
      const createdNodes = await Promise.all(
        newNodes.map((node) => {
          const args = transformNodeForUpsert(
            node,
            flowId,
          ) as Prisma.NodeCreateArgs;
          return tx.node.create({
            ...args,
            include: {
              sourceEdges: true,
              targetEdges: true,
            },
          });
        }),
      );

      // Update existing nodes
      logger.info('Upserting existing nodes', { count: existingNodes.length });
      const upsertedNodes = await Promise.all(
        existingNodes.map((node) => {
          const args = transformNodeForUpsert(
            node,
            flowId,
          ) as Prisma.NodeUpsertArgs;
          return tx.node.upsert({
            ...args,
            include: {
              sourceEdges: true,
              targetEdges: true,
            },
          });
        }),
      );

      // Build node mapping after all node operations
      logger.info('Building node mapping');
      const nodeMapping = new Map<string, string>();

      // Add created nodes to mapping
      createdNodes.forEach((node) => {
        logger.info('Mapping created node', { rfId: node.rfId, id: node.id });
        nodeMapping.set(node.rfId, node.id);
      });

      // Add upserted nodes to mapping
      upsertedNodes.forEach((node) => {
        logger.info('Mapping upserted node', { rfId: node.rfId, id: node.id });
        nodeMapping.set(node.rfId, node.id);
      });

      // Create new edges with node mapping
      logger.info('Creating new edges', { count: newEdges.length });
      const createdEdges = await Promise.all(
        newEdges.map((edge) => {
          const args = transformEdgeForUpsert(
            edge,
            flowId,
            nodeMapping,
          ) as Prisma.EdgeCreateArgs;
          return tx.edge.create({
            ...args,
            include: {
              sourceNode: true,
              targetNode: true,
            },
          });
        }),
      );

      // Update existing edges with node mapping
      logger.info('Upserting existing edges', { count: existingEdges.length });
      const upsertedEdges = await Promise.all(
        existingEdges.map((edge) => {
          const args = transformEdgeForUpsert(
            edge,
            flowId,
            nodeMapping,
          ) as Prisma.EdgeUpsertArgs;
          return tx.edge.upsert({
            ...args,
            include: {
              sourceNode: true,
              targetNode: true,
            },
          });
        }),
      );

      // Update flow record
      logger.db('update', {
        operation: 'flow.update',
        flowId,
        name: updatedFlow.name,
      });
      const updatedFlowRecord = await tx.flow.update({
        where: { id: flowId },
        data: {
          name: updatedFlow.name,
          method: updatedFlow.method,
          isEnabled: updatedFlow.isEnabled,
          metadata: (updatedFlow.metadata as Prisma.InputJsonValue) ?? {},
          viewport: viewport as Prisma.InputJsonValue,
          updatedAt: new Date(),
        },
        include: {
          nodes: {
            include: {
              sourceEdges: true,
              targetEdges: true,
            },
          },
          edges: {
            include: {
              sourceNode: true,
              targetNode: true,
            },
          },
        },
      });

      return {
        flow: updatedFlowRecord,
        nodes: [...createdNodes, ...upsertedNodes],
        edges: [...createdEdges, ...upsertedEdges],
      };
    });

    // Revalidate path if instanceId exists
    if (instanceId) {
      revalidatePath(`/${instanceId}/flow/${flowId}`);
    }

    logger.success('saveFlowAction completed successfully', {
      flowId,
      nodeCount: result.nodes.length,
      edgeCount: result.edges.length,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    logger.error('Error in saveFlowAction:', error);
    return {
      success: false,
      error: {
        message: error?.message,
      },
    };
  }
}
