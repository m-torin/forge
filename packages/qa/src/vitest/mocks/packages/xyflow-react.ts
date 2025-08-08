/**
 * @fileoverview Centralized React Flow (@xyflow/react) mocks for testing
 *
 * This mock provides all necessary DOM API substitutes and component mocks
 * required for testing React Flow applications in Jest/Vitest environments.
 *
 * Usage:
 * - Import '@repo/qa/vitest/mocks' in your test setup
 * - Use ReactFlowTestWrapper for components that need the provider
 * - Call mockReactFlow() if you need to manually initialize mocks
 *
 * Features:
 * - ResizeObserver mock for DOM measurements
 * - DOMMatrixReadOnly mock for transforms
 * - HTMLElement size properties (offsetWidth, offsetHeight)
 * - SVGElement.getBBox mock
 * - ReactFlow component mock with essential props
 * - ReactFlowProvider mock for testing hooks
 * - All essential hooks mocked (useReactFlow, useNodesState, etc.)
 * - Utility functions (isNode, isEdge, getIncomers, etc.)
 */

import { vi } from 'vitest';

// ===============================
// DOM API Mocks (Essential)
// ===============================

class MockResizeObserver {
  callback: globalThis.ResizeObserverCallback;

  constructor(callback: globalThis.ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    // Simulate immediate observation
    this.callback([{ target } as globalThis.ResizeObserverEntry], this);
  }

  unobserve() {
    // No-op for testing
  }

  disconnect() {
    // No-op for testing
  }
}

class MockDOMMatrixReadOnly {
  m22: number;

  constructor(transform?: string) {
    // Extract scale from transform string, default to 1
    const scale = transform?.match(/scale\(([1-9.])\)/)?.[1];
    this.m22 = scale !== undefined ? +scale : 1;
  }
}

// Track initialization to avoid duplicate setup
let domMocksInitialized = false;

/**
 * Initializes DOM API mocks required for React Flow
 * Safe to call multiple times - will only initialize once
 */
export const mockReactFlow = () => {
  if (domMocksInitialized) return;
  domMocksInitialized = true;

  // Mock global ResizeObserver
  global.ResizeObserver = MockResizeObserver;

  // Mock global DOMMatrixReadOnly
  // @ts-ignore - Global mock
  global.DOMMatrixReadOnly = MockDOMMatrixReadOnly;

  // Mock HTMLElement size properties (only if HTMLElement exists)
  if (typeof global.HTMLElement !== 'undefined') {
    Object.defineProperties(global.HTMLElement.prototype, {
      offsetHeight: {
        get() {
          return parseFloat(this.style.height) || 100; // Default test height
        },
      },
      offsetWidth: {
        get() {
          return parseFloat(this.style.width) || 100; // Default test width
        },
      },
    });
  }

  // Mock SVGElement.getBBox method
  if (global.SVGElement) {
    // Ensure getBBox method exists before spying
    if (!(global.SVGElement.prototype as any).getBBox) {
      (global.SVGElement.prototype as any).getBBox = () => ({
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      });
    }
    vi.spyOn((global.SVGElement as any).prototype, 'getBBox').mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 100,
      height: 50,
    }));
  }
};

// Initialize DOM mocks immediately when this module loads
mockReactFlow();

// ===============================
// React Flow Component Mocks
// ===============================

/**
 * Mock ReactFlow component for testing
 * Disables dragging by default to avoid d3-drag issues in tests
 */
export const ReactFlow = vi.fn().mockImplementation(
  ({
    children,
    nodes = [],
    edges = [],
    nodesDraggable = false, // Disabled by default for testing
    panOnDrag = false, // Disabled by default for testing
    onNodeClick,
    onNodeDrag,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onError,
    onInit,
    fitView = false,
    ...rest
  }) => {
    // Create a mock div with data attributes for testing
    const mockElement = {
      type: 'div',
      props: {
        'data-testid': 'react-flow',
        'data-nodes-count': nodes.length,
        'data-edges-count': edges.length,
        className: 'react-flow react-flow__container',
        children: [
          // Mock nodes
          ...nodes.map((node: any) => ({
            type: 'div',
            key: node.id,
            props: {
              'data-id': node.id,
              'data-testid': `node-${node.id}`,
              className: 'react-flow__node',
              onClick: onNodeClick ? (e: any) => onNodeClick(e, node) : undefined,
              children: node.data?.label || `Node ${node.id}`,
            },
          })),
          // Mock edges
          ...edges.map((edge: any) => ({
            type: 'div',
            key: edge.id,
            props: {
              'data-id': edge.id,
              'data-testid': `edge-${edge.id}`,
              className: 'react-flow__edge',
              'data-source': edge.source,
              'data-target': edge.target,
            },
          })),
          // Include children (Controls, Background, etc.)
          children,
        ],
        ...rest,
      },
    };

    return mockElement;
  },
);

/**
 * Mock ReactFlowProvider for testing components that use React Flow hooks
 */
export const ReactFlowProvider = vi.fn().mockImplementation(({ children }) => {
  return {
    type: 'div',
    props: {
      'data-testid': 'react-flow-provider',
      children,
    },
  };
});

