import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewCreateWithoutVotesInputSchema } from './ReviewCreateWithoutVotesInputSchema';
import { ReviewUncheckedCreateWithoutVotesInputSchema } from './ReviewUncheckedCreateWithoutVotesInputSchema';
import { ReviewCreateOrConnectWithoutVotesInputSchema } from './ReviewCreateOrConnectWithoutVotesInputSchema';
import { ReviewUpsertWithoutVotesInputSchema } from './ReviewUpsertWithoutVotesInputSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateToOneWithWhereWithoutVotesInputSchema } from './ReviewUpdateToOneWithWhereWithoutVotesInputSchema';
import { ReviewUpdateWithoutVotesInputSchema } from './ReviewUpdateWithoutVotesInputSchema';
import { ReviewUncheckedUpdateWithoutVotesInputSchema } from './ReviewUncheckedUpdateWithoutVotesInputSchema';

export const ReviewUpdateOneRequiredWithoutVotesNestedInputSchema: z.ZodType<Prisma.ReviewUpdateOneRequiredWithoutVotesNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutVotesInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutVotesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReviewCreateOrConnectWithoutVotesInputSchema).optional(),
  upsert: z.lazy(() => ReviewUpsertWithoutVotesInputSchema).optional(),
  connect: z.lazy(() => ReviewWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateToOneWithWhereWithoutVotesInputSchema),z.lazy(() => ReviewUpdateWithoutVotesInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutVotesInputSchema) ]).optional(),
}).strict();

export default ReviewUpdateOneRequiredWithoutVotesNestedInputSchema;
