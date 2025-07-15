// validateWebhook.ts
'use server';

import { NextResponse } from 'next/server';
import { readNodeAction } from '#/lib/prisma/serverActions/node';
import { Node, NodeType } from '#/lib/prisma';
import { logError } from '@repo/observability';

export interface ValidationResult {
  node: Node | null;
  response: NextResponse | null;
}

export const validateHookId = async (
  hookId: string,
  nodeType: NodeType,
): Promise<ValidationResult> => {
  if (!hookId) {
    return {
      node: null,
      response: new NextResponse(
        JSON.stringify({ message: 'hookId is required' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      ),
    };
  }

  try {
    const node = await readNodeAction(hookId, {
      type: nodeType,
      includeDeleted: false,
    });

    if (!node) {
      return {
        node: null,
        response: new NextResponse(
          JSON.stringify({ message: 'Webhook not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } },
        ),
      };
    }

    return { node, response: null };
  } catch (error) {
    logError('Error validating webhook', { error, hookId, nodeType });
    return {
      node: null,
      response: new NextResponse(
        JSON.stringify({ message: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      ),
    };
  }
};

// Usage example in routes:
// const { node, response } = await validateHookId(hookId, NodeType.webhookSource);
// const { node, response } = await validateHookId(hookId, NodeType.githubEventReceiver);
