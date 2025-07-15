import { z } from 'zod';
import { TagCreateManyNodeInputObjectSchema } from './TagCreateManyNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => TagCreateManyNodeInputObjectSchema),
      z.lazy(() => TagCreateManyNodeInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const TagCreateManyNodeInputEnvelopeObjectSchema = Schema;
