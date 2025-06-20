import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithoutUserInputSchema } from './CollectionUpdateWithoutUserInputSchema';
import { CollectionUncheckedUpdateWithoutUserInputSchema } from './CollectionUncheckedUpdateWithoutUserInputSchema';
import { CollectionCreateWithoutUserInputSchema } from './CollectionCreateWithoutUserInputSchema';
import { CollectionUncheckedCreateWithoutUserInputSchema } from './CollectionUncheckedCreateWithoutUserInputSchema';

export const CollectionUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.CollectionUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => CollectionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CollectionUpdateWithoutUserInputSchema),z.lazy(() => CollectionUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => CollectionCreateWithoutUserInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default CollectionUpsertWithWhereUniqueWithoutUserInputSchema;
