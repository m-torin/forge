import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewUpdateWithoutVotesInputSchema } from './ReviewUpdateWithoutVotesInputSchema';
import { ReviewUncheckedUpdateWithoutVotesInputSchema } from './ReviewUncheckedUpdateWithoutVotesInputSchema';
import { ReviewCreateWithoutVotesInputSchema } from './ReviewCreateWithoutVotesInputSchema';
import { ReviewUncheckedCreateWithoutVotesInputSchema } from './ReviewUncheckedCreateWithoutVotesInputSchema';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';

export const ReviewUpsertWithoutVotesInputSchema: z.ZodType<Prisma.ReviewUpsertWithoutVotesInput> = z.object({
  update: z.union([ z.lazy(() => ReviewUpdateWithoutVotesInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutVotesInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewCreateWithoutVotesInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutVotesInputSchema) ]),
  where: z.lazy(() => ReviewWhereInputSchema).optional()
}).strict();

export default ReviewUpsertWithoutVotesInputSchema;
