import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyUpdateWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyCreateWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyCreateWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';

export const TaxonomyUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.TaxonomyUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => TaxonomyUpdateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => TaxonomyUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => TaxonomyCreateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default TaxonomyUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema;
