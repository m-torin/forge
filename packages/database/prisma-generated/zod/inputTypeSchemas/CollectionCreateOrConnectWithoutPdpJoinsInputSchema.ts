import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionCreateWithoutPdpJoinsInputSchema } from './CollectionCreateWithoutPdpJoinsInputSchema';
import { CollectionUncheckedCreateWithoutPdpJoinsInputSchema } from './CollectionUncheckedCreateWithoutPdpJoinsInputSchema';

export const CollectionCreateOrConnectWithoutPdpJoinsInputSchema: z.ZodType<Prisma.CollectionCreateOrConnectWithoutPdpJoinsInput> = z.object({
  where: z.lazy(() => CollectionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CollectionCreateWithoutPdpJoinsInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutPdpJoinsInputSchema) ]),
}).strict();

export default CollectionCreateOrConnectWithoutPdpJoinsInputSchema;
