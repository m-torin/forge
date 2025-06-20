import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutProductsInputSchema } from './CollectionCreateWithoutProductsInputSchema';
import { CollectionUncheckedCreateWithoutProductsInputSchema } from './CollectionUncheckedCreateWithoutProductsInputSchema';
import { CollectionCreateOrConnectWithoutProductsInputSchema } from './CollectionCreateOrConnectWithoutProductsInputSchema';
import { CollectionUpsertWithWhereUniqueWithoutProductsInputSchema } from './CollectionUpsertWithWhereUniqueWithoutProductsInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithWhereUniqueWithoutProductsInputSchema } from './CollectionUpdateWithWhereUniqueWithoutProductsInputSchema';
import { CollectionUpdateManyWithWhereWithoutProductsInputSchema } from './CollectionUpdateManyWithWhereWithoutProductsInputSchema';
import { CollectionScalarWhereInputSchema } from './CollectionScalarWhereInputSchema';

export const CollectionUpdateManyWithoutProductsNestedInputSchema: z.ZodType<Prisma.CollectionUpdateManyWithoutProductsNestedInput> = z.object({
  create: z.union([ z.lazy(() => CollectionCreateWithoutProductsInputSchema),z.lazy(() => CollectionCreateWithoutProductsInputSchema).array(),z.lazy(() => CollectionUncheckedCreateWithoutProductsInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutProductsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CollectionCreateOrConnectWithoutProductsInputSchema),z.lazy(() => CollectionCreateOrConnectWithoutProductsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CollectionUpsertWithWhereUniqueWithoutProductsInputSchema),z.lazy(() => CollectionUpsertWithWhereUniqueWithoutProductsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CollectionUpdateWithWhereUniqueWithoutProductsInputSchema),z.lazy(() => CollectionUpdateWithWhereUniqueWithoutProductsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CollectionUpdateManyWithWhereWithoutProductsInputSchema),z.lazy(() => CollectionUpdateManyWithWhereWithoutProductsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CollectionScalarWhereInputSchema),z.lazy(() => CollectionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default CollectionUpdateManyWithoutProductsNestedInputSchema;
