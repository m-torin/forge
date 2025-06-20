import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionCreateWithoutIdentifiersInputSchema } from './CollectionCreateWithoutIdentifiersInputSchema';
import { CollectionUncheckedCreateWithoutIdentifiersInputSchema } from './CollectionUncheckedCreateWithoutIdentifiersInputSchema';

export const CollectionCreateOrConnectWithoutIdentifiersInputSchema: z.ZodType<Prisma.CollectionCreateOrConnectWithoutIdentifiersInput> = z.object({
  where: z.lazy(() => CollectionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CollectionCreateWithoutIdentifiersInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutIdentifiersInputSchema) ]),
}).strict();

export default CollectionCreateOrConnectWithoutIdentifiersInputSchema;
