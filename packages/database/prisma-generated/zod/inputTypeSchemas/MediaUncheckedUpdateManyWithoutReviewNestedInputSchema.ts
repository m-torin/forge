import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutReviewInputSchema } from './MediaCreateWithoutReviewInputSchema';
import { MediaUncheckedCreateWithoutReviewInputSchema } from './MediaUncheckedCreateWithoutReviewInputSchema';
import { MediaCreateOrConnectWithoutReviewInputSchema } from './MediaCreateOrConnectWithoutReviewInputSchema';
import { MediaUpsertWithWhereUniqueWithoutReviewInputSchema } from './MediaUpsertWithWhereUniqueWithoutReviewInputSchema';
import { MediaCreateManyReviewInputEnvelopeSchema } from './MediaCreateManyReviewInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithWhereUniqueWithoutReviewInputSchema } from './MediaUpdateWithWhereUniqueWithoutReviewInputSchema';
import { MediaUpdateManyWithWhereWithoutReviewInputSchema } from './MediaUpdateManyWithWhereWithoutReviewInputSchema';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';

export const MediaUncheckedUpdateManyWithoutReviewNestedInputSchema: z.ZodType<Prisma.MediaUncheckedUpdateManyWithoutReviewNestedInput> = z.object({
  create: z.union([ z.lazy(() => MediaCreateWithoutReviewInputSchema),z.lazy(() => MediaCreateWithoutReviewInputSchema).array(),z.lazy(() => MediaUncheckedCreateWithoutReviewInputSchema),z.lazy(() => MediaUncheckedCreateWithoutReviewInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MediaCreateOrConnectWithoutReviewInputSchema),z.lazy(() => MediaCreateOrConnectWithoutReviewInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MediaUpsertWithWhereUniqueWithoutReviewInputSchema),z.lazy(() => MediaUpsertWithWhereUniqueWithoutReviewInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MediaCreateManyReviewInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MediaUpdateWithWhereUniqueWithoutReviewInputSchema),z.lazy(() => MediaUpdateWithWhereUniqueWithoutReviewInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MediaUpdateManyWithWhereWithoutReviewInputSchema),z.lazy(() => MediaUpdateManyWithWhereWithoutReviewInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MediaScalarWhereInputSchema),z.lazy(() => MediaScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MediaUncheckedUpdateManyWithoutReviewNestedInputSchema;
