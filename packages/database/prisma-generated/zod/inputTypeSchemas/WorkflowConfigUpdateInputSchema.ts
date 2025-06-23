import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { WorkflowConfigUpdatetagsInputSchema } from './WorkflowConfigUpdatetagsInputSchema';
import { NullableIntFieldUpdateOperationsInputSchema } from './NullableIntFieldUpdateOperationsInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { WorkflowScheduleUpdateManyWithoutConfigNestedInputSchema } from './WorkflowScheduleUpdateManyWithoutConfigNestedInputSchema';

export const WorkflowConfigUpdateInputSchema: z.ZodType<Prisma.WorkflowConfigUpdateInput> = z
  .object({
    id: z
      .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    workflowSlug: z
      .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    organizationId: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    userId: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    isEnabled: z
      .union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
      .optional(),
    displayName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    category: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    tags: z
      .union([z.lazy(() => WorkflowConfigUpdatetagsInputSchema), z.string().array()])
      .optional(),
    notifyOnStart: z
      .union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
      .optional(),
    notifyOnComplete: z
      .union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
      .optional(),
    notifyOnFailure: z
      .union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
      .optional(),
    notifyOnApproval: z
      .union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
      .optional(),
    notificationEmail: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    maxRetries: z
      .union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    timeoutSeconds: z
      .union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    rateLimitPerHour: z
      .union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    maxConcurrent: z
      .union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    priority: z
      .union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    customPayload: z
      .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
      .optional(),
    metadata: z
      .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    createdBy: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    schedules: z.lazy(() => WorkflowScheduleUpdateManyWithoutConfigNestedInputSchema).optional(),
  })
  .strict();

export default WorkflowConfigUpdateInputSchema;
