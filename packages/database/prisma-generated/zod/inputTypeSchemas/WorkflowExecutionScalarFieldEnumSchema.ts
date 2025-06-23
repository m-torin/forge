import { z } from 'zod';

export const WorkflowExecutionScalarFieldEnumSchema = z.enum([
  'id',
  'workflowRunId',
  'workflowSlug',
  'userId',
  'organizationId',
  'status',
  'startedAt',
  'completedAt',
  'duration',
  'inputPayloadHash',
  'hasOutput',
  'error',
  'errorType',
  'stepCount',
  'completedSteps',
  'retryCount',
  'triggeredBy',
  'triggerSource',
  'parentExecutionId',
  'creditsUsed',
  'apiCallCount',
  'tags',
  'createdAt',
  'updatedAt',
]);

export default WorkflowExecutionScalarFieldEnumSchema;
