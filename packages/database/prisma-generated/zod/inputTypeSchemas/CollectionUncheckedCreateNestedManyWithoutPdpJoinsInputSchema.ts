import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutPdpJoinsInputSchema } from './CollectionCreateWithoutPdpJoinsInputSchema';
import { CollectionUncheckedCreateWithoutPdpJoinsInputSchema } from './CollectionUncheckedCreateWithoutPdpJoinsInputSchema';
import { CollectionCreateOrConnectWithoutPdpJoinsInputSchema } from './CollectionCreateOrConnectWithoutPdpJoinsInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';

export const CollectionUncheckedCreateNestedManyWithoutPdpJoinsInputSchema: z.ZodType<Prisma.CollectionUncheckedCreateNestedManyWithoutPdpJoinsInput> = z.object({
  create: z.union([ z.lazy(() => CollectionCreateWithoutPdpJoinsInputSchema),z.lazy(() => CollectionCreateWithoutPdpJoinsInputSchema).array(),z.lazy(() => CollectionUncheckedCreateWithoutPdpJoinsInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutPdpJoinsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CollectionCreateOrConnectWithoutPdpJoinsInputSchema),z.lazy(() => CollectionCreateOrConnectWithoutPdpJoinsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CollectionUncheckedCreateNestedManyWithoutPdpJoinsInputSchema;
