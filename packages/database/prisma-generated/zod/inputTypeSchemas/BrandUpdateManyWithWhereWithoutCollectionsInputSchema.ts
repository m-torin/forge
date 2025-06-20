import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandScalarWhereInputSchema } from './BrandScalarWhereInputSchema';
import { BrandUpdateManyMutationInputSchema } from './BrandUpdateManyMutationInputSchema';
import { BrandUncheckedUpdateManyWithoutCollectionsInputSchema } from './BrandUncheckedUpdateManyWithoutCollectionsInputSchema';

export const BrandUpdateManyWithWhereWithoutCollectionsInputSchema: z.ZodType<Prisma.BrandUpdateManyWithWhereWithoutCollectionsInput> = z.object({
  where: z.lazy(() => BrandScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BrandUpdateManyMutationInputSchema),z.lazy(() => BrandUncheckedUpdateManyWithoutCollectionsInputSchema) ]),
}).strict();

export default BrandUpdateManyWithWhereWithoutCollectionsInputSchema;