// ===============================
// Hook Mocks
// ===============================

/**
 * Mock useReactFlow hook
 * Returns commonly used ReactFlow instance methods
 */
export const useReactFlow = vi.fn().mockReturnValue({
  getNodes: vi.fn().mockReturnValue([]),
  getEdges: vi.fn().mockReturnValue([]),
  setNodes: vi.fn(),
  setEdges: vi.fn(),
  addNodes: vi.fn(),
  addEdges: vi.fn(),
  deleteElements: vi.fn(),
  fitView: vi.fn(),
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  zoomTo: vi.fn(),
  getZoom: vi.fn().mockReturnValue(1),
  setViewport: vi.fn(),
  getViewport: vi.fn().mockReturnValue({ x: 0, y: 0, zoom: 1 }),
  project: vi.fn().mockReturnValue({ x: 0, y: 0 }),
  flowToScreenPosition: vi.fn().mockReturnValue({ x: 0, y: 0 }),
  screenToFlowPosition: vi.fn().mockReturnValue({ x: 0, y: 0 }),
  toObject: vi.fn().mockReturnValue({ nodes: [], edges: [] }),
});

/**
 * Mock useNodesState hook
 */
export const useNodesState = vi.fn().mockImplementation((initialNodes = []) => {
  const [nodes, setNodes] = [initialNodes, vi.fn()];
  return [nodes, setNodes, vi.fn()]; // [nodes, setNodes, onNodesChange]
});

/**
 * Mock useEdgesState hook
 */
export const useEdgesState = vi.fn().mockImplementation((initialEdges = []) => {
  const [edges, setEdges] = [initialEdges, vi.fn()];
  return [edges, setEdges, vi.fn()]; // [edges, setEdges, onEdgesChange]
});

/**
 * Mock useViewport hook
 */
export const useViewport = vi.fn().mockReturnValue({
  x: 0,
  y: 0,
  zoom: 1,
});

/**
 * Mock useNodes hook
 */
export const useNodes = vi.fn().mockReturnValue([]);

/**
 * Mock useEdges hook
 */
export const useEdges = vi.fn().mockReturnValue([]);

/**
 * Mock useNodesData hook
 */
export const useNodesData = vi.fn().mockReturnValue([]);

/**
 * Mock useHandleConnections hook
 */
export const useHandleConnections = vi.fn().mockReturnValue([]);

/**
 * Mock useNodeConnections hook
 */
export const useNodeConnections = vi.fn().mockReturnValue([]);

/**
 * Mock useStore hook
 */
export const useStore = vi.fn().mockReturnValue({});

/**
 * Mock useNodesInitialized hook
 */
export const useNodesInitialized = vi.fn().mockReturnValue(true);

/**
 * Mock useOnSelectionChange hook
 */
export const useOnSelectionChange = vi.fn();

// ===============================
// Utility Function Mocks
// ===============================

/**
 * Mock isNode utility - validates basic node structure
 */
export const isNode = vi.fn().mockImplementation((obj: any) => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    obj.position &&
    typeof obj.position.x === 'number' &&
    typeof obj.position.y === 'number' &&
    obj.data !== undefined
  );
});

/**
 * Mock isEdge utility - validates basic edge structure
 */
export const isEdge = vi.fn().mockImplementation((obj: any) => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.source === 'string' &&
    typeof obj.target === 'string'
  );
});

/**
 * Mock getIncomers utility - finds nodes connected as sources to target
 */
export const getIncomers = vi.fn().mockImplementation((node: any, nodes: any[], edges: any[]) => {
  return nodes.filter(n => edges.some(edge => edge.source === n.id && edge.target === node.id));
});

/**
 * Mock getOutgoers utility - finds nodes connected as targets from source
 */
export const getOutgoers = vi.fn().mockImplementation((node: any, nodes: any[], edges: any[]) => {
  return nodes.filter(n => edges.some(edge => edge.source === node.id && edge.target === n.id));
});

/**
 * Mock getConnectedEdges utility - finds all edges connected to given nodes
 */
export const getConnectedEdges = vi.fn().mockImplementation((nodes: any[], edges: any[]) => {
  const nodeIds = nodes.map(n => n.id);
  return edges.filter(edge => nodeIds.includes(edge.source) || nodeIds.includes(edge.target));
});

/**
 * Mock addEdge utility
 */
export const addEdge = vi.fn().mockImplementation((edgeParams: any, edges: any[]) => {
  const newEdge = {
    id: `edge-${Date.now()}`,
    ...edgeParams,
  };
  return [...edges, newEdge];
});

/**
 * Mock applyNodeChanges utility
 */
export const applyNodeChanges = vi.fn().mockImplementation((changes: any[], nodes: any[]) => {
  return nodes; // Simplified mock - returns unchanged nodes
});

/**
 * Mock applyEdgeChanges utility
 */
export const applyEdgeChanges = vi.fn().mockImplementation((changes: any[], edges: any[]) => {
  return edges; // Simplified mock - returns unchanged edges
});

/**
 * Mock getNodesBounds utility
 */
export const getNodesBounds = vi.fn().mockReturnValue({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
});

