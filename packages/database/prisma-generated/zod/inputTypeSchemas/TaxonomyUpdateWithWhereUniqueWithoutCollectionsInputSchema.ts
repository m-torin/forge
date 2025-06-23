import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithoutCollectionsInputSchema } from './TaxonomyUpdateWithoutCollectionsInputSchema';
import { TaxonomyUncheckedUpdateWithoutCollectionsInputSchema } from './TaxonomyUncheckedUpdateWithoutCollectionsInputSchema';

export const TaxonomyUpdateWithWhereUniqueWithoutCollectionsInputSchema: z.ZodType<Prisma.TaxonomyUpdateWithWhereUniqueWithoutCollectionsInput> =
  z
    .object({
      where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => TaxonomyUpdateWithoutCollectionsInputSchema),
        z.lazy(() => TaxonomyUncheckedUpdateWithoutCollectionsInputSchema),
      ]),
    })
    .strict();

export default TaxonomyUpdateWithWhereUniqueWithoutCollectionsInputSchema;
