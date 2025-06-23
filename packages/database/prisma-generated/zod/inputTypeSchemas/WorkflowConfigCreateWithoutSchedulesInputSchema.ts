import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowConfigCreatetagsInputSchema } from './WorkflowConfigCreatetagsInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const WorkflowConfigCreateWithoutSchedulesInputSchema: z.ZodType<Prisma.WorkflowConfigCreateWithoutSchedulesInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      workflowSlug: z.string(),
      organizationId: z.string().optional().nullable(),
      userId: z.string().optional().nullable(),
      isEnabled: z.boolean().optional(),
      displayName: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      category: z.string().optional().nullable(),
      tags: z
        .union([z.lazy(() => WorkflowConfigCreatetagsInputSchema), z.string().array()])
        .optional(),
      notifyOnStart: z.boolean().optional(),
      notifyOnComplete: z.boolean().optional(),
      notifyOnFailure: z.boolean().optional(),
      notifyOnApproval: z.boolean().optional(),
      notificationEmail: z.string().optional().nullable(),
      maxRetries: z.number().int().optional().nullable(),
      timeoutSeconds: z.number().int().optional().nullable(),
      rateLimitPerHour: z.number().int().optional().nullable(),
      maxConcurrent: z.number().int().optional().nullable(),
      priority: z.number().int().optional().nullable(),
      customPayload: z
        .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
        .optional(),
      metadata: z
        .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
        .optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      createdBy: z.string().optional().nullable(),
    })
    .strict();

export default WorkflowConfigCreateWithoutSchedulesInputSchema;
