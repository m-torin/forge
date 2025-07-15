import { z } from 'zod';
import { InstanceCreateManyUserInputObjectSchema } from './InstanceCreateManyUserInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => InstanceCreateManyUserInputObjectSchema),
      z.lazy(() => InstanceCreateManyUserInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const InstanceCreateManyUserInputEnvelopeObjectSchema = Schema;
