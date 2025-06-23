import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyScalarWhereInputSchema } from './TaxonomyScalarWhereInputSchema';
import { TaxonomyUpdateManyMutationInputSchema } from './TaxonomyUpdateManyMutationInputSchema';
import { TaxonomyUncheckedUpdateManyWithoutCollectionsInputSchema } from './TaxonomyUncheckedUpdateManyWithoutCollectionsInputSchema';

export const TaxonomyUpdateManyWithWhereWithoutCollectionsInputSchema: z.ZodType<Prisma.TaxonomyUpdateManyWithWhereWithoutCollectionsInput> =
  z
    .object({
      where: z.lazy(() => TaxonomyScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => TaxonomyUpdateManyMutationInputSchema),
        z.lazy(() => TaxonomyUncheckedUpdateManyWithoutCollectionsInputSchema),
      ]),
    })
    .strict();

export default TaxonomyUpdateManyWithWhereWithoutCollectionsInputSchema;
