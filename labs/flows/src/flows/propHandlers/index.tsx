// index.tsx

import { useMemo, useCallback } from 'react';
import {
  useNodesState,
  useEdgesState,
  NodeTypes,
  ReactFlowProps,
  useReactFlow,
  Connection,
  addEdge,
  type IsValidConnection,
} from '@xyflow/react';
import { logWarn, logError } from '@repo/observability';
import { FbNode, FbEdge, FbNodeData } from '../types';
import { NodeTypesEnum, nodeMetaMap } from '../nodes';
import { NodeType } from '@prisma/client';
import { edgeTypes } from '../edges';

const getId = (): string => `node_${Math.random().toString(36).substr(2, 9)}`;
const getEdgeId = (): string =>
  `edge_${Math.random().toString(36).substr(2, 9)}`;

export const useReactFlowSetup = (
  flowData: any,
  dndType: string | null,
  nodeTypes: NodeTypes,
) => {
  const { screenToFlowPosition } = useReactFlow();

  // Transform Prisma nodes to ReactFlow format
  const initialNodes = useMemo(() => {
    if (!flowData?.flow?.nodes) return [];

    return flowData.flow.nodes.map((prismaNode: any): FbNode => {
      const {
        flowId: _flowId,
        flow: _flow,
        metadata: rawMetadata,
        type,
        ...baseNodeData
      } = prismaNode;

      // Validate and assign 'type'
      const nodeType = type as keyof typeof NodeTypesEnum;
      if (!nodeType || !(nodeType in NodeTypesEnum)) {
        logWarn('Invalid or missing node type, assigning default', {
          nodeId: prismaNode.id,
          nodeType
        });
        // Assign a default type if necessary
        // Ensure 'default' exists in NodeTypesEnum
        return {
          id: prismaNode.id,
          type: 'default' as keyof typeof NodeTypesEnum,
          position: prismaNode.position || { x: 0, y: 0 },
          data: {
            ...baseNodeData,
            type: 'default',
            metadata: rawMetadata || {},
            uxMeta: rawMetadata?.uxMeta || {
              heading: prismaNode.name,
              isExpanded: false,
              layer: 0,
              isLocked: false,
              rotation: 0,
            },
            nodeMeta: nodeMetaMap['default'],
            formFields: rawMetadata?.formFields || {},
            isEnabled: true,
            prismaData: {
              ...prismaNode,
              type: 'default' as NodeType,
            },
          },
          uxMeta: rawMetadata?.uxMeta || {
            heading: prismaNode.name,
            isExpanded: false,
            layer: 0,
            isLocked: false,
            rotation: 0,
          },
          nodeMeta: nodeMetaMap['default'],
          nodeType: 'default',
        };
      }

      const nodeMeta = rawMetadata?.nodeMeta || nodeMetaMap[nodeType];

      const uxMeta = rawMetadata?.uxMeta || {
        heading: prismaNode.name,
        isExpanded: false,
        layer: 0,
        isLocked: false,
        rotation: 0,
      };

      // Keep original data structure including the original rfId
      const prismaData = {
        ...prismaNode,
        type: nodeType as NodeType,
      };

      return {
        id: prismaNode.id,
        type: nodeType,
        position: prismaNode.position || { x: 0, y: 0 },
        data: {
          ...baseNodeData,
          type: nodeType,
          metadata: rawMetadata || {},
          uxMeta,
          nodeMeta,
          formFields: rawMetadata?.formFields || {},
          isEnabled: true,
          prismaData,
        },
        uxMeta,
        nodeMeta,
        nodeType,
      };
    });
  }, [flowData?.flow?.nodes]);

  const initialEdges = useMemo(() => {
    if (!flowData?.flow?.edges) return [];

    return flowData.flow.edges.map((prismaEdge: any): FbEdge => {
      const {
        flowId: _flowId,
        flow: _flow,
        sourceNode: _sourceNode,
        targetNode: _targetNode,
        metadata: rawMetadata,
        ...baseEdgeData
      } = prismaEdge;

      return {
        id: prismaEdge.id,
        label: prismaEdge.label,
        source: prismaEdge.sourceNodeId,
        target: prismaEdge.targetNodeId,
        type: prismaEdge.type,
        data: {
          ...baseEdgeData,
          metadata: rawMetadata || {},
          label: prismaEdge.name,
          prismaData: prismaEdge,
        },
      };
    });
  }, [flowData?.flow?.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState<FbNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FbEdge>(initialEdges);

  // Modern connection validation
  const isValidConnection: IsValidConnection = useCallback((connection) => {
    if (!connection.source || !connection.target) return false;
    
    // Prevent self-connections
    if (connection.source === connection.target) return false;
    
    // Check for existing connections to prevent duplicates
    const existingConnection = edges.find(
      (edge) =>
        edge.source === connection.source &&
        edge.target === connection.target &&
        edge.sourceHandle === connection.sourceHandle &&
        edge.targetHandle === connection.targetHandle
    );
    
    if (existingConnection) return false;
    
    // Add custom validation logic based on node types
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);
    
    if (!sourceNode || !targetNode) return false;
    
    // Example: Prevent connections between incompatible node types
    const incompatibleTypes = [
      ['source', 'source'],
      ['destination', 'destination'],
    ];
    
    const sourceType = sourceNode.type || 'default';
    const targetType = targetNode.type || 'default';
    
    const isIncompatible = incompatibleTypes.some(
      ([type1, type2]) =>
        (sourceType.includes(type1) && targetType.includes(type2)) ||
        (sourceType.includes(type2) && targetType.includes(type1))
    );
    
    return !isIncompatible;
  }, [edges, nodes]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isValidConnection(connection)) return;
      
      const edgeId = getEdgeId(); // New edges get edge_xxx id
      setEdges((eds) => addEdge({ 
        ...connection, 
        id: edgeId,
        animated: true, // Make new connections animated by default
      }, eds));
    },
    [setEdges, isValidConnection],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!dndType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeType = dndType as keyof typeof NodeTypesEnum;
      const nodeMeta = nodeMetaMap[nodeType];
      if (!nodeMeta) {
        logError('No meta information found for node type', { nodeType });
        return;
      }

      const nodeId = getId();
      const uxMeta = {
        heading: nodeMeta.displayName,
        isExpanded: false,
        layer: 0,
        isLocked: false,
        rotation: 0,
      };

      const nodeData: FbNodeData = {
        id: nodeId,
        type: nodeType,
        name: nodeMeta.displayName,
        arn: null,
        infrastructureId: null,
        position: null,
        metadata: {},
        rfId: nodeId, // Set rfId to the original node_xxx ID
        deleted: false,
        uxMeta,
        nodeMeta,
        isEnabled: true,
        formFields: {},
      };

      const newNode: FbNode = {
        id: nodeId,
        type: nodeType,
        position,
        data: {
          ...nodeData,
          rfId: nodeId, // Ensure rfId matches the original node_xxx ID
        },
        uxMeta,
        nodeMeta,
        nodeType,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [dndType, screenToFlowPosition, setNodes],
  );

  const flowProps: ReactFlowProps<FbNode, FbEdge> = {
    nodes,
    edges,
    edgeTypes,
    defaultEdgeOptions: {
      type: 'custom',
      markerEnd: 'edge-marker',
      animated: true,
    },
    nodeTypes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDragOver,
    onDrop,
    isValidConnection,
    nodeDragThreshold: 1,
    edgesReconnectable: true,
    defaultViewport: flowData?.flow?.viewport || { x: 0, y: 0, zoom: 1 },
    // Modern accessibility and interaction options
    nodesFocusable: true,
    edgesFocusable: true,
    disableKeyboardA11y: false,
    // Auto-panning configuration
    autoPanOnConnect: true,
    autoPanOnNodeDrag: true,
    connectionRadius: 20,
  };

  return {
    edges,
    flowProps,
    nodes,
    setEdges,
    setNodes,
  };
};
