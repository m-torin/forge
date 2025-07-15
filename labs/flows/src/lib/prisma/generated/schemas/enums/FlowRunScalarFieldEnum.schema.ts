import { z } from 'zod';

export const FlowRunScalarFieldEnumSchema = z.enum([
  'flowId',
  'id',
  'isScheduled',
  'payload',
  'metadata',
  'runStatus',
  'scheduledJobId',
  'startedBy',
  'timeEnded',
  'timeStarted',
]);
