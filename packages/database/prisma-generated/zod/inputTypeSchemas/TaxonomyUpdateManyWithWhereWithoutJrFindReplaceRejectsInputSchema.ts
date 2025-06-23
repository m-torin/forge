import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyScalarWhereInputSchema } from './TaxonomyScalarWhereInputSchema';
import { TaxonomyUpdateManyMutationInputSchema } from './TaxonomyUpdateManyMutationInputSchema';
import { TaxonomyUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema';

export const TaxonomyUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.TaxonomyUpdateManyWithWhereWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => TaxonomyScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => TaxonomyUpdateManyMutationInputSchema),
        z.lazy(() => TaxonomyUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default TaxonomyUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema;
