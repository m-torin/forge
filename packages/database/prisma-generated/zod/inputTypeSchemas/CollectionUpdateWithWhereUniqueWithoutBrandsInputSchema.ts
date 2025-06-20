import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithoutBrandsInputSchema } from './CollectionUpdateWithoutBrandsInputSchema';
import { CollectionUncheckedUpdateWithoutBrandsInputSchema } from './CollectionUncheckedUpdateWithoutBrandsInputSchema';

export const CollectionUpdateWithWhereUniqueWithoutBrandsInputSchema: z.ZodType<Prisma.CollectionUpdateWithWhereUniqueWithoutBrandsInput> = z.object({
  where: z.lazy(() => CollectionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CollectionUpdateWithoutBrandsInputSchema),z.lazy(() => CollectionUncheckedUpdateWithoutBrandsInputSchema) ]),
}).strict();

export default CollectionUpdateWithWhereUniqueWithoutBrandsInputSchema;
