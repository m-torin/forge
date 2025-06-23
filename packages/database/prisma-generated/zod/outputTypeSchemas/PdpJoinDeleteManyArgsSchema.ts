import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpJoinWhereInputSchema } from '../inputTypeSchemas/PdpJoinWhereInputSchema';

export const PdpJoinDeleteManyArgsSchema: z.ZodType<Prisma.PdpJoinDeleteManyArgs> = z
  .object({
    where: PdpJoinWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default PdpJoinDeleteManyArgsSchema;
