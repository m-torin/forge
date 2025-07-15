import { z } from 'zod';
import { EdgeCreateManyTargetNodeInputObjectSchema } from './EdgeCreateManyTargetNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => EdgeCreateManyTargetNodeInputObjectSchema),
      z.lazy(() => EdgeCreateManyTargetNodeInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const EdgeCreateManyTargetNodeInputEnvelopeObjectSchema = Schema;
