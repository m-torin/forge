import { z } from 'zod';
import { EdgeCreateManySourceNodeInputObjectSchema } from './EdgeCreateManySourceNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => EdgeCreateManySourceNodeInputObjectSchema),
      z.lazy(() => EdgeCreateManySourceNodeInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const EdgeCreateManySourceNodeInputEnvelopeObjectSchema = Schema;
