import { z } from 'zod';
import type { Prisma } from '../../client';
import { FavoriteJoinSelectSchema } from '../inputTypeSchemas/FavoriteJoinSelectSchema';
import { FavoriteJoinIncludeSchema } from '../inputTypeSchemas/FavoriteJoinIncludeSchema';

export const FavoriteJoinArgsSchema: z.ZodType<Prisma.FavoriteJoinDefaultArgs> = z
  .object({
    select: z.lazy(() => FavoriteJoinSelectSchema).optional(),
    include: z.lazy(() => FavoriteJoinIncludeSchema).optional(),
  })
  .strict();

export default FavoriteJoinArgsSchema;
