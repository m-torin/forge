import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesCreateWithoutDeletedByInputSchema } from './SeriesCreateWithoutDeletedByInputSchema';
import { SeriesUncheckedCreateWithoutDeletedByInputSchema } from './SeriesUncheckedCreateWithoutDeletedByInputSchema';
import { SeriesCreateOrConnectWithoutDeletedByInputSchema } from './SeriesCreateOrConnectWithoutDeletedByInputSchema';
import { SeriesUpsertWithWhereUniqueWithoutDeletedByInputSchema } from './SeriesUpsertWithWhereUniqueWithoutDeletedByInputSchema';
import { SeriesCreateManyDeletedByInputEnvelopeSchema } from './SeriesCreateManyDeletedByInputEnvelopeSchema';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesUpdateWithWhereUniqueWithoutDeletedByInputSchema } from './SeriesUpdateWithWhereUniqueWithoutDeletedByInputSchema';
import { SeriesUpdateManyWithWhereWithoutDeletedByInputSchema } from './SeriesUpdateManyWithWhereWithoutDeletedByInputSchema';
import { SeriesScalarWhereInputSchema } from './SeriesScalarWhereInputSchema';

export const SeriesUncheckedUpdateManyWithoutDeletedByNestedInputSchema: z.ZodType<Prisma.SeriesUncheckedUpdateManyWithoutDeletedByNestedInput> = z.object({
  create: z.union([ z.lazy(() => SeriesCreateWithoutDeletedByInputSchema),z.lazy(() => SeriesCreateWithoutDeletedByInputSchema).array(),z.lazy(() => SeriesUncheckedCreateWithoutDeletedByInputSchema),z.lazy(() => SeriesUncheckedCreateWithoutDeletedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SeriesCreateOrConnectWithoutDeletedByInputSchema),z.lazy(() => SeriesCreateOrConnectWithoutDeletedByInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SeriesUpsertWithWhereUniqueWithoutDeletedByInputSchema),z.lazy(() => SeriesUpsertWithWhereUniqueWithoutDeletedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SeriesCreateManyDeletedByInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SeriesWhereUniqueInputSchema),z.lazy(() => SeriesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SeriesWhereUniqueInputSchema),z.lazy(() => SeriesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SeriesWhereUniqueInputSchema),z.lazy(() => SeriesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SeriesWhereUniqueInputSchema),z.lazy(() => SeriesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SeriesUpdateWithWhereUniqueWithoutDeletedByInputSchema),z.lazy(() => SeriesUpdateWithWhereUniqueWithoutDeletedByInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SeriesUpdateManyWithWhereWithoutDeletedByInputSchema),z.lazy(() => SeriesUpdateManyWithWhereWithoutDeletedByInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SeriesScalarWhereInputSchema),z.lazy(() => SeriesScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default SeriesUncheckedUpdateManyWithoutDeletedByNestedInputSchema;
