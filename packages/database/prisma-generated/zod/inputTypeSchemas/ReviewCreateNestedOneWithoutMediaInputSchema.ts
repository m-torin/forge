import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewCreateWithoutMediaInputSchema } from './ReviewCreateWithoutMediaInputSchema';
import { ReviewUncheckedCreateWithoutMediaInputSchema } from './ReviewUncheckedCreateWithoutMediaInputSchema';
import { ReviewCreateOrConnectWithoutMediaInputSchema } from './ReviewCreateOrConnectWithoutMediaInputSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';

export const ReviewCreateNestedOneWithoutMediaInputSchema: z.ZodType<Prisma.ReviewCreateNestedOneWithoutMediaInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutMediaInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutMediaInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReviewCreateOrConnectWithoutMediaInputSchema).optional(),
  connect: z.lazy(() => ReviewWhereUniqueInputSchema).optional()
}).strict();

export default ReviewCreateNestedOneWithoutMediaInputSchema;
