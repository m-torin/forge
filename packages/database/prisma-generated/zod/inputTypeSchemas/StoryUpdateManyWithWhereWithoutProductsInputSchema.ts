import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryScalarWhereInputSchema } from './StoryScalarWhereInputSchema';
import { StoryUpdateManyMutationInputSchema } from './StoryUpdateManyMutationInputSchema';
import { StoryUncheckedUpdateManyWithoutProductsInputSchema } from './StoryUncheckedUpdateManyWithoutProductsInputSchema';

export const StoryUpdateManyWithWhereWithoutProductsInputSchema: z.ZodType<Prisma.StoryUpdateManyWithWhereWithoutProductsInput> = z.object({
  where: z.lazy(() => StoryScalarWhereInputSchema),
  data: z.union([ z.lazy(() => StoryUpdateManyMutationInputSchema),z.lazy(() => StoryUncheckedUpdateManyWithoutProductsInputSchema) ]),
}).strict();

export default StoryUpdateManyWithWhereWithoutProductsInputSchema;
