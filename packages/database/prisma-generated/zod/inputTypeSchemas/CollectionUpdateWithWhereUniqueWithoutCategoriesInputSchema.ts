import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithoutCategoriesInputSchema } from './CollectionUpdateWithoutCategoriesInputSchema';
import { CollectionUncheckedUpdateWithoutCategoriesInputSchema } from './CollectionUncheckedUpdateWithoutCategoriesInputSchema';

export const CollectionUpdateWithWhereUniqueWithoutCategoriesInputSchema: z.ZodType<Prisma.CollectionUpdateWithWhereUniqueWithoutCategoriesInput> = z.object({
  where: z.lazy(() => CollectionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CollectionUpdateWithoutCategoriesInputSchema),z.lazy(() => CollectionUncheckedUpdateWithoutCategoriesInputSchema) ]),
}).strict();

export default CollectionUpdateWithWhereUniqueWithoutCategoriesInputSchema;
