import { z } from 'zod';
import type { Prisma } from '../../client';
import { StoryWhereInputSchema } from '../inputTypeSchemas/StoryWhereInputSchema';
import { StoryOrderByWithRelationInputSchema } from '../inputTypeSchemas/StoryOrderByWithRelationInputSchema';
import { StoryWhereUniqueInputSchema } from '../inputTypeSchemas/StoryWhereUniqueInputSchema';

export const StoryAggregateArgsSchema: z.ZodType<Prisma.StoryAggregateArgs> = z
  .object({
    where: StoryWhereInputSchema.optional(),
    orderBy: z
      .union([StoryOrderByWithRelationInputSchema.array(), StoryOrderByWithRelationInputSchema])
      .optional(),
    cursor: StoryWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default StoryAggregateArgsSchema;
