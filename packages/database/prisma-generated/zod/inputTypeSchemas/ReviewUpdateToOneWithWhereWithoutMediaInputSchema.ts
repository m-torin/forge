import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';
import { ReviewUpdateWithoutMediaInputSchema } from './ReviewUpdateWithoutMediaInputSchema';
import { ReviewUncheckedUpdateWithoutMediaInputSchema } from './ReviewUncheckedUpdateWithoutMediaInputSchema';

export const ReviewUpdateToOneWithWhereWithoutMediaInputSchema: z.ZodType<Prisma.ReviewUpdateToOneWithWhereWithoutMediaInput> =
  z
    .object({
      where: z.lazy(() => ReviewWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => ReviewUpdateWithoutMediaInputSchema),
        z.lazy(() => ReviewUncheckedUpdateWithoutMediaInputSchema),
      ]),
    })
    .strict();

export default ReviewUpdateToOneWithWhereWithoutMediaInputSchema;
