import { z } from 'zod';
import { SecretCreateManyFlowInputObjectSchema } from './SecretCreateManyFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => SecretCreateManyFlowInputObjectSchema),
      z.lazy(() => SecretCreateManyFlowInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const SecretCreateManyFlowInputEnvelopeObjectSchema = Schema;
