import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionCreateWithoutProductsInputSchema } from './CollectionCreateWithoutProductsInputSchema';
import { CollectionUncheckedCreateWithoutProductsInputSchema } from './CollectionUncheckedCreateWithoutProductsInputSchema';

export const CollectionCreateOrConnectWithoutProductsInputSchema: z.ZodType<Prisma.CollectionCreateOrConnectWithoutProductsInput> = z.object({
  where: z.lazy(() => CollectionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CollectionCreateWithoutProductsInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutProductsInputSchema) ]),
}).strict();

export default CollectionCreateOrConnectWithoutProductsInputSchema;
