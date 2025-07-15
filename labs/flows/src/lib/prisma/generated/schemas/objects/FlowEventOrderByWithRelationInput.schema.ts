import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { FlowRunOrderByWithRelationInputObjectSchema } from './FlowRunOrderByWithRelationInput.schema';
import { FlowOrderByWithRelationInputObjectSchema } from './FlowOrderByWithRelationInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.FlowEventOrderByWithRelationInput> = z
  .object({
    createdAt: SortOrderSchema.optional(),
    flowRunId: SortOrderSchema.optional(),
    flowId: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    nodeId: SortOrderSchema.optional(),
    payload: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    startedBy: SortOrderSchema.optional(),
    flowRun: z
      .lazy(() => FlowRunOrderByWithRelationInputObjectSchema)
      .optional(),
    flow: z.lazy(() => FlowOrderByWithRelationInputObjectSchema).optional(),
  })
  .strict();

export const FlowEventOrderByWithRelationInputObjectSchema = Schema;
