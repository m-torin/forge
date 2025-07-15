import { z } from 'zod';
import { SecretWhereInputObjectSchema } from './SecretWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    every: z.lazy(() => SecretWhereInputObjectSchema).optional(),
    some: z.lazy(() => SecretWhereInputObjectSchema).optional(),
    none: z.lazy(() => SecretWhereInputObjectSchema).optional(),
  })
  .strict();

export const SecretListRelationFilterObjectSchema = Schema;
