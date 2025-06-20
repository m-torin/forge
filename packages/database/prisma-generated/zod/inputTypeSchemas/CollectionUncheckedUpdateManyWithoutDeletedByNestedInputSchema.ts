import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutDeletedByInputSchema } from './CollectionCreateWithoutDeletedByInputSchema';
import { CollectionUncheckedCreateWithoutDeletedByInputSchema } from './CollectionUncheckedCreateWithoutDeletedByInputSchema';
import { CollectionCreateOrConnectWithoutDeletedByInputSchema } from './CollectionCreateOrConnectWithoutDeletedByInputSchema';
import { CollectionUpsertWithWhereUniqueWithoutDeletedByInputSchema } from './CollectionUpsertWithWhereUniqueWithoutDeletedByInputSchema';
import { CollectionCreateManyDeletedByInputEnvelopeSchema } from './CollectionCreateManyDeletedByInputEnvelopeSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithWhereUniqueWithoutDeletedByInputSchema } from './CollectionUpdateWithWhereUniqueWithoutDeletedByInputSchema';
import { CollectionUpdateManyWithWhereWithoutDeletedByInputSchema } from './CollectionUpdateManyWithWhereWithoutDeletedByInputSchema';
import { CollectionScalarWhereInputSchema } from './CollectionScalarWhereInputSchema';

export const CollectionUncheckedUpdateManyWithoutDeletedByNestedInputSchema: z.ZodType<Prisma.CollectionUncheckedUpdateManyWithoutDeletedByNestedInput> = z.object({
  create: z.union([ z.lazy(() => CollectionCreateWithoutDeletedByInputSchema),z.lazy(() => CollectionCreateWithoutDeletedByInputSchema).array(),z.lazy(() => CollectionUncheckedCreateWithoutDeletedByInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutDeletedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CollectionCreateOrConnectWithoutDeletedByInputSchema),z.lazy(() => CollectionCreateOrConnectWithoutDeletedByInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CollectionUpsertWithWhereUniqueWithoutDeletedByInputSchema),z.lazy(() => CollectionUpsertWithWhereUniqueWithoutDeletedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CollectionCreateManyDeletedByInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CollectionUpdateWithWhereUniqueWithoutDeletedByInputSchema),z.lazy(() => CollectionUpdateWithWhereUniqueWithoutDeletedByInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CollectionUpdateManyWithWhereWithoutDeletedByInputSchema),z.lazy(() => CollectionUpdateManyWithWhereWithoutDeletedByInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CollectionScalarWhereInputSchema),z.lazy(() => CollectionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default CollectionUncheckedUpdateManyWithoutDeletedByNestedInputSchema;
