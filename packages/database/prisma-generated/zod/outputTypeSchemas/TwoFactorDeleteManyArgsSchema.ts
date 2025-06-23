import { z } from 'zod';
import type { Prisma } from '../../client';
import { TwoFactorWhereInputSchema } from '../inputTypeSchemas/TwoFactorWhereInputSchema';

export const TwoFactorDeleteManyArgsSchema: z.ZodType<Prisma.TwoFactorDeleteManyArgs> = z
  .object({
    where: TwoFactorWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default TwoFactorDeleteManyArgsSchema;
