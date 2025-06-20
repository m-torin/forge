import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionCreateWithoutUserInputSchema } from './CollectionCreateWithoutUserInputSchema';
import { CollectionUncheckedCreateWithoutUserInputSchema } from './CollectionUncheckedCreateWithoutUserInputSchema';

export const CollectionCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.CollectionCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => CollectionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CollectionCreateWithoutUserInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default CollectionCreateOrConnectWithoutUserInputSchema;
