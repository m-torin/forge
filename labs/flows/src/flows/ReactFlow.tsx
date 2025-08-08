'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  Panel,
  useReactFlow,
  useOnSelectionChange,
  useStore,
  useKeyPress,
  type FitViewOptions,
  type ReactFlowState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useRouter } from 'next/navigation';
import { Button, Portal, TextInput, Group } from '@mantine/core';
import { useField } from '@mantine/form';
import { logInfo, logError, logDebug } from '@repo/observability';
import { isDemoModeClient } from '#/lib/demoMode';
import { useReactFlowSetup } from './propHandlers';
import { useAppContext } from '#/app/flow/[cuid]/FlowProvider';
import { FlowAside } from './ui/rightSidebar';
import { rfNodeTypes } from './nodes';
import { CustomControls, MiniMapNode } from './ui';
import { FbEdge, FbNode } from './types';
import { FlowMethod } from '@prisma/client';
import { useDocumentTitle } from '@mantine/hooks';
import { saveFlowAction } from './saveFlowAction';

const DEBUG = process.env.NODE_ENV === 'development';
const debug = DEBUG ? logDebug : () => {};

export const ReactFlow12: React.FC = () => {
  const { prismaData, dndType } = useAppContext();
  debug('Prisma Data initialized in ReactFlow', { hasData: !!prismaData, dndType });

  const { flowProps } = useReactFlowSetup(prismaData, dndType, rfNodeTypes);
  const _router = useRouter();
  const reactFlowInstance = useReactFlow<FbNode, FbEdge>();

  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, _setIsRestoring] = useState(false);
  const [selectedElements, setSelectedElements] = useState<{ nodes: FbNode[], edges: FbEdge[] }>({ nodes: [], edges: [] });

  // Keyboard shortcuts for enhanced accessibility
  const deleteKeyPressed = useKeyPress(['Delete', 'Backspace']);
  const escapeKeyPressed = useKeyPress('Escape');
  const spaceKeyPressed = useKeyPress(' ');
  const ctrlSPressed = useKeyPress(['ctrl+s', 'cmd+s']);
  const ctrlZPressed = useKeyPress(['ctrl+z', 'cmd+z']);
  const ctrlYPressed = useKeyPress(['ctrl+y', 'cmd+y']);
  const ctrlAPressed = useKeyPress(['ctrl+a', 'cmd+a']);

  // Advanced store selectors for performance monitoring
  const isInteractive = useStore((s: ReactFlowState) => s.nodesDraggable && s.nodesConnectable);
  
  // Track selection changes for enhanced UX
  useOnSelectionChange({
    onChange: useCallback(({ nodes, edges }: { nodes: FbNode[], edges: FbEdge[] }) => {
      setSelectedElements({ nodes, edges });
      debug('🎯 Selection changed', { 
        selectedNodes: nodes.length,
        selectedEdges: edges.length,
        nodeIds: nodes.map(n => n.id),
        edgeIds: edges.map(e => e.id),
      });
    }, []),
  });

  const flowNameField = useField({
    initialValue: prismaData?.flow?.name || '',
    validateOnChange: true,
    validateOnBlur: true,
    validate: (value) => {
      const trimmed = value.trim();
      if (!trimmed) return 'Flow name is required';
      if (trimmed.length < 3) return 'Flow name must be at least 3 characters';
      return null;
    },
    onValueChange: (value) => {
      // Additional side effects when value changes
      debug('📝 Flow name changed', { newValue: value });
    },
  });

  // Set document title based on flow name
  useDocumentTitle(
    flowNameField.getValue() ? `${flowNameField.getValue()} Flow` : 'New Flow',
  );

  // Initialize flow name from prismaData
  useEffect(() => {
    if (
      prismaData?.flow?.name &&
      prismaData.flow.name !== flowNameField.getValue()
    ) {
      debug('📝 Initializing flow name', {
        newName: prismaData.flow.name,
        currentName: flowNameField.getValue(),
      });
      flowNameField.setValue(prismaData.flow.name);
    }
  }, [prismaData?.flow?.name, flowNameField]);

  useEffect(() => {
    debug('Flow state updated', {
      hasPrismaData: !!prismaData,
      hasFlowProps: !!flowProps,
      nodesCount: reactFlowInstance.getNodes().length,
      edgesCount: reactFlowInstance.getEdges().length,
    });
  }, [prismaData, flowProps, reactFlowInstance]);

  /////
  const handleSave = useCallback(async () => {
    if (!prismaData) {
      return;
    }

    setIsSaving(true);

    try {
      const flowId = prismaData.flow.id;
      const instanceId = prismaData.flow.instanceId;

      // Get the current flow state
      const currentFlow = reactFlowInstance.toObject();

      // Transform nodes to ensure required properties
      const validatedNodes = currentFlow.nodes.map((node) => ({
        ...node,
        // Ensure type is always defined
        type: node.type || 'default',
        data: {
          ...node.data,
          // Ensure required data properties
          type: node.data.type || 'default',
          nodeMeta: {
            ...node.data.nodeMeta,
            type: node.data.nodeMeta?.type || 'default',
          },
          // Ensure other required properties
          name: node.data.name || null,
          metadata: node.data.metadata || {},
          isEnabled: node.data.isEnabled ?? true,
        },
        // Ensure position is defined
        position: node.position || { x: 0, y: 0 },
      }));

      const payload = {
        flowId,
        instanceId,
        flowData: {
          ...currentFlow,
          nodes: validatedNodes,
        },
        updatedFlow: {
          name: flowNameField.getValue(),
          method: prismaData.flow.method ?? FlowMethod.observable,
          isEnabled: prismaData.flow.isEnabled ?? false,
          metadata: prismaData.flow.metadata,
        },
      };

      // Validate payload structure before sending
      logInfo('📤 Sending payload', { payload });

      const result = await saveFlowAction(payload);

      if (result.success) {
        logInfo('✅ Flow saved successfully', { result: result.data });
      } else {
        // In demo mode, suppress error logging to avoid console noise
        if (!isDemoModeClient()) {
          logError('❌ Error saving flow', { error: (result as any).error });
        }
      }
    } catch (error) {
      // In demo mode, suppress error logging to avoid console noise
      if (!isDemoModeClient()) {
        logError('💥 Error in handleSave', { error });
      }
    } finally {
      setIsSaving(false);
    }
  }, [reactFlowInstance, flowNameField, prismaData]);
  /////

  // Modern React Flow error handler
  const onError = useCallback((id: string, message: string) => {
    logError('🚨 React Flow Error', { id, message });
    
    // In demo mode, show user-friendly message  
    if (isDemoModeClient()) {
      logError(`React Flow: Non-critical error in demo mode [${id}]:`, { message });
    }
  }, []);

  // Modern deletion handlers with proper React Flow v12 signatures
  const onBeforeDelete = useCallback(async ({ nodes, edges }: { nodes: FbNode[], edges: FbEdge[] }) => {
    // Filter out nodes/edges that shouldn't be deleted (e.g., locked nodes)
    const filteredNodes = nodes.filter((node) => {
      const nodeData = node.data as any;
      if (nodeData?.uxMeta?.isLocked) {
        debug('🔒 Prevented deletion of locked node', { nodeId: node.id });
        return false;
      }
      return true;
    });

    const filteredEdges = edges.filter((edge) => {
      const edgeData = edge.data as any;
      if (edgeData?.isDeletable === false) {
        debug('🔒 Prevented deletion of protected edge', { edgeId: edge.id });
        return false;
      }
      return true;
    });

    debug('🗑️ Deletion validation', { 
      nodesRequested: nodes.length,
      nodesAllowed: filteredNodes.length,
      edgesRequested: edges.length,
      edgesAllowed: filteredEdges.length,
    });

    return { nodes: filteredNodes, edges: filteredEdges };
  }, []);

  const onDelete = useCallback(({ nodes, edges }: { nodes: FbNode[], edges: FbEdge[] }) => {
    debug('🗑️ Elements deleted', { 
      deletedNodes: nodes.map(n => n.id),
      deletedEdges: edges.map(e => e.id),
    });

    // Log deletion for audit purposes
    logInfo('Flow elements deleted', {
      nodeIds: nodes.map(n => n.id),
      edgeIds: edges.map(e => e.id),
      flowId: prismaData?.flow?.id,
    });

    // Additional cleanup logic can go here
    // e.g., cleanup related resources, notify other components, etc.
  }, [prismaData?.flow?.id]);

  // Keyboard shortcut handlers for enhanced UX
  useEffect(() => {
    if (deleteKeyPressed && selectedElements.nodes.length > 0) {
      const nodesToDelete = selectedElements.nodes.filter(node => {
        const nodeData = node.data as any;
        return !nodeData?.uxMeta?.isLocked;
      });
      
      if (nodesToDelete.length > 0) {
        debug('⌨️ Delete key pressed', { 
          selectedNodes: selectedElements.nodes.length,
          deletableNodes: nodesToDelete.length 
        });
        
        reactFlowInstance.deleteElements({ 
          nodes: nodesToDelete,
          edges: selectedElements.edges 
        });
      }
    }
  }, [deleteKeyPressed, selectedElements, reactFlowInstance]);

  useEffect(() => {
    if (escapeKeyPressed) {
      debug('⌨️ Escape key pressed - clearing selection');
      reactFlowInstance.setNodes((nodes) => 
        nodes.map(node => ({ ...node, selected: false }))
      );
      reactFlowInstance.setEdges((edges) => 
        edges.map(edge => ({ ...edge, selected: false }))
      );
    }
  }, [escapeKeyPressed, reactFlowInstance]);

  useEffect(() => {
    if (spaceKeyPressed) {
      debug('⌨️ Space key pressed - fit view');
      reactFlowInstance.fitView({
        padding: { x: 20, y: 20 },
        duration: 600,
      });
    }
  }, [spaceKeyPressed, reactFlowInstance]);

  useEffect(() => {
    if (ctrlSPressed) {
      debug('⌨️ Ctrl+S pressed - saving flow');
      handleSave();
    }
  }, [ctrlSPressed, handleSave]);

  useEffect(() => {
    if (ctrlAPressed) {
      debug('⌨️ Ctrl+A pressed - select all');
      reactFlowInstance.setNodes((nodes) => 
        nodes.map(node => ({ ...node, selected: true }))
      );
      reactFlowInstance.setEdges((edges) => 
        edges.map(edge => ({ ...edge, selected: true }))
      );
    }
  }, [ctrlAPressed, reactFlowInstance]);

  useEffect(() => {
    if (ctrlZPressed) {
      debug('⌨️ Ctrl+Z pressed - undo (feature pending)');
      // TODO: Implement undo functionality
    }
  }, [ctrlZPressed]);

  useEffect(() => {
    if (ctrlYPressed) {
      debug('⌨️ Ctrl+Y pressed - redo (feature pending)');
      // TODO: Implement redo functionality
    }
  }, [ctrlYPressed]);

  // Modern fitView options with enhanced padding support
  const fitViewOptions: FitViewOptions = {
    padding: {
      x: '20px',
      y: '20px',
      top: '10px',
      bottom: '40px', // Extra space for bottom panel
    },
    duration: 800,
    minZoom: 0.1,
    maxZoom: 2,
  };

  const nodeColor = useCallback((node: FbNode) => {
    switch (node.type) {
      default:
        return '#ff0072';
    }
  }, []);

  const snapGrid: [number, number] = [20, 20];

  return (
    <ReactFlow<FbNode, FbEdge>
      {...flowProps}
      snapToGrid
      snapGrid={snapGrid}
      fitView
      fitViewOptions={fitViewOptions}
      onError={onError}
      onDelete={onDelete}
      onBeforeDelete={onBeforeDelete}
      // Enhanced accessibility and interaction
      aria-label="Interactive flow editor"
      role="application"
      tabIndex={0}
      // Modern keyboard navigation
      multiSelectionKeyCode={['Meta', 'Shift']}
      deleteKeyCode={['Delete', 'Backspace']}
      selectionKeyCode={null} // Disable default selection box
      // Performance optimizations
      elevateNodesOnSelect={true}
      elevateEdgesOnSelect={false}
    >
      <Background
        id="1"
        gap={20}
        color="#f1f1f1"
        variant={BackgroundVariant.Lines}
      />
      <Background
        id="2"
        gap={100}
        offset={0}
        color="#ccc"
        variant={BackgroundVariant.Lines}
      />

      <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-lg">
        <Group>
          {isDemoModeClient() && (
            <div className="mb-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
              🎯 Demo Mode - Changes saved to browser only
            </div>
          )}
          
          {/* Enhanced status display */}
          <div className="mb-2 text-xs text-gray-600">
            {selectedElements.nodes.length > 0 && (
              <span className="mr-3">
                📦 {selectedElements.nodes.length} node{selectedElements.nodes.length !== 1 ? 's' : ''} selected
              </span>
            )}
            {selectedElements.edges.length > 0 && (
              <span className="mr-3">
                🔗 {selectedElements.edges.length} edge{selectedElements.edges.length !== 1 ? 's' : ''} selected
              </span>
            )}
            {isInteractive ? (
              <span className="text-green-600">🟢 Interactive</span>
            ) : (
              <span className="text-gray-500">⏸️ Static</span>
            )}
          </div>

          {/* Keyboard shortcuts help */}
          <div className="mb-2 text-xs text-gray-500 leading-tight">
            <div className="font-medium text-gray-700 mb-1">⌨️ Shortcuts:</div>
            <div>Space: Fit view • Ctrl+S: Save • Ctrl+A: Select all</div>
            <div>Delete: Remove selected • Escape: Clear selection</div>
          </div>

          <TextInput
            {...flowNameField.getInputProps()}
            placeholder="Enter flow name"
            label="Flow Name"
            className="min-w-[200px]"
            error={flowNameField.error}
            required
          />
          <Group mt={24}>
            <Button
              onClick={handleSave}
              loading={isSaving}
              disabled={
                isSaving ||
                isRestoring ||
                !flowNameField.getValue().trim() ||
                !!flowNameField.error
              }
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </Group>
        </Group>
      </Panel>

      <CustomControls />

      <MiniMap
        nodeColor={nodeColor}
        nodeStrokeWidth={3}
        nodeComponent={MiniMapNode}
        zoomable
        pannable
      />

      <Portal target="#applayout-aside">
        <FlowAside />
      </Portal>
    </ReactFlow>
  );
};
