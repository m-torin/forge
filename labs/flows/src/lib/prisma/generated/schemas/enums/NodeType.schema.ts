import { z } from 'zod';

export const NodeTypeSchema = z.enum([
  'anthropicGptNode',
  'awsEventBridgeEvent',
  'awsLambdaNode',
  'awsS3Node',
  'awsSnsNode',
  'awsSqsNode',
  'cronNode',
  'default',
  'githubEventReceiverSource',
  'ifElseThenNode',
  'javascriptEditorLogic',
  'javascriptEditorNode',
  'openaiGptNode',
  'pythonEditorNode',
  'webhook',
  'webhookDestination',
  'webhookSource',
]);
