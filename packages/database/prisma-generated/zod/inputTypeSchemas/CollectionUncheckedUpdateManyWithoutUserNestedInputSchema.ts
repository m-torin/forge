import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutUserInputSchema } from './CollectionCreateWithoutUserInputSchema';
import { CollectionUncheckedCreateWithoutUserInputSchema } from './CollectionUncheckedCreateWithoutUserInputSchema';
import { CollectionCreateOrConnectWithoutUserInputSchema } from './CollectionCreateOrConnectWithoutUserInputSchema';
import { CollectionUpsertWithWhereUniqueWithoutUserInputSchema } from './CollectionUpsertWithWhereUniqueWithoutUserInputSchema';
import { CollectionCreateManyUserInputEnvelopeSchema } from './CollectionCreateManyUserInputEnvelopeSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithWhereUniqueWithoutUserInputSchema } from './CollectionUpdateWithWhereUniqueWithoutUserInputSchema';
import { CollectionUpdateManyWithWhereWithoutUserInputSchema } from './CollectionUpdateManyWithWhereWithoutUserInputSchema';
import { CollectionScalarWhereInputSchema } from './CollectionScalarWhereInputSchema';

export const CollectionUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.CollectionUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => CollectionCreateWithoutUserInputSchema),z.lazy(() => CollectionCreateWithoutUserInputSchema).array(),z.lazy(() => CollectionUncheckedCreateWithoutUserInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CollectionCreateOrConnectWithoutUserInputSchema),z.lazy(() => CollectionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CollectionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => CollectionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CollectionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CollectionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => CollectionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CollectionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => CollectionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CollectionScalarWhereInputSchema),z.lazy(() => CollectionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default CollectionUncheckedUpdateManyWithoutUserNestedInputSchema;
