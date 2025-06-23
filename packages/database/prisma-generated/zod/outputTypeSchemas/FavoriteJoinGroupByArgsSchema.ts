import { z } from 'zod';
import type { Prisma } from '../../client';
import { FavoriteJoinWhereInputSchema } from '../inputTypeSchemas/FavoriteJoinWhereInputSchema';
import { FavoriteJoinOrderByWithAggregationInputSchema } from '../inputTypeSchemas/FavoriteJoinOrderByWithAggregationInputSchema';
import { FavoriteJoinScalarFieldEnumSchema } from '../inputTypeSchemas/FavoriteJoinScalarFieldEnumSchema';
import { FavoriteJoinScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/FavoriteJoinScalarWhereWithAggregatesInputSchema';

export const FavoriteJoinGroupByArgsSchema: z.ZodType<Prisma.FavoriteJoinGroupByArgs> = z
  .object({
    where: FavoriteJoinWhereInputSchema.optional(),
    orderBy: z
      .union([
        FavoriteJoinOrderByWithAggregationInputSchema.array(),
        FavoriteJoinOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: FavoriteJoinScalarFieldEnumSchema.array(),
    having: FavoriteJoinScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default FavoriteJoinGroupByArgsSchema;
