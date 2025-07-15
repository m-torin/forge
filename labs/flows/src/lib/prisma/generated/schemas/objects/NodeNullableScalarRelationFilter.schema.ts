import { z } from 'zod';
import { NodeWhereInputObjectSchema } from './NodeWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    is: z
      .lazy(() => NodeWhereInputObjectSchema)
      .optional()
      .nullable(),
    isNot: z
      .lazy(() => NodeWhereInputObjectSchema)
      .optional()
      .nullable(),
  })
  .strict();

export const NodeNullableScalarRelationFilterObjectSchema = Schema;
