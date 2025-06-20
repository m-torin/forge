import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionCreateWithoutParentInputSchema } from './CollectionCreateWithoutParentInputSchema';
import { CollectionUncheckedCreateWithoutParentInputSchema } from './CollectionUncheckedCreateWithoutParentInputSchema';

export const CollectionCreateOrConnectWithoutParentInputSchema: z.ZodType<Prisma.CollectionCreateOrConnectWithoutParentInput> = z.object({
  where: z.lazy(() => CollectionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CollectionCreateWithoutParentInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutParentInputSchema) ]),
}).strict();

export default CollectionCreateOrConnectWithoutParentInputSchema;
