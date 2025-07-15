import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { FlowOrderByWithRelationInputObjectSchema } from './FlowOrderByWithRelationInput.schema';
import { FlowEventOrderByRelationAggregateInputObjectSchema } from './FlowEventOrderByRelationAggregateInput.schema';
import { ScheduledJobOrderByWithRelationInputObjectSchema } from './ScheduledJobOrderByWithRelationInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.FlowRunOrderByWithRelationInput> = z
  .object({
    flowId: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    isScheduled: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    payload: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    runStatus: SortOrderSchema.optional(),
    scheduledJobId: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    startedBy: SortOrderSchema.optional(),
    timeEnded: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    timeStarted: SortOrderSchema.optional(),
    flow: z.lazy(() => FlowOrderByWithRelationInputObjectSchema).optional(),
    flowEvents: z
      .lazy(() => FlowEventOrderByRelationAggregateInputObjectSchema)
      .optional(),
    scheduledJob: z
      .lazy(() => ScheduledJobOrderByWithRelationInputObjectSchema)
      .optional(),
  })
  .strict();

export const FlowRunOrderByWithRelationInputObjectSchema = Schema;
