import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewCreateWithoutMediaInputSchema } from './ReviewCreateWithoutMediaInputSchema';
import { ReviewUncheckedCreateWithoutMediaInputSchema } from './ReviewUncheckedCreateWithoutMediaInputSchema';
import { ReviewCreateOrConnectWithoutMediaInputSchema } from './ReviewCreateOrConnectWithoutMediaInputSchema';
import { ReviewUpsertWithoutMediaInputSchema } from './ReviewUpsertWithoutMediaInputSchema';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateToOneWithWhereWithoutMediaInputSchema } from './ReviewUpdateToOneWithWhereWithoutMediaInputSchema';
import { ReviewUpdateWithoutMediaInputSchema } from './ReviewUpdateWithoutMediaInputSchema';
import { ReviewUncheckedUpdateWithoutMediaInputSchema } from './ReviewUncheckedUpdateWithoutMediaInputSchema';

export const ReviewUpdateOneWithoutMediaNestedInputSchema: z.ZodType<Prisma.ReviewUpdateOneWithoutMediaNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ReviewCreateWithoutMediaInputSchema),
          z.lazy(() => ReviewUncheckedCreateWithoutMediaInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ReviewCreateOrConnectWithoutMediaInputSchema).optional(),
      upsert: z.lazy(() => ReviewUpsertWithoutMediaInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => ReviewWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => ReviewWhereInputSchema)]).optional(),
      connect: z.lazy(() => ReviewWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => ReviewUpdateToOneWithWhereWithoutMediaInputSchema),
          z.lazy(() => ReviewUpdateWithoutMediaInputSchema),
          z.lazy(() => ReviewUncheckedUpdateWithoutMediaInputSchema),
        ])
        .optional(),
    })
    .strict();

export default ReviewUpdateOneWithoutMediaNestedInputSchema;
