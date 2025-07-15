import { z } from 'zod';
import { TagCreateManyInstanceInputObjectSchema } from './TagCreateManyInstanceInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => TagCreateManyInstanceInputObjectSchema),
      z.lazy(() => TagCreateManyInstanceInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const TagCreateManyInstanceInputEnvelopeObjectSchema = Schema;
