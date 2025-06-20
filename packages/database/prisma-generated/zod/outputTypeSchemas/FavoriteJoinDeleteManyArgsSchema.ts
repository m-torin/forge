import { z } from 'zod';
import type { Prisma } from '../../client';
import { FavoriteJoinWhereInputSchema } from '../inputTypeSchemas/FavoriteJoinWhereInputSchema'

export const FavoriteJoinDeleteManyArgsSchema: z.ZodType<Prisma.FavoriteJoinDeleteManyArgs> = z.object({
  where: FavoriteJoinWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default FavoriteJoinDeleteManyArgsSchema;
