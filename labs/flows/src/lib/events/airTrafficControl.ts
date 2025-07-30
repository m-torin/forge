// 'use server';

import { Node } from '@prisma/client';
import { fetchNextNodes } from './logic';
import {
  handleAwsEventBridge,
  handleAwsKafka,
  handleAwsLambda,
  handleAwsS3,
  handleAwsSns,
  handleAwsSqs,
  handlePythonEditor,
  handleJsEditor,
  handleIfThisThenThat,
  handleDatabase,
  handleWebhook,
} from './handlers';
import { logInfo, logError } from '@repo/observability';

const handleAwsType = (node: Node, isSource: boolean) => {
  const awsHandlers: Record<string, (node: Node, isSource: boolean) => void> = {
    awsEventBridge: handleAwsEventBridge,
    awsKafka: handleAwsKafka,
    awsLambda: handleAwsLambda,
    awsS3: handleAwsS3,
    awsSns: handleAwsSns,
    awsSqs: handleAwsSqs,
  };

  for (const [key, handler] of Object.entries(awsHandlers)) {
    if (node.type.startsWith(key)) {
      handler(node, isSource);
      return;
    }
  }
  throw new Error(
    `Unhandled AWS ${isSource ? 'Source' : 'Destination'} type: ${node.type}`,
  );
};

const handleType = (
  node: Node,
  mappings: Record<string, (node: Node, isSource: boolean) => void>,
  isSource: boolean,
) => {
  for (const [key, handler] of Object.entries(mappings)) {
    if (node.type.startsWith(key)) {
      handler(node, isSource);
      return;
    }
  }
  throw new Error(
    `Unhandled ${isSource ? 'Source' : 'Destination'} type: ${node.type}`,
  );
};

const handleLogicType = (node: Node) => {
  const logicHandlers: Record<string, (node: Node) => void> = {
    pythonEditor: handlePythonEditor,
    jsEditor: handleJsEditor,
    IfThisThenThat: handleIfThisThenThat,
  };
  handleType(node, logicHandlers as any, false);
};

const handleSourceType = (node: Node) => {
  if (node.type.startsWith('aws')) {
    handleAwsType(node, true);
  } else {
    handleType(
      node,
      {
        database: handleDatabase,
        webhook: handleWebhook,
      },
      true,
    );
  }
};

const handleDestinationType = (node: Node) => {
  if (node.type.startsWith('aws')) {
    handleAwsType(node, false);
  } else {
    handleType(
      node,
      {
        database: handleDatabase,
        webhook: handleWebhook,
      },
      false,
    );
  }
};

const processNextNodes = async (nodeId: string) => {
  try {
    logInfo(`Fetching next nodes for node: ${nodeId}`, { nodeId });
    const { nextNodes } = await fetchNextNodes(nodeId);
    logInfo(`Next nodes fetched for node: ${nodeId}`, { nodeId, nextNodes });
    nextNodes.forEach((nextNode) => {
      runEvent(nextNode);
    });
  } catch (error) {
    logError('Error processing next nodes', { error, nodeId });
  }
};

export const runEvent = (node: Node) => {
  logInfo('Running event', { node });

  if (node?.type?.endsWith('Logic')) {
    handleLogicType(node);
  } else if (node?.type?.endsWith('Source')) {
    handleSourceType(node);
  } else if (node?.type?.endsWith('Destination')) {
    handleDestinationType(node);
  } else {
    throw new Error(`Unhandled node type: ${node?.type}`);
  }

  // Fire and forget for processing next nodes
  logInfo(`Setting timeout to process next nodes for node: ${node.id}`, { nodeId: node.id });
  setTimeout(() => processNextNodes(node.id), 0);
};
