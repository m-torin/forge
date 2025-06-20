import { z } from 'zod';
import type { Prisma } from '../../client';
import { FavoriteJoinCreateManyInputSchema } from '../inputTypeSchemas/FavoriteJoinCreateManyInputSchema'

export const FavoriteJoinCreateManyArgsSchema: z.ZodType<Prisma.FavoriteJoinCreateManyArgs> = z.object({
  data: z.union([ FavoriteJoinCreateManyInputSchema,FavoriteJoinCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default FavoriteJoinCreateManyArgsSchema;
