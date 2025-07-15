import { Node } from '@prisma/client';
import { logInfo, logError } from '@repo/observability';

// Example functions to be called for different node types
export const handlePythonEditor = (node: Node) =>
  logInfo('Handling Python Editor Node', { node });

export const handleJsEditor = (node: Node) =>
  logInfo('Handling JS Editor Node', { node });

export const handleIfThisThenThat = (node: Node) =>
  logInfo('Handling IfThisThenThat Node', { node });

export const handleAwsEventBridge = (node: Node, isSource: boolean) => {
  if (isSource) {
    logInfo('Handling AWS EventBridge Source Node', { node });
  } else {
    logInfo('Handling AWS EventBridge Destination Node', { node });
  }
};

export const handleAwsKafka = (node: Node, isSource: boolean) => {
  if (isSource) {
    logInfo('Handling AWS Kafka Source Node', { node });
  } else {
    logInfo('Handling AWS Kafka Destination Node', { node });
  }
};

export const handleAwsLambda = (node: Node, isSource: boolean) => {
  if (isSource) {
    logInfo('Handling AWS Lambda Source Node', { node });
  } else {
    logInfo('Handling AWS Lambda Destination Node', { node });
  }
};

export const handleAwsS3 = (node: Node, isSource: boolean) => {
  if (isSource) {
    logInfo('Handling AWS S3 Source Node', { node });
  } else {
    logInfo('Handling AWS S3 Destination Node', { node });
  }
};

export const handleAwsSns = (node: Node, isSource: boolean) => {
  if (isSource) {
    logInfo('Handling AWS SNS Source Node', { node });
  } else {
    logInfo('Handling AWS SNS Destination Node', { node });
  }
};

export const handleAwsSqs = (node: Node, isSource: boolean) => {
  if (isSource) {
    logInfo('Handling AWS SQS Source Node', { node });
  } else {
    logInfo('Handling AWS SQS Destination Node', { node });
  }
};

export const handleDatabase = (node: Node, isSource: boolean) => {
  if (isSource) {
    logInfo('Handling Database Source Node', { node });
  } else {
    logInfo('Handling Database Destination Node', { node });
  }
};

export const handleWebhook = (node: Node, isSource: boolean) => {
  if (isSource) {
    logInfo('Handling Webhook Source Node', { node });
  } else {
    logInfo('Handling Webhook Destination Node', { node });
  }
};

// Helper function for AWS types
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
  logError(`Unhandled AWS ${isSource ? 'Source' : 'Destination'} type`, {
    nodeType: node.type,
  });
  throw new Error(
    `Unhandled AWS ${isSource ? 'Source' : 'Destination'} type: ${node.type}`,
  );
};

// Generic type handler
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
  logError(`Unhandled ${isSource ? 'Source' : 'Destination'} type`, {
    nodeType: node.type,
  });
  throw new Error(
    `Unhandled ${isSource ? 'Source' : 'Destination'} type: ${node.type}`,
  );
};

// Specific type handlers
const handleLogicType = (node: Node) => {
  const logicHandlers: Record<string, (node: Node) => void> = {
    pythonEditor: handlePythonEditor,
    jsEditor: handleJsEditor,
    IfThisThenThat: handleIfThisThenThat,
  };
  handleType(node, logicHandlers as any, false); // false is arbitrary as isSource isn't used here
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

export const runEvent = (node: Node) => {
  logInfo('Running event', { node });

  if (node?.type?.endsWith('Logic')) {
    handleLogicType(node);
  } else if (node?.type?.endsWith('Source')) {
    handleSourceType(node);
  } else if (node?.type?.endsWith('Destination')) {
    handleDestinationType(node);
  } else {
    logError('Unhandled node type', { nodeType: node?.type });
    throw new Error(`Unhandled node type: ${node?.type}`);
  }
};
