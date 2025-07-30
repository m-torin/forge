// deduplicate.ts

import { Node, Edge, Tag, Secret, Flow } from '@prisma/client';

/**
 * Define a type that includes relations needed for deduplication.
 */
type _SecretWithRelations = Secret & {
  flow: Flow | null;
  node: (Node & { flow: Flow | null }) | null;
};

/**
 * Deduplicates an array of nodes based on their unique identifiers.
 * @param {Node[]} nodes - Array of node objects.
 * @returns {Node[]} - Deduplicated array of nodes.
 */
export const deduplicateNodes = (nodes?: Node[]): Node[] => {
  if (!nodes) return [];
  const uniqueNodesMap = new Map<string, Node>();
  nodes.forEach((node) => {
    if (!uniqueNodesMap.has(node.id)) {
      uniqueNodesMap.set(node.id, node);
    }
  });
  return Array.from(uniqueNodesMap.values());
};

/**
 * Deduplicates an array of edges by treating them as undirected.
 * @param {Edge[]} edges - Array of edge objects.
 * @returns {Edge[]} - Deduplicated array of edges.
 */
export const deduplicateEdges = (edges?: Edge[]): Edge[] => {
  if (!edges) return [];
  const uniqueEdgesSet = new Set<string>();
  const deduplicatedEdges: Edge[] = [];

  edges.forEach((edge) => {
    const sortedIds = [edge.sourceNodeId, edge.targetNodeId].sort();
    const edgeKey = `${sortedIds[0]}-${sortedIds[1]}`;

    if (!uniqueEdgesSet.has(edgeKey)) {
      uniqueEdgesSet.add(edgeKey);
      deduplicatedEdges.push(edge);
    }
  });

  return deduplicatedEdges;
};

/**
 * Deduplicates an array of tags based on their unique identifiers and instance IDs.
 * @param {Tag[]} tags - Array of tag objects.
 * @returns {Tag[]} - Deduplicated array of tags.
 */
export const deduplicateTags = (tags?: Tag[]): Tag[] => {
  if (!tags) return [];
  const uniqueTagsMap = new Map<string, Tag>();
  tags.forEach((tag) => {
    const key = `${tag.id}-${tag.instanceId}`;
    if (!uniqueTagsMap.has(key)) {
      uniqueTagsMap.set(key, tag);
    }
  });
  return Array.from(uniqueTagsMap.values());
};

/**
 * Deduplicates an array of secrets based on their unique identifiers and associated flow or node IDs.
 * @param secrets - Array of secret objects.
 * @returns Deduplicated array of secrets.
 */
export const deduplicateSecrets = (secrets?: Secret[]): Secret[] => {
  if (!secrets) return [];

  const uniqueSecretsMap = new Map<string, Secret>();

  secrets.forEach((secret) => {
    const instanceIdentifier = secret.flowId || secret.nodeId || 'default';
    const key = `${secret.id}-${instanceIdentifier}`;

    if (!uniqueSecretsMap.has(key)) {
      uniqueSecretsMap.set(key, secret);
    }
  });

  return Array.from(uniqueSecretsMap.values());
};
