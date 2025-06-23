import { z } from 'zod';
import type { Prisma } from '../../client';
import { StoryCreateManyInputSchema } from '../inputTypeSchemas/StoryCreateManyInputSchema';

export const StoryCreateManyAndReturnArgsSchema: z.ZodType<Prisma.StoryCreateManyAndReturnArgs> = z
  .object({
    data: z.union([StoryCreateManyInputSchema, StoryCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export default StoryCreateManyAndReturnArgsSchema;
