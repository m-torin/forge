import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutReviewInputSchema } from './MediaUpdateWithoutReviewInputSchema';
import { MediaUncheckedUpdateWithoutReviewInputSchema } from './MediaUncheckedUpdateWithoutReviewInputSchema';

export const MediaUpdateWithWhereUniqueWithoutReviewInputSchema: z.ZodType<Prisma.MediaUpdateWithWhereUniqueWithoutReviewInput> = z.object({
  where: z.lazy(() => MediaWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MediaUpdateWithoutReviewInputSchema),z.lazy(() => MediaUncheckedUpdateWithoutReviewInputSchema) ]),
}).strict();

export default MediaUpdateWithWhereUniqueWithoutReviewInputSchema;
