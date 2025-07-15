import { z } from 'zod';
import { SecretCreateManyNodeInputObjectSchema } from './SecretCreateManyNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => SecretCreateManyNodeInputObjectSchema),
      z.lazy(() => SecretCreateManyNodeInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const SecretCreateManyNodeInputEnvelopeObjectSchema = Schema;
