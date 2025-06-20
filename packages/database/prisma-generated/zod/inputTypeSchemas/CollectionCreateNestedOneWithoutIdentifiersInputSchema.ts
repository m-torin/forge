import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutIdentifiersInputSchema } from './CollectionCreateWithoutIdentifiersInputSchema';
import { CollectionUncheckedCreateWithoutIdentifiersInputSchema } from './CollectionUncheckedCreateWithoutIdentifiersInputSchema';
import { CollectionCreateOrConnectWithoutIdentifiersInputSchema } from './CollectionCreateOrConnectWithoutIdentifiersInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';

export const CollectionCreateNestedOneWithoutIdentifiersInputSchema: z.ZodType<Prisma.CollectionCreateNestedOneWithoutIdentifiersInput> = z.object({
  create: z.union([ z.lazy(() => CollectionCreateWithoutIdentifiersInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutIdentifiersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CollectionCreateOrConnectWithoutIdentifiersInputSchema).optional(),
  connect: z.lazy(() => CollectionWhereUniqueInputSchema).optional()
}).strict();

export default CollectionCreateNestedOneWithoutIdentifiersInputSchema;
