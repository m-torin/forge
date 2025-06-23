import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewCreateWithoutVotesInputSchema } from './ReviewCreateWithoutVotesInputSchema';
import { ReviewUncheckedCreateWithoutVotesInputSchema } from './ReviewUncheckedCreateWithoutVotesInputSchema';
import { ReviewCreateOrConnectWithoutVotesInputSchema } from './ReviewCreateOrConnectWithoutVotesInputSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';

export const ReviewCreateNestedOneWithoutVotesInputSchema: z.ZodType<Prisma.ReviewCreateNestedOneWithoutVotesInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ReviewCreateWithoutVotesInputSchema),
          z.lazy(() => ReviewUncheckedCreateWithoutVotesInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ReviewCreateOrConnectWithoutVotesInputSchema).optional(),
      connect: z.lazy(() => ReviewWhereUniqueInputSchema).optional(),
    })
    .strict();

export default ReviewCreateNestedOneWithoutVotesInputSchema;
