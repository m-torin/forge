import { z } from 'zod';
import type { Prisma } from '../../client';
import { TwoFactorUpdateManyMutationInputSchema } from '../inputTypeSchemas/TwoFactorUpdateManyMutationInputSchema'
import { TwoFactorUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/TwoFactorUncheckedUpdateManyInputSchema'
import { TwoFactorWhereInputSchema } from '../inputTypeSchemas/TwoFactorWhereInputSchema'

export const TwoFactorUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.TwoFactorUpdateManyAndReturnArgs> = z.object({
  data: z.union([ TwoFactorUpdateManyMutationInputSchema,TwoFactorUncheckedUpdateManyInputSchema ]),
  where: TwoFactorWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default TwoFactorUpdateManyAndReturnArgsSchema;
