// transformIncomingData.ts

import {
  Prisma,
  NodeType,
  EdgeType,
  FlowMethod,
  SecretCategory,
} from '@prisma/client';

type FlowCreateInput = Prisma.FlowCreateInput;

interface IncomingNode {
  id: string;
  type: NodeType;
  position: Prisma.InputJsonValue | undefined | null;
  createdAt: Date;
  updatedAt: Date;
  arn: string | null;
  infrastructureId: string | null;
  name: string | null;
  rfId: string;
  metadata: Prisma.InputJsonValue | undefined | null;
  deleted: boolean;
}

interface IncomingEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  rfId?: string;
  name?: string;
  isActive?: boolean;
  type?: EdgeType;
  normalizedKey?: string;
  metadata: Prisma.InputJsonValue | undefined | null;
}

interface IncomingData {
  flowId: string;
  instanceId: string;
  name: string;
  method: FlowMethod;
  authorId: string;
  tagsIds: string[];
  flowData: {
    nodes: IncomingNode[];
    edges: IncomingEdge[];
    viewport: Prisma.JsonValue;
    secrets?: IncomingSecret[];
  };
}

interface IncomingSecret {
  id: string;
  name: string;
  category: string;
  secret: string;
  shouldEncrypt: boolean;
}

/**
 * Transforms incoming flow data to the format expected by the upsertFlow function.
 * @param {IncomingData} incomingData - The incoming flow data from the old function.
 * @returns {FlowCreateInput} - Transformed flow data suitable for the upsertFlow function.
 */
export const transformIncomingData = (
  incomingData: IncomingData,
): FlowCreateInput => {
  const {
    flowId,
    instanceId,
    name,
    method,
    tagsIds,
    flowData: { nodes, edges, viewport, secrets },
  } = incomingData;

  // Transform tagsIds to tags array with numeric IDs
  const tags: { id: number }[] = tagsIds.map((tagId) => {
    const parsedId = parseInt(tagId, 10);
    if (isNaN(parsedId)) {
      throw new Error(`Invalid tagId: ${tagId}`);
    }
    return { id: parsedId };
  });

  // Transform nodes
  const transformedNodes = nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position:
      node.position !== null && node.position !== undefined
        ? node.position
        : Prisma.DbNull,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    arn: node.arn,
    infrastructureId: node.infrastructureId,
    name: node.name,
    rfId: node.rfId,
    metadata: node.metadata ?? Prisma.DbNull,
    deleted: node.deleted,
  }));

  // Transform edges with dynamic fields
  const transformedEdges = edges.map((edge) => ({
    id: edge.id,
    sourceNodeId: edge.sourceNodeId,
    targetNodeId: edge.targetNodeId,
    rfId: edge.rfId ?? null,
    name: edge.name ?? null,
    isActive: edge.isActive ?? false,
    type: edge.type ?? EdgeType.default,
    normalizedKey: edge.normalizedKey ?? null,
    metadata: edge.metadata ?? Prisma.DbNull,
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
  }));

  // Transform secrets if available
  const transformedSecrets = secrets
    ? secrets.map((secret) => ({
        name: secret.name,
        category: secret.category as SecretCategory,
        secret: secret.secret,
        shouldEncrypt: secret.shouldEncrypt,
      }))
    : [];

  // Construct the transformed flow data
  const transformedFlowData: FlowCreateInput = {
    id: flowId,
    instance: { connect: { id: instanceId } },
    name,
    method,
    isEnabled: true,
    deleted: false,
    tags: { connect: tags },
    nodes: {
      create: transformedNodes,
    },
    edges: {
      create: transformedEdges,
    },
    secrets: {
      create: transformedSecrets,
    },
    viewport: viewport ?? Prisma.DbNull,
  };

  return transformedFlowData;
};
