import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutParentInputSchema } from './CollectionCreateWithoutParentInputSchema';
import { CollectionUncheckedCreateWithoutParentInputSchema } from './CollectionUncheckedCreateWithoutParentInputSchema';
import { CollectionCreateOrConnectWithoutParentInputSchema } from './CollectionCreateOrConnectWithoutParentInputSchema';
import { CollectionUpsertWithWhereUniqueWithoutParentInputSchema } from './CollectionUpsertWithWhereUniqueWithoutParentInputSchema';
import { CollectionCreateManyParentInputEnvelopeSchema } from './CollectionCreateManyParentInputEnvelopeSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithWhereUniqueWithoutParentInputSchema } from './CollectionUpdateWithWhereUniqueWithoutParentInputSchema';
import { CollectionUpdateManyWithWhereWithoutParentInputSchema } from './CollectionUpdateManyWithWhereWithoutParentInputSchema';
import { CollectionScalarWhereInputSchema } from './CollectionScalarWhereInputSchema';

export const CollectionUncheckedUpdateManyWithoutParentNestedInputSchema: z.ZodType<Prisma.CollectionUncheckedUpdateManyWithoutParentNestedInput> = z.object({
  create: z.union([ z.lazy(() => CollectionCreateWithoutParentInputSchema),z.lazy(() => CollectionCreateWithoutParentInputSchema).array(),z.lazy(() => CollectionUncheckedCreateWithoutParentInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutParentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CollectionCreateOrConnectWithoutParentInputSchema),z.lazy(() => CollectionCreateOrConnectWithoutParentInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CollectionUpsertWithWhereUniqueWithoutParentInputSchema),z.lazy(() => CollectionUpsertWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CollectionCreateManyParentInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CollectionUpdateWithWhereUniqueWithoutParentInputSchema),z.lazy(() => CollectionUpdateWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CollectionUpdateManyWithWhereWithoutParentInputSchema),z.lazy(() => CollectionUpdateManyWithWhereWithoutParentInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CollectionScalarWhereInputSchema),z.lazy(() => CollectionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default CollectionUncheckedUpdateManyWithoutParentNestedInputSchema;
