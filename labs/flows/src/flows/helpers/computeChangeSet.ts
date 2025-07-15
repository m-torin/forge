import type { Node as PrismaNode, Edge as PrismaEdge } from '@prisma/client';
import type { ReactFlowJsonObject, Viewport } from '@xyflow/react';

interface ChangeSet {
  newNodes: string[];
  updatedNodes: string[];
  deletedNodes: string[];
  newEdges: string[];
  updatedEdges: string[];
  deletedEdges: string[];
}

interface ExtendedReactFlowJson extends Omit<ReactFlowJsonObject, 'viewport'> {
  viewport?: Viewport | { x: number; y: number; zoom: number };
}

export function computeChangeSet(
  existing: {
    nodes: PrismaNode[];
    edges: PrismaEdge[];
  },
  reactFlow: ExtendedReactFlowJson,
): ChangeSet {
  // Create Sets for efficient lookups
  const currentNodeIds = new Set(existing.nodes.map((n) => n.id));
  const currentEdgeIds = new Set(existing.edges.map((e) => e.id));
  const newNodeIds = new Set(reactFlow.nodes.map((n) => n.id));
  const newEdgeIds = new Set(reactFlow.edges.map((e) => e.id));

  // Compute node changes
  const newNodes = reactFlow.nodes
    .filter((n) => !currentNodeIds.has(n.id))
    .map((n) => n.id);

  const updatedNodes = reactFlow.nodes
    .filter((n) => currentNodeIds.has(n.id))
    .map((n) => n.id);

  const deletedNodes = Array.from(currentNodeIds).filter(
    (id) => !newNodeIds.has(id),
  );

  // Compute edge changes
  const newEdges = reactFlow.edges
    .filter((e) => !currentEdgeIds.has(e.id))
    .map((e) => e.id);

  const updatedEdges = reactFlow.edges
    .filter((e) => currentEdgeIds.has(e.id))
    .map((e) => e.id);

  const deletedEdges = Array.from(currentEdgeIds).filter(
    (id) => !newEdgeIds.has(id),
  );

  return {
    newNodes,
    updatedNodes,
    deletedNodes,
    newEdges,
    updatedEdges,
    deletedEdges,
  };
}
