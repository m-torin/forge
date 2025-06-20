import { z } from 'zod';
import type { Prisma } from '../../client';
import { FavoriteJoinWhereInputSchema } from '../inputTypeSchemas/FavoriteJoinWhereInputSchema'
import { FavoriteJoinOrderByWithRelationInputSchema } from '../inputTypeSchemas/FavoriteJoinOrderByWithRelationInputSchema'
import { FavoriteJoinWhereUniqueInputSchema } from '../inputTypeSchemas/FavoriteJoinWhereUniqueInputSchema'

export const FavoriteJoinAggregateArgsSchema: z.ZodType<Prisma.FavoriteJoinAggregateArgs> = z.object({
  where: FavoriteJoinWhereInputSchema.optional(),
  orderBy: z.union([ FavoriteJoinOrderByWithRelationInputSchema.array(),FavoriteJoinOrderByWithRelationInputSchema ]).optional(),
  cursor: FavoriteJoinWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default FavoriteJoinAggregateArgsSchema;
