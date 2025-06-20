import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutDeletedByInputSchema } from './MediaCreateWithoutDeletedByInputSchema';
import { MediaUncheckedCreateWithoutDeletedByInputSchema } from './MediaUncheckedCreateWithoutDeletedByInputSchema';
import { MediaCreateOrConnectWithoutDeletedByInputSchema } from './MediaCreateOrConnectWithoutDeletedByInputSchema';
import { MediaUpsertWithWhereUniqueWithoutDeletedByInputSchema } from './MediaUpsertWithWhereUniqueWithoutDeletedByInputSchema';
import { MediaCreateManyDeletedByInputEnvelopeSchema } from './MediaCreateManyDeletedByInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithWhereUniqueWithoutDeletedByInputSchema } from './MediaUpdateWithWhereUniqueWithoutDeletedByInputSchema';
import { MediaUpdateManyWithWhereWithoutDeletedByInputSchema } from './MediaUpdateManyWithWhereWithoutDeletedByInputSchema';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';

export const MediaUncheckedUpdateManyWithoutDeletedByNestedInputSchema: z.ZodType<Prisma.MediaUncheckedUpdateManyWithoutDeletedByNestedInput> = z.object({
  create: z.union([ z.lazy(() => MediaCreateWithoutDeletedByInputSchema),z.lazy(() => MediaCreateWithoutDeletedByInputSchema).array(),z.lazy(() => MediaUncheckedCreateWithoutDeletedByInputSchema),z.lazy(() => MediaUncheckedCreateWithoutDeletedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MediaCreateOrConnectWithoutDeletedByInputSchema),z.lazy(() => MediaCreateOrConnectWithoutDeletedByInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MediaUpsertWithWhereUniqueWithoutDeletedByInputSchema),z.lazy(() => MediaUpsertWithWhereUniqueWithoutDeletedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MediaCreateManyDeletedByInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MediaWhereUniqueInputSchema),z.lazy(() => MediaWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MediaUpdateWithWhereUniqueWithoutDeletedByInputSchema),z.lazy(() => MediaUpdateWithWhereUniqueWithoutDeletedByInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MediaUpdateManyWithWhereWithoutDeletedByInputSchema),z.lazy(() => MediaUpdateManyWithWhereWithoutDeletedByInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MediaScalarWhereInputSchema),z.lazy(() => MediaScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MediaUncheckedUpdateManyWithoutDeletedByNestedInputSchema;
