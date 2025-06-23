import { z } from 'zod';

export const WorkflowConfigScalarFieldEnumSchema = z.enum([
  'id',
  'workflowSlug',
  'organizationId',
  'userId',
  'isEnabled',
  'displayName',
  'description',
  'category',
  'tags',
  'notifyOnStart',
  'notifyOnComplete',
  'notifyOnFailure',
  'notifyOnApproval',
  'notificationEmail',
  'maxRetries',
  'timeoutSeconds',
  'rateLimitPerHour',
  'maxConcurrent',
  'priority',
  'customPayload',
  'metadata',
  'createdAt',
  'updatedAt',
  'createdBy',
]);

export default WorkflowConfigScalarFieldEnumSchema;
