import { z } from 'zod';
import { InstanceWhereInputObjectSchema } from './InstanceWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    is: z.lazy(() => InstanceWhereInputObjectSchema).optional(),
    isNot: z.lazy(() => InstanceWhereInputObjectSchema).optional(),
  })
  .strict();

export const InstanceScalarRelationFilterObjectSchema = Schema;
