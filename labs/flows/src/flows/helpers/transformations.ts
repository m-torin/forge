import { z } from 'zod';
import { NodeSchema, EdgeSchema } from '#/lib/prisma/generated/zod';
import { FbNode, FbEdge, FbNodeData, FbEdgeData } from '../types';
import { NodeType, Prisma } from '@prisma/client';

type NodeSchemaType = z.infer<typeof NodeSchema>;
type EdgeSchemaType = z.infer<typeof EdgeSchema>;

/**
 * Ensure value is a valid Prisma.JsonValue
 */
const ensureJsonValue = (value: unknown): Prisma.JsonValue => {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(ensureJsonValue);
  }

  if (typeof value === 'object') {
    const result: Record<string, Prisma.JsonValue> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = ensureJsonValue(val);
    }
    return result;
  }

  return null;
};

/**
 * Transforms a React Flow node to a Prisma-compatible node object
 */
export const transformNodeForValidation = (
  node: FbNode,
  flowId: string,
  existingNode?: NodeSchemaType,
): Omit<NodeSchemaType, 'id'> => {
  const nodeType = node.type as NodeType;
  const nodeData = node.data as FbNodeData;

  // Safely handle metadata as an object
  const existingMetadata =
    typeof nodeData?.metadata === 'object' && nodeData.metadata !== null
      ? (nodeData.metadata as Record<string, unknown>)
      : {};

  const metadata = ensureJsonValue({
    ...existingMetadata,
    uxMeta: {
      ...(nodeData?.uxMeta || {}),
      ...(node.uxMeta || {}),
    },
    formFields: nodeData?.formFields || {},
    flowId,
    payload: nodeData?.payload || {},
    nodeType: node.nodeType,
    nodeMeta: node.nodeMeta,
  });

  const position = ensureJsonValue({
    x: node.position.x,
    y: node.position.y,
  });

  const now = new Date();

  const transformedNode = {
    type: nodeType,
    name: nodeData?.name || null,
    position,
    metadata,
    rfId: node.id,
    infrastructureId: nodeData?.infrastructureId || null,
    arn: nodeData?.arn || null,
    flowId,
    createdAt: existingNode?.createdAt || now,
    updatedAt: now,
    deleted: false,
    flow: { connect: { id: flowId } },
    infrastructure: nodeData?.infrastructureId
      ? { connect: { id: nodeData.infrastructureId } }
      : undefined,
    sourceEdges: { connect: [] },
    targetEdges: { connect: [] },
    secrets: { connect: [] },
    tags: { connect: [] },
  };

  return transformedNode;
};

/**
 * Transforms a React Flow edge to a Prisma-compatible edge object
 */
export const transformEdgeForValidation = (
  edge: FbEdge,
  flowId: string,
  existingEdge?: EdgeSchemaType,
): EdgeSchemaType => {
  const edgeType = edge.type || 'custom';
  const edgeData = (edge.data as FbEdgeData) || {};

  const existingMetadata = (edgeData.metadata as Record<string, unknown>) || {};

  const combinedMetadata: Record<string, unknown> = {
    ...existingMetadata,
    style: edge.style || {},
    markerEnd: edge.markerEnd || {},
    // Make label optional/nullable
    ...(edge.label || edgeData.label
      ? { label: edge.label || edgeData.label }
      : {}),
  };

  const transformedEdge = EdgeSchema.parse({
    id: edge.id,
    flowId,
    sourceNodeId: edge.source,
    targetNodeId: edge.target,
    rfId: edge.id,
    // Make name optional/nullable
    name: edgeData.name || null,
    isActive: edgeData.isActive ?? false,
    type: edgeType,
    normalizedKey: edgeData.normalizedKey || null,
    metadata: combinedMetadata,
    createdAt: existingEdge?.createdAt || new Date(),
    updatedAt: new Date(),
    deleted: false,
    flow: { connect: { id: flowId } },
    sourceNode: { connect: { id: edge.source } },
    targetNode: { connect: { id: edge.target } },
  });

  return transformedEdge;
};
