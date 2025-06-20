import { z } from 'zod';
import type { Prisma } from '../../client';
import { StoryCreateManyInputSchema } from '../inputTypeSchemas/StoryCreateManyInputSchema'

export const StoryCreateManyArgsSchema: z.ZodType<Prisma.StoryCreateManyArgs> = z.object({
  data: z.union([ StoryCreateManyInputSchema,StoryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default StoryCreateManyArgsSchema;
