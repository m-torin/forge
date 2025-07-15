import { z } from 'zod';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    is: z
      .lazy(() => FlowWhereInputObjectSchema)
      .optional()
      .nullable(),
    isNot: z
      .lazy(() => FlowWhereInputObjectSchema)
      .optional()
      .nullable(),
  })
  .strict();

export const FlowNullableScalarRelationFilterObjectSchema = Schema;
