import { nanoid } from 'nanoid';
import { FbNode } from '../types';

export * from './prisma';

/**
 * Generates a unique ID with an optional prefix using nanoid.
 *
 * @param {string} [prefix=''] - Optional string prefix for the generated ID.
 * @returns {string} A unique ID string.
 */
export const generateUniqueId = (prefix: string = ''): string => {
  return `${prefix}${nanoid()}`;
};

/**
 * Checks if a given string is valid JSON.
 *
 * @param {string} value - The string to be checked for JSON validity.
 * @returns {boolean} True if the string is valid JSON or empty, false otherwise.
 */
export const isValidJson = (value: string): boolean => {
  if (!value) return true;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Finds the closest edge to a given node within a specified distance.
 *
 * @param {FbNode} node - The node to find the closest edge for.
 * @param {Map<string, FbNode>} nodeLookup - A map of all nodes in the flow.
 * @returns {{ id: string; source: string; target: string } | null} The closest edge or null if no edge is found within the distance threshold.
 */
export const getClosestEdge = (
  node: FbNode,
  nodeLookup: Map<string, FbNode>,
): { id: string; source: string; target: string } | null => {
  const MIN_DISTANCE = 150;

  const nodePosition = node.position;

  if (!nodePosition) {
    return null;
  }

  const closestNode = Array.from(nodeLookup.values()).reduce<{
    distance: number;
    node: FbNode | null;
  }>(
    (res, n) => {
      if (n.id !== node.id) {
        const dx = n.position.x - nodePosition.x;
        const dy = n.position.y - nodePosition.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d < res.distance && d < MIN_DISTANCE) {
          res.distance = d;
          res.node = n;
        }
      }
      return res;
    },
    { distance: Number.MAX_VALUE, node: null },
  );

  if (!closestNode.node) {
    return null;
  }

  const closeNodeIsSource = closestNode.node.position.x < node.position.x;

  return {
    id: closeNodeIsSource
      ? `${closestNode.node.id}-${node.id}`
      : `${node.id}-${closestNode.node.id}`,
    source: closeNodeIsSource ? closestNode.node.id : node.id,
    target: closeNodeIsSource ? node.id : closestNode.node.id,
  };
};
