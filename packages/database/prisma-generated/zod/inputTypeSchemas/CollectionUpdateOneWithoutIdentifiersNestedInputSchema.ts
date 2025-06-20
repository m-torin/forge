import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutIdentifiersInputSchema } from './CollectionCreateWithoutIdentifiersInputSchema';
import { CollectionUncheckedCreateWithoutIdentifiersInputSchema } from './CollectionUncheckedCreateWithoutIdentifiersInputSchema';
import { CollectionCreateOrConnectWithoutIdentifiersInputSchema } from './CollectionCreateOrConnectWithoutIdentifiersInputSchema';
import { CollectionUpsertWithoutIdentifiersInputSchema } from './CollectionUpsertWithoutIdentifiersInputSchema';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateToOneWithWhereWithoutIdentifiersInputSchema } from './CollectionUpdateToOneWithWhereWithoutIdentifiersInputSchema';
import { CollectionUpdateWithoutIdentifiersInputSchema } from './CollectionUpdateWithoutIdentifiersInputSchema';
import { CollectionUncheckedUpdateWithoutIdentifiersInputSchema } from './CollectionUncheckedUpdateWithoutIdentifiersInputSchema';

export const CollectionUpdateOneWithoutIdentifiersNestedInputSchema: z.ZodType<Prisma.CollectionUpdateOneWithoutIdentifiersNestedInput> = z.object({
  create: z.union([ z.lazy(() => CollectionCreateWithoutIdentifiersInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutIdentifiersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CollectionCreateOrConnectWithoutIdentifiersInputSchema).optional(),
  upsert: z.lazy(() => CollectionUpsertWithoutIdentifiersInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => CollectionWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => CollectionWhereInputSchema) ]).optional(),
  connect: z.lazy(() => CollectionWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CollectionUpdateToOneWithWhereWithoutIdentifiersInputSchema),z.lazy(() => CollectionUpdateWithoutIdentifiersInputSchema),z.lazy(() => CollectionUncheckedUpdateWithoutIdentifiersInputSchema) ]).optional(),
}).strict();

export default CollectionUpdateOneWithoutIdentifiersNestedInputSchema;
