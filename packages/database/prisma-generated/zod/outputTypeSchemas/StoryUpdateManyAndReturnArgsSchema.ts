import { z } from 'zod';
import type { Prisma } from '../../client';
import { StoryUpdateManyMutationInputSchema } from '../inputTypeSchemas/StoryUpdateManyMutationInputSchema'
import { StoryUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/StoryUncheckedUpdateManyInputSchema'
import { StoryWhereInputSchema } from '../inputTypeSchemas/StoryWhereInputSchema'

export const StoryUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.StoryUpdateManyAndReturnArgs> = z.object({
  data: z.union([ StoryUpdateManyMutationInputSchema,StoryUncheckedUpdateManyInputSchema ]),
  where: StoryWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default StoryUpdateManyAndReturnArgsSchema;
