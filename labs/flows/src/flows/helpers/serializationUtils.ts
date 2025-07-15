import { Prisma } from '@prisma/client';
import type {
  FbNode,
  FbEdge,
  FbNodeData,
  NodeMetadata,
} from '../types';
import type { Viewport } from '@xyflow/react';
import {
  convertToNodeTypesEnum,
  convertToPrismaEdgeType,
} from './typeUtils';

// Import generated schemas only for validation
import {
  NodeTypeSchema,
  EdgeTypeSchema,
} from '#/lib/prisma/generated/schemas';

type SerializedData = {
  nodes: FbNode[];
  edges: FbEdge[];
  viewport: Viewport | null;
};

/**
 * Type-safe node data sanitization
 */
function sanitizeNodeData(
  data: FbNodeData & NodeMetadata,
): FbNodeData & NodeMetadata {
  return {
    ...data,
    type: convertToNodeTypesEnum(data.type),
    metadata: data.metadata ? (data.metadata as Prisma.JsonValue) : null,
    formFields: data.formFields ? (data.formFields as Prisma.JsonValue) : null,
    payload: data.payload || {},
    uxMeta: {
      heading: data.uxMeta?.heading || '',
      isExpanded: Boolean(data.uxMeta?.isExpanded),
      layer: Number(data.uxMeta?.layer || 0),
      isLocked: Boolean(data.uxMeta?.isLocked),
      rotation: Number(data.uxMeta?.rotation || 0),
    },
  };
}

/**
 * Type-safe edge data sanitization
 */
function sanitizeEdgeData(data: FbEdge['data']): FbEdge['data'] {
  if (!data) return undefined;
  return {
    ...data,
    metadata: data.metadata ? (data.metadata as Prisma.JsonValue) : null,
    label: data.label || '',
    isActive: Boolean(data.isActive),
    normalizedKey: data.normalizedKey || null,
  };
}

/**
 * Type-safe viewport sanitization
 */
function sanitizeViewport(viewport: unknown): Viewport | null {
  if (!viewport || typeof viewport !== 'object') return null;
  const viewportObj = viewport as Record<string, unknown>;
  return {
    x: Number(viewportObj.x || 0),
    y: Number(viewportObj.y || 0),
    zoom: Number(viewportObj.zoom || 1),
  };
}

/**
 * Type-safe JSON value transformer
 */
export function sanitizeJsonValue(value: unknown): Prisma.JsonValue {
  if (value === undefined || value === null) {
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
    return value.map(sanitizeJsonValue);
  }

  if (typeof value === 'object' && value !== null) {
    const result: Record<string, Prisma.JsonValue> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      result[key] = sanitizeJsonValue(val);
    });
    return result;
  }

  return null;
}

/**
 * Type-safe flow data sanitization
 */
export function sanitizeFlowData(flow: SerializedData): SerializedData {
  return {
    nodes: flow.nodes.map((node) => ({
      ...node,
      // Keep NodeTypesEnum for React Flow, but ensure it's valid
      type: convertToNodeTypesEnum(node.type),
      data: sanitizeNodeData(node.data),
      position: {
        x: Number(node.position.x),
        y: Number(node.position.y),
      },
    })) as FbNode[],
    edges: flow.edges.map((edge) => ({
      ...edge,
      data: sanitizeEdgeData(edge.data),
      // Keep edge type as PrismaEdgeType
      type: convertToPrismaEdgeType(edge.type),
    })) as FbEdge[],
    viewport: sanitizeViewport(flow.viewport),
  };
}

/**
 * Safe data cloning utility
 */
export function safeClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * Validate node type using generated schema
 */
export function isValidNodeType(type: unknown): boolean {
  try {
    NodeTypeSchema.parse(type);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate edge type using generated schema
 */
export function isValidEdgeType(type: unknown): boolean {
  try {
    EdgeTypeSchema.parse(type);
    return true;
  } catch {
    return false;
  }
}
