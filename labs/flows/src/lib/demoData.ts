/**
 * Demo flow data for populating localStorage in demo mode
 * Provides sample flows, nodes, and edges for immediate demo experience
 */

import { FlowMethod } from '@prisma/client';
import { DEMO_CONSTANTS } from '#/root/env';
import { logInfo, logWarn } from '@repo/observability';

export const sampleNodes: any[] = [
  {
    id: 'node-start',
    type: 'trigger',
    position: { x: 100, y: 100 },
    data: {
      // FbNodeData fields
      id: 'node-start',
      name: 'Webhook Trigger',
      position: { x: 100, y: 100 },
      deleted: false,
      arn: null,
      infrastructureId: null,
      rfId: 'node-start',
      
      // BaseNodeData fields
      type: 'trigger' as any,
      uxMeta: {
        heading: 'Webhook Trigger',
        isExpanded: false,
        layer: 1,
        isLocked: false,
        rotation: 0
      },
      nodeMeta: {
        displayName: 'Webhook Trigger',
        group: 'triggers',
        icon: 'webhook' as any,
        color: '#10b981',
        type: 'trigger'
      },
      isEnabled: true,
      metadata: {},
      formFields: {},
      prismaData: undefined
    },
    width: 200,
    height: 100
  },
  {
    id: 'node-process',
    type: 'action',
    position: { x: 400, y: 200 },
    data: {
      type: 'action',
      name: 'Process Data',
      metadata: {
        description: 'Transform incoming webhook data'
      },
      nodeMeta: {
        displayName: 'Data Processor',
        group: 'actions',
        icon: 'processor' as any,
        color: '#3b82f6',
        type: 'action'
      },
      isEnabled: true,
      rfId: 'node-process'
    },
    width: 200,
    height: 100
  },
  {
    id: 'node-end',
    type: 'output',
    position: { x: 700, y: 300 },
    data: {
      type: 'output',
      name: 'Send Response',
      metadata: {
        responseType: 'json'
      },
      nodeMeta: {
        displayName: 'API Response',
        group: 'outputs',
        icon: 'output' as any,
        color: '#f59e0b',
        type: 'output'
      },
      isEnabled: true,
      rfId: 'node-end'
    },
    width: 200,
    height: 100
  }
];

export const sampleEdges: any[] = [
  {
    id: 'edge-1',
    source: 'node-start',
    target: 'node-process',
    type: 'default',
    data: {
      label: 'Trigger to Process',
      name: 'Trigger to Process',
      isActive: true,
      metadata: {},
      type: 'default',
      id: 'edge-1',
      deleted: false,
      className: undefined,
      normalizedKey: null
    } as any
  },
  {
    id: 'edge-2',
    source: 'node-process',
    target: 'node-end',
    type: 'default',
    data: {
      label: 'Process to Output',
      name: 'Process to Output',
      isActive: true,
      metadata: {},
      type: 'default',
      id: 'edge-2',
      deleted: false,
      className: undefined,
      normalizedKey: null
    } as any
  }
];

export const sampleFlowData = {
  flowId: DEMO_CONSTANTS.FLOW_ID,
  instanceId: DEMO_CONSTANTS.INSTANCE_ID,
  flowData: {
    nodes: sampleNodes,
    edges: sampleEdges,
    viewport: { x: 0, y: 0, zoom: 1 }
  },
  updatedFlow: {
    name: 'Demo Workflow',
    method: FlowMethod.observable,
    isEnabled: true,
    metadata: {
      description: 'A sample workflow for demonstration purposes',
      tags: ['demo', 'sample', 'webhook']
    }
  },
  savedAt: new Date().toISOString()
};

export const sampleFlowMetadata = {
  flow: {
    id: DEMO_CONSTANTS.FLOW_ID,
    name: 'Demo Workflow',
    method: FlowMethod.observable,
    isEnabled: true,
    metadata: sampleFlowData.updatedFlow.metadata,
    instanceId: DEMO_CONSTANTS.INSTANCE_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    arn: null,
    infrastructureId: null
  },
  nodes: sampleNodes.map(node => ({
    id: node.id,
    flowId: DEMO_CONSTANTS.FLOW_ID,
    type: node.type,
    name: node.data.name,
    position: node.position,
    metadata: node.data.metadata,
    rfId: node.data.rfId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    arn: null,
    infrastructureId: null
  })),
  edges: sampleEdges.map(edge => ({
    id: edge.id,
    flowId: DEMO_CONSTANTS.FLOW_ID,
    sourceNodeId: edge.source,
    targetNodeId: edge.target,
    type: edge.type || 'default',
    rfId: edge.id,
    label: edge.data?.name || null,
    isActive: edge.data?.isActive || false,
    normalizedKey: null,
    metadata: edge.data?.metadata || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false
  }))
};

export const initializeDemoData = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Save main flow data
    localStorage.setItem(
      `${DEMO_CONSTANTS.STORAGE_KEY}-flow-${DEMO_CONSTANTS.FLOW_ID}`,
      JSON.stringify(sampleFlowData)
    );
    
    // Save flow metadata in format expected by the app
    localStorage.setItem(
      DEMO_CONSTANTS.FLOW_ID,
      JSON.stringify({
        nodes: sampleNodes,
        edges: sampleEdges,
        viewport: { x: 0, y: 0, zoom: 1 },
        flowData: sampleFlowMetadata
      })
    );
    
    // Save additional demo metadata
    localStorage.setItem(
      `${DEMO_CONSTANTS.STORAGE_KEY}-metadata`,
      JSON.stringify({
        initialized: true,
        flows: [DEMO_CONSTANTS.FLOW_ID],
        createdAt: new Date().toISOString()
      })
    );
    
    logInfo('✅ Demo data initialized successfully');
    return true;
  } catch (error) {
    logWarn('Failed to initialize demo data', { error });
    return false;
  }
};