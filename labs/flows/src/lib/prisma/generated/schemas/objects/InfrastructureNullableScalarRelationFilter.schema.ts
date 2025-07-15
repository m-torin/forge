import { z } from 'zod';
import { InfrastructureWhereInputObjectSchema } from './InfrastructureWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    is: z
      .lazy(() => InfrastructureWhereInputObjectSchema)
      .optional()
      .nullable(),
    isNot: z
      .lazy(() => InfrastructureWhereInputObjectSchema)
      .optional()
      .nullable(),
  })
  .strict();

export const InfrastructureNullableScalarRelationFilterObjectSchema = Schema;
