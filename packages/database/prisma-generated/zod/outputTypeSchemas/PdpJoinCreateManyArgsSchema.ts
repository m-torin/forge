import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpJoinCreateManyInputSchema } from '../inputTypeSchemas/PdpJoinCreateManyInputSchema';

export const PdpJoinCreateManyArgsSchema: z.ZodType<Prisma.PdpJoinCreateManyArgs> = z
  .object({
    data: z.union([PdpJoinCreateManyInputSchema, PdpJoinCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export default PdpJoinCreateManyArgsSchema;
