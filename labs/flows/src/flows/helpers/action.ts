// 'use server';

import { revalidatePath } from 'next/cache';
import { logError } from '@repo/observability';
import { prisma } from '#/lib/prisma';
import { isDemoMode, saveDemoData } from '#/lib/demoMode';
import {
  type Edge as PrismaEdge,
  type Flow as PrismaFlow,
  type Node as PrismaNode,
  type FlowMethod,
  Prisma,
} from '@prisma/client';

// Import generated schemas only for validation
import {
  NodeCreateInputObjectSchema,
  EdgeCreateInputObjectSchema,
} from '#/lib/prisma/generated/schemas';
import type { FbEdge } from '../types';

// Helper types for Prisma JSON handling (unused but kept for reference)
// type PrismaJsonInput =
//   | Prisma.InputJsonValue
//   | Prisma.NullableJsonNullValueInput
//   | undefined;

// Use direct Prisma types for type definitions
type NodeCreateData = Prisma.NodeUncheckedCreateInput;
type NodeUpdateData = Prisma.NodeUncheckedUpdateInput;
type EdgeCreateData = Prisma.EdgeUncheckedCreateInput;
type EdgeUpdateData = Prisma.EdgeUncheckedUpdateInput;

// Helper function to convert JsonValue to Prisma's expected input type
const toPrismaJson = (
  value: Prisma.JsonValue | null | undefined,
): Prisma.InputJsonValue => {
  if (value === null || value === undefined) return {};
  return value as Prisma.InputJsonValue;
};

