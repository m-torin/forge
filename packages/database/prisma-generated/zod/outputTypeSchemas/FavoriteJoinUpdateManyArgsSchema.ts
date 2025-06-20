import { z } from 'zod';
import type { Prisma } from '../../client';
import { FavoriteJoinUpdateManyMutationInputSchema } from '../inputTypeSchemas/FavoriteJoinUpdateManyMutationInputSchema'
import { FavoriteJoinUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/FavoriteJoinUncheckedUpdateManyInputSchema'
import { FavoriteJoinWhereInputSchema } from '../inputTypeSchemas/FavoriteJoinWhereInputSchema'

export const FavoriteJoinUpdateManyArgsSchema: z.ZodType<Prisma.FavoriteJoinUpdateManyArgs> = z.object({
  data: z.union([ FavoriteJoinUpdateManyMutationInputSchema,FavoriteJoinUncheckedUpdateManyInputSchema ]),
  where: FavoriteJoinWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default FavoriteJoinUpdateManyArgsSchema;
