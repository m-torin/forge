// processor.ts
'use server';

import { Node } from '#/lib/prisma';
import { owlPost } from '#/lib/owlPost';

export const processWebhook = async (
  input: Record<string, any>,
  node: Node,
): Promise<string> => {
  return owlPost(node.id, input, {
    processedNodes: new Set(),
    maxDepth: 10,
    currentDepth: 0,
  });
};
