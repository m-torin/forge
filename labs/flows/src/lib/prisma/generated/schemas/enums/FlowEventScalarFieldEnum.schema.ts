import { z } from 'zod';

export const FlowEventScalarFieldEnumSchema = z.enum([
  'createdAt',
  'flowRunId',
  'flowId',
  'id',
  'nodeId',
  'payload',
  'metadata',
  'startedBy',
]);
