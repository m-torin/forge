import { z } from 'zod';
import type { Prisma } from '../../client';
import { TwoFactorCreateManyInputSchema } from '../inputTypeSchemas/TwoFactorCreateManyInputSchema'

export const TwoFactorCreateManyArgsSchema: z.ZodType<Prisma.TwoFactorCreateManyArgs> = z.object({
  data: z.union([ TwoFactorCreateManyInputSchema,TwoFactorCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default TwoFactorCreateManyArgsSchema;
