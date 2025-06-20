import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';
import { ReviewUpdateWithoutVotesInputSchema } from './ReviewUpdateWithoutVotesInputSchema';
import { ReviewUncheckedUpdateWithoutVotesInputSchema } from './ReviewUncheckedUpdateWithoutVotesInputSchema';

export const ReviewUpdateToOneWithWhereWithoutVotesInputSchema: z.ZodType<Prisma.ReviewUpdateToOneWithWhereWithoutVotesInput> = z.object({
  where: z.lazy(() => ReviewWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutVotesInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutVotesInputSchema) ]),
}).strict();

export default ReviewUpdateToOneWithWhereWithoutVotesInputSchema;
