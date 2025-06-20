import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithoutPdpJoinsInputSchema } from './CollectionUpdateWithoutPdpJoinsInputSchema';
import { CollectionUncheckedUpdateWithoutPdpJoinsInputSchema } from './CollectionUncheckedUpdateWithoutPdpJoinsInputSchema';

export const CollectionUpdateWithWhereUniqueWithoutPdpJoinsInputSchema: z.ZodType<Prisma.CollectionUpdateWithWhereUniqueWithoutPdpJoinsInput> = z.object({
  where: z.lazy(() => CollectionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CollectionUpdateWithoutPdpJoinsInputSchema),z.lazy(() => CollectionUncheckedUpdateWithoutPdpJoinsInputSchema) ]),
}).strict();

export default CollectionUpdateWithWhereUniqueWithoutPdpJoinsInputSchema;
