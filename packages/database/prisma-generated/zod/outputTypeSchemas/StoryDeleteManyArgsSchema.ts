import { z } from 'zod';
import type { Prisma } from '../../client';
import { StoryWhereInputSchema } from '../inputTypeSchemas/StoryWhereInputSchema'

export const StoryDeleteManyArgsSchema: z.ZodType<Prisma.StoryDeleteManyArgs> = z.object({
  where: StoryWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default StoryDeleteManyArgsSchema;
