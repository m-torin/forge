import { z } from 'zod';
import { TagCreateManyTagGroupInputObjectSchema } from './TagCreateManyTagGroupInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => TagCreateManyTagGroupInputObjectSchema),
      z.lazy(() => TagCreateManyTagGroupInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const TagCreateManyTagGroupInputEnvelopeObjectSchema = Schema;
