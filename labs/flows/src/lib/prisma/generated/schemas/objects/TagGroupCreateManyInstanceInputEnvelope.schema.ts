import { z } from 'zod';
import { TagGroupCreateManyInstanceInputObjectSchema } from './TagGroupCreateManyInstanceInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => TagGroupCreateManyInstanceInputObjectSchema),
      z.lazy(() => TagGroupCreateManyInstanceInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const TagGroupCreateManyInstanceInputEnvelopeObjectSchema = Schema;
