import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewCreateWithoutVotesInputSchema } from './ReviewCreateWithoutVotesInputSchema';
import { ReviewUncheckedCreateWithoutVotesInputSchema } from './ReviewUncheckedCreateWithoutVotesInputSchema';

export const ReviewCreateOrConnectWithoutVotesInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutVotesInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewCreateWithoutVotesInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutVotesInputSchema) ]),
}).strict();

export default ReviewCreateOrConnectWithoutVotesInputSchema;
