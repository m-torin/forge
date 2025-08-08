import { rem } from '@mantine/core';
import { 
  IconArrowBackUp, 
  IconArrowForwardUp, 
  IconFocus2,
  IconDownload,
  IconLock,
  IconLockOpen,
  IconEye,
  IconEyeOff
} from '@tabler/icons-react';
import { 
  Controls, 
  ControlButton, 
  useReactFlow,
  useStore,
  type ReactFlowState 
} from '@xyflow/react';
import { useCallback, useState } from 'react';
import { logInfo, logDebug } from '@repo/observability';
import { FbNode, FbEdge } from '../../types';

const DEBUG = process.env.NODE_ENV === 'development';
const debug = DEBUG ? logDebug : () => {};

export const CustomControls = () => {
  const { 
    fitView, 
    setNodes, 
    setEdges,
    toObject 
  } = useReactFlow<FbNode, FbEdge>();
  
  const [isLocked, setIsLocked] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  
  // Advanced store selectors for control state  
  const nodeCount = useStore((s: ReactFlowState) => s.nodes.length);
  const edgeCount = useStore((s: ReactFlowState) => s.edges.length);
  const selectedNodes = useStore((s: ReactFlowState) => 
    s.nodes.filter((node: any) => node.selected)
  );
  
  // Enhanced fit view with modern options
  const handleFitView = useCallback(() => {
    fitView({
      padding: {
        x: '20px',
        y: '20px',
        top: '10px',
        bottom: '40px',
      },
      duration: 600,
      minZoom: 0.1,
      maxZoom: 1.5,
    });
    debug('🎯 Fit view executed', { nodeCount, edgeCount });
  }, [fitView, nodeCount, edgeCount]);

  // Export flow as JSON
  const handleExport = useCallback(() => {
    const flowData = toObject();
    const dataStr = JSON.stringify(flowData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `flow-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    logInfo('📄 Flow exported', { 
      nodeCount: flowData.nodes.length,
      edgeCount: flowData.edges.length,
      fileName: exportFileDefaultName
    });
  }, [toObject]);

  // Toggle node interaction lock
  const handleToggleLock = useCallback(() => {
    const newLockState = !isLocked;
    setIsLocked(newLockState);
    
    setNodes((nodes) => 
      nodes.map((node) => ({
        ...node,
        draggable: !newLockState,
        connectable: !newLockState,
        deletable: !newLockState,
      }))
    );
    
    setEdges((edges) =>
      edges.map((edge) => ({
        ...edge,
        deletable: !newLockState,
      }))
    );
    
    debug('🔒 Flow lock toggled', { locked: newLockState });
    logInfo(`Flow ${newLockState ? 'locked' : 'unlocked'}`, { 
      affectedNodes: nodeCount,
      affectedEdges: edgeCount 
    });
  }, [isLocked, setNodes, setEdges, nodeCount, edgeCount]);

  // Toggle node visibility
  const handleToggleVisibility = useCallback(() => {
    const newHiddenState = !isHidden;
    setIsHidden(newHiddenState);
    
    setNodes((nodes) => 
      nodes.map((node) => ({
        ...node,
        hidden: newHiddenState && !node.selected, // Keep selected nodes visible
      }))
    );
    
    debug('👁️ Node visibility toggled', { hidden: newHiddenState });
    logInfo(`Nodes ${newHiddenState ? 'hidden' : 'shown'}`, {
      totalNodes: nodeCount,
      selectedNodes: selectedNodes.length,
      hiddenNodes: newHiddenState ? nodeCount - selectedNodes.length : 0
    });
  }, [isHidden, setNodes, nodeCount, selectedNodes]);

  // Future: Implement proper undo/redo with history management
  const handleUndo = useCallback(() => {
    // TODO: Implement with React Flow's state history
    debug('⏪ Undo requested - feature pending implementation');
    logInfo('Undo requested (feature pending)');
  }, []);

  const handleRedo = useCallback(() => {
    // TODO: Implement with React Flow's state history  
    debug('⏩ Redo requested - feature pending implementation');
    logInfo('Redo requested (feature pending)');
  }, []);

  return (
    <Controls 
      style={{ marginBottom: rem(80) }}
      showFitView={false} // We'll use our custom fit view
      showZoom={true}
      showInteractive={true}
    >
      {/* Fit View with enhanced options */}
      <ControlButton
        onClick={handleFitView}
        title="Fit view with smart padding"
        aria-label="Fit all elements in view"
      >
        <IconFocus2 size={16} />
      </ControlButton>

      {/* Export Flow */}
      <ControlButton
        onClick={handleExport}
        title="Export flow as JSON"
        aria-label="Export current flow"
      >
        <IconDownload size={16} />
      </ControlButton>

      {/* Toggle Lock */}
      <ControlButton
        onClick={handleToggleLock}
        title={isLocked ? "Unlock flow editing" : "Lock flow editing"}
        aria-label={isLocked ? "Unlock nodes and edges" : "Lock nodes and edges"}
        style={{ 
          backgroundColor: isLocked ? 'var(--mantine-color-red-1)' : undefined,
          color: isLocked ? 'var(--mantine-color-red-7)' : undefined 
        }}
      >
        {isLocked ? <IconLock size={16} /> : <IconLockOpen size={16} />}
      </ControlButton>

      {/* Toggle Visibility */}
      <ControlButton
        onClick={handleToggleVisibility}
        title={isHidden ? "Show all nodes" : "Hide unselected nodes"}
        aria-label={isHidden ? "Show all nodes" : "Hide unselected nodes"}
        style={{ 
          backgroundColor: isHidden ? 'var(--mantine-color-yellow-1)' : undefined,
          color: isHidden ? 'var(--mantine-color-yellow-7)' : undefined 
        }}
      >
        {isHidden ? <IconEyeOff size={16} /> : <IconEye size={16} />}
      </ControlButton>

      {/* Undo/Redo - Prepared for future implementation */}
      <ControlButton
        onClick={handleUndo}
        title="Undo last action (coming soon)"
        disabled={true} // TODO: Enable when history is implemented
        aria-label="Undo last action"
      >
        <IconArrowBackUp size={16} />
      </ControlButton>
      
      <ControlButton
        onClick={handleRedo}
        title="Redo last action (coming soon)"
        disabled={true} // TODO: Enable when history is implemented
        aria-label="Redo last action"
      >
        <IconArrowForwardUp size={16} />
      </ControlButton>
    </Controls>
  );
};
