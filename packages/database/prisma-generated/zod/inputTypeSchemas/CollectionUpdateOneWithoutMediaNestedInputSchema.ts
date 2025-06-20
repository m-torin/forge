import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutMediaInputSchema } from './CollectionCreateWithoutMediaInputSchema';
import { CollectionUncheckedCreateWithoutMediaInputSchema } from './CollectionUncheckedCreateWithoutMediaInputSchema';
import { CollectionCreateOrConnectWithoutMediaInputSchema } from './CollectionCreateOrConnectWithoutMediaInputSchema';
import { CollectionUpsertWithoutMediaInputSchema } from './CollectionUpsertWithoutMediaInputSchema';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateToOneWithWhereWithoutMediaInputSchema } from './CollectionUpdateToOneWithWhereWithoutMediaInputSchema';
import { CollectionUpdateWithoutMediaInputSchema } from './CollectionUpdateWithoutMediaInputSchema';
import { CollectionUncheckedUpdateWithoutMediaInputSchema } from './CollectionUncheckedUpdateWithoutMediaInputSchema';

export const CollectionUpdateOneWithoutMediaNestedInputSchema: z.ZodType<Prisma.CollectionUpdateOneWithoutMediaNestedInput> = z.object({
  create: z.union([ z.lazy(() => CollectionCreateWithoutMediaInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutMediaInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CollectionCreateOrConnectWithoutMediaInputSchema).optional(),
  upsert: z.lazy(() => CollectionUpsertWithoutMediaInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => CollectionWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => CollectionWhereInputSchema) ]).optional(),
  connect: z.lazy(() => CollectionWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CollectionUpdateToOneWithWhereWithoutMediaInputSchema),z.lazy(() => CollectionUpdateWithoutMediaInputSchema),z.lazy(() => CollectionUncheckedUpdateWithoutMediaInputSchema) ]).optional(),
}).strict();

export default CollectionUpdateOneWithoutMediaNestedInputSchema;
