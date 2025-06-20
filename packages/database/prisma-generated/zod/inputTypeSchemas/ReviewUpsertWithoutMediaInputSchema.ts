import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewUpdateWithoutMediaInputSchema } from './ReviewUpdateWithoutMediaInputSchema';
import { ReviewUncheckedUpdateWithoutMediaInputSchema } from './ReviewUncheckedUpdateWithoutMediaInputSchema';
import { ReviewCreateWithoutMediaInputSchema } from './ReviewCreateWithoutMediaInputSchema';
import { ReviewUncheckedCreateWithoutMediaInputSchema } from './ReviewUncheckedCreateWithoutMediaInputSchema';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';

export const ReviewUpsertWithoutMediaInputSchema: z.ZodType<Prisma.ReviewUpsertWithoutMediaInput> = z.object({
  update: z.union([ z.lazy(() => ReviewUpdateWithoutMediaInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutMediaInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewCreateWithoutMediaInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutMediaInputSchema) ]),
  where: z.lazy(() => ReviewWhereInputSchema).optional()
}).strict();

export default ReviewUpsertWithoutMediaInputSchema;