export interface TransactionResult {
  success: boolean;
  data?: {
    flow: PrismaFlow;
    nodes: PrismaNode[];
    edges: PrismaEdge[];
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type FlowCreateUpdateData = {
  id: string;
  name: string;
  method: FlowMethod;
  isEnabled: boolean;
  metadata?: Prisma.JsonValue;
  viewport?: Prisma.JsonValue | null;
  instanceId: string;
  nodes: {
    delete?: { id: string }[];
    upsert?: {
      where: { id: string };
      create: Omit<PrismaNode, 'id' | 'flowId' | 'flow'>;
      update: Partial<PrismaNode>;
    }[];
  };
  edges: {
    delete?: { id: string }[];
    upsert?: {
      where: { id: string };
      create: Omit<
        PrismaEdge,
        'id' | 'flowId' | 'flow' | 'sourceNode' | 'targetNode'
      > & {
        sourceNodeId: string;
        targetNodeId: string;
      };
      update: Partial<PrismaEdge>;
    }[];
  };
};

// Validation functions using generated Zod schemas
const _validateNodeData = (data: unknown): data is NodeCreateData => {
  try {
    NodeCreateInputObjectSchema.parse(data);
    return true;
  } catch {
    return false;
  }
};

const _validateEdgeData = (data: unknown): data is EdgeCreateData => {
  try {
    EdgeCreateInputObjectSchema.parse(data);
    return true;
  } catch {
    return false;
  }
};

function _validateEdges(edges: FbEdge[], nodeIds: Set<string>): void {
  edges.forEach((edge) => {
    if (!edge.source || !edge.target) {
      throw new Error(`Edge ${edge.id} must have both source and target nodes`);
    }
  });

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

  for (const edge of edges) {
    if (!nodeIds.has(edge.source)) {
      throw new Error(
        `Edge ${edge.id} references non-existent source node ${edge.source}`,
      );
    }
    if (!nodeIds.has(edge.target)) {
      throw new Error(
        `Edge ${edge.id} references non-existent target node ${edge.target}`,
      );
    }
  }

  const visited = new Set<string>();
  const path = new Set<string>();
  for (const node of nodeIds) {
    if (hasCycle(node, visited, path)) {
      throw new Error('Circular edge reference detected');
    }
  }
}

export const upsertFlowAction = async (
  flowData: FlowCreateUpdateData,
): Promise<TransactionResult> => {
  try {
    const {
      id: flowId,
      instanceId,
      nodes: nodesData,
      edges: edgesData,
      ...flowUpdate
    } = flowData;

    if (!flowId) {
      throw new Error('Flow ID is required');
    }

    // Handle demo mode
    if (isDemoMode()) {
      const demoData = {
        flowData,
        savedAt: new Date().toISOString()
      };
      
      saveDemoData(`upsert-flow-${flowId}`, demoData);
      
      const mockFlow: PrismaFlow = {
        id: flowId,
        instanceId,
        name: flowUpdate.name,
        method: flowUpdate.method,
        isEnabled: flowUpdate.isEnabled,
        metadata: flowUpdate.metadata || {},
        viewport: flowUpdate.viewport || {},
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false
      };

      const mockNodes: PrismaNode[] = (nodesData.upsert?.map(node => ({
        ...node.create,
        id: node.where.id,
        flowId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false
      })) || []) as PrismaNode[];

      const mockEdges: PrismaEdge[] = (edgesData.upsert?.map(edge => ({
        ...edge.create,
        id: edge.where.id,
        flowId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false
      })) || []) as PrismaEdge[];

      return {
        success: true,
        data: {
          flow: mockFlow,
          nodes: mockNodes,
          edges: mockEdges
        }
      };
    }

    const existingFlow = await prisma.flow.findUnique({
      where: {
        id: flowId,
        instanceId: instanceId ?? undefined,
        deleted: false,
      },
      include: {
        nodes: true,
        edges: true,
      },
    });

    if (!existingFlow) {
      throw new Error('Flow not found or access denied');
    }

    const result = await prisma.$transaction(async (tx) => {
      // Handle edge deletions with safe arrays
      if (edgesData.delete && edgesData.delete.length > 0) {
        await tx.edge.deleteMany({
          where: {
            id: { in: edgesData.delete.map((edge) => edge.id) },
            flowId,
          },
        });
      }

      // Handle node deletions with safe arrays
      if (nodesData.delete && nodesData.delete.length > 0) {
        // First delete related edges
        await tx.edge.deleteMany({
          where: {
            OR: [
              { sourceNodeId: { in: nodesData.delete.map((node) => node.id) } },
              { targetNodeId: { in: nodesData.delete.map((node) => node.id) } },
            ],
            flowId,
          },
        });

        // Then delete nodes
        await tx.node.deleteMany({
          where: {
            id: { in: nodesData.delete.map((node) => node.id) },
            flowId,
          },
        });
      }

      // Handle node upserts with proper typing
      const upsertedNodes = nodesData.upsert
        ? await Promise.all(
            nodesData.upsert.map((node) => {
              const nodeCreate: NodeCreateData = {
                ...node.create,
                flowId,
                infrastructureId: node.create.infrastructureId ?? null,
                metadata: toPrismaJson(node.create.metadata),
                position: toPrismaJson(node.create.position),
                type: node.create.type ?? 'default',
              };

              const nodeUpdate: NodeUpdateData = {
                ...node.update,
                metadata: toPrismaJson(node.update.metadata),
                position: toPrismaJson(node.update.position),
              };

              return tx.node.upsert({
                where: node.where,
                create: nodeCreate,
                update: nodeUpdate,
              });
            }),
          )
        : [];

      // Handle edge upserts with proper typing
      const upsertedEdges = edgesData.upsert
        ? await Promise.all(
            edgesData.upsert.map((edge) => {
              const edgeCreate: EdgeCreateData = {
                ...edge.create,
                flowId,
                metadata: toPrismaJson(edge.create.metadata),
                sourceNodeId: edge.create.sourceNodeId,
                targetNodeId: edge.create.targetNodeId,
                type: edge.create.type ?? 'default',
              };

              const edgeUpdate: EdgeUpdateData = {
                ...edge.update,
                metadata: toPrismaJson(edge.update.metadata),
              };

              return tx.edge.upsert({
                where: edge.where,
                create: edgeCreate,
                update: edgeUpdate,
              });
            }),
          )
        : [];

      // Update flow
      const updatedFlow = await tx.flow.update({
        where: { id: flowId },
        data: {
          name: flowUpdate.name,
          method: flowUpdate.method,
          isEnabled: flowUpdate.isEnabled,
          viewport: toPrismaJson(flowUpdate.viewport),
          metadata: toPrismaJson(flowUpdate.metadata),
          updatedAt: new Date(),
        },
        include: {
          nodes: true,
          edges: true,
        },
      });

      return {
        flow: updatedFlow,
        nodes: upsertedNodes,
        edges: upsertedEdges,
      };
    });

    if (instanceId) {
      revalidatePath(`/${instanceId}/flow/${flowId}`);
    }

    return {
      success: true,
      data: {
        flow: result.flow,
        nodes: result.nodes,
        edges: result.edges,
      },
    };
  } catch (error) {
    logError('Error in upsertFlowAction', { error });
    return {
      success: false,
      error: {
        code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        details: error,
      },
    };
  }
};
