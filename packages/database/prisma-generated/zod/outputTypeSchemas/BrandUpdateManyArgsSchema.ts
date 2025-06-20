import { z } from 'zod';
import type { Prisma } from '../../client';
import { BrandUpdateManyMutationInputSchema } from '../inputTypeSchemas/BrandUpdateManyMutationInputSchema'
import { BrandUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/BrandUncheckedUpdateManyInputSchema'
import { BrandWhereInputSchema } from '../inputTypeSchemas/BrandWhereInputSchema'

export const BrandUpdateManyArgsSchema: z.ZodType<Prisma.BrandUpdateManyArgs> = z.object({
  data: z.union([ BrandUpdateManyMutationInputSchema,BrandUncheckedUpdateManyInputSchema ]),
  where: BrandWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default BrandUpdateManyArgsSchema;