// ===============================
// Component Mocks
// ===============================

/**
 * Mock Controls component
 */
export const Controls = vi.fn().mockImplementation(({ children, ...props }) => ({
  type: 'div',
  props: {
    'data-testid': 'react-flow-controls',
    className: 'react-flow__controls',
    children,
    ...props,
  },
}));

/**
 * Mock Background component
 */
export const Background = vi.fn().mockImplementation(props => ({
  type: 'div',
  props: {
    'data-testid': 'react-flow-background',
    className: 'react-flow__background',
    ...props,
  },
}));

/**
 * Mock MiniMap component
 */
export const MiniMap = vi.fn().mockImplementation(props => ({
  type: 'div',
  props: {
    'data-testid': 'react-flow-minimap',
    className: 'react-flow__minimap',
    ...props,
  },
}));

/**
 * Mock Panel component
 */
export const Panel = vi
  .fn()
  .mockImplementation(({ children, position = 'top-left', ...props }) => ({
    type: 'div',
    props: {
      'data-testid': 'react-flow-panel',
      'data-position': position,
      className: `react-flow__panel react-flow__panel-${position}`,
      children,
      ...props,
    },
  }));

/**
 * Mock Handle component
 */
export const Handle = vi.fn().mockImplementation(({ type, position, ...props }) => ({
  type: 'div',
  props: {
    'data-testid': `react-flow-handle-${type}`,
    'data-handlepos': position,
    className: `react-flow__handle react-flow__handle-${position}`,
    ...props,
  },
}));

// ===============================
// Test Utilities
// ===============================

/**
 * Test wrapper component that provides ReactFlowProvider context
 * Use this to wrap components that need React Flow context in tests
 */
export const ReactFlowTestWrapper = ({ children }: { children: React.ReactNode }) =>
  ReactFlowProvider({ children });

/**
 * Creates mock node data for testing
 */
export const createMockNode = (overrides: any = {}) => ({
  id: 'test-node-1',
  position: { x: 0, y: 0 },
  data: { label: 'Test Node' },
  ...overrides,
});

/**
 * Creates mock edge data for testing
 */
export const createMockEdge = (overrides: any = {}) => ({
  id: 'test-edge-1',
  source: 'node-1',
  target: 'node-2',
  ...overrides,
});

/**
 * Reset all React Flow mocks to their initial state
 * Call this in beforeEach or afterEach to ensure clean test state
 */
export const resetReactFlowMocks = () => {
  vi.clearAllMocks();

  // Reset mock implementations to defaults
  useReactFlow.mockReturnValue({
    getNodes: vi.fn().mockReturnValue([]),
    getEdges: vi.fn().mockReturnValue([]),
    setNodes: vi.fn(),
    setEdges: vi.fn(),
    addNodes: vi.fn(),
    addEdges: vi.fn(),
    deleteElements: vi.fn(),
    fitView: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    zoomTo: vi.fn(),
    getZoom: vi.fn().mockReturnValue(1),
    setViewport: vi.fn(),
    getViewport: vi.fn().mockReturnValue({ x: 0, y: 0, zoom: 1 }),
    project: vi.fn().mockReturnValue({ x: 0, y: 0 }),
    flowToScreenPosition: vi.fn().mockReturnValue({ x: 0, y: 0 }),
    screenToFlowPosition: vi.fn().mockReturnValue({ x: 0, y: 0 }),
    toObject: vi.fn().mockReturnValue({ nodes: [], edges: [] }),
  });

  useNodes.mockReturnValue([]);
  useEdges.mockReturnValue([]);
  useNodesData.mockReturnValue([]);
  useViewport.mockReturnValue({ x: 0, y: 0, zoom: 1 });
  useNodesInitialized.mockReturnValue(true);
  useHandleConnections.mockReturnValue([]);
  useNodeConnections.mockReturnValue([]);
  useStore.mockReturnValue({});
};

// ===============================
// Auto-register mocks with Vitest
// ===============================

// These vi.mock calls will automatically mock the @xyflow/react package
// when this file is imported in test setup

vi.mock('@xyflow/react', () => ({
  // Main components
  ReactFlow,
  ReactFlowProvider,

  // UI components
  Controls,
  Background,
  MiniMap,
  Panel,
  Handle,

  // Hooks
  useReactFlow,
  useNodesState,
  useEdgesState,
  useViewport,
  useNodes,
  useEdges,
  useNodesData,
  useHandleConnections,
  useNodeConnections,
  useStore,
  useNodesInitialized,
  useOnSelectionChange,

  // Utilities
  isNode,
  isEdge,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  getNodesBounds,

  // Constants that might be used
  Position: {
    Top: 'top',
    Right: 'right',
    Bottom: 'bottom',
    Left: 'left',
  },

  ConnectionMode: {
    Strict: 'strict',
    Loose: 'loose',
  },

  // Test utilities (not part of original package)
  ReactFlowTestWrapper,
  createMockNode,
  createMockEdge,
  resetReactFlowMocks,
  mockReactFlow,
}));

// Note: Direct re-exports removed to avoid module resolution issues in tests
