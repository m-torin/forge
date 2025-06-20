import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutChildrenInputSchema } from './CollectionCreateWithoutChildrenInputSchema';
import { CollectionUncheckedCreateWithoutChildrenInputSchema } from './CollectionUncheckedCreateWithoutChildrenInputSchema';
import { CollectionCreateOrConnectWithoutChildrenInputSchema } from './CollectionCreateOrConnectWithoutChildrenInputSchema';
import { CollectionUpsertWithoutChildrenInputSchema } from './CollectionUpsertWithoutChildrenInputSchema';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateToOneWithWhereWithoutChildrenInputSchema } from './CollectionUpdateToOneWithWhereWithoutChildrenInputSchema';
import { CollectionUpdateWithoutChildrenInputSchema } from './CollectionUpdateWithoutChildrenInputSchema';
import { CollectionUncheckedUpdateWithoutChildrenInputSchema } from './CollectionUncheckedUpdateWithoutChildrenInputSchema';

export const CollectionUpdateOneWithoutChildrenNestedInputSchema: z.ZodType<Prisma.CollectionUpdateOneWithoutChildrenNestedInput> = z.object({
  create: z.union([ z.lazy(() => CollectionCreateWithoutChildrenInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutChildrenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CollectionCreateOrConnectWithoutChildrenInputSchema).optional(),
  upsert: z.lazy(() => CollectionUpsertWithoutChildrenInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => CollectionWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => CollectionWhereInputSchema) ]).optional(),
  connect: z.lazy(() => CollectionWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CollectionUpdateToOneWithWhereWithoutChildrenInputSchema),z.lazy(() => CollectionUpdateWithoutChildrenInputSchema),z.lazy(() => CollectionUncheckedUpdateWithoutChildrenInputSchema) ]).optional(),
}).strict();

export default CollectionUpdateOneWithoutChildrenNestedInputSchema;
