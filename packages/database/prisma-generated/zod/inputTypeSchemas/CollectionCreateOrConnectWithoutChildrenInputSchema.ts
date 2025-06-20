import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionCreateWithoutChildrenInputSchema } from './CollectionCreateWithoutChildrenInputSchema';
import { CollectionUncheckedCreateWithoutChildrenInputSchema } from './CollectionUncheckedCreateWithoutChildrenInputSchema';

export const CollectionCreateOrConnectWithoutChildrenInputSchema: z.ZodType<Prisma.CollectionCreateOrConnectWithoutChildrenInput> = z.object({
  where: z.lazy(() => CollectionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CollectionCreateWithoutChildrenInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutChildrenInputSchema) ]),
}).strict();

export default CollectionCreateOrConnectWithoutChildrenInputSchema;
