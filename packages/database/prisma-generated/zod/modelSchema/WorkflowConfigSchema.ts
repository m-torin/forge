import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema';

/////////////////////////////////////////
// WORKFLOW CONFIG SCHEMA
/////////////////////////////////////////

export const WorkflowConfigSchema = z.object({
  id: z.string().cuid(),
  workflowSlug: z.string(),
  organizationId: z.string().nullable(),
  userId: z.string().nullable(),
  isEnabled: z.boolean(),
  displayName: z.string().nullable(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  tags: z.string().array(),
  notifyOnStart: z.boolean(),
  notifyOnComplete: z.boolean(),
  notifyOnFailure: z.boolean(),
  notifyOnApproval: z.boolean(),
  notificationEmail: z.string().nullable(),
  maxRetries: z.number().int().nullable(),
  timeoutSeconds: z.number().int().nullable(),
  rateLimitPerHour: z.number().int().nullable(),
  maxConcurrent: z.number().int().nullable(),
  priority: z.number().int().nullable(),
  customPayload: JsonValueSchema.nullable(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
});

export type WorkflowConfig = z.infer<typeof WorkflowConfigSchema>;

export default WorkflowConfigSchema;
