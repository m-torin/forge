import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';
import { MediaUpdateManyMutationInputSchema } from './MediaUpdateManyMutationInputSchema';
import { MediaUncheckedUpdateManyWithoutReviewInputSchema } from './MediaUncheckedUpdateManyWithoutReviewInputSchema';

export const MediaUpdateManyWithWhereWithoutReviewInputSchema: z.ZodType<Prisma.MediaUpdateManyWithWhereWithoutReviewInput> = z.object({
  where: z.lazy(() => MediaScalarWhereInputSchema),
  data: z.union([ z.lazy(() => MediaUpdateManyMutationInputSchema),z.lazy(() => MediaUncheckedUpdateManyWithoutReviewInputSchema) ]),
}).strict();

export default MediaUpdateManyWithWhereWithoutReviewInputSchema;
