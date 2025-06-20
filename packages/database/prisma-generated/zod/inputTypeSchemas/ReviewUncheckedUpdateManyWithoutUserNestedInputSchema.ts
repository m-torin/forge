import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewCreateWithoutUserInputSchema } from './ReviewCreateWithoutUserInputSchema';
import { ReviewUncheckedCreateWithoutUserInputSchema } from './ReviewUncheckedCreateWithoutUserInputSchema';
import { ReviewCreateOrConnectWithoutUserInputSchema } from './ReviewCreateOrConnectWithoutUserInputSchema';
import { ReviewUpsertWithWhereUniqueWithoutUserInputSchema } from './ReviewUpsertWithWhereUniqueWithoutUserInputSchema';
import { ReviewCreateManyUserInputEnvelopeSchema } from './ReviewCreateManyUserInputEnvelopeSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithWhereUniqueWithoutUserInputSchema } from './ReviewUpdateWithWhereUniqueWithoutUserInputSchema';
import { ReviewUpdateManyWithWhereWithoutUserInputSchema } from './ReviewUpdateManyWithWhereWithoutUserInputSchema';
import { ReviewScalarWhereInputSchema } from './ReviewScalarWhereInputSchema';

export const ReviewUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutUserInputSchema),z.lazy(() => ReviewCreateWithoutUserInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutUserInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ReviewUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ReviewUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => ReviewUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema),z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ReviewUncheckedUpdateManyWithoutUserNestedInputSchema;
