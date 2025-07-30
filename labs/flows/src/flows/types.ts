// =============================================================================
// Imports
// =============================================================================

import {
  Connection,
  ConnectionLineComponentProps,
  ConnectionLineType,
  CoordinateExtent,
  DefaultEdgeOptions,
  Edge,
  EdgeChange,
  EdgeProps,
  Node,
  NodeChange,
  NodeProps,
  PanelPosition,
  ReactFlowInstance,
  Viewport,
} from '@xyflow/react';

import {
  Prisma,
  Flow,
  FlowMethod,
  Node as PrismaNode,
  Edge as PrismaEdge,
  EdgeType as PrismaEdgeType,
} from '@prisma/client';

import { IconName } from './nodes/iconMap';
import { NodeTypesEnum } from '#/flows/nodes';

// =============================================================================
// Prisma Base Types
// =============================================================================

export type PrismaFlowCreate = Prisma.FlowCreateInput;
export type PrismaFlowUpdate = Prisma.FlowUpdateInput;
export type PrismaNodeCreate = Prisma.NodeCreateInput;
export type PrismaNodeUpdate = Prisma.NodeUpdateInput;
export type PrismaEdgeCreate = Prisma.EdgeCreateInput;
export type PrismaEdgeUpdate = Prisma.EdgeUpdateInput;

// =============================================================================
// Flow Builder Core Types
// =============================================================================

export interface MetaType {
  displayName: string;
  group: string;
  icon: IconName;
  color: string;
  type: `${string}`; // Use template literal type to accept string literals
}

export type FlowUpdate = {
  name: string;
  method: FlowMethod;
  isEnabled: boolean;
  metadata?: Prisma.JsonValue;
  viewport?: Viewport;
};

// =============================================================================
// NODE TYPES
// =============================================================================

// Define UX Metadata
export interface UxMeta {
  heading?: string;
  isExpanded?: boolean;
  layer?: number;
  isLocked?: boolean;
  rotation?: number;
}

// Define NodeMetadata Structure
export interface NodeMetadata {
  metadata?: Prisma.JsonValue;
  formFields?: Prisma.JsonValue;
  formValues?: Prisma.JsonValue;
  nodeType?: keyof typeof NodeTypesEnum;
  uxMeta?: UxMeta;
}

// Define base interface for node data
interface BaseNodeData {
  [key: string]: unknown;
  type: keyof typeof NodeTypesEnum;
  uxMeta: UxMeta;
  nodeMeta: MetaType;
  formFields?: Prisma.JsonValue;
  isEnabled: boolean;
  metadata: Prisma.JsonValue;
  name: string | null;
  prismaData?: Omit<PrismaNode, 'flowId' | 'flow'>;
}

// Define Custom Node Data by extending PrismaNode
export interface FbNodeData
  extends Omit<
      PrismaNode,
      'flowId' | 'flow' | 'createdAt' | 'updatedAt' | 'type' | 'metadata'
    >,
    BaseNodeData {}

// Define FbNode type with extended properties
export interface FbNode extends Node<FbNodeData, keyof typeof NodeTypesEnum> {
  uxMeta: UxMeta;
  nodeMeta: MetaType;
  nodeType: keyof typeof NodeTypesEnum;
  data: FbNodeData & NodeMetadata;
}

// Props and Types for FbNode
export type FbNodeProps = NodeProps<FbNode>;
export type FbNodeTypes = Record<string, React.ComponentType<FbNodeProps>>;
export type FbNodeChange = NodeChange;

// =============================================================================
// EDGE TYPES
// =============================================================================

// Define Edge Metadata Structure
export interface EdgeMetadata {
  metadata: Prisma.JsonValue;
  label?: string;
  isActive?: boolean;
  isEditable?: boolean;
  isDeletable?: boolean;
  normalizedKey?: string | null;
  style?: Record<string, unknown>;
}

// Define base interface for edge data
interface BaseEdgeData {
  [key: string]: unknown;
  className?: string;
  metadata: Prisma.JsonValue;
  prismaData?: Omit<
    PrismaEdge,
    'flowId' | 'flow' | 'sourceNode' | 'targetNode'
  >;
}

// Define Custom Edge Data by extending PrismaEdge
export interface FbEdgeData
  extends Omit<
      PrismaEdge,
      | 'flowId'
      | 'flow'
      | 'sourceNode'
      | 'targetNode'
      | 'createdAt'
      | 'updatedAt'
      | 'metadata'
    >,
    Omit<BaseEdgeData, 'label'> {
  // If you need to override the label type, you can do it here
  label: string | null;
}

// Define FbEdge type with extended properties
export type FbEdge = Edge<FbEdgeData & EdgeMetadata, PrismaEdgeType>;

// Props and Types for FbEdge
export type FbEdgeProps = EdgeProps<FbEdge>;
export type FbEdgeTypes = Record<string, React.ComponentType<FbEdgeProps>>;
export type FbEdgeChange = EdgeChange;
export type FbDefaultEdgeOptions = DefaultEdgeOptions;

// =============================================================================
// CONNECTION TYPES
// =============================================================================

export type FbConnection = Connection;
export type FbConnectionResult = {
  isValid: boolean | null;
  connection?: FbConnection;
};
export type FbConnectionLineComponentProps = ConnectionLineComponentProps;
export type FbConnectionLineType = ConnectionLineType;

// =============================================================================
// FLOW ACTION TYPES
// =============================================================================

export type FlowUpsertData = {
  id: string;
  instanceId: string | null;
  flowData: Omit<PrismaFlowUpdate, 'nodes' | 'edges'>;
  nodes: {
    delete?: { id: string }[];
    upsert?: Array<{
      where: { id: string };
      create: Omit<PrismaNodeCreate, 'flow' | 'flowId'>;
      update: Partial<PrismaNodeUpdate>;
    }>;
  };
  edges: {
    delete?: { id: string }[];
    upsert?: Array<{
      where: { id: string };
      create: Omit<
        PrismaEdgeCreate,
        'flow' | 'flowId' | 'sourceNode' | 'targetNode'
      > & {
        sourceNodeId: string;
        targetNodeId: string;
      };
      update: Partial<PrismaEdgeUpdate>;
    }>;
  };
};

export type FlowUpsertResponse = {
  success: boolean;
  data?: {
    flow: Flow & {
      nodes: PrismaNode[];
      edges: PrismaEdge[];
    };
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

// =============================================================================
// UTILITY TYPES AND HELPERS
// =============================================================================

export type FbCoordinateExtent = CoordinateExtent;
export type FbFitViewOptions = {
  padding?: number;
  includeHiddenNodes?: boolean;
  minZoom?: number;
  maxZoom?: number;
};
export type FbPanelPosition = PanelPosition;
export type FbReactFlowInstance = ReactFlowInstance<FbNode, FbEdge>;
export type FbViewport = Viewport;

// Typical JSON value types
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

// JSON array type
export type JsonArray = JsonValue[];

// JSON object type
export type JsonObject = {
  [key: string]: JsonValue;
};
