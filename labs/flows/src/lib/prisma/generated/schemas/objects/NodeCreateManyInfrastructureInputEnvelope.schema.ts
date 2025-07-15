import { z } from 'zod';
import { NodeCreateManyInfrastructureInputObjectSchema } from './NodeCreateManyInfrastructureInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => NodeCreateManyInfrastructureInputObjectSchema),
      z.lazy(() => NodeCreateManyInfrastructureInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const NodeCreateManyInfrastructureInputEnvelopeObjectSchema = Schema;
