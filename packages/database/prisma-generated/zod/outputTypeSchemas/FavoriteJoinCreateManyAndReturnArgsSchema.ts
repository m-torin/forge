import { z } from 'zod';
import type { Prisma } from '../../client';
import { FavoriteJoinCreateManyInputSchema } from '../inputTypeSchemas/FavoriteJoinCreateManyInputSchema';

export const FavoriteJoinCreateManyAndReturnArgsSchema: z.ZodType<Prisma.FavoriteJoinCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([FavoriteJoinCreateManyInputSchema, FavoriteJoinCreateManyInputSchema.array()]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default FavoriteJoinCreateManyAndReturnArgsSchema;
