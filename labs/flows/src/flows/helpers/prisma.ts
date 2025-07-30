import { MarkerType, XYPosition } from '@xyflow/react';
import { logInfo } from '@repo/observability';
import { FbEdge, FbNode, FbNodeData } from '../types';
import { Edge as PrismaEdge, Node as PrismaNode , Prisma } from '@prisma/client';
import { nodeMetaMap, NodeTypesEnum } from '../nodes';
import type { EdgeMetadata, FbEdgeData, MetaType } from '../types';
import { IconName } from '../nodes/iconMap';

interface StoredNodeMetadata {
  isEnabled: boolean;
  metadata: Record<string, unknown>;
  formFields: Record<string, unknown>;
  payload: {
    formValues: Record<string, unknown>;
  };
  nodeType: keyof typeof NodeTypesEnum;
  uxMeta: {
    heading: string;
    isExpanded: boolean;
    layer: number;
    isLocked: boolean;
    rotation: number;
  };
}

interface StoredEdgeMetadata {
  label: string;
  isActive: boolean;
  normalizedKey: string | null;
  style: Record<string, unknown>;
  edgeFormatting?: Record<string, unknown>;
}

/**
 * Gets node metadata for a given node type with type safety
 */
function getNodeMeta(type: keyof typeof NodeTypesEnum): MetaType {
  const meta = nodeMetaMap[type];
  if (!meta) {
    return {
      displayName: 'Default Node',
      group: 'Default',
      icon: 'IconSquare' as IconName,
      color: 'gray',
      type: 'default',
    };
  }
  return meta;
}

/**
 * Safely validates and returns position data
 */
function validatePosition(position: unknown): XYPosition {
  if (
    typeof position === 'object' &&
    position !== null &&
    'x' in position &&
    'y' in position &&
    typeof position.x === 'number' &&
    typeof position.y === 'number'
  ) {
    return position as XYPosition;
  }
  return { x: 0, y: 0 };
}

/**
 * Parse stored metadata with type safety
 */
function parseStoredNodeMetadata(rawMetadata: unknown): StoredNodeMetadata {
  const metadata = (rawMetadata as Record<string, unknown>) || {};
  const uxMeta = (metadata.uxMeta as Record<string, unknown>) || {};

  return {
    isEnabled: Boolean(metadata.isEnabled ?? true),
    metadata: (metadata.metadata as Record<string, unknown>) || {},
    formFields: (metadata.formFields as Record<string, unknown>) || {},
    payload: {
      formValues:
        ((metadata.payload as Record<string, unknown>)?.formValues as Record<
          string,
          unknown
        >) || {},
    },
    nodeType: (metadata.nodeType as keyof typeof NodeTypesEnum) || 'default',
    uxMeta: {
      heading: String(uxMeta.heading || ''),
      isExpanded: Boolean(uxMeta.isExpanded ?? false),
      layer: Number(uxMeta.layer ?? 0),
      isLocked: Boolean(uxMeta.isLocked ?? false),
      rotation: Number(uxMeta.rotation ?? 0),
    },
  };
}

/**
 * Parse stored edge metadata with type safety
 */
function parseStoredEdgeMetadata(rawMetadata: unknown): StoredEdgeMetadata {
  const metadata = (rawMetadata as Record<string, unknown>) || {};

  return {
    label: String(metadata.label || ''),
    isActive: Boolean(metadata.isActive ?? true),
    normalizedKey: metadata.normalizedKey
      ? String(metadata.normalizedKey)
      : null,
    style: (metadata.style as Record<string, unknown>) || {},
    edgeFormatting: (metadata.edgeFormatting as Record<string, unknown>) || {},
  };
}

/**
 * Factory function to create FbNode
 */
function createFbNode(node: PrismaNode): FbNode {
  const nodeType = (node.type as keyof typeof NodeTypesEnum) || 'default';
  const nodeMeta = getNodeMeta(nodeType);
  const storedMetadata = parseStoredNodeMetadata(node.metadata);

  const nodeData: FbNodeData = {
    arn: node.arn,
    deleted: node.deleted,
    id: node.id,
    infrastructureId: node.infrastructureId,
    position: validatePosition(node.position),
    rfId: node.rfId,
    type: nodeType,
    uxMeta: storedMetadata.uxMeta,
    nodeMeta,
    formFields: storedMetadata.formFields as Prisma.JsonValue,
    payload: storedMetadata.payload,
    isEnabled: storedMetadata.isEnabled,
    metadata: storedMetadata.metadata as Prisma.JsonValue,
    name: node.name || null,
    prismaData: {
      arn: node.arn,
      createdAt: node.createdAt,
      deleted: node.deleted,
      id: node.id,
      infrastructureId: node.infrastructureId,
      metadata: node.metadata,
      name: node.name,
      position: node.position,
      rfId: node.rfId,
      type: node.type,
      updatedAt: node.updatedAt,
    },
  };

  return {
    id: node.id,
    type: nodeType,
    position: validatePosition(node.position),
    data: nodeData,
    uxMeta: storedMetadata.uxMeta,
    nodeMeta,
    nodeType,
  };
}

/**
 * Factory function to create FbEdge
 */
function createFbEdge(edge: PrismaEdge): FbEdge {
  logInfo('Creating FbEdge', { edge });
  const edgeMetadata = parseStoredEdgeMetadata(edge.metadata);
  logInfo('FbEdge metadata parsed', { edgeMetadata });

  const edgeData: FbEdgeData & EdgeMetadata = {
    // FbEdgeData properties
    id: edge.id,
    rfId: edge.rfId || null,
    // label: edge.label || null,
    type: edge.type,
    isActive: edge.isActive,
    normalizedKey: edge.normalizedKey,
    sourceNodeId: edge.sourceNodeId,
    targetNodeId: edge.targetNodeId,
    deleted: edge.deleted,
    flowId: edge.flowId,
    className: undefined,
    metadata: edge.metadata as Prisma.JsonValue,
    // EdgeMetadata specific properties
    label: edgeMetadata.label,
    style: edgeMetadata.style,
  };

  return {
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    type: edge.type,
    markerEnd: { type: MarkerType.ArrowClosed },
    data: edgeData,
    style: edgeMetadata.style,
    ...edgeMetadata.edgeFormatting,
  };
}

/**
 * Transforms Prisma nodes and edges to FlowNode and FlowEdge formats with type safety
 */
export function transformPrismaToXYFlow(
  nodes: PrismaNode[],
  edges: PrismaEdge[],
): { nodes: FbNode[]; edges: FbEdge[] } {
  return {
    nodes: nodes.map(createFbNode),
    edges: edges.map(createFbEdge),
  };
}

/**
 * Safely extracts metadata from a node with type checking
 */
export function extractNodeMetadata(node: PrismaNode): Record<string, unknown> {
  try {
    return typeof node.metadata === 'object' && node.metadata !== null
      ? (node.metadata as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

/**
 * Validates node metadata structure
 */
export function isValidNodeMetadata(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== 'object') return false;

  const meta = metadata as Record<string, unknown>;
  return (
    'isEnabled' in meta &&
    'metadata' in meta &&
    'formFields' in meta &&
    'payload' in meta &&
    typeof meta.metadata === 'object' &&
    typeof meta.formFields === 'object' &&
    typeof meta.payload === 'object'
  );
}
