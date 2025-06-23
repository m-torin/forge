import { z } from 'zod';
import type { Prisma } from '../../client';
import { TwoFactorCreateManyInputSchema } from '../inputTypeSchemas/TwoFactorCreateManyInputSchema';

export const TwoFactorCreateManyAndReturnArgsSchema: z.ZodType<Prisma.TwoFactorCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([TwoFactorCreateManyInputSchema, TwoFactorCreateManyInputSchema.array()]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default TwoFactorCreateManyAndReturnArgsSchema;
