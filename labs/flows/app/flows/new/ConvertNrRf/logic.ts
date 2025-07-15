// businessLogic.ts

// Type definitions
export interface NodeData {
  id: string;
  label: string;
  type?: string;
  config: Record<string, unknown>;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  sourcePort?: number | undefined;
  targetPort?: number | undefined;
}

export interface SubflowPort {
  x: number;
  y: number;
  wires: Array<{ id: string; port?: number }>;
}

export interface NodeRedNode {
  id: string;
  type: string;
  name?: string;
  wires?: string[][];
  in?: SubflowPort[];
  out?: SubflowPort[];
  [key: string]: any;
}

export interface FlowState {
  nodes: NodeData[];
  edges: EdgeData[];
}

export interface LoadingState {
  isInitializing: boolean;
  isConverting: boolean;
}

export interface ConversionError extends Error {
  code: string;
  details?: unknown;
}

// Validation utility
export const validateNodeRedFlow = (flow: unknown): flow is NodeRedNode[] => {
  if (!Array.isArray(flow)) return false;
  return flow.every(
    (node) =>
      typeof node === 'object' &&
      node !== null &&
      'id' in node &&
      'type' in node &&
      typeof node.id === 'string' &&
      typeof node.type === 'string',
  );
};

// Conversion utility
export const createFlowConverter =
  (_notifyService: any) =>
  (flow: string): FlowState => {
    try {
      const parsedFlow = JSON.parse(flow);

      if (!validateNodeRedFlow(parsedFlow)) {
        throw new Error('Invalid Node-RED flow structure');
      }

      const newNodes: NodeData[] = [];
      const newEdges: EdgeData[] = [];
      const configNodes = new Set<string>();

      // First pass: Identify config nodes and tabs
      parsedFlow.forEach((node) => {
        if (!node.z && node.type !== 'tab' && node.type.includes('-')) {
          configNodes.add(node.id);
        }
      });

      // Second pass: Process all nodes
      parsedFlow.forEach((node) => {
        if (node.type === 'tab') return;

        // Store node data with complete config
        newNodes.push({
          id: node.id,
          label: node.name || node.type,
          type: node.type,
          config: node,
        });

        // Process standard wire connections
        if (node.wires && Array.isArray(node.wires)) {
          node.wires.forEach((wireArray, outputIndex) => {
            if (Array.isArray(wireArray)) {
              wireArray.forEach((targetId) => {
                if (targetId) {
                  newEdges.push({
                    id: `${node.id}-${outputIndex}-${targetId}`,
                    source: node.id,
                    target: targetId,
                    sourcePort: outputIndex,
                  });
                }
              });
            }
          });
        }

        // Process subflow connections
        if (node.type === 'subflow') {
          // Handle subflow input connections
          node.in?.forEach((input, inputIndex) => {
            input.wires?.forEach((wire) => {
              newEdges.push({
                id: `${node.id}-in-${inputIndex}-${wire.id}`,
                source: node.id,
                target: wire.id,
                sourcePort: inputIndex,
                targetPort: wire.port ?? undefined,
              });
            });
          });

          // Handle subflow output connections
          node.out?.forEach((output, outputIndex) => {
            output.wires?.forEach((wire) => {
              newEdges.push({
                id: `${wire.id}-${node.id}-out-${outputIndex}`,
                source: wire.id,
                target: node.id,
                sourcePort: wire.port ?? undefined,
                targetPort: outputIndex,
              });
            });
          });
        }

        // Handle config node references
        Object.entries(node).forEach(([_key, value]) => {
          if (typeof value === 'string' && configNodes.has(value)) {
            newEdges.push({
              id: `${node.id}-config-${value}`,
              source: node.id,
              target: value,
            });
          }
        });
      });

      return { nodes: newNodes, edges: newEdges };
    } catch (error) {
      const conversionError = new Error(
        error instanceof Error ? error.message : 'Unknown conversion error',
      ) as ConversionError;
      conversionError.code = 'CONVERSION_ERROR';
      conversionError.details = error;
      throw conversionError;
    }
  };
