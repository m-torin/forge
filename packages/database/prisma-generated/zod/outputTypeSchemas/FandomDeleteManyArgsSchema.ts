import { z } from 'zod';
import type { Prisma } from '../../client';
import { FandomWhereInputSchema } from '../inputTypeSchemas/FandomWhereInputSchema';

export const FandomDeleteManyArgsSchema: z.ZodType<Prisma.FandomDeleteManyArgs> = z
  .object({
    where: FandomWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default FandomDeleteManyArgsSchema;
