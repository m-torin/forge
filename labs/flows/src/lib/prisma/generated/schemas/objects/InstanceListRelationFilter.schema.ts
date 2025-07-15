import { z } from 'zod';
import { InstanceWhereInputObjectSchema } from './InstanceWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    every: z.lazy(() => InstanceWhereInputObjectSchema).optional(),
    some: z.lazy(() => InstanceWhereInputObjectSchema).optional(),
    none: z.lazy(() => InstanceWhereInputObjectSchema).optional(),
  })
  .strict();

export const InstanceListRelationFilterObjectSchema = Schema;
