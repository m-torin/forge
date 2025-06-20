import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithoutBrandsInputSchema } from './CollectionUpdateWithoutBrandsInputSchema';
import { CollectionUncheckedUpdateWithoutBrandsInputSchema } from './CollectionUncheckedUpdateWithoutBrandsInputSchema';
import { CollectionCreateWithoutBrandsInputSchema } from './CollectionCreateWithoutBrandsInputSchema';
import { CollectionUncheckedCreateWithoutBrandsInputSchema } from './CollectionUncheckedCreateWithoutBrandsInputSchema';

export const CollectionUpsertWithWhereUniqueWithoutBrandsInputSchema: z.ZodType<Prisma.CollectionUpsertWithWhereUniqueWithoutBrandsInput> = z.object({
  where: z.lazy(() => CollectionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CollectionUpdateWithoutBrandsInputSchema),z.lazy(() => CollectionUncheckedUpdateWithoutBrandsInputSchema) ]),
  create: z.union([ z.lazy(() => CollectionCreateWithoutBrandsInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutBrandsInputSchema) ]),
}).strict();

export default CollectionUpsertWithWhereUniqueWithoutBrandsInputSchema;
