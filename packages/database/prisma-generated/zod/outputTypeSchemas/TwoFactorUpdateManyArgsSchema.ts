import { z } from 'zod';
import type { Prisma } from '../../client';
import { TwoFactorUpdateManyMutationInputSchema } from '../inputTypeSchemas/TwoFactorUpdateManyMutationInputSchema';
import { TwoFactorUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/TwoFactorUncheckedUpdateManyInputSchema';
import { TwoFactorWhereInputSchema } from '../inputTypeSchemas/TwoFactorWhereInputSchema';

export const TwoFactorUpdateManyArgsSchema: z.ZodType<Prisma.TwoFactorUpdateManyArgs> = z
  .object({
    data: z.union([
      TwoFactorUpdateManyMutationInputSchema,
      TwoFactorUncheckedUpdateManyInputSchema,
    ]),
    where: TwoFactorWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default TwoFactorUpdateManyArgsSchema;
