import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithoutCollectionsInputSchema } from './TaxonomyUpdateWithoutCollectionsInputSchema';
import { TaxonomyUncheckedUpdateWithoutCollectionsInputSchema } from './TaxonomyUncheckedUpdateWithoutCollectionsInputSchema';
import { TaxonomyCreateWithoutCollectionsInputSchema } from './TaxonomyCreateWithoutCollectionsInputSchema';
import { TaxonomyUncheckedCreateWithoutCollectionsInputSchema } from './TaxonomyUncheckedCreateWithoutCollectionsInputSchema';

export const TaxonomyUpsertWithWhereUniqueWithoutCollectionsInputSchema: z.ZodType<Prisma.TaxonomyUpsertWithWhereUniqueWithoutCollectionsInput> =
  z
    .object({
      where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => TaxonomyUpdateWithoutCollectionsInputSchema),
        z.lazy(() => TaxonomyUncheckedUpdateWithoutCollectionsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => TaxonomyCreateWithoutCollectionsInputSchema),
        z.lazy(() => TaxonomyUncheckedCreateWithoutCollectionsInputSchema),
      ]),
    })
    .strict();

export default TaxonomyUpsertWithWhereUniqueWithoutCollectionsInputSchema;
