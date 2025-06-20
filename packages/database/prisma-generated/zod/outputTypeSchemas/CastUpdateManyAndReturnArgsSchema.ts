import { z } from 'zod';
import type { Prisma } from '../../client';
import { CastUpdateManyMutationInputSchema } from '../inputTypeSchemas/CastUpdateManyMutationInputSchema'
import { CastUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/CastUncheckedUpdateManyInputSchema'
import { CastWhereInputSchema } from '../inputTypeSchemas/CastWhereInputSchema'

export const CastUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CastUpdateManyAndReturnArgs> = z.object({
  data: z.union([ CastUpdateManyMutationInputSchema,CastUncheckedUpdateManyInputSchema ]),
  where: CastWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default CastUpdateManyAndReturnArgsSchema;
