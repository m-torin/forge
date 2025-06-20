import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionCreateWithoutDeletedByInputSchema } from './CollectionCreateWithoutDeletedByInputSchema';
import { CollectionUncheckedCreateWithoutDeletedByInputSchema } from './CollectionUncheckedCreateWithoutDeletedByInputSchema';

export const CollectionCreateOrConnectWithoutDeletedByInputSchema: z.ZodType<Prisma.CollectionCreateOrConnectWithoutDeletedByInput> = z.object({
  where: z.lazy(() => CollectionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CollectionCreateWithoutDeletedByInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutDeletedByInputSchema) ]),
}).strict();

export default CollectionCreateOrConnectWithoutDeletedByInputSchema;
