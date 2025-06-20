import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';
import { MediaUpdateManyMutationInputSchema } from './MediaUpdateManyMutationInputSchema';
import { MediaUncheckedUpdateManyWithoutCategoryInputSchema } from './MediaUncheckedUpdateManyWithoutCategoryInputSchema';

export const MediaUpdateManyWithWhereWithoutCategoryInputSchema: z.ZodType<Prisma.MediaUpdateManyWithWhereWithoutCategoryInput> = z.object({
  where: z.lazy(() => MediaScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MediaUpdateManyMutationInputSchema),z.lazy(() => MediaUncheckedUpdateManyWithoutCategoryInputSchema) ]),
}).strict();

export default MediaUpdateManyWithWhereWithoutCategoryInputSchema;
