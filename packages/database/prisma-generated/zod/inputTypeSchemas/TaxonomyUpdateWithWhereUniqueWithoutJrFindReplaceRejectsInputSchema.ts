import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyUpdateWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema';

export const TaxonomyUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.TaxonomyUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => TaxonomyUpdateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => TaxonomyUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default TaxonomyUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema;
